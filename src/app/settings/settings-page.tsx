"use client";

import { useState } from "react";
import { addFamilyMember, deleteFamilyMember, addWorshipItem, deleteWorshipItem, updateFamilyMember, updateWorshipItem } from "./actions";
import { Trash, Plus, AlertCircle, CheckCircle, Save, Pencil, User, Shield, Heart, Star, Smile, LucideIcon } from "lucide-react";

// Matches AuthUI mapping
const IconMap: Record<string, LucideIcon> = {
  "user-check": Shield,
  "heart": Heart,
  "star": Star,
  "smile": Smile,
  "default": User,
  "user": User, // Added for fallback
};

type UserData = { id: number; name: string; role: string; avatarUrl: string | null; pin: string | null };
type WorshipData = { id: number; name: string; category: string; points: number };

function FamilySettings({ users }: { users: UserData[] }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState<UserData | null>(null);

    const showForm = isAdding || editingItem;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Daftar Anggota Keluarga</h3>
                {!showForm && (
                     <button 
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1 bg-emerald-600 text-white px-3 py-2 rounded-lg hover:bg-emerald-700 text-sm"
                    >
                        <Plus className="w-4 h-4" /> Tambah Anggota
                    </button>
                )}
            </div>

            {showForm && (
                <div id="family-form-container" className="scroll-mt-24">
                <form key={editingItem ? `edit-${editingItem.id}` : 'add-new'} action={async (formData) => {
                    if (editingItem) {
                        await updateFamilyMember(editingItem.id, formData);
                        setEditingItem(null);
                    } else {
                        await addFamilyMember(formData);
                        setIsAdding(false);
                    }
                }} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">{editingItem ? `Edit ${editingItem.name}` : 'Tambah Anggota Baru'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input 
                            name="name" 
                            placeholder="Nama" 
                            required 
                            defaultValue={editingItem?.name}
                            className="p-2 border dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950" 
                        />
                        <select 
                            name="role" 
                            className="p-2 border dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
                            defaultValue={editingItem?.role || "child"}
                        >
                            <option value="child">Anak</option>
                            <option value="parent">Orang Tua</option>
                        </select>
                        <input 
                            name="pin" 
                            placeholder="PIN (Khusus Orang Tua)" 
                            defaultValue={editingItem?.pin || ""}
                            className="p-2 border dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950" 
                        />
                        <select 
                            name="avatarUrl" 
                            className="p-2 border dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
                            defaultValue={editingItem?.avatarUrl || "smile"}
                        >
                            <option value="smile">🙂 Smile</option>
                            <option value="star">⭐ Star</option>
                            <option value="heart">❤️ Heart</option>
                            <option value="user">👤 User</option>
                            <option value="user-check">🛡️ Admin/Shield</option>
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
                        <button type="submit" className="bg-emerald-600 text-white px-4 py-1 rounded text-sm flex items-center gap-1">
                            <Save className="w-4 h-4" /> Simpan
                        </button>
                    </div>
                </form>
                </div>
            )}

            <div className="space-y-2">
                {users.map(u => {
                    const Icon = IconMap[u.avatarUrl || "default"] || IconMap["default"];
                    return (
                    <div key={u.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${u.role === 'parent' ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400' : 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400'}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{u.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">{u.role}</div>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => { 
                                    setEditingItem(u); 
                                    setIsAdding(false); 
                                    setTimeout(() => document.getElementById('family-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
                                }}
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
                )})}
            </div>
        </div>
    );
}

function WorshipSettings({ worships }: { worships: WorshipData[] }) {
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState<WorshipData | null>(null);

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
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Daftar Ibadah & Penalti</h3>
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
                <div id="worship-form-container" className="scroll-mt-24">
                <form key={editingItem ? `edit-${editingItem.id}` : 'add-new'} action={async (formData) => {
                    if (editingItem) {
                         await updateWorshipItem(editingItem.id, formData);
                         setEditingItem(null);
                    } else {
                        await addWorshipItem(formData);
                        setIsAdding(false);
                    }
                }} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                     <h4 className="font-semibold text-sm text-green-700 dark:text-green-500">{editingItem ? `Edit ${editingItem.name}` : 'Tambah Item Baru'}</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input 
                            name="name" 
                            placeholder="Nama Ibadah / Kesalahan" 
                            required 
                            defaultValue={editingItem?.name}
                            className="p-2 border dark:border-slate-700 rounded md:col-span-2 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950" 
                        />
                        <input 
                            name="points" 
                            type="number" 
                            placeholder="Poin (Negatif untuk Penalti)" 
                            required 
                            defaultValue={editingItem?.points}
                            className="p-2 border dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950" 
                        />
                        <select 
                            name="category" 
                            className="p-2 border dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
                            defaultValue={editingItem?.category || "wajib"}
                        >
                            <option value="wajib">Wajib</option>
                            <option value="sunnah">Sunnah</option>
                            <option value="kesalahan">Kesalahan</option>
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
                </div>
            )}

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {sortedWorships.map(w => {
                    const isPenalty = w.points < 0;
                    return (
                        <div key={w.id} className={`flex justify-between items-center p-3 border rounded-lg ${isPenalty ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}>
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center`}>
                                   {isPenalty ? <AlertCircle className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className={`font-medium truncate ${isPenalty ? "text-red-700 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}`}>{w.name}</div>
                                    <div className="flex gap-2 text-xs">
                                        <span className={`px-2 py-0.5 rounded-full ${w.category === 'wajib' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' : 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 mr-1'}`}>
                                            {w.category}
                                        </span>
                                        <span className={`font-bold ${isPenalty ? "text-red-600 dark:text-red-500" : "text-green-600 dark:text-green-500"}`}>
                                            {w.points > 0 ? `+${w.points}` : w.points} Poin
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => { 
                                        setEditingItem(w); 
                                        setIsAdding(false); 
                                        setTimeout(() => document.getElementById('worship-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
                                    }}
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

import { saveProToken, saveFamilyName, revokeProToken } from "./actions";
import { Check, Loader2, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

function FamilyNameSettings({ initialName }: { initialName: string }) {
    const [name, setName] = useState(initialName);
    const [saved, setSaved] = useState(false);

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Nama Keluarga</h3>
            </div>
            
            <form action={async (formData) => {
                await saveFamilyName(formData);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nama Keluarga / Grup (Muncul di layar Mutabaah)</label>
                    <div className="flex items-center gap-2">
                        <input 
                            name="familyName"
                            type="text"
                            placeholder="Keluarga Berkah"
                            className="flex-1 p-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
                            {saved ? <><Check className="w-4 h-4" /> Tersimpan</> : <><Save className="w-4 h-4" /> Simpan</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

function ProSettings({ initialToken }: { initialToken: string }) {
    const [token, setToken] = useState(initialToken);
    const [isSaving, setIsSaving] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);

    const handleRevoke = async () => {
        if (!confirm("Yakin ingin menghapus lisensi Pro? Fitur keuangan akan terkunci.")) return;
        setIsRevoking(true);
        try {
            const result = await revokeProToken();
            if (result?.success) {
                toast(result.message, "success");
                setToken("");
            }
        } catch {
            toast("Gagal menghapus lisensi.", "error");
        } finally {
            setIsRevoking(false);
        }
    };

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Financial Family (Pro Edition)</h3>
            </div>
            
            <form action={async (formData) => {
                setIsSaving(true);
                try {
                    const result = await saveProToken(formData);
                    if (result.success) {
                        toast(result.message, "success");
                    } else {
                        toast(result.message, "error");
                    }
                } catch {
                    toast("Terjadi kesalahan sistem.", "error");
                } finally {
                    setIsSaving(false);
                }
            }} className="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/50 dark:to-teal-900/20 p-6 rounded-xl border border-emerald-100 dark:border-emerald-900/50 space-y-4">
                <p className="text-sm text-emerald-800 dark:text-emerald-200">
                    Masukkan Lisensi JannahFlow Pro (JWT Token) untuk mengaktifkan fitur Financial Family. 
                    Token akan divalidasi berdasarkan domain aplikasi Anda.
                </p>
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase">License Token</label>
                    <textarea 
                        name="token"
                        rows={3}
                        placeholder="eyJhbG..."
                        className="w-full p-3 border border-emerald-200 dark:border-emerald-800 rounded-lg text-sm bg-white dark:bg-slate-900 font-mono text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                    <a 
                        href="https://wa.me/6285220696117?text=Mau%20Fitur%20Pro%20JannahFlow" 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline font-medium"
                    >
                        Klik di sini untuk aktivasi via WhatsApp
                    </a>
                    
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {initialToken && (
                            <button 
                                type="button" 
                                onClick={handleRevoke}
                                disabled={isRevoking || isSaving} 
                                className="bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-950/50 dark:text-red-400 dark:hover:bg-red-900/50 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex-1 sm:flex-none"
                            >
                                {isRevoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Hapus Lisensi
                            </button>
                        )}
                        <button disabled={isSaving || isRevoking} type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-75 disabled:cursor-not-allowed flex-1 sm:flex-none">
                            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Sedang Mengaktivasi</> : <><Check className="w-4 h-4" /> Aktivasi</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function SettingsPage({ users, worships, initialProToken, initialFamilyName }: { users: UserData[], worships: WorshipData[], initialProToken: string, initialFamilyName: string }) {
    return (
        <div className="p-4 max-w-5xl mx-auto space-y-8 pb-20">
            <div>
                <FamilyNameSettings initialName={initialFamilyName} />
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            <div>
                <ProSettings initialToken={initialProToken} />
            </div>

            <hr className="border-slate-200 dark:border-slate-800" />

            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Pengaturan Keluarga</h2>
                <FamilySettings users={users} />
            </div>
            
            <hr className="border-slate-200 dark:border-slate-800" />
            
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Pengaturan Ibadah</h2>
                <WorshipSettings worships={worships} />
            </div>
        </div>
    );
}
