import { addAccount } from "../../actions";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";

export default function NewAccountPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/finance/accounts" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </Link>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Tambah Akun / Dompet</h2>
            </div>

            <form action={addAccount} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Akun</label>
                    <input type="text" id="name" name="name" required placeholder="Contoh: Dompet Utama, BCA, dll" className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis Akun</label>
                    <select id="type" name="type" required className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="CASH">Tunai (Cash)</option>
                        <option value="BANK">Rekening Bank</option>
                        <option value="GOLD">Emas</option>
                        <option value="INVESTMENT">Investasi</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="balance" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Saldo Awal (Rp)</label>
                    <input type="text" id="balance" name="balance" required placeholder="0" defaultValue="0" className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div className="pt-4">
                    <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2">
                        <Wallet className="w-5 h-5" /> Simpan Akun
                    </button>
                </div>
            </form>
        </div>
    );
}
