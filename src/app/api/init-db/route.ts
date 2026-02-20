import { NextResponse } from "next/server";
import { ensureDb } from "@/lib/ensure-db";

export async function GET() {
  try {
    await ensureDb();
    return NextResponse.json({ success: true, message: "Database initialized successfully" });
  } catch (e) {
    console.error("DB init error:", e);
    return NextResponse.json(
      { success: false, error: String(e) },
      { status: 500 }
    );
  }
}
