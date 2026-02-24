import { db } from "@/db";
import { mutabaahLogs, users, worships } from "@/db/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { LogList } from "@/app/dashboard/log-list"; 
import { getLocalTodayStr, getLocalFormattedToday } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

export default async function MutabaahPage() {
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

  const today = await getLocalTodayStr();
  const allWorships = await db.select().from(worships);
  
  const myLogs = await db.select().from(mutabaahLogs).where(
    and(
      eq(mutabaahLogs.userId, userId),
      eq(mutabaahLogs.date, today)
    )
  );

  const myData = allWorships.map((w) => {
    const log = myLogs.find((l) => l.worshipId === w.id);
    return {
      ...w,
      logValue: log ? log.value : 0,
      logId: log ? log.id : null,
    };
  });

  const totalPoints = myData.reduce((acc, curr) => {
    if (curr.type === 'boolean') {
      return acc + (curr.logValue ? curr.points : 0);
    } else {
      return acc + (curr.logValue > 0 ? curr.points : 0); 
    }
  }, 0);

  const maxPoints = allWorships.reduce((acc, curr) => acc + (curr.points > 0 ? curr.points : 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100">
      {/* Emerald Header — matches Jurnal style */}
      <div className="bg-linear-to-br from-emerald-500 to-teal-600 text-white px-6 pt-8 pb-12 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-1">Pengisian Mutabaah</h1>
          <p className="text-emerald-100">{await getLocalFormattedToday("EEEE, dd MMMM yyyy")}</p>
          <div className="mt-4 inline-block bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold">
            Capaian Hari Ini: {totalPoints} / {maxPoints} Poin
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 relative z-10">
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <h2 className="font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <span>📝</span> Daftar Ibadah
          </h2>
          <LogList 
            items={myData} 
            userId={userId} 
            date={today} 
          />
        </section>
      </div>
    </div>
  );
}
