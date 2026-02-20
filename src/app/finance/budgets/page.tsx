import { db } from "@/db";
import { budgets } from "@/db/schema";
import { Plus, Target, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
    const allBudgets = await db.select().from(budgets);

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Perencanaan Anggaran (Budgeting)</h2>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Buat Anggaran
                </button>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 p-4 rounded-xl flex gap-3 text-orange-800 dark:text-orange-300">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <strong>Peringatan Dini:</strong> Anggaran &quot;Hiburan &amp; Rekreasi&quot; untuk bulan Hijriyah ini tersisa 15% lagi. Pertimbangkan untuk memprioritaskan kebutuhan (Daruriyat).
                </div>
            </div>

            {allBudgets.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-slate-600 dark:text-slate-400 font-medium">Belum ada anggaran yang dibuat</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Kelola pengeluaran keluarga lebih baik dengan menetapkan batas bulanan (Masehi/Hijri).</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allBudgets.map(b => (
                        <div key={b.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{b.category}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${b.periodType === 'HIJRI' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'}`}>
                                    Bulanan {b.periodType}
                                </span>
                            </div>
                            <div className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">{formatRupiah(b.monthlyLimit)}</div>
                            
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    <span>Terpakai: Rp 0</span>
                                    <span>Sisa: {formatRupiah(b.monthlyLimit)}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
