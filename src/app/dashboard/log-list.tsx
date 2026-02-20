"use client";

import { useOptimistic } from "react";
import { toggleLog, updateCounter } from "./actions";
import { Check, BookOpen, Sun, Moon, Sunrise, Sunset, MoonStar, HeartHandshake, Coins } from "lucide-react";
import { cn } from "@/lib/utils"; // Need to create utils

import { type LucideIcon } from "lucide-react";

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
};

export function LogList({ items, userId, date }: { items: Item[]; userId: number; date: string }) {
  const [optimisticItems, addOptimisticItem] = useOptimistic(
    items,
    (state, updatedItem: { id: number; value: number }) => {
        return state.map((item) =>
            item.id === updatedItem.id ? { ...item, logValue: updatedItem.value } : item
        );
    }
  );

  async function handleToggle(item: Item) {
    const newValue = item.logValue ? 0 : 1;
    addOptimisticItem({ id: item.id, value: newValue });
    await toggleLog(userId, item.id, date, item.logValue);
  }

  return (
    <div className="space-y-6">
      {['wajib', 'sunnah', 'kesalahan'].map((category) => (
        <div key={category}>
           <h3 className={cn("text-sm font-bold uppercase tracking-wider mb-3", category === 'kesalahan' ? "text-red-400" : "text-slate-400")}>{category}</h3>
           <div className="space-y-3">
             {optimisticItems.filter(i => i.category === category).map((item) => {
                const Icon = item.iconName && iconMap[item.iconName] ? iconMap[item.iconName] : Check;
                
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
                           <p className="text-sm text-slate-400 dark:text-slate-500">{item.points} Poin</p>
                        </div>
                     </div>

                     {item.type === 'boolean' ? (
                        <button 
                          onClick={() => handleToggle(item)}
                          className={cn("w-14 h-8 rounded-full transition-colors relative shrink-0",
                              item.logValue > 0 ? (category === 'kesalahan' ? "bg-red-500" : "bg-emerald-500 dark:bg-emerald-500") : "bg-slate-200 dark:bg-slate-700"
                          )}
                        >
                           <div className={cn("w-6 h-6 bg-white rounded-full shadow-md absolute top-1 transition-all", 
                               item.logValue > 0 ? "left-7" : "left-1"
                           )}></div>
                        </button>
                     ) : (
                        <div className="flex items-center gap-3 shrink-0">
                           <button 
                             onClick={() => {
                               const newValue = Math.max(0, (item.logValue || 0) - 1);
                               // Optimistic update
                               addOptimisticItem({ id: item.id, value: newValue });
                               // Server action
                               updateCounter(userId, item.id, date, newValue);
                             }}
                             className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                           >-</button>
                           <span className="text-base font-semibold text-slate-700 dark:text-slate-200 w-8 text-center">{item.logValue || 0}</span>
                           <button 
                             onClick={() => {
                               const newValue = (item.logValue || 0) + 1;
                               addOptimisticItem({ id: item.id, value: newValue });
                               updateCounter(userId, item.id, date, newValue);
                             }}
                             className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                           >+</button>
                        </div>
                     )}
                  </div>
                );
             })}
           </div>
        </div>
      ))}
    </div>
  );
}
