import { addTransaction } from "../../actions";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { formatMasehiDate, convertToHijri } from "@/lib/hijri-utils";

export const dynamic = "force-dynamic";

export default async function NewTransactionPage() {
    const allAccounts = await db.select().from(accounts);
    const masehiToday = formatMasehiDate();
    const hijriString = convertToHijri(); // Returns YYYY-MM-DD string directly

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/finance/transactions" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </Link>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Catat Transaksi Baru</h2>
            </div>

            <form action={addTransaction} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl space-y-4">
                <input type="hidden" name="dateMasehi" value={masehiToday} />
                <input type="hidden" name="dateHijri" value={hijriString} />
                
                <div>
                    <label htmlFor="accountId" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dompet / Akun</label>
                    <select id="accountId" name="accountId" required className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        {allAccounts.length === 0 && <option value="">Belum ada akun, buat akun dulu</option>}
                        {allAccounts.map(acc => (
                            <option key={acc.id} value={acc.id}>{acc.name} - Rp {acc.balance.toLocaleString('id-ID')}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jenis Transaksi</label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input type="radio" name="type" value="INCOME" defaultChecked className="w-4 h-4 text-indigo-600" />
                            Pemasukan
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium">
                            <input type="radio" name="type" value="EXPENSE" className="w-4 h-4 text-indigo-600" />
                            Pengeluaran
                        </label>
                    </div>
                </div>

                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nominal (Rp)</label>
                    <input type="number" min="0" id="amount" name="amount" required placeholder="0" className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" />
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kategori</label>
                    <select id="category" name="category" required className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all">
                        <option value="Makanan">Makanan & Minuman</option>
                        <option value="Transportasi">Transportasi</option>
                        <option value="Pendidikan">Pendidikan</option>
                        <option value="Kesehatan">Kesehatan</option>
                        <option value="Zakat & Sedekah">Zakat, Infaq, Sedekah</option>
                        <option value="Gaji">Gaji / Pendapatan</option>
                        <option value="Lainnya">Lainnya</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi & Catatan</label>
                    <textarea id="description" name="description" rows={2} placeholder="Keterangan tambahan..." className="w-full border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg px-4 py-2 border focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"></textarea>
                </div>

                <div>
                    <label className="flex items-center gap-2 text-sm font-medium mt-2">
                        <input type="checkbox" name="isHalalCertified" className="w-4 h-4 rounded text-indigo-600" />
                        Termasuk produk Halal / Thayyib?
                    </label>
                    <p className="text-xs text-slate-500 ml-6 mt-1">Hanya centang jika produk benar-benar tersertifikasi atau jelas statusnya.</p>
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={allAccounts.length === 0} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Save className="w-5 h-5" /> Simpan Transaksi
                    </button>
                    {allAccounts.length === 0 && <p className="text-sm text-red-500 text-center mt-2">Silakan buat akun terlebih dahulu.</p>}
                </div>
            </form>
        </div>
    );
}
