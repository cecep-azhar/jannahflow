import React from "react";
import { BookOpen, Book, GraduationCap, RefreshCw, PenTool, Hash } from "lucide-react";
import { getLocalFormattedToday } from "@/lib/date-utils";
import { BottomNav } from "@/components/bottom-nav";

export const dynamic = "force-dynamic";

export default async function QuranPage() {
  const formattedDate = await getLocalFormattedToday("EEEE, dd MMMM yyyy");

  const cards = [
    { name: "Tilawah", icon: <Book className="w-6 h-6" />, desc: "Bacaan Al-Quran harian" },
    { name: "Murojaah", icon: <RefreshCw className="w-6 h-6" />, desc: "Mengulang hafalan" },
    { name: "Ziyadah", icon: <PenTool className="w-6 h-6" />, desc: "Tambah hafalan baru" },
    { name: "Tadabur", icon: <BookOpen className="w-6 h-6" />, desc: "Mendalami makna ayat" },
    { name: "Setoran", icon: <GraduationCap className="w-6 h-6" />, desc: "Setoran hafalan ke guru" },
  ];

  return (
    <main className="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950">
      <div className="p-6 max-w-2xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg text-white shadow-lg shadow-emerald-500/20">
                  <BookOpen className="w-6 h-6" />
                </div>
                <span>Al-Quran</span>
              </h1>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
                {formattedDate}
              </p>
            </div>
          </div>
        </header>

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
    </main>
  );
}
