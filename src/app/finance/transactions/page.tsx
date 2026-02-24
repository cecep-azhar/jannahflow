import { db } from "@/db";
import { transactions } from "@/db/schema";
import { Plus, ArrowDownCircle, ArrowUpCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { deleteTransaction } from "../actions";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
    const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.dateMasehi)).limit(50);
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get("mutabaah-user-role")?.value;
    const isChild = roleCookie === "child";

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Riwayat Transaksi</h2>
                {!isChild && (
                    <Link href="/finance/transactions/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors">
                        <Plus className="w-4 h-4" /> Catat Transaksi
                    </Link>
                )}
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                        <thead className="bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 font-semibold border-b dark:border-slate-800">
                            <tr>
                                <th className="px-6 py-4">Tanggal (Masehi/Hijri)</th>
                                <th className="px-6 py-4">Kategori / Deskripsi</th>
                                <th className="px-6 py-4">Status Halal-Thayyib</th>
                                <th className="px-6 py-4 text-right">Nominal</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {allTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 italic">
                                        Belum ada data transaksi
                                    </td>
                                </tr>
                            ) : (
                                allTransactions.map(t => (
                                    <tr key={t.id} className="border-b dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{t.dateMasehi}</div>
                                            <div className="text-xs text-indigo-500 dark:text-indigo-400">{t.dateHijri}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-800 dark:text-slate-200">{t.category}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{t.description || "-"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {t.isHalalCertified ? (
                                                <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-semibold">Tersertifikasi Halal/Thayyib</span>
                                            ) : (
                                                <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded text-xs">Belum dinilai</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-semibold">
                                            <div className="flex items-center justify-end gap-1">
                                                {t.type === "INCOME" ? (
                                                    <><ArrowDownCircle className="w-4 h-4 text-green-500 dark:text-green-400" /> <span className="text-green-600 dark:text-green-400">+{formatRupiah(t.amount)}</span></>
                                                ) : (
                                                    <><ArrowUpCircle className="w-4 h-4 text-red-500 dark:text-red-400" /> <span className="text-red-600 dark:text-red-400">-{formatRupiah(t.amount)}</span></>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {!isChild && (
                                                <form action={deleteTransaction}>
                                                    <input type="hidden" name="id" value={t.id} />
                                                    <input type="hidden" name="accountId" value={t.accountId} />
                                                    <input type="hidden" name="amount" value={t.amount} />
                                                    <input type="hidden" name="type" value={t.type} />
                                                    <button type="submit" className="text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors" title="Hapus Transaksi">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
