import { db } from "@/db";
import { mutabaahLogs, users, worships } from "@/db/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { LogList } from "@/app/dashboard/log-list"; 
import { getLocalTodayStr, getLocalFormattedToday } from "@/lib/date-utils";
import { calculateAge, getIslamicLevel, IslamicLevel } from "@/lib/level-utils";
import { DatePicker } from "./date-picker";
import { MemberSelector } from "./member-selector";

export const dynamic = "force-dynamic";

export default async function MutabaahPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; userId?: string }>;
}) {
  const { date: queryDate, userId: queryUserId } = await searchParams;
  const cookieStore = await cookies();
  const loggedInUserIdStr = cookieStore.get("mutabaah-user-id")?.value;
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";

  if (!loggedInUserIdStr) {
    redirect("/auth");
  }

  const loggedInUserId = parseInt(loggedInUserIdStr);
  let loggedInUser;
  try {
    loggedInUser = await db.query.users.findFirst({
      where: eq(users.id, loggedInUserId),
    });
  } catch {
    redirect("/setup");
  }

  if (!loggedInUser) {
    redirect("/auth");
  }

  // If parent, use queryUserId, otherwise always use self
  let targetUserId = loggedInUserId;
  let allFamilyMembers: (typeof users.$inferSelect)[] = [];

  if (loggedInUser.role === "parent") {
    allFamilyMembers = await db.select().from(users);
    if (queryUserId) {
      const parsedQueryId = parseInt(queryUserId);
      if (!isNaN(parsedQueryId)) {
        // Verify target exists
        const targetExists = allFamilyMembers.some(m => m.id === parsedQueryId);
        if (targetExists) targetUserId = parsedQueryId;
      }
    }
  }

  const targetUser = (targetUserId === loggedInUserId 
    ? loggedInUser 
    : allFamilyMembers.find(m => m.id === targetUserId))!;

  const todayStr = await getLocalTodayStr();
  const activeDate = queryDate || todayStr;
  
  const allWorships = await db.select().from(worships);
  
  const myLogs = await db.select().from(mutabaahLogs).where(
    and(
      eq(mutabaahLogs.userId, targetUserId),
      eq(mutabaahLogs.date, activeDate)
    )
  );

  const age = calculateAge(targetUser.birthDate);
  const level = getIslamicLevel(age, targetUser.role);

  const targetedWorships = allWorships.filter(w => {
      if (!w.targetLevels) return true;
      try {
          const targets: IslamicLevel[] = JSON.parse(w.targetLevels);
          if (targets.length === 0) return false;
          return targets.includes(level);
      } catch { return true; }
  });

  const myData = targetedWorships.map((w) => {
    const log = myLogs.find((l) => l.worshipId === w.id);
    return {
      ...w,
      logValue: log ? log.value : 0,
      logId: log ? log.id : null,
    };
  });

  const totalPoints = myData.reduce((acc, curr) => {
    if (curr.levels && curr.logValue > 0) return acc + curr.logValue;
    return acc + (curr.logValue > 0 ? curr.points : 0);
  }, 0);

  const maxPoints = targetedWorships.reduce((acc, curr) => {
    if (curr.points <= 0) return acc;
    if (curr.levels) {
        try {
            const levels = JSON.parse(curr.levels) as {points: number}[];
            const maxLvl = Math.max(...levels.map(l => l.points), curr.points);
            return acc + maxLvl;
        } catch { return acc + curr.points; }
    }
    return acc + curr.points;
  }, 0);

  // For header formatting if not today
  let formattedDateHeader = await getLocalFormattedToday("EEEE, dd MMMM yyyy", lang);
  if (activeDate !== todayStr) {
      try {
          const d = new Date(activeDate);
          formattedDateHeader = new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
          }).format(d);
      } catch {
          formattedDateHeader = activeDate;
      }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100">
      {/* Emerald Header */}
      <div className="bg-linear-to-br from-emerald-500 to-teal-600 text-white px-6 pt-8 pb-12 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-1">Mutabaah {loggedInUser.role === 'parent' ? 'Keluarga' : 'Mandiri'}</h1>
          <p className="text-emerald-100">{formattedDateHeader}</p>
          <div className="mt-4 inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold">
            Capaian {targetUser.name}: {totalPoints} / {maxPoints} Poin
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 relative z-10">
        {loggedInUser.role === 'parent' && (
            <div className="space-y-4 mb-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-1">Pilih Anggota Keluarga:</p>
                    <MemberSelector members={allFamilyMembers} activeUserId={targetUserId} />
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pilih Tanggal:</span>
                    <DatePicker activeDate={activeDate} />
                </div>
            </div>
        )}

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span>📝</span> Daftar Ibadah {targetUserId !== loggedInUserId && `(${targetUser.name})`}
          </h2>
          <LogList 
            items={myData} 
            userId={targetUserId} 
            date={activeDate} 
          />
        </section>
      </div>
    </div>
  );
}

