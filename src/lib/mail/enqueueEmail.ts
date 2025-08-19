// src/lib/mail/enqueueEmail.ts
import admin from "firebase-admin";

type MailJob = {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  messageIdHint?: string; // optional for dedupe in downstream
  replyTo?: string;
  fromName?: string; // display name for impersonated user
  notBefore?: FirebaseFirestore.Timestamp; // optional scheduling
  metadata?: Record<string, unknown>; // arbitrary context
};

let _db: FirebaseFirestore.Firestore | null = null;
function db() {
  if (admin.apps.length === 0) admin.initializeApp();
  if (!_db) _db = admin.firestore();
  return _db!;
}

/**
 * Enqueue an email for guaranteed delivery by the mail worker.
 * Writes to /mailQueue with status=queued, attempts=0, and an optional notBefore.
 */
export async function enqueueEmail(job: MailJob) {
  const now = admin.firestore.Timestamp.now();
  const doc = {
    to: job.to,
    cc: job.cc ?? [],
    bcc: job.bcc ?? [],
    subject: job.subject,
    text: job.text ?? null,
    html: job.html ?? null,
    replyTo: job.replyTo ?? null,
    fromName: job.fromName ?? null,
    messageIdHint: job.messageIdHint ?? null,
    metadata: job.metadata ?? {},
    status: "queued" as const,
    attempts: 0,
    lastError: null as string | null,
    leaseOwner: null as string | null,
    leaseExpiresAt: null as FirebaseFirestore.Timestamp | null,
    notBefore: job.notBefore ?? now,
    createdAt: now,
    updatedAt: now,
    env: process.env.NEXT_PUBLIC_ENV || "prod",
  };

  const ref = await db().collection("mailQueue").add(doc);
  return ref.id;
}
