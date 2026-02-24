import { client } from "@/db";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { NextResponse } from "next/server";
import { getLocalFormattedToday } from "@/lib/date-utils";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Get all tables and their schema
    const result = await client.execute(`SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '_litestream_seq' AND name != '_litestream_lock'`);
    const tables = result.rows as unknown as { name: string; sql: string }[];
    
    // 2. Create temp db
    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const formattedDate = await getLocalFormattedToday("yyyy-MM-dd_HH-mm-ss");
    const dbName = `jannahflow_${formattedDate}.db`;
    const dbPath = path.join(tempDir, dbName);
    
    // Delete if already exists somehow
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    
    const sqlite = new Database(dbPath);
    
    // 3. For each table, create it and copy data
    for (const table of tables) {
       if (!table.sql) continue;
       sqlite.exec(table.sql);
       
       const dataResult = await client.execute(`SELECT * FROM \`${table.name}\``);
       const rows = dataResult.rows;
       if (rows.length > 0) {
          const columns = Object.keys(rows[0]);
          const placeholders = columns.map(() => '?').join(', ');
          const stmt = sqlite.prepare(`INSERT INTO \`${table.name}\` (${columns.map(c => `\`${c}\``).join(', ')}) VALUES (${placeholders})`);
          
          const insertMany = sqlite.transaction((rows: Record<string, unknown>[]) => {
             for (const row of rows) {
                stmt.run(columns.map(c => row[c]));
             }
          });
          
          insertMany(rows);
       }
    }
    
    sqlite.close();
    
    const fileBuffer = fs.readFileSync(dbPath);
    fs.unlinkSync(dbPath); // Cleanup
    
    return new NextResponse(fileBuffer, {
       headers: {
          "Content-Disposition": `attachment; filename="${dbName}"`,
          "Content-Type": "application/x-sqlite3",
       }
    });

  } catch (error) {
     return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
