"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trash2, Loader2, BookOpen } from "lucide-react";
import { saveTadabur, deleteTadabur } from "../actions";
import { surahList } from "@/lib/quran-data";

interface TadaburEntry {
  id: number;
  surahNumber: number | null;
  ayatRef: string | null;
  notes: string | null;
  date: string;
  createdAt: string | null;
}

interface Props {
  userId: number;
  initialList: TadaburEntry[];
}

export function TadaburClient({ userId, initialList }: Props) {
  const [list, setList] = useState(initialList);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [surahNumber, setSurahNumber] = useState(1);
  const [ayatRef, setAyatRef] = useState("1");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;
    startTransition(async () => {
      const surah = surahList[surahNumber - 1];
      const ref = `${surah?.name}:${ayatRef}`;
      await saveTadabur(userId, { surahNumber, ayatRef: ref, notes });
      setList((prev) => [{
        id: Date.now(),
        surahNumber,
        ayatRef: ref,
        notes,
        date: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
      }, ...prev]);
      setShowForm(false);
      setNotes("");
    });
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteTadabur(id, userId);
      setList((prev) => prev.filter((x) => x.id !== id));
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-4 mt-4">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-amber-200 dark:shadow-amber-900/30"
        >
          <Plus className="w-5 h-5" />
          Tulis Tadabur
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="bg-amber-50 dark:bg-amber-900/20 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-amber-700 dark:text-amber-300 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Catatan Tadabur
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Surah</label>
                <select
                  value={surahNumber}
                  onChange={(e) => setSurahNumber(parseInt(e.target.value))}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {surahList.map((s) => (
                    <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Ayat</label>
                <input
                  type="text"
                  value={ayatRef}
                  onChange={(e) => setAyatRef(e.target.value)}
                  placeholder="misal: 255 atau 1-5"
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Hikmah & Refleksi
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Apa yang kamu renungkan dari ayat ini? Apa kondisi hatimu saat ini?..."
                rows={5}
                required
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">Batal</button>
              <button type="submit" disabled={isPending || !notes.trim()} className="flex-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
              </button>
            </div>
          </div>
        </form>
      )}

      {list.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Riwayat Tadabur</h3>
          {list.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  {entry.ayatRef && (
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">{entry.ayatRef}</span>
                  )}
                  <p className="text-xs text-slate-400 mt-1">{entry.date}</p>
                </div>
                <button onClick={() => handleDelete(entry.id)} disabled={deletingId === entry.id} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  {deletingId === entry.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{entry.notes}</p>
            </div>
          ))}
        </div>
      )}

      {list.length === 0 && !showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Belum ada catatan tadabur</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 italic">
            &ldquo;Maka apakah mereka tidak memperhatikan Al-Quran?&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
