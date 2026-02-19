"use client";

import { useState } from "react";
import { addFamilyMember, deleteFamilyMember, addWorshipItem, deleteWorshipItem } from "./actions";
import { Trash, Plus, User, AlertCircle, CheckCircle, Save } from "lucide-react";

export default function SettingsPage({ 
  users, 
  worships 
}: { 
  users: any[], 
  worships: any[] 
}) {
  const [activeTab, setActiveTab] = useState<"family" | "worship">("family");

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <a href="/dashboard" className="text-slate-300 hover:text-white px-3 py-1 rounded bg-slate-700 text-sm">Kembali ke Dashboard</a>
        </div>

        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab("family")}
            className={`flex-1 p-4 font-semibold text-center ${activeTab === "family" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-50"}`}
          >
            👨‍👩‍👧‍👦 Kelola Keluarga
          </button>
          <button 
             onClick={() => setActiveTab("worship")}
             className={`flex-1 p-4 font-semibold text-center ${activeTab === "worship" ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50" : "text-slate-500 hover:bg-slate-50"}`}
          >
            🕌 Kelola Ibadah & Penalti
          </button>
        </div>

        <div className="p-6">
          {activeTab === "family" ? (
             <FamilySettings users={users} />
          ) : (
             <WorshipSettings worships={worships} />
          )}
        </div>
      </div>
    </div>
  );
}

function FamilySettings({ users }: { users: any[] }) {
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Daftar Anggota Keluarga</h3>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 text-sm"
                >
                    <Plus className="w-4 h-4" /> Tambah Anggota
                </button>
            </div>

            {isAdding && (
                <form action={async (formData) => {
                    await addFamilyMember(formData);
                    setIsAdding(false);
                }} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                    <h4 className="font-semibold text-sm text-indigo-700">Tambah Anggota Baru</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input name="name" placeholder="Nama" required className="p-2 border rounded text-slate-900" />
                        <select name="role" className="p-2 border rounded text-slate-900">
                            <option value="child">Anak</option>
                            <option value="parent">Orang Tua</option>
                        </select>
                        <input name="pin" placeholder="PIN (Khusus Orang Tua)" className="p-2 border rounded text-slate-900" />
                        <select name="avatarUrl" className="p-2 border rounded text-slate-900">
                            <option value="smile">🙂 Smile</option>
                            <option value="star">⭐ Star</option>
                            <option value="heart">❤️ Heart</option>
                            <option value="user">👤 User</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500 text-sm">Batal</button>
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-1 rounded text-sm">Simpan</button>
                    </div>
                </form>
            )}

            <div className="space-y-2">
                {users.map(u => (
                    <div key={u.id} className="flex justify-between items-center p-3 bg-white border border-slate-200 rounded-lg hover:shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-lg">
                                {u.role === 'parent' ? '👨‍👩‍👧' : '👶'}
                            </div>
                            <div>
                                <div className="font-semibold text-slate-800">{u.name}</div>
                                <div className="text-xs text-slate-500 uppercase">{u.role}</div>
                            </div>
                        </div>
                        <form action={deleteFamilyMember.bind(null, u.id)}>
                            <button className="text-red-400 hover:text-red-600 p-2" title="Hapus" onClick={(e) => !confirm(`Hapus ${u.name}?`) && e.preventDefault()}>
                                <Trash className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                ))}
            </div>
        </div>
    );
}

function WorshipSettings({ worships }: { worships: any[] }) {
    const [isAdding, setIsAdding] = useState(false);

    // Sort: Wajib -> Sunnah -> Penalty (Negative points)
    const sortedWorships = [...worships].sort((a, b) => {
        if (a.points < 0 && b.points >= 0) return 1;
        if (a.points >= 0 && b.points < 0) return -1;
        return 0; // Keep roughly original order or sort by ID
    });

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Daftar Ibadah & Penalti</h3>
                <button 
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                >
                    <Plus className="w-4 h-4" /> Tambah Item
                </button>
            </div>

            {isAdding && (
                <form action={async (formData) => {
                    await addWorshipItem(formData);
                    setIsAdding(false);
                }} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                     <h4 className="font-semibold text-sm text-green-700">Tambah Item Baru</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input name="name" placeholder="Nama Ibadah / Kesalahan" required className="p-2 border rounded md:col-span-2 text-slate-900" />
                        <input name="points" type="number" placeholder="Poin (Negatif untuk Penalti)" required className="p-2 border rounded text-slate-900" />
                        <select name="category" className="p-2 border rounded text-slate-900">
                            <option value="wajib">Wajib</option>
                            <option value="sunnah">Sunnah</option>
                        </select>
                     </div>
                     <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500 text-sm">Batal</button>
                        <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded text-sm">Simpan</button>
                    </div>
                </form>
            )}

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {sortedWorships.map(w => {
                    const isPenalty = w.points < 0;
                    return (
                        <div key={w.id} className={`flex justify-between items-center p-3 border rounded-lg ${isPenalty ? "bg-red-50 border-red-100" : "bg-white border-slate-200"}`}>
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center`}>
                                   {isPenalty ? <AlertCircle className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
                                </div>
                                <div>
                                    <div className={`font-medium ${isPenalty ? "text-red-700" : "text-slate-700"}`}>{w.name}</div>
                                    <div className="flex gap-2 text-xs">
                                        <span className={`px-2 py-0.5 rounded-full ${w.category === 'wajib' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}>
                                            {w.category}
                                        </span>
                                        <span className={`font-bold ${isPenalty ? "text-red-600" : "text-green-600"}`}>
                                            {w.points > 0 ? `+${w.points}` : w.points} Poin
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <form action={deleteWorshipItem.bind(null, w.id)}>
                                <button className="text-slate-400 hover:text-red-600 p-2" onClick={(e) => !confirm(`Hapus ${w.name}?`) && e.preventDefault()}>
                                    <Trash className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
