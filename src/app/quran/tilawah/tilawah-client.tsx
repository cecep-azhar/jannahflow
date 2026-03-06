"use client";

import React, { useState, useTransition, useMemo } from "react";
import { Plus, Trash2, Loader2, ChevronDown, ChevronUp, BookOpen, Sparkles } from "lucide-react";
import { addTilawahSession, deleteTilawahSession } from "../actions";
import { surahList, calculateTilawahProgress, TilawahProgress } from "@/lib/quran-data";
import { cn } from "@/lib/utils";

interface TilawahSession {
  id: number;
  startSurah: number | null;
  startAyat: number | null;
  endSurah: number | null;
  endAyat: number | null;
  totalAyat: number | null;
  sessionTime: string | null;
  notes: string | null;
  startName: string;
  endName: string;
  progress: TilawahProgress | null;
  createdAt: string | null;
}

interface Props {
  userId: number;
  date: string;
  sessions: TilawahSession[];
  suggestedStart: { surahNumber: number; ayatNumber: number };
}

export function TilawahClient({ userId, date, sessions: initialSessions, suggestedStart }: Props) {
  const [sessions, setSessions] = useState(initialSessions);
  const [showForm, setShowForm] = useState(initialSessions.length === 0);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Form state
  const [startSurah, setStartSurah] = useState(suggestedStart.surahNumber);
  const [startAyat, setStartAyat] = useState(suggestedStart.ayatNumber);
  const [endSurah, setEndSurah] = useState(suggestedStart.surahNumber);
  const [endAyat, setEndAyat] = useState(suggestedStart.ayatNumber);
  const [sessionTime, setSessionTime] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (startSurah && startAyat && endSurah && endAyat) {
      return calculateTilawahProgress(startSurah, startAyat, endSurah, endAyat);
    }
    return null;
  }, [startSurah, startAyat, endSurah, endAyat]);

  const startSurahInfo = surahList[startSurah - 1];
  const endSurahInfo = surahList[endSurah - 1];

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!startSurahInfo || startAyat < 1 || startAyat > startSurahInfo.totalAyat) {
      setFormError(`Ayat mulai tidak valid (max ${startSurahInfo?.totalAyat ?? "?"})`);
      return;
    }
    if (!endSurahInfo || endAyat < 1 || endAyat > endSurahInfo.totalAyat) {
      setFormError(`Ayat selesai tidak valid (max ${endSurahInfo?.totalAyat ?? "?"})`);
      return;
    }
    if (preview && preview.totalAyat <= 0) {
      setFormError("Titik selesai harus setelah titik mulai.");
      return;
    }

    startTransition(async () => {
      try {
        await addTilawahSession(userId, {
          date,
          sessionTime,
          startSurah,
          startAyat,
          endSurah,
          endAyat,
          notes,
        });

        // Optimistic update
        const newSession: TilawahSession = {
          id: Date.now(),
          startSurah,
          startAyat,
          endSurah,
          endAyat,
          totalAyat: preview?.totalAyat ?? 0,
          sessionTime: sessionTime || null,
          notes: notes || null,
          startName: `${startSurahInfo?.name}:${startAyat}`,
          endName: `${endSurahInfo?.name}:${endAyat}`,
          progress: preview,
          createdAt: new Date().toISOString(),
        };
        setSessions((prev) => [newSession, ...prev]);
        showToast(`Barakallah! 🌿 Kamu sudah membaca ${preview?.summary ?? "beberapa ayat"} hari ini.`);
        setShowForm(false);
        setNotes("");
        setSessionTime("");
      } catch {
        setFormError("Gagal menyimpan sesi. Coba lagi.");
      }
    });
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Apakah yakin akan dihapus?")) return;
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteTilawahSession(id, userId);
        setSessions((prev) => prev.filter((s) => s.id !== id));
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4" />
          {toast}
        </div>
      )}

      {/* Add session button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-emerald-200 dark:shadow-emerald-900/30"
        >
          <Plus className="w-5 h-5" />
          Tambah Sesi Tilawah
        </button>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
        >
          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-emerald-700 dark:text-emerald-300 text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Sesi Tilawah Baru
            </h3>
          </div>

          <div className="p-5 space-y-4">
            {/* Session Time */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Waktu Sesi (opsional)
              </label>
              <input
                type="time"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            {/* Start Point */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Mulai Dari
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={startSurah}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    setStartSurah(v);
                    setStartAyat(1);
                    if (v > endSurah) { setEndSurah(v); setEndAyat(1); }
                  }}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {surahList.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 shrink-0">Ayat</span>
                  <input
                    type="number"
                    min={1}
                    max={startSurahInfo?.totalAyat}
                    value={startAyat}
                    onChange={(e) => setStartAyat(parseInt(e.target.value) || 1)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  {startSurahInfo && (
                    <span className="text-[10px] text-slate-400 shrink-0">/{startSurahInfo.totalAyat}</span>
                  )}
                </div>
              </div>
            </div>

            {/* End Point */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Sampai
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={endSurah}
                  onChange={(e) => { setEndSurah(parseInt(e.target.value)); setEndAyat(1); }}
                  className="border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  {surahList.map((s) => (
                    <option key={s.number} value={s.number}>
                      {s.number}. {s.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-400 shrink-0">Ayat</span>
                  <input
                    type="number"
                    min={1}
                    max={endSurahInfo?.totalAyat}
                    value={endAyat}
                    onChange={(e) => setEndAyat(parseInt(e.target.value) || 1)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  {endSurahInfo && (
                    <span className="text-[10px] text-slate-400 shrink-0">/{endSurahInfo.totalAyat}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            {preview && preview.totalAyat > 0 && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800/40 flex items-center justify-between">
                <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                  {startSurahInfo?.name}:{startAyat} — {endSurahInfo?.name}:{endAyat}
                </span>
                <span className="text-emerald-700 dark:text-emerald-300 font-black text-sm">
                  {preview.summary}
                </span>
              </div>
            )}
            {preview && preview.totalAyat <= 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-100 dark:border-red-800/40">
                <span className="text-xs text-red-600 dark:text-red-400">Titik selesai harus setelah titik mulai</span>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Catatan (opsional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Setelah Subuh, terasa khusyuk..."
                rows={2}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none"
              />
            </div>

            {formError && (
              <p className="text-red-500 text-xs font-medium">{formError}</p>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending || !preview || preview.totalAyat <= 0}
                className="flex-2 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Simpan Sesi
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Sessions list */}
      {sessions.length === 0 && !showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Belum ada tilawah hari ini</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Klik tombol di atas untuk mulai mencatat</p>
        </div>
      )}

      {sessions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
            Sesi Hari Ini ({sessions.length})
          </h3>
          {sessions.map((s, idx) => (
            <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === s.id ? null : s.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-black">
                    {sessions.length - idx}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {s.startName} — {s.endName}
                    </p>
                    {s.sessionTime && (
                      <p className="text-xs text-slate-400 mt-0.5">{s.sessionTime}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={cn(
                    "text-xs font-black px-2.5 py-1 rounded-full",
                    "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                  )}>
                    {s.progress?.summary ?? `${s.totalAyat} Ayat`}
                  </span>
                  {expandedId === s.id ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedId === s.id && (
                <div className="px-4 pb-4 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  {s.notes && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 italic">&ldquo;{s.notes}&rdquo;</p>
                  )}
                  <button
                    onClick={() => handleDelete(s.id)}
                    disabled={deletingId === s.id}
                    className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-semibold transition-colors disabled:opacity-50"
                  >
                    {deletingId === s.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                    Hapus sesi ini
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add more sessions prompt */}
      {sessions.length > 0 && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400 font-semibold py-3 rounded-2xl hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah Sesi Lagi
        </button>
      )}
    </div>
  );
}
