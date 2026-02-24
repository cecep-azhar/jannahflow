import { db } from "@/db";
import { accounts, transactions } from "@/db/schema";
import { formatMasehiDateTime, convertToHijri, formatHijriReadable } from "@/lib/hijri-utils";
import { Calendar, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { redirect } from "next/navigation";
import { like, or } from "drizzle-orm";

export const dynamic = "force-dynamic";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function getLast6Months(): { year: number; month: number; label: string; prefix: string }[] {
    const result = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        result.push({
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            label: MONTH_NAMES[d.getMonth()],
            prefix: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        });
    }
    return result;
}

export default async function FinanceDashboard() {
    let allAccounts: { id: string; name: string; type: string; balance: number }[] = [];
    let pemasukan = 0;
    let pengeluaran = 0;
    let allTransactions: { type: string; amount: number; dateMasehi: string }[] = [];

    try {
        allAccounts = await db.select().from(accounts);

        const today = new Date();
        const masehiMonthPrefix = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

        // Get last 6 months for chart
        const months = getLast6Months();

        allTransactions = await db
            .select({ type: transactions.type, amount: transactions.amount, dateMasehi: transactions.dateMasehi })
            .from(transactions)
            .where(or(...months.map(m => like(transactions.dateMasehi, `${m.prefix}-%`))));

        // Current month totals
        for (const tx of allTransactions) {
            if (!tx.dateMasehi.startsWith(masehiMonthPrefix)) continue;
            if (tx.type === "INCOME") pemasukan += tx.amount;
            else if (tx.type === "EXPENSE") pengeluaran += tx.amount;
        }

    } catch (e) {
        console.error("Finance DB error:", e);
        redirect("/setup");
    }

    const totalBalance = allAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const masehiToday = formatMasehiDateTime();
    const hijriToday = convertToHijri();
    const hijriReadable = formatHijriReadable(hijriToday);

    const formatRupiah = (val: number) =>
        new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

    const formatShort = (val: number) => {
        if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}jt`;
        if (val >= 1_000) return `${(val / 1_000).toFixed(0)}rb`;
        return val.toString();
    };

    // Build per-month chart data
    const months = getLast6Months();
    const chartData = months.map(m => {
        let inc = 0, exp = 0;
        for (const tx of allTransactions) {
            if (!tx.dateMasehi.startsWith(m.prefix)) continue;
            if (tx.type === "INCOME") inc += tx.amount;
            else if (tx.type === "EXPENSE") exp += tx.amount;
        }
        return { label: m.label, income: inc, expense: exp };
    });

    const maxVal = Math.max(...chartData.flatMap(d => [d.income, d.expense]), 1);
    const hasData = chartData.some(d => d.income > 0 || d.expense > 0);

    // SVG chart dimensions
    const W = 560, H = 180;
    const PAD_L = 50, PAD_R = 16, PAD_T = 16, PAD_B = 36;
    const chartW = W - PAD_L - PAD_R;
    const chartH = H - PAD_T - PAD_B;
    const groupW = chartW / months.length;
    const barW = Math.min(groupW * 0.35, 28);
    const gap = barW * 0.4;

    // Y gridlines
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => ({
        y: PAD_T + chartH * (1 - pct),
        label: pct === 0 ? "0" : formatShort(maxVal * pct),
    }));

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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="relative bg-linear-to-br from-emerald-500 to-teal-600 p-6 rounded-2xl text-white shadow-lg min-h-[150px] flex flex-col justify-between">
                    <div className="absolute inset-0 bg-white/5 rounded-2xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 text-emerald-100 mb-2">
                            <Wallet className="w-5 h-5" />
                            <span className="font-medium">Total Kekayaan Cair</span>
                        </div>
                        <div className="text-3xl font-bold">{formatRupiah(totalBalance)}</div>
                    </div>
                    <p className="text-sm text-emerald-200 mt-2 relative z-10">Dari {allAccounts.length} Akun/Dompet</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm min-h-[150px] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400" />
                            <span className="font-medium">Pemasukan Bulan Ini</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{formatRupiah(pemasukan)}</div>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed italic">Berdasarkan data {masehiToday.split(" ").slice(1, 4).join(" ")}</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm min-h-[150px] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
                            <TrendingDown className="w-5 h-5 text-red-500 dark:text-red-400" />
                            <span className="font-medium">Pengeluaran Bulan Ini</span>
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-200">{formatRupiah(pengeluaran)}</div>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed italic">Berdasarkan data {masehiToday.split(" ").slice(1, 4).join(" ")}</p>
                </div>
            </div>

            {/* Cash Flow Chart */}
            <div className="mt-8 border-t dark:border-slate-800 pt-6">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">Arus Kas — 6 Bulan Terakhir</h3>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-indigo-500 inline-block"></span>
                            <span className="text-slate-500 dark:text-slate-400">Pemasukan</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-sm bg-rose-400 inline-block"></span>
                            <span className="text-slate-500 dark:text-slate-400">Pengeluaran</span>
                        </span>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 overflow-x-auto">
                    {!hasData ? (
                        <div className="h-48 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="text-sm italic">Belum ada transaksi. Mulai catat untuk melihat grafik.</p>
                        </div>
                    ) : (
                        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: "300px", height: `${H + 8}px` }}>
                            {/* Grid lines */}
                            {gridLines.map((g, i) => (
                                <g key={i}>
                                    <line
                                        x1={PAD_L} y1={g.y} x2={W - PAD_R} y2={g.y}
                                        stroke="currentColor" strokeOpacity="0.08" strokeWidth="1"
                                        strokeDasharray={i === 0 ? "0" : "4 4"}
                                        className="text-slate-600"
                                    />
                                    <text x={PAD_L - 6} y={g.y + 4} textAnchor="end" fontSize="10" className="fill-slate-400 dark:fill-slate-500" fill="#94a3b8">
                                        {g.label}
                                    </text>
                                </g>
                            ))}

                            {/* Bars */}
                            {chartData.map((d, i) => {
                                const cx = PAD_L + groupW * i + groupW / 2;
                                const incH = maxVal > 0 ? (d.income / maxVal) * chartH : 0;
                                const expH = maxVal > 0 ? (d.expense / maxVal) * chartH : 0;
                                const incX = cx - gap / 2 - barW;
                                const expX = cx + gap / 2;
                                const baseY = PAD_T + chartH;

                                return (
                                    <g key={i}>
                                        {/* Income bar */}
                                        {d.income > 0 && (
                                            <>
                                                <rect
                                                    x={incX} y={baseY - incH}
                                                    width={barW} height={incH}
                                                    rx="4" ry="4"
                                                    fill="#6366f1"
                                                    opacity="0.9"
                                                />
                                                {incH > 18 && (
                                                    <text x={incX + barW / 2} y={baseY - incH + 12} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">
                                                        {formatShort(d.income)}
                                                    </text>
                                                )}
                                            </>
                                        )}
                                        {d.income === 0 && (
                                            <rect x={incX} y={baseY - 2} width={barW} height={2} rx="1" fill="#6366f1" opacity="0.2" />
                                        )}

                                        {/* Expense bar */}
                                        {d.expense > 0 && (
                                            <>
                                                <rect
                                                    x={expX} y={baseY - expH}
                                                    width={barW} height={expH}
                                                    rx="4" ry="4"
                                                    fill="#fb7185"
                                                    opacity="0.9"
                                                />
                                                {expH > 18 && (
                                                    <text x={expX + barW / 2} y={baseY - expH + 12} textAnchor="middle" fontSize="9" fill="white" fontWeight="600">
                                                        {formatShort(d.expense)}
                                                    </text>
                                                )}
                                            </>
                                        )}
                                        {d.expense === 0 && (
                                            <rect x={expX} y={baseY - 2} width={barW} height={2} rx="1" fill="#fb7185" opacity="0.2" />
                                        )}

                                        {/* Month label */}
                                        <text
                                            x={cx} y={H - PAD_B + 16}
                                            textAnchor="middle" fontSize="11"
                                            fontWeight="600"
                                            fill="#94a3b8"
                                        >
                                            {d.label}
                                        </text>
                                    </g>
                                );
                            })}

                            {/* Baseline */}
                            <line
                                x1={PAD_L} y1={PAD_T + chartH}
                                x2={W - PAD_R} y2={PAD_T + chartH}
                                stroke="#94a3b8" strokeWidth="1" strokeOpacity="0.3"
                            />
                        </svg>
                    )}
                </div>

                {/* Net summary row */}
                {hasData && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                        {chartData.slice(-3).map((d, i) => {
                            const net = d.income - d.expense;
                            return (
                                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 text-center border border-slate-100 dark:border-slate-800">
                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">{d.label}</div>
                                    <div className={`text-sm font-bold ${net >= 0 ? "text-indigo-600 dark:text-indigo-400" : "text-rose-500 dark:text-rose-400"}`}>
                                        {net >= 0 ? "+" : ""}{formatShort(net)}
                                    </div>
                                    <div className="text-xs text-slate-400 dark:text-slate-500">net</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
