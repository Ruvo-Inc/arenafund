// src/app/robots.txt/route.ts
import { NextResponse } from "next/server";

export function GET() {
  const env = process.env.NEXT_PUBLIC_ENV || "prod"; // "prod" | "staging" | "dev"
  const isStaging = env !== "prod";
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.thearenafund.com";

  const body = isStaging
    ? `User-agent: *\nDisallow: /`
    : `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml`;

  return new NextResponse(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
