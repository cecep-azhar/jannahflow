import { db } from "@/db";
import { quotes } from "@/db/schema";
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const textPath = path.join(process.cwd(), "inspirasi.text");
    const text = fs.readFileSync(textPath, "utf-8");
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);

    const parsedQuotes = [];
    let currentLines: string[] = [];
    let currentCategory = "Keluarga";

    for (const line of lines) {
        if (
            line.includes("Mutiara Hikmah JannahFlow") || 
            line.includes("Panduan Lengkap") || 
            line.includes("Koleksi 360 Kutipan") || 
            line.includes("Semoga bermanfaat") ||
            line.includes("Hingga Nomor 288 tetap mengikuti format kalimat lengkap") ||
            line.includes("Kutipan 304-360 dilanjutkan dengan uraian kalimat yang sama panjangnya dan tidak disingkat")
        ) {
            continue;
        }
        
        if (line.startsWith("Bagian")) {
            currentCategory = line.split(":")[1]?.split("(")[0]?.trim() || "Keluarga";
            continue;
        }
        
        let source = "";
        let isSourceLine = false;

        if (line.startsWith("(") && line.endsWith(")")) {
            source = line.slice(1, -1);
            isSourceLine = true;
        }

        if (isSourceLine) {
            let textIdn = "";
            
            for (const cl of currentLines) {
                 if (/[a-zA-Z]/.test(cl)) {
                     textIdn = cl.replace(/^[\*\"\s]+|[\*\"\s]+$/g, '');
                     break;
                 }
            }

            if (textIdn && source) {
                parsedQuotes.push({
                    text: textIdn,
                    source: source,
                    category: currentCategory
                });
            }
            currentLines = [];
        } else {
            currentLines.push(line);
        }
    }

    if (parsedQuotes.length > 0) {
        await db.run(sql`CREATE TABLE IF NOT EXISTS \`quotes\` (\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL, \`text\` text NOT NULL, \`source\` text NOT NULL, \`category\` text NOT NULL)`);
        console.log("Menghapus quotes lama...");
        await db.delete(quotes);
        
        console.log(`Memasukkan ${parsedQuotes.length} kutipan ke database...`);
        for (let i = 0; i < parsedQuotes.length; i += 50) {
            const chunk = parsedQuotes.slice(i, i + 50);
            await db.insert(quotes).values(chunk);
        }
    }
    
    return NextResponse.json({ success: true, count: parsedQuotes.length, message: "Proses Seeding Mutiara Hikmah Selesai!" });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
