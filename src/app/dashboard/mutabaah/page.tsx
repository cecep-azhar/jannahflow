import { db } from "@/db";
import { mutabaahLogs, users, worships } from "@/db/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";
import { LogList } from "../log-list"; 

export const dynamic = "force-dynamic";

export default async function MutabaahPage() {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("mutabaah-user-id")?.value;

  if (!userIdStr) {
    redirect("/auth");
  }

  const userId = parseInt(userIdStr);
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    redirect("/auth");
  }

  const today = format(new Date(), "yyyy-MM-dd");
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
    <div className="p-4 max-w-5xl mx-auto space-y-6">
      <div className="bg-indigo-600 dark:bg-indigo-800 text-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-1">Pengisian Mutabaah</h1>
        <p className="text-indigo-100">{format(new Date(), "EEEE, dd MMMM yyyy")}</p>
        
        <div className="mt-4 inline-block bg-white/20 px-3 py-1.5 rounded-lg text-sm font-medium">
          Capaian Hari Ini: {totalPoints} / {maxPoints} Poin
        </div>
      </div>

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
  );
}
