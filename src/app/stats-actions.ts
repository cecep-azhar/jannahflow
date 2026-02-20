"use server";

import { db } from "@/db";
import { systemStats, mutabaahLogs, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function incrementViewCount() {
  const stats = await db.select().from(systemStats).where(eq(systemStats.key, "page_views")).get();

  if (stats) {
    await db.update(systemStats)
      .set({ value: String(parseInt(stats.value || "0") + 1), lastUpdated: new Date().toISOString() })
      .where(eq(systemStats.key, "page_views"));
  } else {
    await db.insert(systemStats).values({
        key: "page_views",
        value: "1",
        lastUpdated: new Date().toISOString()
    });
  }
}

export async function getSystemStats() {
    // get view count
    const views = await db.select().from(systemStats).where(eq(systemStats.key, "page_views")).get();
    
    // get last update manually since relations might not be configured
    const lastLogs = await db.select()
        .from(mutabaahLogs)
        .orderBy(desc(mutabaahLogs.timestamp))
        .limit(1);
    
    const lastLog = lastLogs[0];

    // Helper to format "Last updated by [Name] at [Time]"
    let lastUpdateInfo = "Belum ada aktivitas";
    
    if (lastLog && lastLog.timestamp) {
        // Parse UTC timestamp
        // SQLite stores as 'YYYY-MM-DD HH:MM:SS' in UTC usually if using sql`CURRENT_TIMESTAMP`
        // We append 'Z' to treat it as UTC
        const timeVal = lastLog.timestamp.endsWith('Z') ? lastLog.timestamp : lastLog.timestamp + 'Z';
        const localDate = new Date(timeVal); 
        
        const user = await db.select().from(users).where(eq(users.id, lastLog.userId)).get();
        
        const timeString = localDate.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
        const dateString = localDate.toLocaleDateString("id-ID", { day: 'numeric', month: 'short' });
        
        lastUpdateInfo = `Terakhir update oleh ${user?.name || 'Seseorang'} pada ${dateString} ${timeString}`;
    }

    return {
        views: parseInt(views?.value || "0"),
        lastUpdate: lastUpdateInfo
    };
}
