import React from "react";
import { BookOpen, Book, GraduationCap, RefreshCw, PenTool, Plus, ChevronRight } from "lucide-react";
import { cookies } from "next/headers";
import { getLocalFormattedToday, getLocalTodayStr } from "@/lib/date-utils";
import { BottomNav } from "@/components/bottom-nav";
import { redirect } from "next/navigation";
import { getDailyTilawahSummary, getZiyadahList, getMurojaahReminders } from "./actions";
import Link from "next/link";
import { AppLink } from "@/components/app-link";

export const dynamic = "force-dynamic";

export default async function QuranPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";
  const userIdStr = cookieStore.get("mutabaah-user-id")?.value;
  if (!userIdStr) redirect("/auth");
  const userId = parseInt(userIdStr);

  const today = await getLocalTodayStr();
  const formattedDate = await getLocalFormattedToday("EEEE, dd MMMM yyyy", lang);

  const [summary, ziyadahList, reminders] = await Promise.all([
    getDailyTilawahSummary(userId, today),
    getZiyadahList(userId),
    getMurojaahReminders(userId),
  ]);

  const cards = [
    {
      name: "Tilawah",
      href: "/quran/tilawah",
      icon: <Book className="w-6 h-6" />,
      desc: "Bacaan Al-Quran harian",
      color: "from-emerald-500 to-teal-600",
      bgLight: "bg-emerald-50 dark:bg-emerald-900/20",
      textColor: "text-emerald-600 dark:text-emerald-400",
      badge:
        summary.totalAyat > 0
          ? `${summary.totalAyat} Ayat (${summary.sessionCount} sesi)`
          : null,
      badgeColor: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    },
    {
      name: "Murojaah",
      href: "/quran/murojaah",
      icon: <RefreshCw className="w-6 h-6" />,
      desc: "Mengulang hafalan",
      color: "from-blue-500 to-indigo-600",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
      textColor: "text-blue-600 dark:text-blue-400",
      badge: reminders.length > 0 ? `${reminders.length} perlu diulang` : null,
      badgeColor: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    },
    {
      name: "Ziyadah",
      href: "/quran/ziyadah",
      icon: <PenTool className="w-6 h-6" />,
      desc: "Tambah hafalan baru",
      color: "from-violet-500 to-purple-600",
      bgLight: "bg-violet-50 dark:bg-violet-900/20",
      textColor: "text-violet-600 dark:text-violet-400",
      badge: ziyadahList.length > 0 ? `${ziyadahList.length} surah` : null,
      badgeColor: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
    },
    {
      name: "Tadabur",
      href: "/quran/tadabur",
      icon: <BookOpen className="w-6 h-6" />,
      desc: "Mendalami makna ayat",
      color: "from-amber-500 to-orange-500",
      bgLight: "bg-amber-50 dark:bg-amber-900/20",
      textColor: "text-amber-600 dark:text-amber-400",
      badge: null,
      badgeColor: "",
    },
    {
      name: "Setoran",
      href: "/quran/setoran",
      icon: <GraduationCap className="w-6 h-6" />,
      desc: "Setoran hafalan ke guru",
      color: "from-rose-500 to-pink-600",
      bgLight: "bg-rose-50 dark:bg-rose-900/20",
      textColor: "text-rose-600 dark:text-rose-400",
      badge: null,
      badgeColor: "",
    },
  ];

  return (
    <div className="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="bg-linear-to-br from-emerald-500 to-teal-600 px-6 pt-8 pb-16 rounded-b-4xl shadow-lg mb-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white opacity-5 rounded-full blur-xl" />
        <div className="flex items-center gap-3 mb-2 relative z-10">
          <div className="p-2 bg-white/20 rounded-lg text-white shadow-lg shadow-black/10 backdrop-blur-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-white">Al-Quran</h1>
        </div>
        <p className="text-emerald-100 text-sm relative z-10">{formattedDate}</p>

        {/* Daily summary banner */}
        <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 relative z-10">
          <p className="text-emerald-100 text-xs mb-1 font-medium uppercase tracking-wider">Tilawah Hari Ini</p>
          {summary.totalAyat > 0 ? (
            <div>
              <p className="text-white text-2xl font-black">
                {summary.totalAyat} <span className="text-lg font-semibold text-emerald-100">Ayat</span>
              </p>
              <p className="text-emerald-200 text-xs mt-1">{summary.sessionCount} sesi terlaksana — Barakallah! 🌿</p>
            </div>
          ) : (
            <div>
              <p className="text-white/80 text-sm font-medium italic">Belum ada tilawah hari ini</p>
              <AppLink
                href="/quran/tilawah"
                className="mt-2 inline-flex items-center gap-1 text-xs bg-white/25 hover:bg-white/35 text-white px-3 py-1.5 rounded-full font-semibold transition-all"
              >
                <Plus className="w-3 h-3" /> Mulai Tilawah
              </AppLink>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 relative z-10 space-y-3">
        {cards.map((card) => (
          <Link
            key={card.name}
            href={card.href}
            className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 ${card.bgLight} ${card.textColor} rounded-xl group-hover:scale-105 transition-transform`}>
                {card.icon}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{card.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{card.desc}</p>
                {card.badge && (
                  <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                )}
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-colors shrink-0" />
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
