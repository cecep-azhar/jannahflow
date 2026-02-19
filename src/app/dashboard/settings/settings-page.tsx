"use client";

import { useState } from "react";
import { addFamilyMember, deleteFamilyMember, addWorshipItem, deleteWorshipItem, updateFamilyMember, updateWorshipItem } from "./actions";
import { Trash, Plus, User, AlertCircle, CheckCircle, Save, Pencil, X } from "lucide-react";

function FamilySettings({ users }: { users: any[] }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const showForm = isAdding || editingItem;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Daftar Anggota Keluarga</h3>
                {!showForm && (
                     <button 
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 text-sm"
                    >
                        <Plus className="w-4 h-4" /> Tambah Anggota
                    </button>
                )}
            </div>

            {showForm && (
                <form action={async (formData) => {
                    if (editingItem) {
                        await updateFamilyMember(editingItem.id, formData);
                        setEditingItem(null);
                    } else {
                        await addFamilyMember(formData);
                        setIsAdding(false);
                    }
                }} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                    <h4 className="font-semibold text-sm text-indigo-700">{editingItem ? `Edit ${editingItem.name}` : 'Tambah Anggota Baru'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input 
                            name="name" 
                            placeholder="Nama" 
                            required 
                            defaultValue={editingItem?.name}
                            className="p-2 border rounded text-slate-900" 
                        />
                        <select 
                            name="role" 
                            className="p-2 border rounded text-slate-900"
                            defaultValue={editingItem?.role || "child"}
                        >
                            <option value="child">Anak</option>
                            <option value="parent">Orang Tua</option>
                        </select>
                        <input 
                            name="pin" 
                            placeholder="PIN (Khusus Orang Tua)" 
                            defaultValue={editingItem?.pin || ""}
                            className="p-2 border rounded text-slate-900" 
                        />
                        <select 
                            name="avatarUrl" 
                            className="p-2 border rounded text-slate-900"
                            defaultValue={editingItem?.avatarUrl || "smile"}
                        >
                            <option value="smile">🙂 Smile</option>
                            <option value="star">⭐ Star</option>
                            <option value="heart">❤️ Heart</option>
                            <option value="user">👤 User</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={() => { setIsAdding(false); setEditingItem(null); }} 
                            className="text-slate-500 text-sm px-3 py-1"
                        >
                            Batal
                        </button>
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-1 rounded text-sm flex items-center gap-1">
                            <Save className="w-4 h-4" /> Simpan
                        </button>
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
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-slate-800 truncate">{u.name}</div>
                                <div className="text-xs text-slate-500 uppercase">{u.role}</div>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => { setEditingItem(u); setIsAdding(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                className="text-blue-400 hover:text-blue-600 p-2" 
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <form action={deleteFamilyMember.bind(null, u.id)}>
                                <button className="text-red-400 hover:text-red-600 p-2" title="Hapus" onClick={(e) => !confirm(`Hapus ${u.name}?`) && e.preventDefault()}>
                                    <Trash className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function WorshipSettings({ worships }: { worships: any[] }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    const showForm = isAdding || editingItem;

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
                {!showForm && (
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                        <Plus className="w-4 h-4" /> Tambah Item
                    </button>
                )}
            </div>

            {showForm && (
                <form action={async (formData) => {
                    if (editingItem) {
                         await updateWorshipItem(editingItem.id, formData);
                         setEditingItem(null);
                    } else {
                        await addWorshipItem(formData);
                        setIsAdding(false);
                    }
                }} className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                     <h4 className="font-semibold text-sm text-green-700">{editingItem ? `Edit ${editingItem.name}` : 'Tambah Item Baru'}</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input 
                            name="name" 
                            placeholder="Nama Ibadah / Kesalahan" 
                            required 
                            defaultValue={editingItem?.name}
                            className="p-2 border rounded md:col-span-2 text-slate-900" 
                        />
                        <input 
                            name="points" 
                            type="number" 
                            placeholder="Poin (Negatif untuk Penalti)" 
                            required 
                            defaultValue={editingItem?.points}
                            className="p-2 border rounded text-slate-900" 
                        />
                        <select 
                            name="category" 
                            className="p-2 border rounded text-slate-900"
                            defaultValue={editingItem?.category || "wajib"}
                        >
                            <option value="wajib">Wajib</option>
                            <option value="sunnah">Sunnah</option>
                        </select>
                     </div>
                     <div className="flex justify-end gap-2">
                        <button 
                            type="button" 
                            onClick={() => { setIsAdding(false); setEditingItem(null); }} 
                            className="text-slate-500 text-sm px-3 py-1"
                        >
                            Batal
                        </button>
                        <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded text-sm flex items-center gap-1">
                            <Save className="w-4 h-4" /> Simpan
                        </button>
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
                                <div className="min-w-0 flex-1">
                                    <div className={`font-medium truncate ${isPenalty ? "text-red-700" : "text-slate-700"}`}>{w.name}</div>
                                    <div className="flex gap-2 text-xs">
                                        <span className={`px-2 py-0.5 rounded-full ${w.category === 'wajib' ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700 mr-1'}`}>
                                            {w.category}
                                        </span>
                                        <span className={`font-bold ${isPenalty ? "text-red-600" : "text-green-600"}`}>
                                            {w.points > 0 ? `+${w.points}` : w.points} Poin
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => { setEditingItem(w); setIsAdding(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                    className="text-blue-400 hover:text-blue-600 p-2" 
                                    title="Edit"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <form action={deleteWorshipItem.bind(null, w.id)}>
                                    <button className="text-slate-400 hover:text-red-600 p-2" onClick={(e) => !confirm(`Hapus ${w.name}?`) && e.preventDefault()}>
                                        <Trash className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function SettingsPage({ users, worships }: { users: any[], worships: any[] }) {
    return (
        <div className="space-y-8 pb-20">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Pengaturan Keluarga</h2>
                <FamilySettings users={users} />
            </div>
            
            <hr className="border-slate-200" />
            
            <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Pengaturan Ibadah</h2>
                <WorshipSettings worships={worships} />
            </div>
        </div>
    );
}
