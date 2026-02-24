import { db } from "@/db";
import { quotes, users, worships, mutabaahLogs, journals, bondingActivities } from "@/db/schema";
import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { randomInt } from "crypto";

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

    // Seed additional dummy data for DEMO MODE
    console.log("Menghapus data dummy sebelumnya...");
    await db.run(sql`DELETE FROM \`mutabaah_logs\``);
    await db.run(sql`DELETE FROM \`users\``);
    await db.run(sql`DELETE FROM \`worships\``);
    await db.run(sql`DELETE FROM \`journals\``);
    await db.run(sql`DELETE FROM \`bonding_activities\``);
    
    // 1. Seed Users
    const newUsers = await db.insert(users).values([
        { name: "Ayah Budi", role: "parent", gender: "M", birthDate: "1985-05-15", avatarUrl: "user", targetPoints: 100, pin: "1234" },
        { name: "Ibu Siti", role: "parent", gender: "F", birthDate: "1988-08-20", avatarUrl: "heart", targetPoints: 100, pin: "1234" },
        { name: "Kak Aisyah", role: "child", gender: "F", birthDate: "2010-02-10", avatarUrl: "star", targetPoints: 80 },
        { name: "Adik Umar", role: "child", gender: "M", birthDate: "2015-11-25", avatarUrl: "smile", targetPoints: 60 },
    ]).returning({ id: users.id });

    // 2. Seed Worships (using raw SQL to bypass category enum restriction for 'kesalahan')
    await db.run(sql`INSERT INTO worships (name, type, category, points) VALUES
        ('Shalat Subuh', 'boolean', 'wajib', 20),
        ('Shalat Dzuhur', 'boolean', 'wajib', 20),
        ('Shalat Ashar', 'boolean', 'wajib', 20),
        ('Shalat Maghrib', 'boolean', 'wajib', 20),
        ('Shalat Isya', 'boolean', 'wajib', 20),
        ('Dzikir Pagi', 'boolean', 'sunnah', 10),
        ('Dzikir Petang', 'boolean', 'sunnah', 10),
        ('Tilawah 1 Juz', 'boolean', 'sunnah', 15),
        ('Nonton TV Berlebihan', 'boolean', 'kesalahan', -10)
    `);
    const newWorships = await db.select({ id: worships.id, points: worships.points }).from(worships);

    // 3. Seed Mutabaah Logs (for the last 30 days)
    // Build array of dates using local time
    const today = new Date();
    const dates = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dates.push(`${yyyy}-${mm}-${dd}`);
    }

    const logsData = [];
    const worshipsData = newWorships;
    for (const user of newUsers) {
         for (const dateStr of dates) {
             for (const worship of worshipsData) {
                  if (randomInt(0, 10) > 2) { // 70% chance of completion
                      if ((worship.points ?? 0) > 0) {
                          logsData.push({
                              userId: user.id,
                              worshipId: worship.id,
                              date: dateStr,
                              value: 1
                          });
                      }
                  }
             }
         }
    }
    
    if (logsData.length > 0) {
        // SQLite has a parameter limit per insert, so chunk inserts for large data
        for (let i = 0; i < logsData.length; i += 50) {
            await db.insert(mutabaahLogs).values(logsData.slice(i, i + 50));
        }
    }

    // 4. Seed Journals
    await db.insert(journals).values([
        { id: "uuid-j1", userId: newUsers[0].id, content: "Alhamdulillah hari ini keluarga bisa berkumpul dan shalat jamaah di masjid.", mood: "Bahagia", createdAt: `${dates[dates.length - 1]}T01:00:00.000Z` },
        { id: "uuid-j2", userId: newUsers[1].id, content: "Anak-anak sangat semangat menghafal Quran hari ini.", mood: "Bersyukur", createdAt: `${dates[dates.length - 2]}T01:00:00.000Z` }
    ]);

    // 5. Seed Bonding Activities
    type BondingCategory = "SPIRITUAL" | "FUN" | "SERVICE" | "DEEP_TALK";
    type BondingInsert = { id: string; title: string; description: string; category: BondingCategory; isCompleted: boolean; completedAt: string | null; };
    const bondingData: BondingInsert[] = [];
    for (let i = 1; i <= 100; i++) {
        const category: BondingCategory = i <= 25 ? "SPIRITUAL" : i <= 50 ? "DEEP_TALK" : i <= 75 ? "SERVICE" : "FUN";
        const isCompleted = i <= 35; // Complete first 35
        
        // Distribute completed activities over the last 30 dates
        const randomDateIndex = Math.floor(Math.random() * dates.length);
        const randomDateStr = dates[randomDateIndex];
        
        bondingData.push({
            id: `uuid-b${i}`,
            title: `Tantangan Harmoni #${i}`,
            description: `Deskripsi untuk tantangan harmoni ke-${i} dalam kategori ${category}. Lakukan bersama pasangan.`,
            category: category,
            isCompleted: isCompleted,
            completedAt: isCompleted ? `${randomDateStr}T10:00:00.000Z` : null
        });
    }

    for (let i = 0; i < bondingData.length; i += 25) {
        await db.insert(bondingActivities).values(bondingData.slice(i, i + 25));
    }
    
    return NextResponse.json({ success: true, count: parsedQuotes.length, message: "Demo Mode Aktif! Data dummy berhasil dimuat." });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

