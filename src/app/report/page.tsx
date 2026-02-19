"use client";

import { useState } from "react";
import { getReportData } from "./actions"; 
import * as XLSX from "xlsx";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export default function ReportPage() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleFetch() {
    setLoading(true);
    const result = await getReportData(startDate, endDate);
    setData(result);
    setLoading(false);
  }

  function handleExport() {
    if (!data) return;

    const wb = XLSX.utils.book_new();

    // Detail Sheet
    const detailRows: any[] = [];
    const interval = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });

    data.report.forEach((user: any) => {
        interval.forEach(date => {
            const dateStr = format(date, "yyyy-MM-dd");
             data.allWorships.forEach((w: any) => {
                 const log = user.logs.find((l: any) => l.date === dateStr && l.worshipId === w.id);
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

    XLSX.writeFile(wb, `Laporan_Mutabaah_${startDate}_${endDate}.xlsx`);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Laporan Detail Mutabaah</h1>
        
        <div className="flex flex-wrap gap-4 mb-6 items-end bg-slate-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dari Tanggal</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded-lg text-slate-900 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sampai Tanggal</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded-lg text-slate-900 bg-white"
            />
          </div>
          <button 
            onClick={handleFetch}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Memuat..." : "Tampilkan Laporan"}
          </button>
          
          {data && (
             <button 
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <span>📥</span> Export Excel
              </button>
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
                        {data.report.flatMap((user: any) => {
                           // Flatten logs for table
                           return user.logs.map((log: any) => {
                               const worship = data.allWorships.find((w: any) => w.id === log.worshipId);
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
                        {data.report.every((u: any) => u.logs.length === 0) && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-400">
                                    Belum ada data pada periode ini
                                </td>
                            </tr>
                        )}
                    </tbody>
                     <tfoot className="bg-slate-100 font-bold text-slate-900">
                        {data.report.map((user: any) => (
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
      </div>
    </div>
  );
}

