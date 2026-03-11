import { db } from "@/db";
import { transactions } from "@/db/schema";
import { Plus } from "lucide-react";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { TransactionsClient } from "./transactions-client";

export const dynamic = "force-dynamic";

export default async function TransactionsPage() {
    const allTransactions = await db.select().from(transactions).orderBy(desc(transactions.dateMasehi));
    const cookieStore = await cookies();
    const roleCookie = cookieStore.get("mutabaah-user-role")?.value;
    const isChild = roleCookie === "child";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Riwayat Transaksi</h2>
                {!isChild && (
                    <Link href="/finance/transactions/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 transition-colors">
                        <Plus className="w-4 h-4" /> Catat Transaksi
                    </Link>
                )}
            </div>

            <TransactionsClient allTransactions={allTransactions} isChild={isChild} />
        </div>
    );
}
