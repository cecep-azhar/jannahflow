"use client";

import { useState } from "react";
import { getReportData, getFinanceReportData, getJournalReportData } from "./actions"; 
import { BottomNav } from "@/components/bottom-nav";
import * as XLSX from "xlsx";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from "date-fns";
import { id } from "date-fns/locale";

type LogData = { id: number; date: string; worshipId: number; value: number; note: string | null };
type WorshipData = { id: number; name: string; type: string; category: string; points: number };
type UserReport = { id: number; name: string; role: string; totalPoints: number; logs: LogData[] };
type ReportResult = { report: UserReport[]; allWorships: WorshipData[] };
type JournalReport = { id: string; createdAt: string | null; content: string; mood: string | null; user: { name: string; role: string; } | null; };

type AccountData = { id: string; name: string; type: string; balance: number };
type TransactionData = { id: string; type: string; amount: number; category: string; description: string | null; dateMasehi: string };
type FinanceResult = { accounts: AccountData[]; transactions: TransactionData[]; summary: { totalBalance: number; totalIncome: number; totalExpense: number } };

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<"mutabaah" | "finance" | "jurnal">("mutabaah");
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [selectedUserId, setSelectedUserId] = useState<string>("all");
  const [data, setData] = useState<ReportResult | null>(null);
  const [financeData, setFinanceData] = useState<FinanceResult | null>(null);
  const [jurnalData, setJurnalData] = useState<JournalReport[] | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    setLoading(true);
    if (activeTab === "mutabaah") {
      const result = await getReportData(startDate, endDate) as ReportResult;
      setData(result);
    } else if (activeTab === "finance") {
      const result = await getFinanceReportData(startDate, endDate) as FinanceResult;
      setFinanceData(result);
    } else if (activeTab === "jurnal") {
      const result = await getJournalReportData(startDate, endDate);
      setJurnalData(result);
    }
    setLoading(false);
  }

  function handleExport() {
    if (!data) return;

    const wb = XLSX.utils.book_new();

    // Filter users for export
    const filteredReport = selectedUserId === "all" 
        ? data.report 
        : data.report.filter((u) => u.id === Number(selectedUserId));

    // Detail Sheet
    const detailRows: Record<string, string | number>[] = [];
    const interval = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });

    filteredReport.forEach((user) => {
        interval.forEach(date => {
            const dateStr = format(date, "yyyy-MM-dd");
             data.allWorships.forEach((w) => {
                 const log = user.logs.find((l) => l.date === dateStr && l.worshipId === w.id);
                 if (log && log.value !== 0) { // Export logged items
                     detailRows.push({
                         Tanggal: dateStr,
                         Nama: user.name,
                         "Ibadah / Kesalahan": w.name,
                         Status: "✅",
                         Poin: (log.value > 0 ? w.points : w.points), // Negative points for penalties
                         Keterangan: log.note || "-"
                     });
                 }
             });
        });
    });

    const wsDetail = XLSX.utils.json_to_sheet(detailRows);
    XLSX.utils.book_append_sheet(wb, wsDetail, "Laporan Detail");

    const fileNameFragment = selectedUserId === "all" ? "Semua" : filteredReport[0]?.name.replace(/\s+/g, "_");
    XLSX.writeFile(wb, `Laporan_Mutabaah_${fileNameFragment}_${startDate}_${endDate}.xlsx`);
  }

  const filteredData = data ? (
      selectedUserId === "all" 
        ? data.report 
        : data.report.filter((u) => u.id === Number(selectedUserId))
  ) : [];

  const formatRupiah = (val: number) => {
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 pb-24">

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-slate-800">Laporan & Analitik Terpadu</h1>
        </div>

        <div className="flex border-b border-slate-200 mb-6 gap-6">
            <button 
                onClick={() => { setActiveTab("mutabaah"); setData(null); }}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'mutabaah' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Laporan Mutabaah
            </button>
            <button 
                onClick={() => { setActiveTab("finance"); setFinanceData(null); }}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'finance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Laporan Keuangan
            </button>
            <button 
                onClick={() => { setActiveTab("jurnal"); setFinanceData(null); setData(null); }}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'jurnal' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Laporan Jurnal
            </button>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6 items-end bg-slate-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dari Tanggal</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              title="Dari Tanggal"
              aria-label="Dari Tanggal"
              className="p-2 border rounded-lg text-slate-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sampai Tanggal</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              title="Sampai Tanggal"
              aria-label="Sampai Tanggal"
              className="p-2 border rounded-lg text-slate-900 bg-white"
            />
          </div>
          <button 
            onClick={handleFetch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shrink-0"
          >
            {loading ? "Memuat..." : "Tampilkan Laporan"}
          </button>
          
          {activeTab === "mutabaah" && data && (
            <>
               <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Filter Nama</label>
                    <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        title="Filter Nama"
                        aria-label="Filter Nama"
                        className="p-2 border rounded-lg text-slate-900 bg-white min-w-[160px]"
                    >
                        <option value="all">Semua Anggota</option>
                        {data.report.map((u) => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
               </div>

               <button 
                    onClick={handleExport}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 shrink-0 whitespace-nowrap"
                  >
                    <span>📥</span> Export Excel
               </button>
            </>
          )}
        </div>

        {data && (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm text-slate-900">
                    <thead>
                        <tr className="bg-slate-100 border-b-2 border-slate-200">
                            <th className="p-3 text-slate-600 border">Tanggal</th>
                            <th className="p-3 text-slate-600 border">Nama</th>
                            <th className="p-3 text-slate-600 border">Ibadah / Kesalahan</th>
                            <th className="p-3 text-center text-slate-600 border">Status</th>
                            <th className="p-3 text-right text-slate-600 border">Poin</th>
                            <th className="p-3 text-slate-600 border">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.flatMap((user) => {
                           // Flatten logs for table
                           return user.logs.map((log) => {
                               const worship = data.allWorships.find((w) => w.id === log.worshipId);
                               if (!worship || log.value === 0) return null;
                               
                               const isPenalty = worship.points < 0;
                               
                               return (
                                   <tr key={log.id} className={`border-b border-slate-50 hover:bg-slate-50 ${isPenalty ? 'bg-red-50' : ''}`}>
                                       <td className="p-2 border">{format(parseISO(log.date), "dd MMM yyyy", { locale: id })}</td>
                                       <td className="p-2 border font-medium text-slate-900">{user.name}</td>
                                       <td className="p-2 border">
                                            <span className={isPenalty ? "text-red-600 font-medium" : "text-slate-700"}>
                                                {worship.name}
                                            </span>
                                       </td>
                                       <td className="p-2 border text-center">
                                            {isPenalty ? "⚠️" : "✅"}
                                       </td>
                                       <td className={`p-2 border text-right font-medium ${isPenalty ? "text-red-600" : "text-green-600"}`}>
                                            {worship.points}
                                       </td>
                                       <td className="p-2 border text-slate-500 italic">
                                           {log.note || "-"}
                                       </td>
                                   </tr>
                               );
                           }).filter(Boolean);
                        })}
                        {filteredData.every((u) => u.logs.length === 0) && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400">
                                    Belum ada data pada periode ini {selectedUserId !== "all" && "untuk pengguna ini"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                     <tfoot className="bg-slate-100 font-bold text-slate-900">
                        {filteredData.map((user) => (
                             <tr key={`total-${user.id}`}>
                                <td colSpan={4} className="p-2 border text-right">Total Poin {user.name}:</td>
                                <td className="p-2 border text-right text-blue-700">{user.totalPoints}</td>
                                <td className="p-2 border"></td>
                             </tr>
                        ))}
                    </tfoot>
                </table>
            </div>
        )}

        {activeTab === "finance" && financeData && (
             <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="text-sm text-blue-600 font-medium mb-1">Total Saldo Terkini</div>
                        <div className="text-2xl font-bold text-blue-800">{formatRupiah(financeData.summary.totalBalance)}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                        <div className="text-sm text-green-600 font-medium mb-1">Pemasukan Periode Ini</div>
                        <div className="text-2xl font-bold text-green-800">{formatRupiah(financeData.summary.totalIncome)}</div>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                        <div className="text-sm text-red-600 font-medium mb-1">Pengeluaran Periode Ini</div>
                        <div className="text-2xl font-bold text-red-800">{formatRupiah(financeData.summary.totalExpense)}</div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <h3 className="font-bold text-slate-800 mb-3 mt-4">Histori Transaksi</h3>
                    <table className="w-full text-left border-collapse text-sm text-slate-900">
                        <thead>
                            <tr className="bg-slate-100 border-b-2 border-slate-200">
                                <th className="p-3 text-slate-600 border">Tanggal</th>
                                <th className="p-3 text-slate-600 border">Kategori</th>
                                <th className="p-3 text-slate-600 border">Deskripsi</th>
                                <th className="p-3 text-slate-600 border text-center">Tipe</th>
                                <th className="p-3 text-right text-slate-600 border">Nominal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {financeData.transactions.map((tx) => (
                                <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="p-2 border">{format(parseISO(tx.dateMasehi), "dd MMM yyyy", { locale: id })}</td>
                                    <td className="p-2 border font-medium text-slate-900">{tx.category}</td>
                                    <td className="p-2 border text-slate-500 italic">{tx.description || "-"}</td>
                                    <td className="p-2 border text-center">
                                       <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tx.type === 'INCOME' ? 'bg-green-100 text-green-700' : tx.type === 'EXPENSE' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-700'}`}>
                                            {tx.type}
                                       </span>
                                    </td>
                                    <td className={`p-2 border text-right font-bold ${tx.type === 'INCOME' ? 'text-green-600' : tx.type === 'EXPENSE' ? 'text-red-600' : 'text-slate-600'}`}>
                                       {tx.type === 'EXPENSE' ? '- ' : ''}{formatRupiah(tx.amount)}
                                    </td>
                                </tr>
                            ))}
                            {financeData.transactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">
                                        Tidak ada transaksi pada periode ini
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
        )}

        {activeTab === "jurnal" && jurnalData && (
             <div className="space-y-6">
                <div className="overflow-x-auto">
                    <h3 className="font-bold text-slate-800 mb-3 mt-4">Log Jurnal Keluarga</h3>
                    <table className="w-full text-left border-collapse text-sm text-slate-900">
                        <thead>
                            <tr className="bg-slate-100 border-b-2 border-slate-200">
                                <th className="p-3 text-slate-600 border">Waktu</th>
                                <th className="p-3 text-slate-600 border">Penulis</th>
                                <th className="p-3 text-slate-600 border">Mood</th>
                                <th className="p-3 text-slate-600 border">Isi Catatan</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jurnalData.map((jurnal) => (
                                <tr key={jurnal.id} className="border-b border-slate-50 hover:bg-slate-50">
                                    <td className="p-2 border">{jurnal.createdAt ? format(parseISO(jurnal.createdAt), "dd MMM yyyy HH:mm", { locale: id }) : "-"}</td>
                                    <td className="p-2 border font-medium text-slate-900">{jurnal.user?.name}</td>
                                    <td className="p-2 border font-medium text-indigo-600">{jurnal.mood || "-"}</td>
                                    <td className="p-2 border whitespace-pre-wrap">{jurnal.content}</td>
                                </tr>
                            ))}
                            {jurnalData.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-slate-400">
                                        Tidak ada catatan jurnal pada periode ini
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
             </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

