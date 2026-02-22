import { db } from "@/db";
import { budgets, transactions } from "@/db/schema";
import { Plus, Target, CheckCircle2, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteBudget } from "../actions";
import { like } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function BudgetsPage() {
    const allBudgets = await db.select().from(budgets);

    // Calculate real monthly spending per category (Masehi)
    const today = new Date();
    const masehiMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    const monthExpenses = await db.select()
        .from(transactions)
        .where(like(transactions.dateMasehi, `${masehiMonthPrefix}-%`));

    // Sum spending per category
    const spendingMap: Record<string, number> = {};
    for (const tx of monthExpenses) {
        if (tx.type === "EXPENSE") {
            spendingMap[tx.category] = (spendingMap[tx.category] || 0) + tx.amount;
        }
    }

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
    };

    // Budgets that are over 80% usage
    const warningBudgets = allBudgets.filter(b => {
        const spent = spendingMap[b.category] || 0;
        return spent > 0 && spent / b.monthlyLimit >= 0.8;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Perencanaan Anggaran (Budgeting)</h2>
                <Link href="/finance/budgets/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Buat Anggaran
                </Link>
            </div>

            {warningBudgets.length > 0 && (
                <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 p-4 rounded-xl flex gap-3 text-orange-800 dark:text-orange-300">
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-orange-500" />
                    <div className="text-sm">
                        <strong>⚠️ Peringatan Anggaran:</strong>{" "}
                        {warningBudgets.map(b => {
                            const spent = spendingMap[b.category] || 0;
                            const pct = Math.round((spent / b.monthlyLimit) * 100);
                            return `"${b.category}" sudah terpakai ${pct}% dari anggaran bulanan`;
                        }).join(". ")}.{" "}
                        Pertimbangkan untuk memprioritaskan kebutuhan (Daruriyat).
                    </div>
                </div>
            )}

            {allBudgets.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <Target className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-slate-600 dark:text-slate-400 font-medium">Belum ada anggaran yang dibuat</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Kelola pengeluaran keluarga lebih baik dengan menetapkan batas bulanan (Masehi/Hijri).</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allBudgets.map(b => {
                        const spent = spendingMap[b.category] || 0;
                        const percentage = b.monthlyLimit > 0 ? Math.min(Math.round((spent / b.monthlyLimit) * 100), 100) : 0;
                        const isWarning = percentage >= 80;
                        const isOver = percentage >= 100;
                        return (
                            <div key={b.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{b.category}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${b.periodType === 'HIJRI' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'}`}>
                                            Bulanan {b.periodType}
                                        </span>
                                        <form action={deleteBudget}>
                                            <input type="hidden" name="id" value={b.id} />
                                            <button type="submit" className="text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors" title="Hapus Anggaran">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                                <div className="text-indigo-600 dark:text-indigo-400 font-semibold mb-3">{formatRupiah(b.monthlyLimit)}</div>
                                
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        <span>Terpakai: {formatRupiah(spent)}</span>
                                        <span className={isOver ? 'text-red-500 font-bold' : ''}>Sisa: {formatRupiah(Math.max(b.monthlyLimit - spent, 0))}</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full transition-all ${isOver ? 'bg-red-500' : isWarning ? 'bg-orange-400' : 'bg-indigo-500'}`} 
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-right font-semibold" style={{ color: isOver ? '#ef4444' : isWarning ? '#f97316' : undefined }}>
                                        {percentage}%{isOver ? ' — Melebihi anggaran!' : isWarning ? ' — Hampir habis!' : ''}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
