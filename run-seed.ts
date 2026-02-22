import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { quotes } from "./src/db/schema.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;
const url = tursoUrl || "file:database/jannahflow.db";
const authToken = tursoUrl ? tursoToken : undefined;

const client = createClient({ url, authToken });
const db = drizzle(client);

function parseQuotes() {
    try {
        const textPath = path.join(process.cwd(), "inspirasi.text");
        const text = fs.readFileSync(textPath, "utf-8");
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);

        const parsedQuotes = [];
        let currentLines = [];
        let currentCategory = "Keluarga";

        for (const line of lines) {
            if (line.includes("Mutiara Hikmah JannahFlow") || line.includes("Panduan Lengkap") || line.includes("Koleksi 360 Kutipan") || line.includes("Semoga bermanfaat")) {
                continue;
            }
            if (line.startsWith("Bagian")) {
                currentCategory = line.split(":")[1]?.split("(")[0]?.trim() || "Keluarga";
                continue;
            }
            
            if (line.startsWith("(") && line.endsWith(")")) {
                const source = line.slice(1, -1);
                let textIdn = "";
                
                for (const cl of currentLines) {
                    if (/[a-zA-Z]/.test(cl)) {
                        textIdn = cl.replace(/^"|"$/g, '').replace(/^\* "\* "/g, '').replace(/^\* "|"\*$/g, '').trim();
                        break;
                    }
                }
                
                if (!textIdn && currentLines.length > 0) {
                   textIdn = currentLines[currentLines.length - 1].replace(/^"|"$/g, '').trim();
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
        
        return parsedQuotes;
    } catch (e) {
        console.error("Error reading inspirasi.text:", e);
        return [];
    }
}

async function runSeed() {
    console.log("Menghapus quotes lama...");
    await db.delete(quotes);
    
    console.log("Membaca 360 kutipan dari inspirasi.text...");
    const data = parseQuotes();
    
    if (data.length === 0) {
        console.log("Tidak ada kutipan yang ditemukan dari inspirasi.text!");
        process.exit(1);
    }
    
    console.log(`Memasukkan ${data.length} kutipan ke database...`);
    for (let i = 0; i < data.length; i += 50) {
        const chunk = data.slice(i, i + 50);
        await db.insert(quotes).values(chunk);
    }
    
    console.log("✅ Proses Seeding Mutiara Hikmah Selesai!");
    process.exit(0);
}

runSeed().catch(err => {
    console.error("Gagal melakukan seeding:", err);
    process.exit(1);
});
