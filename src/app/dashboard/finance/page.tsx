import { db } from "@/db";
import { accounts } from "@/db/schema";
import { formatMasehiDate, convertToHijri, formatHijriReadable } from "@/lib/hijri-utils";
import { Calendar, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FinanceDashboard() {
    let allAccounts: { id: string; name: string; type: string; balance: number }[] = [];
    try {
        allAccounts = await db.select().from(accounts);
    } catch (e) {
        console.error("Finance DB error:", e);
        redirect("/setup");
    }
    const totalBalance = allAccounts.reduce((sum, acc) => sum + acc.balance, 0);

    const masehiToday = formatMasehiDate();
    const hijriToday = convertToHijri();
    const hijriReadable = formatHijriReadable(hijriToday);

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-xl font-bold border-b dark:border-slate-700 pb-2 w-full md:w-auto md:border-b-0 text-slate-800 dark:text-slate-200">Ringkasan Keuangan</h2>
                <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-4 py-2 rounded-lg text-sm font-medium">
                    <Calendar className="w-4 h-4" />
                    <div className="text-right">
                        <div>{masehiToday} Masehi</div>
                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{hijriReadable}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="relative bg-indigo-500 to-indigo-700 p-6 rounded-2xl text-white shadow-lg">
                    <div className="absolute inset-0 bg-linear-to-br from-indigo-500/20 to-purple-500/20" />
                    <div className="flex items-center gap-2 text-indigo-100 mb-2">
                        <Wallet className="w-5 h-5" />
                        <span className="font-medium">Total Kekayaan Cair</span>
                    </div>
                    <div className="text-3xl font-bold">{formatRupiah(totalBalance)}</div>
                    <div className="text-sm text-indigo-200 mt-2">Dari {allAccounts.length} Akun/Dompet</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400" />
                        <span className="font-medium">Pemasukan Bulan Ini</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{formatRupiah(0)}*</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">*Segera hadir - Pemasukan Masehi/Hijri</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                        <TrendingDown className="w-5 h-5 text-red-500 dark:text-red-400" />
                        <span className="font-medium">Pengeluaran Bulan Ini</span>
                    </div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{formatRupiah(0)}*</div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-2">*Segera hadir - Pengeluaran Masehi/Hijri</div>
                </div>
            </div>

            <div className="mt-8 border-t dark:border-slate-800 pt-6">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Grafik Arus Kas (Mendatang)</h3>
                <div className="h-48 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm italic">
                    Visualisasi perbandingan Masehi vs Hijriyah akan tampil di sini
                </div>
            </div>
        </div>
    );
}
