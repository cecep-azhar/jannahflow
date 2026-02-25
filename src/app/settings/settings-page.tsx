"use client";

import { useState, useRef } from "react";
import { addFamilyMember, deleteFamilyMember, addWorshipItem, deleteWorshipItem, updateFamilyMember, updateWorshipItem } from "./actions";
import { Trash, Plus, AlertCircle, CheckCircle, Save, Pencil, User, Shield, Heart, Star, Smile, LucideIcon } from "lucide-react";
import Link from "next/link";

import { UserAvatar } from "@/components/user-avatar";
import { calculateAge, getIslamicLevel, LEVEL_LABELS, IslamicLevel } from "@/lib/level-utils";

type UserData = { id: number; name: string; role: string; avatarUrl: string | null; pin: string | null; gender: string | null; birthDate: string | null; };
type WorshipData = { id: number; name: string; category: string; points: number; levels?: string | null; targetLevels?: string | null };

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
                        const res = await updateFamilyMember(editingItem.id, formData);
                        if (res?.error) {
                            alert(res.error);
                            return;
                        }
                        setEditingItem(null);
                    } else {
                        const res = await addFamilyMember(formData);
                        if (res?.error) {
                            alert(res.error);
                            return;
                        }
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
                        <select
                            name="gender"
                            className="p-2 border dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950"
                            defaultValue={editingItem?.gender || ""}
                        >
                            <option value="">Pilih Jenis Kelamin</option>
                            <option value="M">Laki-laki</option>
                            <option value="F">Perempuan</option>
                        </select>
                        <input 
                            name="birthDate" 
                            type="date"
                            placeholder="Tanggal Lahir" 
                            defaultValue={editingItem?.birthDate || ""}
                            required
                            className="p-2 border dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950" 
                        />
                        <input 
                            type="number"
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
                    const age = calculateAge(u.birthDate);
                    const islamicLevel = getIslamicLevel(age, u.role);
                    const levelLabel = LEVEL_LABELS[islamicLevel];
                    
                    return (
                    <div key={u.id} className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:shadow-sm">
                        <div className="flex items-center gap-3">
                            <UserAvatar name={u.name} avatarUrl={u.avatarUrl} className={u.role === 'parent' ? 'ring-2 ring-emerald-500/20' : ''} />
                            <div className="min-w-0 flex-1">
                                <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">{u.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                    <span className="uppercase">{u.role}</span>
                                    {u.role === 'child' && age !== null && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                            <span>{age} thn</span>
                                        </>
                                    )}
                                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{levelLabel}</span>
                                </div>
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
    const [levels, setLevels] = useState<{label: string, points: number}[]>([]);
    const [targetLevels, setTargetLevels] = useState<IslamicLevel[]>(["parent", "baligh", "tamyiz", "ghairu_tamyiz"]);

    const showForm = isAdding || editingItem;

    // Load levels when editing
    const handleEdit = (w: WorshipData) => {
        setEditingItem(w);
        setIsAdding(false);
        try {
            if (w.levels) setLevels(JSON.parse(w.levels));
            else setLevels([]);
        } catch { setLevels([]); }

        try {
            if (w.targetLevels) setTargetLevels(JSON.parse(w.targetLevels));
            else setTargetLevels(["parent", "baligh", "tamyiz", "ghairu_tamyiz"]);
        } catch { setTargetLevels(["parent", "baligh", "tamyiz", "ghairu_tamyiz"]); }
        
        setTimeout(() => document.getElementById('worship-form-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50);
    };

    const handleAddLevel = () => setLevels([...levels, { label: "", points: 0 }]);
    const handleRemoveLevel = (index: number) => setLevels(levels.filter((_, i) => i !== index));
    const handleLevelChange = (index: number, field: 'label' | 'points', value: string | number) => {
        const newLevels = [...levels];
        newLevels[index] = { ...newLevels[index], [field]: value };
        setLevels(newLevels);
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Daftar Ibadah & Penalti</h3>
                {!showForm && (
                    <button 
                        onClick={() => { setIsAdding(true); setLevels([]); setTargetLevels(["parent", "baligh", "tamyiz", "ghairu_tamyiz"]); }}
                        className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                        <Plus className="w-4 h-4" /> Tambah Item
                    </button>
                )}
            </div>

            {showForm && (
                <div id="worship-form-container" className="scroll-mt-24">
                <form key={editingItem ? `edit-${editingItem.id}` : 'add-new'} action={async (formData) => {
                    formData.append("levels", JSON.stringify(levels));
                    formData.append("targetLevels", JSON.stringify(targetLevels));
                    if (editingItem) {
                         await updateWorshipItem(editingItem.id, formData);
                         setEditingItem(null);
                    } else {
                        await addWorshipItem(formData);
                        setIsAdding(false);
                    }
                }} className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
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
                            placeholder="Poin Default (Jika tanpa level)" 
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

                     {/* Levels Management */}
                     <div className="space-y-2 border-t pt-3 border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Levels / Scoring Rules (Optional)</label>
                            <button type="button" onClick={handleAddLevel} className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-full font-bold hover:bg-indigo-100 transition-colors">+ Add Level</button>
                        </div>
                        {levels.length > 0 && (
                            <div className="space-y-2">
                                {levels.map((lvl, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input 
                                            placeholder="Level Label (e.g. Ringan)" 
                                            value={lvl.label}
                                            onChange={(e) => handleLevelChange(idx, 'label', e.target.value)}
                                            className="flex-1 p-2 text-xs border dark:border-slate-800 bg-white dark:bg-slate-950 rounded"
                                        />
                                        <input 
                                            type="number" 
                                            placeholder="Pts" 
                                            value={lvl.points}
                                            onChange={(e) => handleLevelChange(idx, 'points', parseInt(e.target.value) || 0)}
                                            className="w-20 p-2 text-xs border dark:border-slate-800 bg-white dark:bg-slate-950 rounded"
                                        />
                                        <button type="button" onClick={() => handleRemoveLevel(idx)} className="text-red-400 hover:text-red-600 p-1"><Trash className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                        {levels.length === 0 && <p className="text-[10px] text-slate-400 italic px-1">No levels defined. Uses default points.</p>}
                     </div>

                     {/* Target Levels Management */}
                     <div className="space-y-2 border-t pt-3 border-slate-200 dark:border-slate-800">
                        <div className="px-1 text-xs font-bold text-slate-500 uppercase tracking-widest">
                            Target Audience (Usia)
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(Object.entries(LEVEL_LABELS) as [IslamicLevel, string][]).map(([val, label]) => {
                                const isChecked = targetLevels.includes(val);
                                return (
                                    <label key={val} className={`cursor-pointer px-3 py-1.5 rounded border text-xs font-medium transition-colors ${isChecked ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800/50 dark:text-indigo-300' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400'}`}>
                                        <input 
                                            type="checkbox" 
                                            className="hidden"
                                            checked={isChecked}
                                            onChange={(e) => {
                                                if (e.target.checked) setTargetLevels([...targetLevels, val]);
                                                else setTargetLevels(targetLevels.filter(lvl => lvl !== val));
                                            }}
                                        />
                                        {label}
                                    </label>
                                );
                            })}
                        </div>
                        {targetLevels.length === 0 && <p className="text-[10px] text-red-400 italic px-1">Warning: Item ini tidak akan muncul di mutabaah siapapun jika tidak ada target yang dipilih.</p>}
                     </div>

                     <div className="flex justify-end gap-2 border-t pt-3 border-slate-200 dark:border-slate-800">
                        <button 
                            type="button" 
                            onClick={() => { setIsAdding(false); setEditingItem(null); setLevels([]); setTargetLevels(["parent", "baligh", "tamyiz", "ghairu_tamyiz"]); }} 
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
                {[...worships].sort((a,b) => {
                    if (a.points < 0 && b.points >= 0) return 1;
                    if (a.points >= 0 && b.points < 0) return -1;
                    return 0;
                }).map(w => {
                    const isPenalty = w.points < 0;
                    let levelCount = 0;
                    try { if (w.levels) levelCount = JSON.parse(w.levels).length; } catch {}

                    return (
                        <div key={w.id} className={`flex justify-between items-center p-3 border rounded-lg ${isPenalty ? "bg-red-50 dark:bg-red-950/30 border-red-100 dark:border-red-900/50" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}>
                             <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center`}>
                                   {isPenalty ? <AlertCircle className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className={`font-medium truncate ${isPenalty ? "text-red-700 dark:text-red-400" : "text-slate-700 dark:text-slate-300"}`}>{w.name}</div>
                                    <div className="flex gap-2 text-xs flex-wrap">
                                        <span className={`px-2 py-0.5 rounded-full ${w.category === 'wajib' ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' : 'bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 mr-1'}`}>
                                            {w.category}
                                        </span>
                                        {levelCount > 0 ? (
                                            <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 font-bold">
                                                {levelCount} Levels
                                            </span>
                                        ) : (
                                            <span className={`font-bold ${isPenalty ? "text-red-600 dark:text-red-500" : "text-green-600 dark:text-green-500"}`}>
                                                {w.points > 0 ? `+${w.points}` : w.points} Poin
                                            </span>
                                        )}
                                    </div>
                                    {/* Target Level Badges */}
                                    <div className="flex gap-1 mt-1.5 flex-wrap">
                                        {(() => {
                                            try {
                                                const targets: IslamicLevel[] = w.targetLevels ? JSON.parse(w.targetLevels) : ["parent", "baligh", "tamyiz", "ghairu_tamyiz"];
                                                return targets.map(t => (
                                                    <span key={t} className="text-[9px] uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                        {t.split('_').join(' ')}
                                                    </span>
                                                ));
                                            } catch { return null; }
                                        })()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => handleEdit(w)}
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

import { saveProToken, saveFamilyName, revokeProToken, saveInspirasiSetting, saveFamilyVision } from "./actions";
import { Check, Loader2, Trash2, Lightbulb, Languages as LanguagesIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useLanguage } from "@/lib/language-context";

function LanguageSettings() {
    const { lang, t, toggleLanguage } = useLanguage();

    const handleToggleLanguage = () => {
        toggleLanguage();
        const nextLang = lang === "id" ? "English" : "Indonesia";
        toast(t.langSwitched(nextLang), "success");
    };

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><LanguagesIcon className="w-5 h-5 text-blue-500" /> {t.changeLanguage}</h3>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bahasa Aplikasi</label>
                    <p className="text-xs text-slate-500">Pilih bahasa yang akan digunakan pada antarmuka aplikasi.</p>
                    <div className="flex items-center gap-4 mt-2">
                        <button 
                            onClick={handleToggleLanguage}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
                        >
                            <LanguagesIcon className="w-4 h-4" />
                            {lang === "id" ? "Ubah ke English" : "Switch to Indonesia"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InspirasiSettings({ initialShow }: { initialShow: boolean }) {
    const [show, setShow] = useState(initialShow);
    const [saved, setSaved] = useState(false);

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Lightbulb className="w-5 h-5 text-amber-500" /> Pengaturan Inspirasi Harian</h3>
            </div>
            
            <form action={async (formData) => {
                await saveInspirasiSetting(formData);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tampilkan Inspirasi Harian di Dashboard</label>
                    <p className="text-xs text-slate-500">Jika dimatikan, widget kutipan mutiara hikmah harian tidak akan muncul di halaman dashboard.</p>
                    <div className="flex items-center gap-4 mt-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                name="show_inspirasi" 
                                value="true"
                                className="sr-only peer" 
                                checked={show}
                                onChange={(e) => setShow(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                        </label>
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                            {saved ? <><Check className="w-4 h-4" /> Tersimpan</> : <><Save className="w-4 h-4" /> Simpan</>}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

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

function FamilyVisionSettings({ initialTarget, initialVisi, initialMisi }: { initialTarget: string, initialVisi: string, initialMisi: string }) {
    const [target, setTarget] = useState(initialTarget);
    const [visi, setVisi] = useState(initialVisi);
    const [misi, setMisi] = useState(initialMisi);
    const [saved, setSaved] = useState(false);

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 dark:text-slate-300">Target & Visi Misi Keluarga</h3>
            </div>
            
            <form action={async (formData) => {
                await saveFamilyVision(formData);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Keluarga (Tahun Ini)</label>
                        <input 
                            name="familyTarget"
                            type="text"
                            placeholder="Contoh: Hafal Juz 30 Bersama, Lunas KPR"
                            className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Visi Keluarga</label>
                        <textarea 
                            name="familyVisi"
                            rows={2}
                            placeholder="Contoh: Menjadi keluarga yang sakinah, mawaddah, warahmah dan berkumpul di Surga Firdaus."
                            className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={visi}
                            onChange={(e) => setVisi(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Misi Keluarga</label>
                        <textarea 
                            name="familyMisi"
                            rows={3}
                            placeholder="Contoh: 1. Shalat berjamaah 5 waktu. 2. Tilawah 1 juz per hari."
                            className="w-full p-3 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-slate-50 dark:bg-slate-950 font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                            value={misi}
                            onChange={(e) => setMisi(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
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

export default function SettingsPage({ users, worships, initialProToken, initialFamilyName, showInspirasi, initialTarget, initialVisi, initialMisi }: { users: UserData[], worships: WorshipData[], initialProToken: string, initialFamilyName: string, showInspirasi: boolean, initialTarget: string, initialVisi: string, initialMisi: string }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
            {/* Emerald Header Banner */}
            <div className="bg-linear-to-br from-emerald-500 to-teal-600 px-6 pt-8 pb-12 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="relative z-10 font-sans flex justify-between items-center sm:flex-row flex-col gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Pengaturan</h1>
                        <p className="text-emerald-100 text-sm">Kelola anggota keluarga, ibadah, lisensi Pro, dan preferensi aplikasi.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 space-y-8">

        <div>
            <FamilyVisionSettings initialTarget={initialTarget} initialVisi={initialVisi} initialMisi={initialMisi} />
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        <div>
            <FamilyNameSettings initialName={initialFamilyName} />
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        <div>
            <InspirasiSettings initialShow={showInspirasi} />
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        <div>
            <ProSettings initialToken={initialProToken} />
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        <hr className="border-slate-200 dark:border-slate-800" />


        <div>
            <LanguageSettings />
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Informasi</h2>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Link href="/tentang" className="flex items-center justify-between text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 group transition-colors w-full">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg group-hover:bg-emerald-100 dark:group-hover:bg-emerald-800/50 transition-colors">
                           <Star className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="text-left">
                            <div className="font-semibold text-sm">Tentang Aplikasi</div>
                            <div className="text-xs text-slate-500">Informasi Creator dan Pengembangan</div>
                        </div>
                    </div>
                </Link>
            </div>
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />

        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Pengaturan Keluarga</h2>
            <FamilySettings users={users} />
        </div>

        
        <hr className="border-slate-200 dark:border-slate-800" />
        
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Pengaturan Sistem</h2>
            <DatabaseSettings />
        </div>

        <hr className="border-slate-200 dark:border-slate-800" />
        
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Pengaturan Ibadah</h2>
            <WorshipSettings worships={worships} />
        </div>

            </div>
            </div>
        </div>
    );
}

function DatabaseSettings() {
    const [isRestoring, setIsRestoring] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleRestore(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!confirm("Peringatan: Proses ini akan memasukkan data dari file backup ke tabel yang MASIH KOSONG. Data yang sudah ada tidak akan tertimpa. Lanjutkan?")) {
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setIsRestoring(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/restore", {
                method: "POST",
                body: formData
            });
            const data = await res.json();
            if (res.ok && data.success) {
                toast(data.message || "Restore berhasil.", "success");
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast(data.error || "Gagal melakukan restore.", "error");
            }
        } catch {
            toast("Terjadi kesalahan jaringan.", "error");
        } finally {
            setIsRestoring(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    }

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700/50 space-y-4">
            <h3 className="font-bold text-slate-700 dark:text-slate-300">Backup & Restore Database</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Amankan data keluarga Anda dengan mengekspor (Backup) seluruh database ke file .db. Anda dapat memulihkannya (Restore) di kemudian hari. Restore hanya mengisi tabel yang kosong.</p>
            
            <div className="flex flex-wrap gap-4">
                <a 
                    href="/api/backup"
                    target="_blank"
                    className="inline-flex items-center gap-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:hover:bg-emerald-900/80 dark:text-emerald-300 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <span className="text-xl">📥</span> Backup Database
                </a>

                <input 
                    type="file" 
                    accept=".db" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleRestore} 
                    disabled={isRestoring}
                />
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isRestoring}
                    className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-700 dark:bg-amber-900/50 dark:hover:bg-amber-900/80 dark:text-amber-300 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
                >
                    <span className="text-xl">📤</span> {isRestoring ? "Memproses..." : "Restore Database"}
                </button>
            </div>
        </div>
    );
}
