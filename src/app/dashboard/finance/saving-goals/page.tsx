import { Target, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SavingGoalsPage() {
    
    // Static dummy data for structural demonstration
    const goals = [
        { id: 1, name: "Ibadah Qurban 1446", targetAmount: 4500000, currentAmount: 1500000, deadline: "1 Dzulhijjah 1446" },
        { id: 2, name: "Aqiqah Anak Ketiga", targetAmount: 7000000, currentAmount: 6800000, deadline: "Syawwal 1445" },
        { id: 3, name: "Tabungan Haji & Umroh", targetAmount: 50000000, currentAmount: 12500000, deadline: "Tanpa Batas" },
    ];

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Target Tabungan & Impian</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Buat Impian
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {goals.map(goal => {
                    const percentage = Math.round((goal.currentAmount / goal.targetAmount) * 100);
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
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Target: {goal.deadline}</p>
                                        </div>
                                    </div>
                                    {isCompleted && <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full font-bold">Tercapai 🎉</span>}
                                </div>

                                <div className="flex justify-between items-end mb-2">
                                    <div className="text-2xl font-bold text-slate-700 dark:text-slate-200">{formatRupiah(goal.currentAmount)}</div>
                                    <div className="text-sm font-medium text-slate-400 dark:text-slate-500">/ {formatRupiah(goal.targetAmount)}</div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600 dark:text-slate-400">
                                    <span>Progres</span>
                                    <span>{percentage}%</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
                                    <div 
                                        className={`h-3 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
