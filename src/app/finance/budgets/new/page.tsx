import { addBudget } from "../../actions";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function NewBudgetPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/finance/budgets" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </Link>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Buat Anggaran Baru</h2>
            </div>

            <form action={addBudget} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl space-y-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori Pengeluaran</label>
                    <select id="category" name="category" required className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="Makanan">Makanan & Minuman (Primer)</option>
                        <option value="Pendidikan">Pendidikan (Primer)</option>
                        <option value="Kesehatan">Kesehatan</option>
                        <option value="Tagihan">Tagihan (Listrik, Air)</option>
                        <option value="Transportasi">Transportasi</option>
                        <option value="Hiburan & Rekreasi">Hiburan & Rekreasi (Tersier)</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="periodType" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Berdasarkan Periode</label>
                    <select id="periodType" name="periodType" required className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="MASEHI">Masehi (Bulanan)</option>
                        <option value="HIJRI">Hijriyah (Bulanan)</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="monthlyLimit" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Batas Maksimal (Rp)</label>
                    <input type="text" id="monthlyLimit" name="monthlyLimit" required placeholder="0" className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2">
                        <Save className="w-5 h-5" /> Simpan Anggaran
                    </button>
                </div>
            </form>
        </div>
    );
}
