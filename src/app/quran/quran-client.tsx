"use client";

import React, { useState, useTransition } from "react";
import { BookOpen, Headphones, CheckCircle, Heart, Star, Plus, Minus, Loader2 } from "lucide-react";
import { updateQuranLog } from "./actions";
import { cn } from "@/lib/utils";

export type QuranWorship = {
  id: number;
  name: string;
  type: string;
  category: string;
  points: number;
  targetUnit: number | null;
  iconName: string | null;
  logValue: number;
};

interface QuranClientProps {
  userId: number;
  date: string;
  initialWorships: QuranWorship[];
}

export function QuranClient({ userId, date, initialWorships }: QuranClientProps) {
  const [worships, setWorships] = useState(initialWorships);
  const [, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleUpdate = async (id: number, newValue: number) => {
    setUpdatingId(id);
    startTransition(async () => {
      try {
        await updateQuranLog(userId, id, date, newValue);
        setWorships(prev => prev.map(w => w.id === id ? { ...w, logValue: newValue } : w));
      } catch (error) {
        console.error("Failed to update Quran log:", error);
      } finally {
        setUpdatingId(null);
      }
    });
  };

  const iconMap: Record<string, React.ElementType> = {
    BookOpen,
    Headphones,
    Star,
    CheckCircle,
    Heart
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {worships.map((w) => {
        const Icon = iconMap[w.iconName || "BookOpen"] || BookOpen;
        const isUpdating = updatingId === w.id;

        if (w.name === "Tadabur") {
          return (
            <div key={w.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 col-span-1 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-xl transition-colors", w.logValue > 0 ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">{w.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Merenungi makna Al-Quran</p>
                  </div>
                </div>
                <button
                  disabled={isUpdating}
                  onClick={() => handleUpdate(w.id, w.logValue > 0 ? 0 : 1)}
                  className={cn(
                    "w-12 h-6 rounded-full relative transition-all duration-200",
                    w.logValue > 0 ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                    w.logValue > 0 ? "left-7" : "left-1"
                  )}></div>
                  {isUpdating && <Loader2 className="absolute top-1 left-3 w-4 h-4 text-white animate-spin opacity-50" />}
                </button>
              </div>
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-sm italic text-slate-600 dark:text-slate-400">
                  &quot;Maka apakah mereka tidak memperhatikan Al Quran ataukah hati mereka terkunci?&quot; (QS. Muhammad: 24)
                </p>
              </div>
            </div>
          );
        }

        return (
          <div key={w.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl transition-colors", w.logValue > 0 ? "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400")}>
                <Icon className="w-6 h-6" />
              </div>
              {isUpdating && <Loader2 className="w-4 h-4 text-emerald-500 animate-spin" />}
            </div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100">{w.name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {w.name === "Tilawah" || w.name === "Setoran" ? "Halaman" : "Baris"} harian
            </p>
            
            <div className="mt-4 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
              <button
                disabled={isUpdating || w.logValue <= 0}
                onClick={() => handleUpdate(w.id, Math.max(0, w.logValue - 1))}
                className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-all disabled:opacity-30"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="text-xl font-black text-slate-800 dark:text-slate-100 tabular-nums">
                {w.logValue}
              </div>
              <button
                disabled={isUpdating}
                onClick={() => handleUpdate(w.id, w.logValue + 1)}
                className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-emerald-500 transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
