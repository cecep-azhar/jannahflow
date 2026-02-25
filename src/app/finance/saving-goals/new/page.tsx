import { addSavingGoal } from "../../actions";
import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";

export default function NewSavingGoalPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/finance/saving-goals" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </Link>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Buat Target Tabungan Baru</h2>
            </div>

            <form action={addSavingGoal} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Impian / Target</label>
                    <input type="text" id="name" name="name" required placeholder="Contoh: Tabungan Haji, Qurban 1447, Aqiqah Anak Pertama" className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div>
                    <label htmlFor="targetAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Nominal (Rp)</label>
                    <input type="number" min="0" id="targetAmount" name="targetAmount" required placeholder="0" className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div>
                    <label htmlFor="currentAmount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Saldo Awal (jika sudah ada tabungan)</label>
                    <input type="number" min="0" id="currentAmount" name="currentAmount" placeholder="0" defaultValue="0" className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Waktu (opsional)</label>
                    <input type="text" id="deadline" name="deadline" placeholder="Contoh: Dzulhijjah 1447 atau Desember 2026" className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                    <p className="text-xs text-slate-500 mt-1">Bisa dalam format Hijriyah maupun Masehi.</p>
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2">
                        <Target className="w-5 h-5" /> Simpan Target
                    </button>
                </div>
            </form>
        </div>
    );
}
