import { ParentView } from "./parent-view";
import { InspirationCard } from "./inspiration-card";
import { 
  LogOut, 
  HeartHandshake, 
  Trophy, 
  BookCheck, 
  BookOpen, 
  History, 
  Wallet, 
  Utensils, 
  Sparkles, 
  Activity,
  PieChart,
  Settings,
  Target,
  Eye,
  Rocket
} from "lucide-react";
import { logout } from "../actions";
import { FAQ } from "@/components/faq";
import { Footer } from "@/components/footer";
import { HeaderClock } from "@/components/header-clock";
import Link from "next/link";
import { users, mutabaahLogs, worships, systemStats, quotes as quotesSchema } from "@/db/schema";
import { db } from "@/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Image from "next/image";
import { eq, and } from "drizzle-orm";
import { getLocalTodayStr, getLocalFormattedToday, getLocalDateObj } from "@/lib/date-utils";
import { calculateAge, getIslamicLevel, IslamicLevel } from "@/lib/level-utils";

import logoImage from "../logo/logo-jannahflow-green.png";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("mutabaah-user-id")?.value;
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";

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
  
  const photoStat = await db.query.systemStats.findFirst({
    where: eq(systemStats.key, "family_photo")
  });
  const familyPhoto = photoStat?.value || null;
  
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
          const age = calculateAge(member.birthDate);
          const level = getIslamicLevel(age, member.role);

          const memberWorships = allWorships.filter(w => {
              if (!w.targetLevels) return true; // fallback to all
              try {
                  const targets: IslamicLevel[] = JSON.parse(w.targetLevels);
                  if (targets.length === 0) return false;
                  return targets.includes(level);
              } catch { return true; }
          });

          // Calculate points
          const memberPoints = memberWorships.reduce((acc, w) => {
               const log = logs.find(l => l.worshipId === w.id);
               if (!log) return acc;
               if (w.levels && log.value > 0) return acc + log.value;
               return acc + (log.value > 0 ? w.points : 0); 
          }, 0);

          const target = member.targetPoints || 100;

          // Exclude penalty points from max points
          const memberMaxPoints = memberWorships.reduce((acc, curr) => acc + (curr.points > 0 ? curr.points : 0), 0);
          const computedTarget = memberMaxPoints > 0 ? memberMaxPoints : target;

          return {
              id: member.id,
              name: member.name,
              role: member.role,
              avatarUrl: member.avatarUrl,
              avatarColor: member.avatarColor,
              points: memberPoints,
              targetPoints: computedTarget,
              percentage: Math.min(100, Math.round((memberPoints / computedTarget) * 100))
          };
      }));

      // Calculate family average for parent view
      const familyAverage = familyData.length > 0 
        ? Math.round(familyData.reduce((acc, curr) => acc + curr.percentage, 0) / familyData.length)
        : 0;

      // Fetch Quotes: Just use what's in the DB
      const allQuotesInDb = await db.select().from(quotesSchema);

      const inspirasiStat = await db.query.systemStats.findFirst({
        where: eq(systemStats.key, "show_inspirasi")
      });
      const showInspirasi = inspirasiStat ? inspirasiStat.value === "1" : true;

      // Fetch family stats
      const targetStat = await db.query.systemStats.findFirst({ where: eq(systemStats.key, "family_target") });
      const visionStat = await db.query.systemStats.findFirst({ where: eq(systemStats.key, "family_vision") });
      const missionStat = await db.query.systemStats.findFirst({ where: eq(systemStats.key, "family_mission") });

      const familyStats = {
        target: targetStat?.value || "-",
        vision: visionStat?.value || "-",
        mission: missionStat?.value || "-"
      };


      let randomQuote = null;
      if (allQuotesInDb.length > 0) {
          // Semi-random: change once per day based on date
          const todayObj = await getLocalDateObj();
          const seed = todayObj.getDate() + todayObj.getMonth() + todayObj.getFullYear();
          randomQuote = allQuotesInDb[seed % allQuotesInDb.length];
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
              </div>
            </div>
          </header>

          <main className="p-4 space-y-8">
              <div className="relative w-full h-[350px] sm:h-[450px] rounded-xl overflow-hidden shadow-sm bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30">
                 {familyPhoto ? (
                    <Image src={familyPhoto} alt="Family Hero" fill className="object-cover" />
                 ) : (
                    <div className="flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-500 opacity-60">
                        <div className="relative w-16 h-16 mb-2 opacity-80">
                            <Image src={logoImage} alt="JannahFlow" fill className="object-contain" />
                        </div>
                        <span className="font-semibold tracking-widest text-sm">JannahFlow</span>
                    </div>
                 )}
              </div>

              <section className="mt-8">

                  
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-x-3 gap-y-7 sm:gap-x-4 sm:gap-y-8">
                      <DashboardIconItem 
                        href="/mutabaah" 
                        icon={<BookCheck className="w-8 h-8" />} 
                        label="Mutabaah" 
                        color="bg-emerald-500" 
                      />
                      <DashboardIconItem 
                        href="/quran" 
                        icon={<BookOpen className="w-8 h-8" />} 
                        label="Al Quran" 
                        color="bg-teal-500" 
                      />
                      <DashboardIconItem 
                        href="/journal" 
                        icon={<History className="w-8 h-8" />} 
                        label="Jurnal" 
                        color="bg-indigo-500" 
                      />
                      <DashboardIconItem 
                        href="/bonding" 
                        icon={<HeartHandshake className="w-8 h-8" />} 
                        label="Bounding" 
                        color="bg-rose-500" 
                      />
                      <DashboardIconItem 
                        href="/finance" 
                        icon={<Wallet className="w-8 h-8" />} 
                        label="Keuangan" 
                        color="bg-amber-500" 
                      />
                      <DashboardIconItem 
                        href="/leaderboard" 
                        icon={<Trophy className="w-8 h-8" />} 
                        label="Peringkat" 
                        color="bg-blue-500" 
                      />
                      <DashboardIconItem 
                        href="/menu-makan" 
                        icon={<Utensils className="w-8 h-8" />} 
                        label="Menu" 
                        color="bg-orange-500" 
                      />
                      <DashboardIconItem 
                        href="/hana-ai" 
                        icon={<Sparkles className="w-8 h-8" />} 
                        label="Hana AI" 
                        color="bg-purple-500" 
                      />
                      <DashboardIconItem 
                        href="/log-activity" 
                        icon={<Activity className="w-8 h-8" />} 
                        label="Aktivitas" 
                        color="bg-slate-700" 
                      />
                      <DashboardIconItem 
                        href="/report" 
                        icon={<PieChart className="w-8 h-8" />} 
                        label="Laporan" 
                        color="bg-cyan-500" 
                      />
                      <DashboardIconItem 
                        href="/settings" 
                        icon={<Settings className="w-8 h-8" />} 
                        label="Setelan" 
                        color="bg-slate-500" 
                      />
                  </div>
              </section>

              {showInspirasi && randomQuote && (
                <InspirationCard initialQuote={randomQuote} />
              )}

              <FamilyStatsSection stats={familyStats} familyName={user.name} averageProgress={familyAverage} />

              <section>
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="font-bold text-slate-800 dark:text-slate-200 text-lg">Laporan Keluarga</h2>
                  </div>
                  <ParentView familyData={familyData} />
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

  


  // Using the total calculation to show to children
  const memberLogs = await db.select().from(mutabaahLogs).where(
    and(
      eq(mutabaahLogs.userId, userId),
      eq(mutabaahLogs.date, today)
    )
  );

  const age = calculateAge(user.birthDate);
  const level = getIslamicLevel(age, user.role);

  const memberWorships = allWorships.filter(w => {
      if (!w.targetLevels) return true;
      try {
          const targets: IslamicLevel[] = JSON.parse(w.targetLevels);
          if (targets.length === 0) return false;
          return targets.includes(level);
      } catch { return true; }
  });

  const totalPoints = memberWorships.reduce((acc, curr) => {
    const log = memberLogs.find(l => l.worshipId === curr.id);
    if (!log) return acc;
    if (curr.levels && log.value > 0) return acc + log.value;
    return acc + (log.value > 0 ? curr.points : 0);
  }, 0);

  const maxPoints = memberWorships.reduce((acc, curr) => acc + (curr.points > 0 ? curr.points : 0), 0);

  // Fetch Quotes: Just use what's in the DB (ensureDb run at higher level)
  const allQuotesInDb = await db.select().from(quotesSchema);

  const inspirasiStat = await db.query.systemStats.findFirst({
    where: eq(systemStats.key, "show_inspirasi")
  });
  const showInspirasi = inspirasiStat ? inspirasiStat.value === "1" : true;

  // Fetch family stats for child
  const targetStat = await db.query.systemStats.findFirst({ where: eq(systemStats.key, "family_target") });
  const visionStat = await db.query.systemStats.findFirst({ where: eq(systemStats.key, "family_vision") });
  const missionStat = await db.query.systemStats.findFirst({ where: eq(systemStats.key, "family_mission") });

  const familyStats = {
    target: targetStat?.value || "-",
    vision: visionStat?.value || "-",
    mission: missionStat?.value || "-"
  };
  
  let randomQuote = null;
  if (allQuotesInDb.length > 0) {
      const todayObj = await getLocalDateObj();
      const seed = todayObj.getDate() + todayObj.getMonth() + todayObj.getFullYear();
      randomQuote = allQuotesInDb[seed % allQuotesInDb.length];
  }

  const percentage = Math.min(100, Math.round((totalPoints / maxPoints) * 100));

  // Fetch all members to calculate family average for child view
  const allMembers = await db.select().from(usersSchema);
  const familyProgressResults = await Promise.all(allMembers.map(async (member) => {
      const memberLogs = await db.query.mutabaahLogs.findMany({
          where: and(eq(mutabaahLogs.userId, member.id), eq(mutabaahLogs.date, today))
      });
      const memberPoints = memberLogs.reduce((acc, log) => acc + log.value, 0);
      const mTarget = await db.query.systemStats.findFirst({ where: eq(systemStats.key, `target_points_${member.id}`) });
      const cTarget = mTarget ? parseInt(mTarget.value) : member.targetPoints || 100;
      return Math.min(100, Math.round((memberPoints / cTarget) * 100));
  }));
  const familyAverage = Math.round(familyProgressResults.reduce((acc, curr) => acc + curr, 0) / familyProgressResults.length);

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

        <main className="p-4 -mt-10 relative z-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-2 mb-8 border border-slate-100 dark:border-slate-800 overflow-hidden group">
        <div className="relative w-full h-[280px] sm:h-[350px] rounded-2xl overflow-hidden shadow-inner bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center">
           {familyPhoto ? (
              <Image src={familyPhoto} alt="Family Hero" fill className="object-cover" />
           ) : (
              <div className="flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-500 opacity-60">
                  <div className="relative w-16 h-16 mb-2 opacity-80">
                      <Image src={logoImage} alt="JannahFlow" fill className="object-contain" />
                  </div>
                  <span className="font-semibold tracking-widest text-sm">JannahFlow</span>
              </div>
           )}
        </div>
        </div>

        <h2 className="text-slate-400 dark:text-slate-500 font-black mb-6 flex items-center justify-between text-[11px] uppercase tracking-widest px-1">
          <span className="flex items-center gap-2"><span>📅</span> {await getLocalFormattedToday("dd MMMM yyyy", lang)}</span>
        </h2>
        
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-x-3 gap-y-7 mb-8">
            <DashboardIconItem 
              href="/mutabaah" 
              icon={<BookCheck className="w-8 h-8" />} 
              label="Mutabaah" 
              color="bg-emerald-500" 
            />
            <DashboardIconItem 
              href="/quran" 
              icon={<BookOpen className="w-8 h-8" />} 
              label="Al Quran" 
              color="bg-teal-500" 
            />
            <DashboardIconItem 
              href="/journal" 
              icon={<History className="w-8 h-8" />} 
              label="Jurnal" 
              color="bg-indigo-500" 
            />
            <DashboardIconItem 
              href="/bonding" 
              icon={<HeartHandshake className="w-8 h-8" />} 
              label="Bounding" 
              color="bg-rose-500" 
            />
            <DashboardIconItem 
              href="/finance" 
              icon={<Wallet className="w-8 h-8" />} 
              label="Keuangan" 
              color="bg-amber-500" 
            />
            <DashboardIconItem 
              href="/leaderboard" 
              icon={<Trophy className="w-8 h-8" />} 
              label="Peringkat" 
              color="bg-blue-500" 
            />
            <DashboardIconItem 
              href="/menu-makan" 
              icon={<Utensils className="w-8 h-8" />} 
              label="Menu" 
              color="bg-orange-500" 
            />
            <DashboardIconItem 
              href="/hana-ai" 
              icon={<Sparkles className="w-8 h-8" />} 
              label="Hana AI" 
              color="bg-purple-500" 
            />
            <DashboardIconItem 
              href="/log-activity" 
              icon={<Activity className="w-8 h-8" />} 
              label="Aktivitas" 
              color="bg-slate-700" 
            />
            <DashboardIconItem 
              href="/report" 
              icon={<PieChart className="w-8 h-8" />} 
              label="Laporan" 
              color="bg-cyan-500" 
            />
            <DashboardIconItem 
              href="/settings" 
              icon={<Settings className="w-8 h-8" />} 
              label="Setelan" 
              color="bg-slate-500" 
            />
        </div>

        {showInspirasi && randomQuote && (
          <div className="mb-6">
             <InspirationCard initialQuote={randomQuote} />
          </div>
        )}

        <FamilyStatsSection stats={familyStats} familyName={user.name} averageProgress={familyAverage} />
        
        <div className="pt-8 border-t border-slate-200 mt-8">
            <FAQ />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
function FamilyStatsSection({ stats, familyName, averageProgress = 0 }: { stats: { target: string; vision: string; mission: string }; familyName: string, averageProgress?: number }) {
  const displayFamilyName = familyName.startsWith("Keluarga") ? familyName : `Keluarga ${familyName}`;
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-3">
           <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
           {displayFamilyName}
        </h3>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg h-fit">
              <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-bold text-blue-700 dark:text-blue-400 text-sm mb-1">Visi</h4>
              <p className="text-slate-600 dark:text-slate-300 italic whitespace-pre-line">&quot;{stats.vision}&quot;</p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/50 pt-6 flex gap-4">
            <div className="mt-1 bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg h-fit">
              <Rocket className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="font-bold text-indigo-700 dark:text-indigo-400 text-sm mb-1">Misi</h4>
              <div className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                 {stats.mission}
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800/50 pt-6 flex gap-4">
            <div className="mt-1 bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg h-fit">
              <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm mb-1">Target Tahun Ini</h4>
              <p className="text-slate-600 dark:text-slate-300 font-medium whitespace-pre-line">{stats.target}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-emerald-500 rounded-lg p-2 text-white shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-slate-200">Notifikasi & Insight</h3>
        </div>
        <div className="text-emerald-800 dark:text-emerald-300 font-medium mb-1">
          Total capaian keluarga hari ini adalah {averageProgress}%. Ayo semangati yang belum mencapai target!
        </div>
        <div className="mt-3 w-full bg-emerald-200 dark:bg-emerald-900/50 rounded-full h-2 overflow-hidden shadow-inner">
          <div 
            className="bg-emerald-500 h-full transition-all duration-1000 ease-out" 
            style={{ width: `${averageProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}


function DashboardIconItem({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <Link href={href} className="flex flex-col items-center group active:scale-95 transition-all">
      <div className={`${color} text-white p-5 rounded-3xl mb-3 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center shadow-md`}>
        {icon}
      </div>
      <span className="text-[13px] font-black text-slate-800 dark:text-slate-200 text-center leading-none tracking-tight uppercase px-1">
        {label}
      </span>
    </Link>
  );
}
