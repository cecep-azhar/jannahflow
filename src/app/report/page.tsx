"use client";

import { useState, Fragment } from "react";
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

    // Detail Sheet Pivot Layout
    const detailRows: Record<string, string | number>[] = [];
    const interval = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });

    filteredReport.forEach((user) => {
        data.allWorships.forEach((w) => {
            const row: Record<string, string | number> = {
                "Nama Anggota": user.name,
                "Ibadah / Kesalahan": w.name,
            };
            
            let totalPoin = 0;
            interval.forEach(date => {
                const dateStr = format(date, "yyyy-MM-dd");
                const colHeader = format(date, "dd/MM");
                const log = user.logs.find((l) => l.date === dateStr && l.worshipId === w.id);
                
                if (log && log.value !== 0) {
                    const pts = log.value > 0 ? w.points : 0;
                    totalPoin += pts;
                    row[colHeader] = w.points < 0 ? `⚠️ ${pts}` : `✅ ${pts}`;
                } else {
                    row[colHeader] = "-";
                }
            });
            row["Total Poin"] = totalPoin;
            detailRows.push(row);
        });
    });

    const wsDetail = XLSX.utils.json_to_sheet(detailRows);
    XLSX.utils.book_append_sheet(wb, wsDetail, "Laporan Pivot");

    const fileNameFragment = selectedUserId === "all" ? "Semua" : filteredReport[0]?.name.replace(/\s+/g, "_");
    XLSX.writeFile(wb, `Laporan_Mutabaah_${fileNameFragment}_${startDate}_${endDate}.xlsx`);
  }

  const interval = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });

  const filteredData = data ? (
      selectedUserId === "all" 
        ? data.report 
        : data.report.filter((u) => u.id === Number(selectedUserId))
  ) : [];

  const formatRupiah = (val: number) => {
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-24">

      {/* Emerald Header Banner */}
      <div className="bg-linear-to-br from-emerald-500 to-teal-600 px-6 pt-8 pb-12 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-1">Laporan & Analitik</h1>
          <p className="text-emerald-100 text-sm">Ringkasan mutabaah, keuangan, dan jurnal keluarga dalam satu tempat.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden">

        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 px-6">
            <button 
                onClick={() => { setActiveTab("mutabaah"); setData(null); }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'mutabaah' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                Laporan Mutabaah
            </button>
            <button 
                onClick={() => { setActiveTab("finance"); setFinanceData(null); }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'finance' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                Laporan Keuangan
            </button>
            <button 
                onClick={() => { setActiveTab("jurnal"); setFinanceData(null); setData(null); }}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'jurnal' ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
                Laporan Jurnal
            </button>
        </div>
        
        <div className="p-6">
        <div className="flex flex-wrap gap-4 mb-6 items-end bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dari Tanggal</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              title="Dari Tanggal"
              aria-label="Dari Tanggal"
              className="p-2 border dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sampai Tanggal</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              title="Sampai Tanggal"
              aria-label="Sampai Tanggal"
              className="p-2 border dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900"
            />
          </div>
          <button 
            onClick={handleFetch}
            disabled={loading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 shrink-0"
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
                <table className="w-full text-left border-collapse text-sm text-slate-900 border-spacing-0">
                    <thead>
                        <tr className="bg-slate-100 border-b-2 border-slate-200">
                            <th className="p-3 text-slate-600 border whitespace-nowrap sticky left-0 bg-slate-100 z-10 w-48 min-w-[200px]">Ibadah / Kesalahan</th>
                            {interval.map((date, idx) => (
                                <th key={idx} className="p-3 text-center text-slate-600 border whitespace-nowrap min-w-[60px]">
                                    {format(date, "dd/MM")}
                                </th>
                            ))}
                            <th className="p-3 text-right text-slate-600 border whitespace-nowrap sticky right-0 bg-slate-100 z-10">Total Poin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((user) => {
                           return (
                               <Fragment key={user.id}>
                                   {data.allWorships.map((worship) => {
                                       const isPenalty = worship.points < 0;
                                       let userWorshipTotalPoints = 0;
                                       
                                       const cols = interval.map(date => {
                                           const dateStr = format(date, "yyyy-MM-dd");
                                           const log = user.logs.find(l => l.date === dateStr && l.worshipId === worship.id);
                                           if (log && log.value !== 0) {
                                              const pts = log.value > 0 ? worship.points : 0;
                                              userWorshipTotalPoints += pts;
                                              return { hasLog: true, points: pts, isPenalty };
                                           }
                                           return { hasLog: false, points: 0, isPenalty: false };
                                       });

                                       return (
                                           <tr key={`${user.id}-${worship.id}`} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                               <td className="p-2 border font-medium text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 z-0 w-48 min-w-[200px]">
                                                   {worship.name} {selectedUserId === 'all' ? <span className="text-xs text-slate-500 block">{user.name}</span> : ''}
                                               </td>
                                               {cols.map((col, idx) => (
                                                   <td key={idx} className="p-2 border text-center text-xs whitespace-nowrap">
                                                       {col.hasLog ? (
                                                           <span className={col.isPenalty ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>
                                                               {col.isPenalty ? '⚠️' : '✅'} {col.points}
                                                           </span>
                                                       ) : (
                                                           <span className="text-slate-200">-</span>
                                                       )}
                                                   </td>
                                               ))}
                                               <td className={`p-2 border text-right font-bold sticky right-0 bg-white group-hover:bg-slate-50 z-0 ${isPenalty ? "text-red-600" : "text-green-600"}`}>
                                                   {userWorshipTotalPoints !== 0 ? userWorshipTotalPoints : "-"}
                                               </td>
                                           </tr>
                                       );
                                   })}
                               </Fragment>
                           );
                        })}
                        {filteredData.length === 0 && (
                            <tr>
                                <td colSpan={interval.length + 2} className="p-8 text-center text-slate-400">
                                    Belum ada data pada periode ini {selectedUserId !== "all" && "untuk pengguna ini"}
                                </td>
                            </tr>
                        )}
                    </tbody>
                     <tfoot className="bg-slate-100 font-bold text-slate-900">
                        {filteredData.map((user) => (
                             <tr key={`total-${user.id}`}>
                                <td colSpan={interval.length + 1} className="p-2 border text-right sticky left-0 bg-slate-100 z-10 shadow-sm">Total Poin {selectedUserId === 'all' ? user.name : ''}:</td>
                                <td className="p-2 border text-right text-blue-700 sticky right-0 bg-slate-100 z-10 shadow-sm">{user.totalPoints}</td>
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
      </div> {/* end p-6 */}
      </div> {/* end card */}
      </div> {/* end max-w-6xl */}
      <BottomNav />
    </div>
  );
}

