"use client";

import { useState, useMemo } from "react";
import { ArrowDownCircle, ArrowUpCircle, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { deleteTransaction } from "../actions";
import { DeleteButton } from "@/components/ui/delete-button";

interface Transaction {
    id: string;
    accountId: string;
    type: "INCOME" | "EXPENSE" | "TRANSFER";
    amount: number;
    category: string;
    description: string | null;
    dateMasehi: string;
    dateHijri: string;
    isHalalCertified: number | boolean | null;
}

interface Props {
    allTransactions: Transaction[];
    isChild: boolean;
}

const PAGE_SIZE = 10;

function formatRupiah(val: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

export function TransactionsClient({ allTransactions, isChild }: Props) {
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE" | "TRANSFER">("ALL");
    const [page, setPage] = useState(1);

    const filtered = useMemo(() => {
        return allTransactions.filter((t) => {
            if (dateFrom && t.dateMasehi < dateFrom) return false;
            if (dateTo && t.dateMasehi > dateTo) return false;
            if (typeFilter !== "ALL" && t.type !== typeFilter) return false;
            return true;
        });
    }, [allTransactions, dateFrom, dateTo, typeFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const totalIncome = filtered.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
    const totalExpense = filtered.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

    const clearFilters = () => {
        setDateFrom("");
        setDateTo("");
        setTypeFilter("ALL");
        setPage(1);
    };

    const hasFilter = dateFrom || dateTo || typeFilter !== "ALL";

    return (
        <div className="space-y-4">

            {/* Filter Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dari Tanggal</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                            className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sampai Tanggal</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                            className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tipe</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value as "ALL" | "INCOME" | "EXPENSE" | "TRANSFER"); setPage(1); }}
                            className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                            <option value="ALL">Semua Tipe</option>
                            <option value="INCOME">Pemasukan</option>
                            <option value="EXPENSE">Pengeluaran</option>
                            <option value="TRANSFER">Transfer</option>
                        </select>
                    </div>
                    {hasFilter && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" /> Reset Filter
                        </button>
                    )}
                </div>
            </div>

            {/* Summary */}
            {hasFilter && (
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">Hasil Filter</div>
                        <div className="font-bold text-slate-700 dark:text-slate-200">{filtered.length} transaksi</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40 rounded-xl px-4 py-3">
                        <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Total Pemasukan</div>
                        <div className="font-bold text-green-700 dark:text-green-300 text-sm">{formatRupiah(totalIncome)}</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-4 py-3">
                        <div className="text-xs text-red-500 dark:text-red-400 font-medium mb-1">Total Pengeluaran</div>
                        <div className="font-bold text-red-600 dark:text-red-300 text-sm">{formatRupiah(totalExpense)}</div>
                    </div>
                </div>
            )}

            {/* Table */}
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
                            {paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-slate-500 dark:text-slate-400">
                                        <Search className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                                        <div className="font-medium">Tidak ada transaksi ditemukan</div>
                                        <div className="text-xs mt-1 text-slate-400">Coba ubah filter pencarian</div>
                                    </td>
                                </tr>
                            ) : (
                                paginated.map(t => (
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
                                                    <DeleteButton title="Hapus Transaksi" confirmMessage="Apakah yakin akan dihapus?" className="text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors" />
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        Menampilkan {Math.min((safePage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(safePage * PAGE_SIZE, filtered.length)} dari {filtered.length} transaksi
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Sebelumnya
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                                .reduce<(number | "...")[]>((acc, p, idx, arr) => {
                                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push("...");
                                    acc.push(p);
                                    return acc;
                                }, [])
                                .map((p, idx) =>
                                    p === "..." ? (
                                        <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p as number)}
                                            className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                                                safePage === p
                                                    ? "bg-indigo-600 text-white"
                                                    : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                )
                            }
                        </div>

                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Berikutnya <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Simple count when only 1 page */}
            {totalPages === 1 && filtered.length > 0 && (
                <div className="text-sm text-slate-400 dark:text-slate-500 text-right">
                    {filtered.length} transaksi ditampilkan
                </div>
            )}
        </div>
    );
}
