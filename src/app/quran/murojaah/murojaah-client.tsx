"use client";

import React, { useState, useTransition } from "react";
import { Plus, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { addMurojaahLog } from "../actions";
import { surahList } from "@/lib/quran-data";
import { cn } from "@/lib/utils";

interface MurojaahLog {
  id: number;
  surahNumber: number | null;
  quality: string | null;
  notes: string | null;
  date: string;
  createdAt: string | null;
}

interface ReminderEntry {
  id: number;
  surahNumber: number;
  lastMurojaahAt: string | null;
  memorizedAyat: number;
  totalAyat: number;
}

interface Props {
  userId: number;
  logs: MurojaahLog[];
  reminders: ReminderEntry[];
}

const qualityOptions = [
  { value: "lancar", label: "Lancar 🟢", color: "bg-emerald-500" },
  { value: "cukup", label: "Cukup 🟡", color: "bg-amber-500" },
  { value: "perlu_diulang", label: "Perlu Diulang 🔴", color: "bg-red-500" },
] as const;

export function MurojaahClient({ userId, logs: initialLogs, reminders }: Props) {
  const [logs, setLogs] = useState(initialLogs);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [surahNumber, setSurahNumber] = useState(1);
  const [quality, setQuality] = useState<"lancar" | "cukup" | "perlu_diulang">("lancar");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await addMurojaahLog(userId, { surahNumber, quality, notes });
      setLogs((prev) => [{
        id: Date.now(),
        surahNumber,
        quality,
        notes: notes || null,
        date: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
      }, ...prev]);
      setShowForm(false);
      setNotes("");
    });
  };

  const qualityBadge = (q: string | null) => {
    if (q === "lancar") return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Lancar</span>;
    if (q === "cukup") return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Cukup</span>;
    return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Perlu Diulang</span>;
  };

  return (
    <div className="space-y-5 mt-4">
      {/* Reminders */}
      {reminders.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900/40 p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h3 className="font-bold text-red-700 dark:text-red-400 text-sm">Perlu Dimurojaah ({reminders.length})</h3>
          </div>
          <div className="space-y-2">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-xl px-3 py-2.5">
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{surahList[r.surahNumber - 1]?.name}</p>
                  <p className="text-xs text-slate-400">
                    Terakhir: {r.lastMurojaahAt ? new Date(r.lastMurojaahAt).toLocaleDateString("id-ID") : "Belum pernah"}
                  </p>
                </div>
                <button
                  onClick={() => { setSurahNumber(r.surahNumber); setShowForm(true); }}
                  className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full font-bold hover:bg-red-200 transition-all"
                >
                  Murojaah
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-blue-200 dark:shadow-blue-900/30"
        >
          <Plus className="w-5 h-5" />
          Catat Murojaah
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="bg-blue-50 dark:bg-blue-900/20 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Log Murojaah
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Surah yang Dimurojaah</label>
              <select
                value={surahNumber}
                onChange={(e) => setSurahNumber(parseInt(e.target.value))}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {surahList.map((s) => (
                  <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Kualitas Murojaah</label>
              <div className="grid grid-cols-3 gap-2">
                {qualityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setQuality(opt.value)}
                    className={cn(
                      "py-2.5 rounded-xl text-xs font-bold border transition-all",
                      quality === opt.value
                        ? `${opt.color} text-white border-transparent`
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Catatan (opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Bagian mana yang masih perlu diperbaiki..."
                rows={2}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">Batal</button>
              <button type="submit" disabled={isPending} className="flex-2 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Log History */}
      {logs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Riwayat Murojaah</h3>
          {logs.slice(0, 20).map((log) => (
            <div key={log.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{log.surahNumber ? surahList[log.surahNumber - 1]?.name : "—"}</p>
                <p className="text-xs text-slate-400 mt-0.5">{log.date}</p>
                {log.notes && <p className="text-xs text-slate-500 italic mt-1">{log.notes}</p>}
              </div>
              {qualityBadge(log.quality)}
            </div>
          ))}
        </div>
      )}
      {logs.length === 0 && !showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
          <RefreshCw className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Belum ada catatan murojaah</p>
        </div>
      )}
    </div>
  );
}
