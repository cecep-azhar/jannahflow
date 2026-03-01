import React from "react";
import { BookOpen, Book, GraduationCap, RefreshCw, PenTool } from "lucide-react";
import { cookies } from "next/headers";
import { getLocalFormattedToday } from "@/lib/date-utils";
import { BottomNav } from "@/components/bottom-nav";

export const dynamic = "force-dynamic";

export default async function QuranPage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";
  const formattedDate = await getLocalFormattedToday("EEEE, dd MMMM yyyy", lang);

  const cards = [
    { name: "Tilawah", icon: <Book className="w-6 h-6" />, desc: "Bacaan Al-Quran harian" },
    { name: "Murojaah", icon: <RefreshCw className="w-6 h-6" />, desc: "Mengulang hafalan" },
    { name: "Ziyadah", icon: <PenTool className="w-6 h-6" />, desc: "Tambah hafalan baru" },
    { name: "Tadabur", icon: <BookOpen className="w-6 h-6" />, desc: "Mendalami makna ayat" },
    { name: "Setoran", icon: <GraduationCap className="w-6 h-6" />, desc: "Setoran hafalan ke guru" },
  ];

  return (
    <div className="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Header Area */}
      <div className="bg-linear-to-br from-emerald-500 to-teal-600 px-6 pt-8 pb-12 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-white/20 rounded-lg text-white shadow-lg shadow-black/10 backdrop-blur-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-bold text-white">Al-Quran</h1>
        </div>
        <p className="text-emerald-100 text-sm">{formattedDate}</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-10 relative z-10 space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {cards.map((card) => (
            <div 
              key={card.name}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    {card.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{card.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{card.desc}</p>
                  </div>
                </div>
                <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider border border-amber-100 dark:border-amber-900/30">
                  Next Feature
                </div>
              </div>
              <div className="h-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium italic">Content under development...</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
