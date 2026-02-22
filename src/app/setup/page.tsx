"use client";

import { useState } from "react";
import { setupFamily } from "./actions";
import { Plus, Trash, Check, User, Heart, Lock } from "lucide-react";

export default function SetupPage() {
  const [children, setChildren] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);

  function addChild() {
    setChildren([...children, ""]);
  }

  function removeChild(index: number) {
    const newChildren = [...children];
    newChildren.splice(index, 1);
    setChildren(newChildren);
  }

  function updateChild(index: number, value: string) {
    const newChildren = [...children];
    newChildren[index] = value;
    setChildren(newChildren);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-900">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="bg-emerald-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Selamat Datang!</h1>
          <p className="opacity-90 mt-2">Mari siapkan aplikasi Mutabaah Keluarga Anda.</p>
        </div>

        <form action={setupFamily} className="p-6 space-y-6" onSubmit={() => setLoading(true)}>
          {/* Parents Section */}
          <div className="space-y-4">
            <h2 className="font-semibold text-slate-700 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" /> Data Orang Tua
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Nama Ayah</label>
                <input 
                  name="fatherName" 
                  required 
                  placeholder="Contoh: Abi Budi" 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Nama Bunda</label>
                <input 
                  name="motherName" 
                  required 
                  placeholder="Contoh: Umi Siti" 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                <Lock className="inline w-4 h-4 mr-1" /> PIN Orang Tua
              </label>
              <input 
                name="pin" 
                required 
                placeholder="123456" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none font-mono tracking-widest text-center text-slate-900"
              />
              <p className="text-xs text-slate-500 mt-1">PIN ini digunakan Ayah & Bunda untuk login dan settings.</p>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Children Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" /> Data Anak
              </h2>
              <button 
                type="button" 
                onClick={addChild}
                className="text-sm text-emerald-600 font-medium flex items-center gap-1 hover:text-emerald-800"
              >
                <Plus className="w-4 h-4" /> Tambah Anak
              </button>
            </div>

            <div className="space-y-2">
              {children.map((child, index) => (
                <div key={index} className="flex gap-2">
                  <input 
                    name={`child-${index}`}
                    value={child}
                    onChange={(e) => updateChild(index, e.target.value)}
                    placeholder={`Nama Anak ke-${index + 1}`}
                    required
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-slate-900"
                  />
                  {children.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeChild(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Settings Section */}
            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3">
              <input 
                type="checkbox" 
                name="useTemplate" 
                defaultChecked 
                id="useTemplate"
                className="mt-1 w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500" 
              />
              <label htmlFor="useTemplate" className="text-sm text-slate-700 cursor-pointer select-none">
                <span className="font-semibold block text-slate-900">Gunakan Template Ibadah Standar</span>
                Otomatis mengisi daftar ibadah (Wajib, Sunnah) dan Penalti (Kesalahan). Jika tidak dicentang, daftar ibadah akan kosong.
              </label>
            </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Memproses...</span>
            ) : (
              <>
                <Check className="w-5 h-5" /> Selesai & Mulai
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
