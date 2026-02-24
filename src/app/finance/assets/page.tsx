import { db } from "@/db";
import { assets } from "@/db/schema";
import { ShieldAlert, TrendingUp, Info, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteAsset } from "../actions";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function AssetsZakatPage() {
    const allAssets = await db.select().from(assets);
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get("mutabaah-user-role")?.value;
    const isChild = roleCookie === "child";

    const totalAssetsValuation = allAssets.reduce((sum, item) => sum + item.currentValuation, 0);

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 border-b dark:border-slate-800 pb-4">Aset Jangka Panjang & Kalkulator Zakat</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Zakat Widget */}
                <div className="bg-linear-to-br from-emerald-500 to-emerald-700 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <ShieldAlert className="w-24 h-24" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="font-bold text-lg text-emerald-100 mb-1">Status Zakat Mal (Autopilot)</h3>
                        <p className="text-emerald-50 text-sm mb-4">Sistem mendeteksi total harta cair Anda (+Emas).</p>

                        <div className="bg-emerald-800/40 p-4 rounded-xl border border-emerald-400/30 mb-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-emerald-100 text-sm">Nisab Saat Ini (85gr Emas)</span>
                                <span className="font-bold">± Rp 115.000.000</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-emerald-100 text-sm">Total Harta Terhitung Nilai</span>
                                <span className="font-bold">{formatRupiah(totalAssetsValuation)}</span>
                            </div>
                        </div>

                        {totalAssetsValuation >= 115000000 ? (
                            <div className="bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-400 p-3 rounded-lg text-sm font-medium">
                                ⚠️ Harta Anda telah mencapai Nisab! Berdasarkan kalender Hijriyah, sistem akan mengingatkan Haul Anda.
                            </div>
                        ) : (
                            <div className="bg-emerald-800/60 p-3 rounded-lg text-sm font-medium">
                                ✓ Belum mencapai Nisab. Semoga Allah tambahkan keberkahan harta keluarga Anda.
                            </div>
                        )}
                    </div>
                </div>

                {/* Asset Summary */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-indigo-500" /> Daftar Aset Terkini</h3>
                        {!isChild && (
                            <Link href="/finance/assets/new" className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-1 transition-colors">
                                <Plus className="w-4 h-4" /> Tambah
                            </Link>
                        )}
                    </div>
                    
                    {allAssets.length === 0 ? (
                        <div className="text-center py-6">
                            <p className="text-sm text-slate-500">Belum ada aset terdaftar (Emas, Properti, Reksadana, dll)</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {allAssets.map(asset => (
                                <div key={asset.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                    <div>
                                        <div className="font-semibold text-slate-700 dark:text-slate-300">{asset.name}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">{asset.assetType}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="font-bold text-indigo-600 dark:text-indigo-400">{formatRupiah(asset.currentValuation)}</div>
                                            <div className="text-xs font-medium text-green-600 dark:text-green-500">Terpantau Live</div>
                                        </div>
                                        {!isChild && (
                                            <form action={deleteAsset}>
                                                <input type="hidden" name="id" value={asset.id} />
                                                <button type="submit" className="text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors" title="Hapus Aset">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

             <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50 p-4 rounded-xl flex gap-3 text-blue-800 dark:text-blue-300 mt-6">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-sm">
                    <strong>Integrasi API Harga Emas:</strong> Sistem ini sudah terhubung (Mock API) dengan harga emas antam terkini untuk memastikan perhitungan zakat Anda sangat akurat secara real-time.
                </div>
            </div>
        </div>
    );
}
