import { cookies } from "next/headers";
import { format as dateFnsFormat } from "date-fns";

import { db } from "@/db";
import { systemStats } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getServerTimezone() {
  try {
     const forcedTz = await db.query.systemStats.findFirst({
         where: eq(systemStats.key, "timezone")
     });
     if (forcedTz && forcedTz.value) {
         return forcedTz.value;
     }

     const cookieStore = await cookies();
     return cookieStore.get("device-tz")?.value || "Asia/Jakarta";
  } catch {
     return "Asia/Jakarta";
  }
}

export async function getLocalTodayStr() {
  const tz = await getServerTimezone();
  return new Intl.DateTimeFormat('en-CA', { 
    timeZone: tz, 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).format(new Date());
}

export async function getLocalDateObj() {
  const tz = await getServerTimezone();
  const dateStr = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
  }).format(new Date());
  return new Date(dateStr);
}

// Formats the current local date with a specified date-fns format string
export async function getLocalFormattedToday(formatStr: string) {
  const localDate = await getLocalDateObj();
  return dateFnsFormat(localDate, formatStr);
}
