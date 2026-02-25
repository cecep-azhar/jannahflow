import { client } from "@/db";
import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";
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
     
     const tempClient = createClient({ url: `file:${dbPath}` });
     
     try {
        // Get tables from uploaded DB
        const tablesResult = await tempClient.execute(`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_litestream_seq' AND name != '_litestream_lock'`);
        const tables = tablesResult.rows as unknown as { name: string }[];
        
        for (const tableObj of tables) {
            const tableName = tableObj.name;
            
            // Check if table exists in current database and get count
            let currentCount = 0;
            try {
                const cntRes = await client.execute(`SELECT COUNT(*) as c FROM "${tableName}"`);
                currentCount = Number(cntRes.rows[0].c);
            } catch {
                // Table might not exist in the new schema, skip
                continue;
            }
            
            if (currentCount === 0) {
                // Insert records
                const dataResult = await tempClient.execute(`SELECT * FROM "${tableName}"`);
                const rows = dataResult.rows as unknown as Record<string, any>[];
                
                if (rows.length > 0) {
                    const columns = Object.keys(rows[0]);
                    const sql = `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(',')}) VALUES (${columns.map(() => '?').join(',')})`;
                    
                    // Batch insert
                    for (let i = 0; i < rows.length; i += 50) {
                      const batch = rows.slice(i, i + 50);
                      const stmts = batch.map(row => ({
                        sql,
                        args: columns.map(c => row[c] ?? null)
                      }));
                      await client.batch(stmts, "write");
                    }
                }
            }
        }
     } finally {
        await tempClient.close();
        try {
            fs.unlinkSync(dbPath);
        } catch (e) {
            console.error("Failed to cleanup restore db:", e);
        }
     }
     
     return NextResponse.json({ success: true, message: "Database berhasil di-restore untuk tabel yang kosong." });
  } catch (error) {
     console.error("Restore error:", error);
     return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
