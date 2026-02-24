import { ParentView } from "./parent-view";
import { LogOut, HeartHandshake, Trophy } from "lucide-react";
import { logout } from "../actions";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { HeaderClock } from "@/components/header-clock";
import Link from "next/link";
import { users, mutabaahLogs, worships, systemStats, quotes as quotesSchema } from "@/db/schema";
import { db } from "@/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and, sql } from "drizzle-orm";
import { format, getDayOfYear } from "date-fns";
import { parseQuotes } from "@/db/seed-quotes";
const quotesData = parseQuotes();
import { getLocalTodayStr, getLocalFormattedToday, getLocalDateObj } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
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

          // Exclude penalty points from max points
          const memberMaxPoints = allWorships.reduce((acc, curr) => acc + (curr.points > 0 ? curr.points : 0), 0);
          const computedTarget = memberMaxPoints > 0 ? memberMaxPoints : target;

          return {
              id: member.id,
              name: member.name,
              role: member.role,
              avatarUrl: member.avatarUrl,
              points: memberPoints,
              targetPoints: computedTarget,
              percentage: Math.min(100, Math.round((memberPoints / computedTarget) * 100))
          };
      }));

      // Fetch Quotes with auto-seed fallback
      let allQuotes: { id?: number; text: string; source: string; category: string }[] = [];
      try {
          allQuotes = await db.select().from(quotesSchema);
          if (allQuotes.length === 0) {
              allQuotes = quotesData;
          }
      } catch {
          console.warn("Quotes table missing or empty, using local JSON.");
          allQuotes = quotesData;
          try {
              await db.run(sql`CREATE TABLE IF NOT EXISTS \`quotes\` (\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL, \`text\` text NOT NULL, \`source\` text NOT NULL, \`category\` text NOT NULL)`);
          } catch(e) {}
      }

      const inspirasiStat = await db.query.systemStats.findFirst({
        where: eq(systemStats.key, "show_inspirasi")
      });
      const showInspirasi = inspirasiStat ? inspirasiStat.value === "1" : true;

      const familyName = await db.query.systemStats.findFirst({
        where: eq(systemStats.key, "family_name")
      });

      const familyTarget = await db.query.systemStats.findFirst({
        where: eq(systemStats.key, "family_target")
      });

      const familyVision = await db.query.systemStats.findFirst({
        where: eq(systemStats.key, "family_vision")
      });

      const familyMission = await db.query.systemStats.findFirst({
        where: eq(systemStats.key, "family_mission")
      });

      let randomQuote = null;
      if (allQuotes.length > 0) {
          const localDeviceDate = await getLocalDateObj();
          const dayOfYear = getDayOfYear(localDeviceDate);
          const year = localDeviceDate.getFullYear();
          const seed = dayOfYear + year;
          randomQuote = allQuotes[seed % allQuotes.length];
      }

      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100">
           <header className="bg-linear-to-br from-emerald-500 to-teal-600 text-white px-6 pt-8 pb-12 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="flex justify-between items-center relative z-10">
              <div>
                <h1 className="text-3xl font-bold">Hi, {user.name}</h1>
                <p className="text-emerald-100">Dashboard</p>
              </div>
              <div className="flex items-center gap-4">
                <HeaderClock />
                <form action={logout}>
                   <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors" title="Keluar">
                   <LogOut className="w-5 h-5" />
                   </button>
                </form>
              </div>
            </div>
          </header>

          <main className="p-4 space-y-8">
              {showInspirasi && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500">
                        <span className="text-8xl font-serif">&quot;</span>
                    </div>
                    <h3 className="font-bold text-slate-500 dark:text-slate-400 text-sm mb-2 uppercase tracking-wide flex items-center gap-2">
                        <span>💡</span> Inspirasi Harian
                    </h3>
                    {randomQuote ? (
                        <blockquote className="space-y-2 relative z-10 mt-2">
                            <p className="text-base md:text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic">&quot;{randomQuote.text}&quot;</p>
                            <footer className="text-sm font-bold text-emerald-600 dark:text-emerald-400">— {randomQuote.source}</footer>
                        </blockquote>
                    ) : (
                        <p className="text-sm text-slate-500 italic z-10 relative">&quot;Keluarga adalah anugerah terindah. Jaga dan rawatlah dengan iman.&quot;</p>
                    )}
                </div>
              )}

              {(familyTarget?.value || familyVision?.value || familyMission?.value) && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg border-b border-slate-100 dark:border-slate-800 pb-2">
                    Keluarga {familyName?.value || ""}
                  </h3>
                  
                  {familyTarget?.value && (
                    <div>
                      <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">🎯 Target Tahun Ini</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{familyTarget.value}</p>
                    </div>
                  )}

                  {familyVision?.value && (
                    <div>
                      <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">👁️ Visi</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 italic">&quot;{familyVision.value}&quot;</p>
                    </div>
                  )}

                  {familyMission?.value && (
                    <div>
                      <h4 className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">🚀 Misi</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 whitespace-pre-wrap">{familyMission.value}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2 text-lg">
                    <Trophy className="w-6 h-6" /> Notifikasi & Insight
                </h3>
                <p className="text-emerald-700 dark:text-emerald-400 text-base leading-relaxed">
                    Total capaian keluarga hari ini adalah <span className="font-bold">{
                        Math.round(familyData.reduce((acc, curr) => acc + curr.percentage, 0) / (familyData.length || 1))
                    }%</span>. 
                    {familyData.some(m => m.percentage < 50) ? " Ayo semangati yang belum mencapai target!" : " Alhamdulillah, pertahankan!"}
                </p>
              </div>

              <section>
                  <h2 className="font-bold text-slate-700 mb-4">Laporan Keluarga</h2>
                  <ParentView familyData={familyData} />
              </section>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center shadow-sm">
                  <div className="text-4xl mb-3">📝</div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Mutabaah Harian</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Yuk lengkapi amalan dan laporan mutabaah harianmu hari ini.</p>
                  <a href="/mutabaah" className="inline-block bg-emerald-600 text-white font-medium px-6 py-2 rounded-full hover:bg-emerald-700 transition">
                     Isi Mutabaah Saya
                  </a>
              </div>

              <div className="bg-linear-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-900/20 border border-rose-100 dark:border-rose-900/50 rounded-xl p-6 text-center shadow-sm relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 opacity-10">
                      <HeartHandshake className="w-32 h-32 text-rose-500" />
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                      <div className="bg-white dark:bg-slate-900 p-3 rounded-full shadow-sm text-rose-500 mb-4 inline-block">
                          <HeartHandshake className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 text-lg">Bounding Card <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-500 px-2 py-0.5 rounded-full font-bold ml-1 align-middle">PRO</span></h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 leading-relaxed">
                          Ruang khusus untuk membangun kedekatan. Selesaikan tantangan keharmonisan dan perkuat ikatan cinta keluarga.
                      </p>
                      <Link href="/bonding" className="inline-block bg-rose-500 text-white font-medium px-6 py-2.5 rounded-full hover:bg-rose-600 transition shadow-md hover:shadow-lg w-full sm:w-auto">
                         Buka Bounding Card
                      </Link>
                  </div>
              </div>

              <div className="pt-8 border-t border-slate-200">
                 <FAQ />
              </div>
          </main>
          
          <Footer />
        </div>
      );
  }

  // Child View logic continues... (we already fetched allWorships above, so remove duplicate const)

  


  // Using the total calculation to show to children
  const memberLogs = await db.select().from(mutabaahLogs).where(
    and(
      eq(mutabaahLogs.userId, userId),
      eq(mutabaahLogs.date, today)
    )
  );
  const totalPoints = allWorships.reduce((acc, curr) => {
    const log = memberLogs.find(l => l.worshipId === curr.id);
    if (!log) return acc;
    if (curr.type === 'boolean') {
      return acc + (log.value > 0 ? curr.points : 0);
    } else {
      return acc + (log.value > 0 ? curr.points : 0); 
    }
  }, 0);

  const maxPoints = allWorships.reduce((acc, curr) => acc + (curr.points > 0 ? curr.points : 0), 0);

  // Fetch Quotes with auto-seed fallback
  let allQuotes: { id?: number; text: string; source: string; category: string }[] = [];
  try {
      allQuotes = await db.select().from(quotesSchema);
      if (allQuotes.length === 0) {
          allQuotes = quotesData;
      }
  } catch {
      allQuotes = quotesData;
      // Table already created by parent view if hit first, but handle concurrency just in case
      try {
          await db.run(sql`CREATE TABLE IF NOT EXISTS \`quotes\` (\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL, \`text\` text NOT NULL, \`source\` text NOT NULL, \`category\` text NOT NULL)`);
      } catch {}
  }

  const inspirasiStat = await db.query.systemStats.findFirst({
    where: eq(systemStats.key, "show_inspirasi")
  });
  const showInspirasi = inspirasiStat ? inspirasiStat.value === "1" : true;
  
  let randomQuote = null;
  if (allQuotes.length > 0) {
      const localDeviceDate = await getLocalDateObj();
      const dayOfYear = getDayOfYear(localDeviceDate);
      const year = localDeviceDate.getFullYear();
      const seed = dayOfYear + year;
      randomQuote = allQuotes[seed % allQuotes.length];
  }

  const percentage = Math.min(100, Math.round((totalPoints / maxPoints) * 100));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="bg-linear-to-br from-emerald-500 to-teal-600 text-white px-6 pt-8 pb-14 rounded-b-4xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="flex justify-between items-center mb-6 relative z-10">
          <div>
            <h1 className="text-3xl font-bold">Assalamu&apos;alaikum,</h1>
            <p className="text-emerald-100 text-lg">{user.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <HeaderClock />
            <form action={logout}>
              <button className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Progress Card */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 flex items-center justify-between relative z-10">
          <div>
            <p className="text-emerald-100 text-sm mb-1">Capaian Hari Ini</p>
            <div className="text-3xl font-bold">{totalPoints} <span className="text-base font-normal text-emerald-200">/ {maxPoints} Poin</span></div>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
             <div className="absolute inset-0 rounded-full border-4 border-white/30"></div>
             <div className="text-sm font-bold">{percentage}%</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4">
        {showInspirasi && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-xl p-6 shadow-sm mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10 text-emerald-500">
                  <span className="text-8xl font-serif">&quot;</span>
              </div>
              <h3 className="font-bold text-slate-500 dark:text-slate-400 text-sm mb-2 uppercase tracking-wide flex items-center gap-2">
                  <span>💡</span> Inspirasi Harian
              </h3>
              {randomQuote ? (
                  <blockquote className="space-y-2 relative z-10 mt-2">
                      <p className="text-base md:text-lg text-slate-800 dark:text-slate-200 font-medium leading-relaxed italic">&quot;{randomQuote.text}&quot;</p>
                      <footer className="text-sm font-bold text-emerald-600 dark:text-emerald-400">— {randomQuote.source}</footer>
                  </blockquote>
              ) : (
                  <p className="text-sm text-slate-500 italic z-10 relative">&quot;Keluarga adalah anugerah terindah. Jaga dan rawatlah dengan iman.&quot;</p>
              )}
          </div>
        )}

        <h2 className="text-slate-800 font-semibold mb-4 flex items-center gap-2">
          <span>📅</span> {await getLocalFormattedToday("dd MMMM yyyy")}
        </h2>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center shadow-sm">
            <div className="text-4xl mb-3">📝</div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2">Mutabaah Harian</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Yuk lengkapi amalan dan mutabaah harianmu agar target poin tercapai.</p>
            <a href="/mutabaah" className="inline-block bg-emerald-600 text-white font-medium px-6 py-2 rounded-full hover:bg-emerald-700 transition">
               Isi Mutabaah Sekarang
            </a>
        </div>
        
        <div className="pt-8 border-t border-slate-200 mt-8">
            <FAQ />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
