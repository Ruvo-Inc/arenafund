// mail-worker/src/index.ts
import admin from "firebase-admin";
import { google } from "googleapis";

// Initialize admin
if (admin.apps.length === 0) admin.initializeApp();
const db = admin.firestore();

// Env
const ENV = process.env.NEXT_PUBLIC_ENV || "prod";
const GMAIL_SUBJECT_USER = process.env.GMAIL_IMPERSONATE || "ops@thearenafund.com";
const GMAIL_CLIENT_EMAIL = process.env.GMAIL_CLIENT_EMAIL || "";
const GMAIL_PRIVATE_KEY = process.env.GMAIL_PRIVATE_KEY || "";
const MAX_ATTEMPTS = Number(process.env.MAIL_MAX_ATTEMPTS || "8");

// Exponential backoff with jitter: 2^n seconds, capped to 1 hour
function nextDelaySeconds(attempts: number): number {
  const base = Math.min(3600, Math.pow(2, Math.max(1, attempts)) + Math.floor(Math.random() * 5));
  return base;
}

// Acquire lease to avoid duplicate sends on concurrent triggers
async function tryAcquireLease(ref: FirebaseFirestore.DocumentReference) {
  const now = admin.firestore.Timestamp.now();
  const leaseFor = 60; // seconds
  const leaseExpiry = admin.firestore.Timestamp.fromMillis(now.toMillis() + leaseFor * 1000);
  const leaseOwner = `mail-worker-${process.env.K_SERVICE || "local"}-${process.pid}`;

  const ok = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return false;
    const d = snap.data()!;
    if (d.status !== "queued") return false;

    const notBefore: admin.firestore.Timestamp | null = d.notBefore ?? null;
    if (notBefore && notBefore.toMillis() > now.toMillis()) return false;

    const leaseExpiresAt: admin.firestore.Timestamp | null = d.leaseExpiresAt ?? null;
    if (leaseExpiresAt && leaseExpiresAt.toMillis() > now.toMillis()) {
      // someone else holds lease
      return false;
    }

    tx.update(ref, {
      leaseOwner,
      leaseExpiresAt: leaseExpiry,
      updatedAt: now,
    });
    return true;
  });

  return ok;
}

function buildRfc822(opts: {
  fromEmail: string;
  fromName?: string | null;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string | null;
  html?: string | null;
  replyTo?: string | null;
}): string {
  const headers: string[] = [];
  const fromName = opts.fromName && opts.fromName.trim() ? opts.fromName.trim() : undefined;
  const from = fromName ? `${encodeHeader(fromName)} <${opts.fromEmail}>` : opts.fromEmail;

  headers.push(`From: ${from}`);
  headers.push(`To: ${opts.to.join(", ")}`);
  if (opts.cc && opts.cc.length) headers.push(`Cc: ${opts.cc.join(", ")}`);
  if (opts.bcc && opts.bcc.length) headers.push(`Bcc: ${opts.bcc.join(", ")}`);
  if (opts.replyTo && opts.replyTo.trim()) headers.push(`Reply-To: ${opts.replyTo.trim()}`);
  headers.push(`Subject: ${encodeHeader(opts.subject)}`);
  headers.push("MIME-Version: 1.0");

  const text = opts.text || "";
  const html = opts.html || "";

  if (html) {
    const boundary = `b${Math.random().toString(16).slice(2)}`;
    headers.push(`Content-Type: multipart/alternative; boundary="${boundary}"`);
    const parts = [
      `--${boundary}`,
      "Content-Type: text/plain; charset=UTF-8",
      "",
      text || stripHtml(html),
      `--${boundary}`,
      "Content-Type: text/html; charset=UTF-8",
      "",
      html,
      `--${boundary}--`,
      ""
    ];
    return headers.join("\r\n") + "\r\n\r\n" + parts.join("\r\n");
  } else {
    headers.push("Content-Type: text/plain; charset=UTF-8");
    return headers.join("\r\n") + "\r\n\r\n" + (text || "");
  }
}

function encodeHeader(s: string): string {
  // RFC 2047 minimal
  if (/[\u007F-\uFFFF]/.test(s)) {
    const b64 = Buffer.from(s, "utf8").toString("base64");
    return `=?UTF-8?B?${b64}?=`;
  }
  return s.replace(/\r|\n/g, " ");
}

function stripHtml(html: string): string {
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();
}

async function gmailClient() {
  if (!GMAIL_CLIENT_EMAIL || !GMAIL_PRIVATE_KEY) {
    throw new Error('GMAIL_CLIENT_EMAIL and GMAIL_PRIVATE_KEY environment variables are required');
  }

  const jwtClient = new google.auth.JWT(
    GMAIL_CLIENT_EMAIL,
    undefined,
    GMAIL_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle escaped newlines
    ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.compose'],
    GMAIL_SUBJECT_USER
  );

  return google.gmail({ version: "v1", auth: jwtClient });
}

async function sendWithGmail(job: any) {
  const gmail = await gmailClient();
  const raw = buildRfc822({
    fromEmail: GMAIL_SUBJECT_USER,
    fromName: job.fromName || null,
    to: job.to as string[],
    cc: job.cc as string[] | undefined,
    bcc: job.bcc as string[] | undefined,
    subject: job.subject as string,
    text: (job.text as string | null) ?? null,
    html: (job.html as string | null) ?? null,
    replyTo: (job.replyTo as string | null) ?? null,
  });

  const base64Url = Buffer.from(raw, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const res = await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: base64Url,
      // threadId can be set if you want threading by Message-Id; here we let Gmail set it
    },
  });
  return res.data;
}

// Firestore trigger: on create OR on update back to queued
// Use Eventarc Firestore triggers for Gen2
// Export a handler for both created and updated events.
export async function handleMailQueueEvent(snap: FirebaseFirestore.DocumentSnapshot) {
  const ref = snap.ref;
  const data = snap.data();
  if (!data) return;

  if (data.status !== "queued") return;

  // try lease
  const got = await tryAcquireLease(ref);
  if (!got) return;

  const attempts = Number(data.attempts || 0);

  try {
    // basic validation
    if (!Array.isArray(data.to) || data.to.length === 0) throw new Error("Invalid 'to' addresses");
    if (typeof data.subject !== "string" || !data.subject) throw new Error("Missing subject");

    await sendWithGmail(data);

    await ref.update({
      status: "sent",
      updatedAt: admin.firestore.Timestamp.now(),
      lastError: null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const newAttempts = attempts + 1;
    const delay = nextDelaySeconds(newAttempts);
    const nextTime = admin.firestore.Timestamp.fromMillis(Date.now() + delay * 1000);
    const updates: Record<string, unknown> = {
      attempts: newAttempts,
      updatedAt: admin.firestore.Timestamp.now(),
      lastError: msg,
      leaseExpiresAt: null,
      leaseOwner: null,
    };

    if (newAttempts >= MAX_ATTEMPTS) {
      updates.status = "dead-letter";
    } else {
      updates.notBefore = nextTime;
      updates.status = "queued";
    }

    await ref.update(updates);
  }
}

/**
 * Wiring for Cloud Functions v2:
 *  - onDocumentCreated: processes new jobs
 *  - onDocumentUpdated: re-processes jobs that were re-queued after backoff
 */

import { onDocumentCreated, onDocumentUpdated } from "firebase-functions/v2/firestore";
import { logger } from "firebase-functions";

export const onMailQueued = onDocumentCreated(
  {
    document: "mailQueue/{docId}",
    region: "us-central1",
    secrets: ["GMAIL_DWD_JSON"],
    maxInstances: 5,
    retry: false
  },
  async (event) => {
    try {
      if (!event.data) return;
      await handleMailQueueEvent(event.data);
    } catch (e) {
      logger.error("mailQueue create handler failed", e);
      throw e;
    }
  }
);

export const onMailRequeued = onDocumentUpdated(
  {
    document: "mailQueue/{docId}",
    region: "us-central1",
    secrets: ["GMAIL_DWD_JSON"],
    maxInstances: 5,
    retry: false
  },
  async (event) => {
    try {
      if (!event.data?.after) return;
      await handleMailQueueEvent(event.data.after);
    } catch (e) {
      logger.error("mailQueue update handler failed", e);
      throw e;
    }
  }
);
