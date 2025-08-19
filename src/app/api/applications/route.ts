// src/app/api/applications/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";
import admin from "firebase-admin";
import { enqueueEmail } from "@/lib/mail/enqueueEmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function ensureAdmin() {
  if (admin.apps.length === 0) admin.initializeApp();
  return { db: admin.firestore(), auth: admin.auth() };
}

type Stage = "pre-seed" | "seed" | "series-a" | "bootstrapped" | "other";

type ApplyPayload = {
  founderName?: string;
  founderEmail?: string;
  companyName?: string;
  companyUrl?: string;
  stage?: Stage;
  problem?: string;
  whyNow?: string;
  traction?: string;
  dataSources?: string;
  deckUrl?: string;
  websiteHoneypot?: string;
};

function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
}
function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
function clampLen(s: unknown, max: number): string {
  const v = typeof s === "string" ? s : "";
  return v.length > max ? v.slice(0, max) : v;
}
function bad(reason: string, status = 400) {
  return NextResponse.json({ error: reason }, { status });
}

async function notifyOpsWebhook(summary: string, payload: Record<string, unknown>) {
  const hook = process.env.OPS_WEBHOOK_URL;
  if (!hook) return;
  try {
    await fetch(hook, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        text: summary,
        application: payload,
        source: "apply_api",
        env: process.env.NEXT_PUBLIC_ENV || "prod",
      }),
    });
  } catch {/* best effort */}
}

export async function POST(req: Request) {
  const { db, auth } = ensureAdmin();

  // Optional Firebase auth
  let uid = "";
  let idTokenEmail = "";
  const authz = req.headers.get("authorization") || "";
  if (authz.startsWith("Bearer ")) {
    try {
      const decoded = await auth.verifyIdToken(authz.slice("Bearer ".length).trim());
      uid = decoded.uid;
      idTokenEmail = typeof decoded.email === "string" ? decoded.email : "";
    } catch {/* ignore invalid token */}
  }

  let body: ApplyPayload;
  try {
    body = (await req.json()) as ApplyPayload;
  } catch {
    return bad("Invalid JSON payload.");
  }

  // Honeypot
  if (body.websiteHoneypot && body.websiteHoneypot.trim() !== "") {
    return bad("Spam detected.");
  }

  // Requireds
  const founderName = clampLen(body.founderName, 100).trim();
  const founderEmail = clampLen(body.founderEmail, 254).trim();
  const companyName = clampLen(body.companyName, 120).trim();
  const companyUrl = clampLen(body.companyUrl, 200).trim();

  if (!founderName) return bad("Your name is required.");
  if (!founderEmail || !isEmail(founderEmail)) return bad("A valid email is required.");
  if (!companyName) return bad("Company name is required.");
  if (!companyUrl || !isHttpUrl(companyUrl)) return bad("A valid company URL is required.");

  const stage = (["pre-seed", "seed", "series-a", "bootstrapped", "other"] as const).includes(
    (body.stage || "seed") as Stage
  ) ? ((body.stage || "seed") as Stage) : "seed";

  const problem = clampLen(body.problem, 2000).trim();
  const whyNow = clampLen(body.whyNow, 2000).trim();
  const traction = clampLen(body.traction, 2000).trim();
  const dataSources = clampLen(body.dataSources, 1000).trim();
  const deckUrl = clampLen(body.deckUrl, 200).trim();
  if (deckUrl && !isHttpUrl(deckUrl)) return bad("Deck URL must be a valid link.");

  // Rate limit by email hash, 30s
  const emailForRate = idTokenEmail || founderEmail;
  const emailHash = crypto.createHash("sha256").update(emailForRate.toLowerCase()).digest("hex");
  const metaRef = db.collection("applications_meta").doc(emailHash);
  const now = admin.firestore.Timestamp.now();

  try {
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(metaRef);
      const lastTs = snap.exists ? (snap.get("lastSubmittedAt") as admin.firestore.Timestamp | undefined) : undefined;
      if (lastTs && now.seconds - lastTs.seconds < 30) {
        throw new Error("Please wait 30 seconds before submitting again.");
      }
      tx.set(metaRef, { lastSubmittedAt: now, count: admin.firestore.FieldValue.increment(1) }, { merge: true });
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return bad(msg, 429);
  }

  // Persist
  const docRef = db.collection("applications").doc();
  const appRecord = {
    id: docRef.id,
    uid: uid || null,
    founderName,
    founderEmail,
    companyName,
    companyUrl,
    stage,
    problem,
    whyNow,
    traction,
    dataSources,
    deckUrl: deckUrl || null,
    userEmailFromIdToken: idTokenEmail || null,
    userAgent: req.headers.get("user-agent") || null,
    ipHint: req.headers.get("x-forwarded-for") || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    env: process.env.NEXT_PUBLIC_ENV || "prod",
  } as const;

  try {
    await docRef.set(appRecord);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to persist: ${msg}` }, { status: 500 });
  }

  // Enqueue Ops email via queue, guaranteed by worker retries
  try {
    const opsTo = (process.env.OPS_EMAILS || "invest@thearenafund.com")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const subject = `[Arena] New founder application — ${appRecord.companyName}`;
    const text = [
      `Company: ${appRecord.companyName}`,
      `URL: ${appRecord.companyUrl}`,
      `Stage: ${appRecord.stage}`,
      `Founder: ${appRecord.founderName} <${appRecord.founderEmail}>`,
      "",
      `Problem: ${appRecord.problem || "-"}`,
      "",
      `Why now: ${appRecord.whyNow || "-"}`,
      "",
      `Traction: ${appRecord.traction || "-"}`,
      "",
      `Data sources: ${appRecord.dataSources || "-"}`,
      "",
      `Deck: ${appRecord.deckUrl || "-"}`,
      "",
      `App ID: ${appRecord.id}`,
    ].join("\n");

    const html =
      `<p><strong>Company</strong>: ${escapeHtml(appRecord.companyName)}<br/>` +
      `<strong>URL</strong>: <a href="${escapeAttr(appRecord.companyUrl)}">${escapeHtml(appRecord.companyUrl)}</a><br/>` +
      `<strong>Stage</strong>: ${escapeHtml(appRecord.stage)}<br/>` +
      `<strong>Founder</strong>: ${escapeHtml(appRecord.founderName)} &lt;${escapeHtml(appRecord.founderEmail)}&gt;</p>` +
      `<p><strong>Problem</strong><br/>${nl2br(escapeHtml(appRecord.problem || "-"))}</p>` +
      `<p><strong>Why now</strong><br/>${nl2br(escapeHtml(appRecord.whyNow || "-"))}</p>` +
      `<p><strong>Traction</strong><br/>${nl2br(escapeHtml(appRecord.traction || "-"))}</p>` +
      `<p><strong>Data sources</strong><br/>${nl2br(escapeHtml(appRecord.dataSources || "-"))}</p>` +
      `<p><strong>Deck</strong>: ${
        appRecord.deckUrl ? `<a href="${escapeAttr(appRecord.deckUrl)}">${escapeHtml(appRecord.deckUrl)}</a>` : "-"
      }</p>` +
      `<p><small>App ID: ${escapeHtml(appRecord.id)}</small></p>`;

    await enqueueEmail({
      to: opsTo,
      subject,
      text,
      html,
      fromName: "Arena Intake",
      replyTo: appRecord.founderEmail || undefined,
      messageIdHint: `apply-${appRecord.id}`,
      metadata: { type: "application", appId: appRecord.id },
    });
  } catch {
    // Do not fail the API if queue insert fails
  }

  // Best-effort webhook
  await notifyOpsWebhook(
    `New founder application: ${appRecord.companyName} by ${appRecord.founderName} (${appRecord.founderEmail})`,
    appRecord as unknown as Record<string, unknown>,
  );

  return NextResponse.json({ id: docRef.id }, { status: 201 });
}

// tiny helpers
function escapeHtml(s: unknown): string {
  const t = typeof s === "string" ? s : "";
  return t.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));
}
function escapeAttr(s: unknown): string {
  return escapeHtml(s);
}
function nl2br(s: string): string {
  return s.replace(/\n/g, "<br/>");
}
