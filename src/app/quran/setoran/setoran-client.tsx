"use client";

import React, { useState, useTransition } from "react";
import { Plus, Trash2, Loader2, GraduationCap, Star } from "lucide-react";
import { saveSetoran, deleteSetoran } from "../actions";

interface SetoranEntry {
  id: number;
  teacherName: string | null;
  material: string | null;
  notes: string | null;
  date: string;
  createdAt: string | null;
}

interface Props {
  userId: number;
  initialList: SetoranEntry[];
}

export function SetoranClient({ userId, initialList }: Props) {
  const [list, setList] = useState(initialList);
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [teacherName, setTeacherName] = useState("");
  const [material, setMaterial] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !material.trim()) return;
    startTransition(async () => {
      await saveSetoran(userId, { teacherName, material, notes });
      setList((prev) => [{
        id: Date.now(),
        teacherName,
        material,
        notes: notes || null,
        date: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
      }, ...prev]);
      setShowForm(false);
      setTeacherName("");
      setMaterial("");
      setNotes("");
    });
  };

  const handleDelete = (id: number) => {
    setDeletingId(id);
    startTransition(async () => {
      await deleteSetoran(id, userId);
      setList((prev) => prev.filter((x) => x.id !== id));
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-4 mt-4">
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-rose-200 dark:shadow-rose-900/30"
        >
          <Plus className="w-5 h-5" />
          Catat Setoran
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="bg-rose-50 dark:bg-rose-900/20 px-5 py-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Form Setoran
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nama Guru / Pembimbing *</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="Ust. Ahmad, Bu Fatimah..."
                required
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Materi Setoran *</label>
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                placeholder="Al-Baqarah:1-5, Al-Mulk..."
                required
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Nilai / Catatan dari Guru</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Makhraj huruf Ra perlu diperbaiki, tajwid sudah bagus..."
                rows={3}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">Batal</button>
              <button type="submit" disabled={isPending || !teacherName.trim() || !material.trim()} className="flex-2 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-60 text-white font-bold text-sm transition-all flex items-center justify-center gap-2">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />} Simpan
              </button>
            </div>
          </div>
        </form>
      )}

      {list.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Riwayat Setoran</h3>
          {list.map((entry) => (
            <div key={entry.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                    <Star className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{entry.teacherName}</p>
                    <p className="text-xs text-slate-400">{entry.date}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(entry.id)} disabled={deletingId === entry.id} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                  {deletingId === entry.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="ml-12">
                <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 mb-1">📖 {entry.material}</p>
                {entry.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">{entry.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {list.length === 0 && !showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
          <GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Belum ada catatan setoran</p>
        </div>
      )}
    </div>
  );
}
