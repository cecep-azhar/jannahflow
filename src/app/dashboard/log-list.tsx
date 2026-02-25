"use client";

import { useOptimistic, startTransition } from "react";
import { toggleLog, updateCounter } from "./actions";
import { Check, BookOpen, Sun, Moon, Sunrise, Sunset, MoonStar, HeartHandshake, Coins } from "lucide-react";
import { cn } from "@/lib/utils"; // Need to create utils

import { type LucideIcon } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { useState } from "react";

// Map icon names to components
const iconMap: Record<string, LucideIcon> = {
  BookOpen, Sun, Moon, Sunrise, Sunset, MoonStar, HeartHandshake, Coins
};

type Item = {
  id: number;
  name: string;
  type: "boolean" | "counter" | string;
  category: "wajib" | "sunnah" | string;
  points: number;
  targetUnit: number | null;
  iconName: string | null;
  logValue: number;
  logId: number | null;
  levels?: string | null;
};

export function LogList({ items, userId, date }: { items: Item[]; userId: number; date: string }) {
  const [levelingItem, setLevelingItem] = useState<Item | null>(null);
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items,
    (state, updatedItem: { id: number; value: number }) => {
      return state.map((item) =>
        item.id === updatedItem.id ? { ...item, logValue: updatedItem.value } : item
      );
    }
  );

  async function handleToggle(item: Item) {
    if (item.levels) {
        setLevelingItem(item);
        return;
    }
    const newValue = item.logValue ? 0 : 1;
    startTransition(() => {
      addOptimisticItem({ id: item.id, value: newValue });
    });
    await toggleLog(userId, item.id, date, item.logValue);
  }

  async function handleSelectLevel(item: Item, points: number) {
      startTransition(() => {
          addOptimisticItem({ id: item.id, value: points });
      });
      await updateCounter(userId, item.id, date, points);
      setLevelingItem(null);
  }

  return (
    <div className="space-y-6">
      {['wajib', 'sunnah', 'kesalahan'].map((category) => (
        <div key={category}>
            <h3 className={cn("text-sm font-bold uppercase tracking-wider mb-3", category === 'kesalahan' ? "text-red-400" : "text-slate-400")}>{category}</h3>
            <div className="space-y-3">
              {optimisticItems.filter(i => i.category === category).map((item) => {
                const Icon = item.iconName && iconMap[item.iconName] ? iconMap[item.iconName] : Check;
                const hasLevels = !!item.levels;
                
                return (
                  <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
                     <div className="flex items-center gap-4">
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-colors shrink-0", 
                            item.logValue > 0 ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                        )}>
                           <Icon className="w-6 h-6" />
                        </div>
                        <div>
                           <p className="font-semibold text-base text-slate-700 dark:text-slate-200">{item.name}</p>
                           <p className="text-sm text-slate-400 dark:text-slate-500">
                             {hasLevels && item.logValue > 0 ? `${item.logValue} Poin (Terpilih)` : `${hasLevels ? 'Multiple Choice' : item.points + ' Poin'}`}
                           </p>
                        </div>
                     </div>

                     {item.type === 'counter' ? (
                        <div className="flex items-center gap-3 shrink-0">
                           <button 
                             onClick={() => {
                               const newValue = Math.max(0, (item.logValue || 0) - 1);
                               startTransition(() => {
                                 addOptimisticItem({ id: item.id, value: newValue });
                               });
                               updateCounter(userId, item.id, date, newValue);
                             }}
                             className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                           >-</button>
                           <span className="text-base font-semibold text-slate-700 dark:text-slate-200 w-8 text-center">{item.logValue || 0}</span>
                           <button 
                             onClick={() => {
                               const newValue = (item.logValue || 0) + 1;
                               startTransition(() => {
                                 addOptimisticItem({ id: item.id, value: newValue });
                               });
                               updateCounter(userId, item.id, date, newValue);
                             }}
                             className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                           >+</button>
                        </div>
                     ) : (
                        <div className="flex items-center gap-2">
                            {hasLevels && item.logValue > 0 && (
                                <button 
                                    onClick={() => handleSelectLevel(item, 0)}
                                    className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-tighter"
                                >Reset</button>
                            )}
                            <button 
                              onClick={() => handleToggle(item)}
                              className={cn(
                                "transition-all duration-200 flex items-center justify-center",
                                hasLevels 
                                  ? (item.logValue > 0 
                                      ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800" 
                                      : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 px-4 py-1.5 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700")
                                  : "w-14 h-8 rounded-full relative"
                              )}
                            >
                               {hasLevels ? (
                                   item.logValue > 0 ? "Ubah" : "Pilih"
                               ) : (
                                   <div className={cn(
                                       "w-6 h-6 bg-white rounded-full shadow-md absolute top-1 transition-all", 
                                       item.logValue > 0 ? "left-7" : "left-1"
                                   )}></div>
                               )}
                               {!hasLevels && (
                                   <div className={cn("w-full h-full rounded-full transition-colors", 
                                       item.logValue > 0 ? (category === 'kesalahan' ? "bg-red-500" : "bg-emerald-500") : "bg-slate-200 dark:bg-slate-700"
                                   )}></div>
                               )}
                            </button>
                        </div>
                     )}
                  </div>
                );
              })}
            </div>
        </div>
      ))}

      {/* Level Picker Modal */}
      {levelingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{levelingItem.name}</h4>
                        <p className="text-xs text-slate-500">Pilih tingkat pencapaian</p>
                      </div>
                      <button onClick={() => setLevelingItem(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                        <Check className="w-5 h-5 rotate-45" />
                      </button>
                  </div>
                  <div className="p-4 space-y-2">
                      {(() => {
                          try {
                              const levels = JSON.parse(levelingItem.levels || "[]") as {label: string, points: number}[];
                              return levels.map((lvl, i) => (
                                  <button 
                                    key={i} 
                                    onClick={() => handleSelectLevel(levelingItem, lvl.points)}
                                    className={cn(
                                        "w-full p-4 rounded-2xl flex justify-between items-center transition-all border",
                                        levelingItem.logValue === lvl.points 
                                            ? "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20" 
                                            : "bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600"
                                    )}
                                  >
                                      <span className="font-semibold">{lvl.label}</span>
                                      <span className="bg-emerald-100 dark:bg-emerald-900/60 px-3 py-1 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                          {lvl.points > 0 ? `+${lvl.points}` : lvl.points} Pts
                                      </span>
                                  </button>
                              ));
                          } catch { return <p className="text-center text-slate-400 py-4 text-sm">Error loading levels</p>; }
                      })()}
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50">
                      <button onClick={() => setLevelingItem(null)} className="w-full py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors">Batal</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
