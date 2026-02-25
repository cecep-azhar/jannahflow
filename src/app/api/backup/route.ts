import { client } from "@/db";
import fs from "fs";
import path from "path";
import { createClient } from "@libsql/client";
import { NextResponse } from "next/server";
import { getLocalFormattedToday } from "@/lib/date-utils";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Get all tables and their schema
    // Exclude internal LibSQL/SQLite tables
    const result = await client.execute(`
      SELECT name, sql 
      FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%' 
      AND name NOT LIKE '_litestream_%'
      AND name NOT LIKE '__drizzle_migrations'
      AND sql IS NOT NULL
    `);
    const tables = result.rows as unknown as { name: string; sql: string }[];
    
    // 2. Create temp db
    const tempDir = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    
    const formattedDate = await getLocalFormattedToday("yyyy-MM-dd_HH-mm-ss");
    const dbName = `jannahflow_${formattedDate}.db`;
    const dbPath = path.join(tempDir, dbName);
    
    // Delete if already exists somehow
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
    
    const tempClient = createClient({ url: `file:${dbPath}` });
    
    // 3. For each table, create it and copy data
    for (const table of tables) {
       // LibSQL sometimes returns table names with 'main.' prefix in sqlite_master
       const tableName = table.name.replace(/^main\./, '');
       console.log(`Backing up table: ${tableName}`);
       
       // Create table in temp db
       // Ensure SQL also doesn't have 'main.' prefix for table name if it was somehow included
       let createSql = table.sql.replace(new RegExp(`"main"\\."${tableName}"`, 'g'), `"${tableName}"`);
       createSql = createSql.replace(new RegExp(`main\\."${tableName}"`, 'g'), `"${tableName}"`);
       createSql = createSql.replace(new RegExp(`main\\.${tableName}`, 'g'), `"${tableName}"`);
       
       await tempClient.execute(createSql);
       
       // Fetch data from main db
       const dataResult = await client.execute(`SELECT * FROM "${tableName}"`);
       const rows = dataResult.rows as unknown as Record<string, any>[];
       
       if (rows.length > 0) {
          const columns = Object.keys(rows[0]);
          const sql = `INSERT INTO "${tableName}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
          
          // Use individual inserts to avoid complex batch/schema issues
          for (const row of rows) {
             await tempClient.execute({
                sql,
                args: columns.map(c => row[c] ?? null)
             });
          }
       }
    }
    
    await tempClient.close();
    
    const fileBuffer = fs.readFileSync(dbPath);
    try {
        fs.unlinkSync(dbPath); // Cleanup
    } catch (e) {
        console.error("Failed to cleanup temp db:", e);
    }
    
    return new NextResponse(fileBuffer, {
       headers: {
          "Content-Disposition": `attachment; filename="${dbName}"`,
          "Content-Type": "application/x-sqlite3",
       }
    });

  } catch (error) {
     console.error("Backup error:", error);
     return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
