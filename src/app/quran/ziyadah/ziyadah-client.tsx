"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trash2, Loader2, PenTool, CheckCircle2 } from "lucide-react";
import { saveZiyadah, deleteZiyadah } from "../actions";
import { surahList } from "@/lib/quran-data";
import { cn } from "@/lib/utils";

interface ZiyadahEntry {
  id: number;
  surahNumber: number;
  memorizedAyat: number;
  totalAyat: number;
  percentComplete: number;
  status: "hafalan" | "mutqin";
}

interface Props {
  userId: number;
  initialList: ZiyadahEntry[];
}

export function ZiyadahClient({ userId, initialList }: Props) {
  const [list, setList] = useState(initialList);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [surahNumber, setSurahNumber] = useState(1);
  const [memorizedAyat, setMemorizedAyat] = useState(1);
  const [status, setStatus] = useState<"hafalan" | "mutqin">("hafalan");

  const selectedSurah = surahList[surahNumber - 1];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSurah) return;
    startTransition(async () => {
      await saveZiyadah(userId, {
        surahNumber,
        memorizedAyat,
        totalAyat: selectedSurah.totalAyat,
        status,
      });
      const percent = Math.round((memorizedAyat / selectedSurah.totalAyat) * 100);
      setList((prev) => {
        const exists = prev.find((x) => x.surahNumber === surahNumber);
        if (exists) {
          return prev.map((x) =>
            x.surahNumber === surahNumber
              ? { ...x, memorizedAyat, totalAyat: selectedSurah.totalAyat, percentComplete: percent, status }
              : x
          );
        }
        return [{ id: Date.now(), surahNumber, memorizedAyat, totalAyat: selectedSurah.totalAyat, percentComplete: percent, status }, ...prev];
      });
      setShowForm(false);
    });
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteZiyadah(id, userId);
      setList((prev) => prev.filter((x) => x.id !== id));
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-4 mt-4">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-violet-500 hover:bg-violet-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-violet-200 dark:shadow-violet-900/30"
        >
          <Plus className="w-5 h-5" />
          Tambah / Update Hafalan
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="bg-violet-50 dark:bg-violet-900/20 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-violet-700 dark:text-violet-300 text-sm flex items-center gap-2">
              <PenTool className="w-4 h-4" /> Catat Hafalan
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Surah</label>
              <select
                value={surahNumber}
                onChange={(e) => { setSurahNumber(parseInt(e.target.value)); setMemorizedAyat(1); }}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
              >
                {surahList.map((s) => (
                  <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Sudah Hafal (Ayat 1 – {selectedSurah?.totalAyat})
              </label>
              <input
                type="number"
                min={0}
                max={selectedSurah?.totalAyat}
                value={memorizedAyat}
                onChange={(e) => setMemorizedAyat(parseInt(e.target.value) || 0)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-400"
              />
              {selectedSurah && (
                <div className="mt-2">
                  <div className="h-2 bg-violet-100 dark:bg-violet-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.round((memorizedAyat / selectedSurah.totalAyat) * 100))}%` }}
                    />
                  </div>
                  <p className="text-xs text-violet-600 dark:text-violet-400 mt-1 font-semibold text-right">
                    {Math.min(100, Math.round((memorizedAyat / selectedSurah.totalAyat) * 100))}%
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
              <div className="grid grid-cols-2 gap-2">
                {(["hafalan", "mutqin"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={cn(
                      "py-2.5 rounded-xl text-sm font-semibold border transition-all",
                      status === s
                        ? "bg-violet-500 text-white border-violet-500"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    )}
                  >
                    {s === "hafalan" ? "Sedang Menghafal" : "✅ Mutqin/Lulus"}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">Batal</button>
              <button type="submit" disabled={isPending} className="flex-2 py-2.5 rounded-xl bg-violet-500 hover:bg-violet-600 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
              </button>
            </div>
          </div>
        </form>
      )}

      {list.length === 0 && !showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
          <PenTool className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Belum ada hafalan tercatat</p>
        </div>
      )}

      {list.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Daftar Hafalan ({list.length})</h3>
          {list.map((entry) => {
            const surah = surahList[entry.surahNumber - 1];
            return (
              <div key={entry.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xs font-black text-violet-600 dark:text-violet-400">
                      {entry.surahNumber}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{surah?.name}</p>
                      <p className="text-xs text-slate-500">{entry.memorizedAyat} / {entry.totalAyat} ayat</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.status === "mutqin" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-full",
                      entry.status === "mutqin"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                        : "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400"
                    )}>
                      {entry.status === "mutqin" ? "Mutqin" : "Hafalan"}
                    </span>
                    <button onClick={() => handleDelete(entry.id)} disabled={deletingId === entry.id} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                      {deletingId === entry.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", entry.status === "mutqin" ? "bg-emerald-500" : "bg-violet-500")}
                    style={{ width: `${Math.min(100, entry.percentComplete)}%` }}
                  />
                </div>
                <p className="text-xs font-bold mt-1 text-right text-slate-500">{Math.min(100, Math.round(entry.percentComplete))}%</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
