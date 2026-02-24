import { db } from "@/db";
import { quotes } from "@/db/schema";
import { NextResponse } from "next/server";
import quotesData from "@/db/quotes.json";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        console.log("Menghapus quotes lama...");
        await db.delete(quotes);
        
        console.log(`Memasukkan ${quotesData.length} kutipan dari JSON ke database SQLite...`);
        for (let i = 0; i < quotesData.length; i += 50) {
            const chunk = quotesData.slice(i, i + 50);
            await db.insert(quotes).values(chunk);
        }
        
        return NextResponse.json({ success: true, count: quotesData.length, message: "Quotes successfully seeded from quotes.json!" });
    } catch (err) {
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}
