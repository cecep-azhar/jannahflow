"use client";

import { useOptimistic } from "react";
import { toggleLog, updateCounter } from "./actions";
import { Check, BookOpen, Sun, Moon, Sunrise, Sunset, MoonStar, HeartHandshake, Coins } from "lucide-react";
import { cn } from "@/lib/utils"; // Need to create utils

// Map icon names to components
const iconMap: Record<string, any> = {
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
      {['wajib', 'sunnah'].map((category) => (
        <div key={category}>
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">{category}</h3>
           <div className="space-y-3">
             {optimisticItems.filter(i => i.category === category).map((item) => {
                const Icon = item.iconName && iconMap[item.iconName] ? iconMap[item.iconName] : Check;
                
                return (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center transition-colors", 
                            item.logValue > 0 ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                        )}>
                           <Icon className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="font-medium text-slate-700">{item.name}</p>
                           <p className="text-xs text-slate-400">{item.points} Poin</p>
                        </div>
                     </div>

                     {item.type === 'boolean' ? (
                        <button 
                          onClick={() => handleToggle(item)}
                          className={cn("w-12 h-7 rounded-full transition-colors relative",
                              item.logValue > 0 ? "bg-green-500" : "bg-slate-200"
                          )}
                        >
                           <div className={cn("w-5 h-5 bg-white rounded-full shadow-md absolute top-1 transition-all", 
                               item.logValue > 0 ? "left-6" : "left-1"
                           )}></div>
                        </button>
                     ) : (
                        <div className="flex items-center gap-3">
                           <button 
                             onClick={() => {
                               const newValue = Math.max(0, (item.logValue || 0) - 1);
                               // Optimistic update
                               addOptimisticItem({ id: item.id, value: newValue });
                               // Server action
                               updateCounter(userId, item.id, date, newValue);
                             }}
                             className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                           >-</button>
                           <span className="text-sm font-semibold text-slate-700 w-8 text-center">{item.logValue || 0}</span>
                           <button 
                             onClick={() => {
                               const newValue = (item.logValue || 0) + 1;
                               addOptimisticItem({ id: item.id, value: newValue });
                               updateCounter(userId, item.id, date, newValue);
                             }}
                             className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
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
