import { db } from "@/db";
import { mutabaahLogs, users, worships } from "@/db/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { LogList } from "@/app/dashboard/log-list"; 
import { getLocalTodayStr, getLocalFormattedToday } from "@/lib/date-utils";
import { calculateAge, getIslamicLevel, IslamicLevel } from "@/lib/level-utils";

export const dynamic = "force-dynamic";

export default async function MutabaahPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: queryDate } = await searchParams;
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("mutabaah-user-id")?.value;

  if (!userIdStr) {
    redirect("/auth");
  }

  const userId = parseInt(userIdStr);
  let user;
  try {
    user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
  } catch {
    redirect("/setup");
  }

  if (!user) {
    redirect("/auth");
  }

  const todayStr = await getLocalTodayStr();
  const activeDate = queryDate || todayStr;
  
  const allWorships = await db.select().from(worships);
  
  const myLogs = await db.select().from(mutabaahLogs).where(
    and(
      eq(mutabaahLogs.userId, userId),
      eq(mutabaahLogs.date, activeDate)
    )
  );
  const age = calculateAge(user.birthDate);
  const level = getIslamicLevel(age, user.role);

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
  let formattedDateHeader = await getLocalFormattedToday("EEEE, dd MMMM yyyy");
  if (queryDate && queryDate !== todayStr) {
      const d = new Date(queryDate);
      formattedDateHeader = new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
      }).format(d);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100">
      {/* Emerald Header — matches Jurnal style */}
      <div className="bg-linear-to-br from-emerald-500 to-teal-600 text-white px-6 pt-8 pb-12 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-1">Mutabaah {user.role === 'parent' ? 'Keluarga' : 'Mandiri'}</h1>
          <p className="text-emerald-100">{formattedDateHeader}</p>
          <div className="mt-4 inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold">
            Capaian: {totalPoints} / {maxPoints} Poin
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 relative z-10">
        {user.role === 'parent' && (
            <div className="mb-6 bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pilih Tanggal:</span>
                <input 
                    type="date" 
                    defaultValue={activeDate}
                    onChangeCapture={(e) => {
                        const val = (e.target as HTMLInputElement).value;
                        if (val) window.location.href = `/mutabaah?date=${val}`;
                    }}
                    className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                />
            </div>
        )}

        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span>📝</span> Daftar Ibadah
          </h2>
          <LogList 
            items={myData} 
            userId={userId} 
            date={activeDate} 
          />
        </section>
      </div>
    </div>
  );
}
