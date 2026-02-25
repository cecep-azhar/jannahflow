import { client } from "@/db";
import { NextResponse } from "next/server";
import { getLocalFormattedToday } from "@/lib/date-utils";
import { verifyProToken } from "@/lib/pro-utils";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
     const tokenStat = await client.execute(`SELECT value FROM system_stats WHERE key = 'pro_token' LIMIT 1`);
     if (!tokenStat.rows.length) {
         return NextResponse.json({ success: false, error: "Token Pro tidak ditemukan." }, { status: 403 });
     }
     const token = String(tokenStat.rows[0].value);
     const headersList = await headers();
     let host = headersList.get('host') ?? "localhost:3000";
     host = host.split(":")[0];
     try {
       const isPro = await verifyProToken(token, host);
       if (!isPro) {
           return NextResponse.json({ success: false, error: "Fitur ini hanya untuk pengguna Pro. Token tidak valid untuk domain." }, { status: 403 });
       }
     } catch {
         return NextResponse.json({ success: false, error: "Token Pro tidak valid." }, { status: 403 });
     }

    // 1. Get all tables
    const tablesResult = await client.execute(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%' 
      AND name NOT LIKE '_litestream_%'
      AND name NOT LIKE '__drizzle_migrations'
    `);
    const tables = tablesResult.rows as unknown as { name: string }[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const backupData: Record<string, any[]> = {};
    
    // 2. Fetch data for each table
    for (const table of tables) {
       const dataResult = await client.execute(`SELECT * FROM "${table.name}"`);
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       backupData[table.name] = dataResult.rows as unknown as any[];
    }
    
    const formattedDate = await getLocalFormattedToday("yyyy-MM-dd_HH-mm-ss");
    const fileName = `jannahflow_backup_${formattedDate}.json`;
    
    const jsonString = JSON.stringify(backupData, null, 2);
    
    return new NextResponse(jsonString, {
       headers: {
          "Content-Disposition": `attachment; filename="${fileName}"`,
          "Content-Type": "application/json",
       }
    });

  } catch (error) {
     console.error("Backup error:", error);
     return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
