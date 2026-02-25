import { client } from "@/db";
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { verifyProToken } from "@/lib/pro-utils";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
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

     const formData = await req.formData();
     const file = formData.get("file") as File;
     if (!file) return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
     
     const text = await file.text();
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
     let backupData: Record<string, any[]>;
     
     try {
         backupData = JSON.parse(text);
     } catch {
         return NextResponse.json({ error: "File bukan format backup JSON yang valid" }, { status: 400 });
     }
     
     const tableNames = Object.keys(backupData);
     let restoredTables = 0;
     
     for (const tableName of tableNames) {
         const rows = backupData[tableName];
         if (!Array.isArray(rows) || rows.length === 0) continue;
         
         // Check if table exists and is empty
         let currentCount = 0;
         try {
             const cntRes = await client.execute(`SELECT COUNT(*) as c FROM "${tableName}"`);
             currentCount = Number(cntRes.rows[0].c);
         } catch {
             // Table might not exist, skip
             continue;
         }
         
         if (currentCount === 0) {
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
             restoredTables++;
         }
     }
     
     return NextResponse.json({ 
         success: true, 
         message: restoredTables > 0 
            ? `Berhasil restore ${restoredTables} tabel.` 
            : "Tidak ada tabel baru yang di-restore (tabel sudah terisi)." 
     });
  } catch (error) {
     console.error("Restore error:", error);
     return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
