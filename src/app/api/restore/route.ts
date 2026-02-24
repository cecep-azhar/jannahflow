import { client } from "@/db";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
     const formData = await req.formData();
     const file = formData.get("file") as File;
     if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
     
     const buffer = Buffer.from(await file.arrayBuffer());
     const tempDir = path.join(process.cwd(), "tmp");
     if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
     
     const dbPath = path.join(tempDir, `restore_${Date.now()}.db`);
     fs.writeFileSync(dbPath, buffer);
     
     let sqlite;
     try {
         sqlite = new Database(dbPath);
     } catch {
         fs.unlinkSync(dbPath);
         return NextResponse.json({ error: "File bukan database SQLite yang valid" }, { status: 400 });
     }
     
     // Get tables from uploaded DB
     const tables = sqlite.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_litestream_seq' AND name != '_litestream_lock'`).all() as {name: string}[];
     
     for (const tableObj of tables) {
         const tableName = tableObj.name;
         
         // Check if table exists in current Drizzle DB
         let currentCount = 0;
         try {
             // We need to reliably quote table names. In libSQL/Turso, raw DSQL requires careful quoting.
             const cntRes = await client.execute(`SELECT COUNT(*) as c FROM "${tableName}"`);
             currentCount = Number(cntRes.rows[0].c);
         } catch {
             // Table might not exist in the new schema, skip
             continue;
         }
         
         if (currentCount === 0) {
             // Insert records
             const rows = sqlite.prepare(`SELECT * FROM "${tableName}"`).all();
             if (rows.length > 0) {
                 const columns = Object.keys(rows[0] as object);
                 for (const row of rows) {
                     const vals = columns.map(c => {
                         const v = (row as Record<string, unknown>)[c];
                         if (v === null) return 'NULL';
                         if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
                         return v;
                     });
                     await client.execute(`INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(',')}) VALUES (${vals.join(',')})`);
                 }
             }
         }
     }
     
     sqlite.close();
     fs.unlinkSync(dbPath);
     
     return NextResponse.json({ success: true, message: "Database berhasil di-restore untuk tabel yang kosong." });
  } catch (error) {
     return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
