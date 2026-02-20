/**
 * POST /api/admin/generate-license
 *
 * Body (JSON):
 *   { "domain": "app.keluargamu.com", "label": "Keluarga Maju", "adminKey": "your-admin-password" }
 *
 * Returns:
 *   { "token": "<JWT>", "domain": "...", "label": "..." }
 *
 * Set ADMIN_KEY in your .env file to protect this endpoint.
 * Set ADMIN_KEY=off to disable this route entirely.
 */

import { NextRequest, NextResponse } from "next/server";
import * as jose from "jose";

const SECRET_KEY = new TextEncoder().encode("bahagiabersamacacubehinggajannah");

export async function POST(req: NextRequest) {
  // Disable the route in production unless explicitly enabled
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey || adminKey === "off") {
    return NextResponse.json({ error: "Endpoint disabled" }, { status: 404 });
  }

  let body: { domain?: string; label?: string; adminKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Authenticate the request
  if (body.adminKey !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const domain = body.domain?.trim().toLowerCase();
  const label = body.label?.trim() || "";

  if (!domain) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  // Generate JWT
  const token = await new jose.SignJWT({ domain, label })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer("jannahflow-cacube")
    .sign(SECRET_KEY);

  // Optional: save to DB (add your own PostgreSQL/Turso insert here if needed)
  // await db.insert(licenses).values({ domain, label, token, issuedAt: new Date().toISOString() });

  return NextResponse.json({ token, domain, label });
}
