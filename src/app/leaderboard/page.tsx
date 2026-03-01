import { db } from "@/db";
import { users, mutabaahLogs, worships } from "@/db/schema";
import { eq, and, gte } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Trophy, Star } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { BottomNav } from "@/components/bottom-nav";

export const dynamic = "force-dynamic";

type FilterType = "today" | "week" | "month" | "year";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("mutabaah-user-id")?.value;
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";

  if (!userIdStr) {
    redirect("/auth");
  }

  const { filter = "today" } = await searchParams;
  const currentFilter = filter as FilterType;

  // Calculate date range based on filter
  const now = new Date();
  let startDate = new Date();
  
  if (currentFilter === "today") {
    startDate.setHours(0, 0, 0, 0);
  } else if (currentFilter === "week") {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    startDate = new Date(now.setDate(diff));
    startDate.setHours(0, 0, 0, 0);
  } else if (currentFilter === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else if (currentFilter === "year") {
    startDate = new Date(now.getFullYear(), 0, 1);
  }

  const startDateStr = startDate.toISOString().split('T')[0];

  // Fetch all users and their logs within the date range
  const allUsers = await db.select().from(users);
  const allWorships = await db.select().from(worships);
  
  const leaderboardData = await Promise.all(
    allUsers.map(async (user) => {
      const logs = await db
        .select()
        .from(mutabaahLogs)
        .where(
          and(
            eq(mutabaahLogs.userId, user.id),
            gte(mutabaahLogs.date, startDateStr)
          )
        );

      const totalPoints = logs.reduce((acc, log) => {
        const worship = allWorships.find((w) => w.id === log.worshipId);
        if (!worship) return acc;
        // Logic similar to dashboard point calculation
        if (worship.levels && log.value > 0) return acc + log.value;
        return acc + (log.value > 0 ? worship.points : 0);
      }, 0);

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        avatarColor: user.avatarColor,
        points: totalPoints,
      };
    })
  );

  // Sort by points descending
  const sortedLeaderboard = leaderboardData.sort((a, b) => b.points - a.points);

  const filterLabels = {
    today: lang === "id" ? "Hari Ini" : "Today",
    week: lang === "id" ? "Pekan Ini" : "This Week",
    month: lang === "id" ? "Bulan Ini" : "This Month",
    year: lang === "id" ? "Tahun Ini" : "This Year",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100">
      <header className="bg-linear-to-br from-emerald-500 to-teal-600 text-white px-6 pt-8 pb-12 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-4 relative z-10 mb-4">
          <Link href="/dashboard" className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">{lang === "id" ? "Papan Peringkat" : "Leaderboard"}</h1>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 relative z-10 w-fit">
          <Trophy className="w-5 h-5 text-yellow-300" />
          <span className="text-sm font-medium">{lang === "id" ? "Keluarga Terbaik" : "Best Family Members"}</span>
        </div>
      </header>

      <main className="px-4">
        {/* Filter Tabs */}
        <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl mb-8 border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
          {(Object.keys(filterLabels) as FilterType[]).map((f) => (
            <Link
              key={f}
              href={`/leaderboard?filter=${f}`}
              className={`flex-1 min-w-[100px] py-2.5 px-4 rounded-xl text-center text-sm font-bold transition-all ${
                currentFilter === f
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200 dark:shadow-none"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              {filterLabels[f]}
            </Link>
          ))}
        </div>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-4 mb-10 pt-6">
          {/* Rank 2 */}
          {sortedLeaderboard[1] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <UserAvatar 
                  name={sortedLeaderboard[1].name} 
                  avatarUrl={sortedLeaderboard[1].avatarUrl} 
                  avatarColor={sortedLeaderboard[1].avatarColor}
                  size="lg"
                  className="ring-4 ring-slate-200 dark:ring-slate-800"
                />
                <div className="absolute -top-2 -right-2 bg-slate-300 text-slate-700 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">2</div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl w-24 h-24 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[11px] font-bold px-1 w-full text-center leading-tight">{sortedLeaderboard[1].name}</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{sortedLeaderboard[1].points} pts</span>
              </div>
            </div>
          )}

          {/* Rank 1 */}
          {sortedLeaderboard[0] && (
            <div className="flex flex-col items-center -mt-6">
              <div className="relative mb-2">
                <UserAvatar 
                  name={sortedLeaderboard[0].name} 
                  avatarUrl={sortedLeaderboard[0].avatarUrl} 
                  avatarColor={sortedLeaderboard[0].avatarColor}
                  size="lg"
                  className="ring-4 ring-yellow-400"
                />
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 border-white">1</div>
              </div>
              <div className="bg-linear-to-b from-yellow-50 to-white dark:from-yellow-950/20 dark:to-slate-900 border border-yellow-200 dark:border-yellow-900/50 rounded-t-3xl w-28 h-32 flex flex-col items-center justify-center shadow-md">
                <span className="text-sm font-black px-1 w-full text-center leading-tight">{sortedLeaderboard[0].name}</span>
                <span className="text-sm text-yellow-600 dark:text-yellow-400 font-black">{sortedLeaderboard[0].points} pts</span>
              </div>
            </div>
          )}

          {/* Rank 3 */}
          {sortedLeaderboard[2] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <UserAvatar 
                  name={sortedLeaderboard[2].name} 
                  avatarUrl={sortedLeaderboard[2].avatarUrl} 
                  avatarColor={sortedLeaderboard[2].avatarColor}
                  size="lg"
                  className="ring-4 ring-orange-200 dark:ring-orange-900/30"
                />
                <div className="absolute -top-2 -right-2 bg-orange-300 text-orange-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 border-white">3</div>
              </div>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl w-24 h-20 flex flex-col items-center justify-center shadow-sm">
                <span className="text-[11px] font-bold px-1 w-full text-center leading-tight">{sortedLeaderboard[2].name}</span>
                <span className="text-xs text-orange-600 dark:text-orange-400 font-bold">{sortedLeaderboard[2].points} pts</span>
              </div>
            </div>
          )}
        </div>

        {/* Full Ranking List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
            <span>{lang === "id" ? "Anggota Keluarga" : "Family Member"}</span>
            <span>{lang === "id" ? "Total Poin" : "Total Points"}</span>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {sortedLeaderboard.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-black w-6 ${index < 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300'}`}>
                    {index + 1}
                  </span>
                  <UserAvatar 
                    name={user.name} 
                    avatarUrl={user.avatarUrl} 
                    avatarColor={user.avatarColor}
                  />
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{user.name}</h4>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                      {user.role === 'parent' ? (lang === 'id' ? 'Orang Tua' : 'Parent') : (lang === 'id' ? 'Anak' : 'Child')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{user.points}</span>
                  <span className="text-[10px] text-slate-400 block font-bold">PTS</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-6 text-center">
            <Star className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
            <h4 className="font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              {lang === "id" ? "Ayo Berlomba dalam Kebaikan!" : "Race in Goodness!"}
            </h4>
            <p className="text-sm text-emerald-600 dark:text-emerald-400 leading-relaxed">
              {lang === "id" 
                ? "Selesaikan mutabaah harianmu untuk mengumpulkan lebih banyak poin." 
                : "Complete your daily worships to collect more points and climb the ranks."}
            </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
