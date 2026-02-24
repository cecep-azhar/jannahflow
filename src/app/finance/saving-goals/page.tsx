import { db } from "@/db";
import { savingGoals } from "@/db/schema";
import { Target, Plus, Trash2, PlusCircle } from "lucide-react";
import Link from "next/link";
import { deleteSavingGoal, addDeposit } from "../actions";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function SavingGoalsPage() {
    const goals = await db.select().from(savingGoals);
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get("mutabaah-user-role")?.value;
    const isChild = roleCookie === "child";

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Target Tabungan & Impian</h2>
                {!isChild && (
                    <Link href="/finance/saving-goals/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors">
                        <Plus className="w-4 h-4" /> Buat Impian
                    </Link>
                )}
            </div>

            {goals.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-slate-600 dark:text-slate-400 font-medium">Belum ada target tabungan</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Tetapkan impian keluarga Anda — Qurban, Haji, Aqiqah, dan lainnya.</p>
                    {!isChild && (
                        <Link href="/finance/saving-goals/new" className="inline-block mt-4 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                            Buat Target Pertama
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {goals.map(goal => {
                        const percentage = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
                        const isCompleted = percentage >= 100;
                        
                        return (
                            <div key={goal.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl ${isCompleted ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'}`}>
                                                <Target className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-slate-200">{goal.name}</h3>
                                                {goal.deadline && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target: {goal.deadline}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isCompleted && <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full font-bold">Tercapai 🎉</span>}
                                            {!isChild && (
                                                <form action={deleteSavingGoal}>
                                                    <input type="hidden" name="id" value={goal.id} />
                                                    <button type="submit" className="text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors" title="Hapus Target">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mb-2">
                                        <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{formatRupiah(goal.currentAmount)}</div>
                                        <div className="text-sm font-medium text-slate-400 dark:text-slate-500">/ {formatRupiah(goal.targetAmount)}</div>
                                    </div>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div>
                                        <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                                            <span>Progres</span>
                                            <span>{Math.min(percentage, 100)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                                            <div 
                                                className={`h-3 rounded-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                                style={{ width: `${Math.min(percentage, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                     {!isCompleted && !isChild && (
                                        <form action={addDeposit} className="flex gap-2 mt-2">
                                            <input type="hidden" name="id" value={goal.id} />
                                            <input 
                                                type="text" 
                                                name="amount" 
                                                placeholder="Tambah tabungan (Rp)" 
                                                className="flex-1 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" 
                                            />
                                            <button type="submit" className="bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-1 text-sm font-medium">
                                                <PlusCircle className="w-4 h-4" />
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
