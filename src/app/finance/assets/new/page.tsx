import { addAsset } from "../../actions";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewAssetPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/finance/assets" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </Link>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Tambah Pencatatan Aset</h2>
            </div>

            <form action={addAsset} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Aset (Contoh: Rumah, Emas 10gr, Mobil)</label>
                    <input type="text" id="name" name="name" required placeholder="Nama aset" className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div>
                    <label htmlFor="assetType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis Aset</label>
                    <select id="assetType" name="assetType" required className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="PROPERTY">Properti (Tanah / Bangunan)</option>
                        <option value="GOLD">Logam Mulia (Emas / Perak)</option>
                        <option value="VEHICLE">Kendaraan</option>
                        <option value="STOCK">Saham / Reksadana / Efek</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="purchasePrice" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Harga Beli / Modal (Rp)</label>
                    <input type="text" id="purchasePrice" name="purchasePrice" required placeholder="0" className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div>
                    <label htmlFor="currentValuation" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estimasi Nilai Saat Ini (Rp)</label>
                    <input type="text" id="currentValuation" name="currentValuation" required placeholder="0" className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    <p className="text-xs text-slate-500 mt-1">Nilai ini digunakan untuk kalkulasi Nisab Zakat jika aset bersifat likuid atau niat diperdagangkan.</p>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2">
                        <Save className="w-5 h-5" /> Simpan Aset
                    </button>
                </div>
            </form>
        </div>
    );
}
