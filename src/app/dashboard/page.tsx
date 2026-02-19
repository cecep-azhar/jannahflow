import { db } from "@/db";
import { mutabaahLogs, users, worships } from "@/db/schema";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { format } from "date-fns";
import { LogList } from "./log-list"; 
import { ParentView } from "./parent-view";
import { LogOut } from "lucide-react";
import { logout } from "../actions";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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

  // Common data fetching
  const allWorships = await db.select().from(worships);
  
  if (user.role === "parent") {
      // Fetch all family data
      const allUsers = await db.select().from(users);
      
      const familyData = await Promise.all(allUsers.map(async (member) => {
          const logs = await db.select().from(mutabaahLogs).where(
            and(
                eq(mutabaahLogs.userId, member.id),
                eq(mutabaahLogs.date, today)
            )
          );

          // Calculate points
          const memberPoints = allWorships.reduce((acc, w) => {
               const log = logs.find(l => l.worshipId === w.id);
               if (!log) return acc;
               if (w.type === 'boolean') return acc + (log.value > 0 ? w.points : 0);
               return acc + (log.value > 0 ? w.points : 0); 
          }, 0);

          const target = member.targetPoints || 100;

          return {
              id: member.id,
              name: member.name,
              role: member.role,
              avatarUrl: member.avatarUrl,
              points: memberPoints,
              targetPoints: target,
              percentage: Math.min(100, Math.round((memberPoints / target) * 100))
          };
      }));

      // Parent's own logs
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

      return (
        <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
           <header className="bg-indigo-600 text-white p-6 rounded-b-3xl shadow-lg mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Monitor Keluarga</h1>
                <p className="text-indigo-100">{user.name}</p>
              </div>
              <div className="flex gap-2">
                 <a href="/report" className="p-2 bg-indigo-500 rounded-full hover:bg-indigo-400 transition-colors text-white" title="Laporan">
                     📊
                 </a>
                 <a href="/dashboard/settings" className="p-2 bg-indigo-500 rounded-full hover:bg-indigo-400 transition-colors text-white" title="Pengaturan">
                     ⚙️
                 </a>
                 <form action={logout}>
                    <button className="p-2 bg-indigo-500 rounded-full hover:bg-indigo-400 transition-colors text-white" title="Keluar">
                    <LogOut className="w-5 h-5" />
                    </button>
                </form>
              </div>
            </div>
          </header>

          <main className="p-4 space-y-8">
              <section>
                  <h2 className="font-bold text-slate-700 mb-4">Laporan Keluarga</h2>
                  <ParentView familyData={familyData} />
              </section>
              
               <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                       <span>📝</span> Mutabaah Saya ({format(new Date(), "dd MMM")})
                  </h2>
                   <LogList 
                      items={myData} 
                      userId={userId} 
                      date={today} 
                    />
              </section>

              <div className="pt-8 border-t border-slate-200">
                 <FAQ />
              </div>
          </main>
          
          <Footer />
        </div>
      );
  }

  // Child View logic continues... (we already fetched allWorships above, so remove duplicate const)

  
  // Get existing logs for today
  const existingLogs = await db.select().from(mutabaahLogs).where(
    and(
      eq(mutabaahLogs.userId, userId),
      eq(mutabaahLogs.date, today)
    )
  );

  // Map logs to worships
  const data = allWorships.map((w) => {
    const log = existingLogs.find((l) => l.worshipId === w.id);
    return {
      ...w,
      logValue: log ? log.value : 0,
      logId: log ? log.id : null,
    };
  });

  const totalPoints = data.reduce((acc, curr) => {
    if (curr.type === 'boolean') {
      return acc + (curr.logValue ? curr.points : 0);
    } else {
      return acc + (curr.logValue > 0 ? curr.points : 0); 
    }
  }, 0);

  const percentage = Math.min(100, Math.round((totalPoints / (user.targetPoints || 100)) * 100));

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 rounded-b-3xl shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Assalamu'alaikum,</h1>
            <p className="text-blue-100 text-lg">{user.name}</p>
          </div>
          <form action={logout}>
            <button className="p-2 bg-blue-500 rounded-full hover:bg-blue-400 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Progress Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm mb-1">Capaian Hari Ini</p>
            <div className="text-3xl font-bold">{totalPoints} <span className="text-base font-normal text-blue-200">/ {user.targetPoints} Poin</span></div>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
             <div className="absolute inset-0 rounded-full border-4 border-blue-400/30"></div>
             <div className="text-sm font-bold">{percentage}%</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        <h2 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
          <span>📅</span> {format(new Date(), "dd MMMM yyyy")}
        </h2>
        
        <LogList 
          items={data} 
          userId={userId} 
          date={today} 
        />
        
        <div className="pt-8 border-t border-slate-200 mt-8">
            <FAQ />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
