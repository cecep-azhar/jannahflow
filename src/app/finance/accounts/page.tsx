import { db } from "@/db";
import { accounts } from "@/db/schema";
import { Plus, Wallet, HandCoins, Building2, TrendingUp, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteAccount } from "../actions";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
    const allAccounts = await db.select().from(accounts);
    
    const getTypeIcon = (type: string) => {
        switch(type) {
            case "CASH": return <HandCoins className="w-5 h-5 text-green-600" />;
            case "BANK": return <Building2 className="w-5 h-5 text-blue-600" />;
            case "GOLD": return <TrendingUp className="w-5 h-5 text-yellow-600" />;
            default: return <Wallet className="w-5 h-5 text-slate-600" />;
        }
    };

    const formatRupiah = (val: number) => {
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
    };

    return (
        <div className="space-y-6">
             <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Daftar Akun / Dompet</h2>
                <Link href="/finance/accounts/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Tambah Akun
                </Link>
            </div>

            {allAccounts.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <Wallet className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-slate-600 dark:text-slate-400 font-medium">Belum ada akun yang terdaftar</h3>
                    <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Tambahkan dompet tunai atau rekening bank Anda untuk memulai.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allAccounts.map(account => (
                        <div key={account.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-full">
                                {getTypeIcon(account.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-slate-700 dark:text-slate-300 truncate">{account.name}</h4>
                                <div className="text-sm text-slate-500 dark:text-slate-400 capitalize">{account.type.toLowerCase()}</div>
                                <div className="font-semibold text-indigo-600 dark:text-indigo-400 mt-1">{formatRupiah(account.balance)}</div>
                            </div>
                            <form action={deleteAccount}>
                                <input type="hidden" name="id" value={account.id} />
                                <button type="submit" className="text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors p-1" title="Hapus Akun">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
