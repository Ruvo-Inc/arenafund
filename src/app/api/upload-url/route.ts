export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";

const storage = new Storage();
const bucketName = process.env.GCS_BUCKET!;
const ALLOWED = new Set(["application/pdf", "image/jpeg", "image/png"]);

function safeName(name: string) {
  return name.replace(/[^\w.\-]/g, "_").slice(0, 128);
}

export async function POST(req: NextRequest) {
  try {
    const { filename, contentType } = await req.json();
    if (!filename || !contentType) {
      return NextResponse.json({ error: "filename and contentType required" }, { status: 400 });
    }
    if (!ALLOWED.has(contentType)) {
      return NextResponse.json({ error: "contentType not allowed" }, { status: 400 });
    }

    const objectPath = `investor_uploads/${Date.now()}-${safeName(filename)}`;
    const file = storage.bucket(bucketName).file(objectPath);

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 10 * 60 * 1000,
      contentType
    });

    return NextResponse.json({
      url,
      objectPath,
      expires: Date.now() + 10 * 60 * 1000
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "failed";
    console.error(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
