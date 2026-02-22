import fs from "fs";
import { quotes } from "./src/db/schema";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env" });

const url = process.env.TURSO_DATABASE_URL || "file:database/jannahflow.db";
const authToken = process.env.TURSO_AUTH_TOKEN;

const client = createClient({ url, authToken });
const db = drizzle(client);

async function main() {
    const text = fs.readFileSync("inspirasi.text", "utf-8");
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
                    textIdn = cl.replace(/^[\*\"\s]+|[\*\"\s]+$/g, '');
                    break;
                }
            }

            if (textIdn && source) {
                parsedQuotes.push({ text: textIdn, source: source, category: currentCategory });
            }
            currentLines = [];
        } else {
            currentLines.push(line);
        }
    }

    console.log(`Parsed ${parsedQuotes.length} quotes!`);
    if(parsedQuotes.length > 0) {
        console.log("Deleting old quotes...");
        await db.delete(quotes);
        
        console.log("Inserting new quotes...");
        for (let i = 0; i < parsedQuotes.length; i += 50) {
            const chunk = parsedQuotes.slice(i, i + 50);
            await db.insert(quotes).values(chunk);
        }
        console.log("Seeding Success!");
    }
}

main().catch(console.error);
