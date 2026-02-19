"use client";

import { useState } from "react";
import { getReportData } from "./actions"; // We'll create this
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

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Summary Sheet
    const summaryData = data.report.map((r: any) => ({
      Nama: r.name,
      Peran: r.role,
      "Total Poin": r.totalPoints,
    }));
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan");

    // Detail Sheet (One big flat list or separate sheets?)
    // Let's do a flat list: Date | Name | Worship | Status/Value
    const detailRows: any[] = [];
    
    const interval = eachDayOfInterval({ start: parseISO(startDate), end: parseISO(endDate) });

    data.report.forEach((user: any) => {
        interval.forEach(date => {
            const dateStr = format(date, "yyyy-MM-dd");
             data.allWorships.forEach((w: any) => {
                 const log = user.logs.find((l: any) => l.date === dateStr && l.worshipId === w.id);
                 if (log) {
                     detailRows.push({
                         Tanggal: dateStr,
                         Nama: user.name,
                         Ibadah: w.name,
                         Nilai: log.value,
                         Poin: (log.value > 0 ? w.points : 0)
                     });
                 }
             });
        });
    });

    const wsDetail = XLSX.utils.json_to_sheet(detailRows);
    XLSX.utils.book_append_sheet(wb, wsDetail, "Detail Harian");

    // Save
    XLSX.writeFile(wb, `Laporan_Mutabaah_${startDate}_${endDate}.xlsx`);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Laporan Mutabaah</h1>
        
        <div className="flex flex-wrap gap-4 mb-6 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dari Tanggal</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Sampai Tanggal</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 border rounded-lg"
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
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-slate-100">
                            <th className="p-3 text-slate-600">Nama</th>
                            <th className="p-3 text-slate-600">Peran</th>
                            <th className="p-3 text-slate-600 text-right">Total Poin</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.report.map((r: any) => (
                            <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
                                <td className="p-3 font-medium">{r.name}</td>
                                <td className="p-3 text-slate-500 capitalize">{r.role}</td>
                                <td className="p-3 text-right font-bold text-blue-600">{r.totalPoints}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}
