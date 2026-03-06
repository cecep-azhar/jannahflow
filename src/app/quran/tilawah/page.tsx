import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLocalTodayStr, getLocalFormattedToday } from "@/lib/date-utils";
import { getTilawahSessions, getLastTilawahPosition, getDailyTilawahSummary } from "../actions";
import { TilawahClient } from "./tilawah-client";
import { BottomNav } from "@/components/bottom-nav";
import { Book, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { calculateTilawahProgress, getSurahName } from "@/lib/quran-data";

export const dynamic = "force-dynamic";

export default async function TilawahPage() {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("mutabaah-user-id")?.value;
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";
  if (!userIdStr) redirect("/auth");
  const userId = parseInt(userIdStr);

  const today = await getLocalTodayStr();
  const formattedDate = await getLocalFormattedToday("EEEE, dd MMMM yyyy", lang);

  const [sessions, lastPosition, summary] = await Promise.all([
    getTilawahSessions(userId, today),
    getLastTilawahPosition(userId),
    getDailyTilawahSummary(userId, today),
  ]);

  // Precompute readable names for sessions
  const sessionsWithNames = sessions.map((s) => ({
    ...s,
    startName: s.startSurah ? `${getSurahName(s.startSurah)}:${s.startAyat}` : "-",
    endName: s.endSurah ? `${getSurahName(s.endSurah)}:${s.endAyat}` : "-",
    progress: s.startSurah && s.startAyat && s.endSurah && s.endAyat
      ? calculateTilawahProgress(s.startSurah, s.startAyat, s.endSurah, s.endAyat)
      : null,
  }));

  // Suggest next start point from last session
  const suggestedStart = lastPosition?.endSurah
    ? { surahNumber: lastPosition.endSurah, ayatNumber: (lastPosition.endAyat ?? 1) + 1 }
    : { surahNumber: 1, ayatNumber: 1 };

  return (
    <div className="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="bg-linear-to-br from-emerald-500 to-teal-600 px-6 pt-8 pb-16 rounded-b-4xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
        <div className="flex items-center gap-3 mb-1 relative z-10">
          <Link href="/quran" className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="p-2 bg-white/20 rounded-lg text-white">
            <Book className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-white">Tilawah</h1>
        </div>
        <p className="text-emerald-100 text-sm relative z-10 mt-1 ml-1">{formattedDate}</p>

        {/* Summary */}
        <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 relative z-10">
          <p className="text-emerald-100 text-xs font-medium uppercase tracking-wider mb-1">Total Hari Ini</p>
          <div className="flex items-end gap-2">
            <span className="text-white text-3xl font-black">{summary.totalAyat}</span>
            <span className="text-emerald-200 text-base font-medium mb-0.5">Ayat</span>
            <span className="text-emerald-300 text-sm mb-0.5 ml-2">({summary.sessionCount} sesi)</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-10">
        <TilawahClient
          userId={userId}
          date={today}
          sessions={sessionsWithNames}
          suggestedStart={suggestedStart}
        />
      </div>

      <BottomNav />
    </div>
  );
}
