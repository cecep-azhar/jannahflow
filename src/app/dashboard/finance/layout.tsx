import Link from "next/link";
import { Wallet, CreditCard, ArrowRightLeft, Target, ShieldAlert, BadgeDollarSign } from "lucide-react";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { sql } from "drizzle-orm";

export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
    try {
        await db.select().from(accounts).limit(1);
    } catch {
        console.warn("Finance tables missing, auto-creating...");
        await db.run(sql`CREATE TABLE IF NOT EXISTS \`accounts\` (\`id\` text PRIMARY KEY NOT NULL, \`name\` text NOT NULL, \`type\` text NOT NULL, \`balance\` integer DEFAULT 0 NOT NULL)`);
        await db.run(sql`CREATE TABLE IF NOT EXISTS \`transactions\` (\`id\` text PRIMARY KEY NOT NULL, \`account_id\` text NOT NULL REFERENCES accounts(id) ON DELETE cascade, \`type\` text NOT NULL, \`amount\` integer NOT NULL, \`category\` text NOT NULL, \`description\` text, \`date_masehi\` text NOT NULL, \`date_hijri\` text NOT NULL, \`is_halal_certified\` integer DEFAULT 0)`);
        await db.run(sql`CREATE TABLE IF NOT EXISTS \`budgets\` (\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL, \`category\` text NOT NULL, \`monthly_limit\` integer NOT NULL, \`period_type\` text DEFAULT 'MASEHI' NOT NULL)`);
        await db.run(sql`CREATE TABLE IF NOT EXISTS \`assets\` (\`id\` integer PRIMARY KEY AUTOINCREMENT NOT NULL, \`name\` text NOT NULL, \`purchase_price\` integer NOT NULL, \`current_valuation\` integer NOT NULL, \`asset_type\` text NOT NULL)`);
    }
    const tabs = [
        { name: "Ringkasan", href: "/dashboard/finance", icon: <BadgeDollarSign className="w-5 h-5" /> },
        { name: "Dompet", href: "/dashboard/finance/accounts", icon: <Wallet className="w-5 h-5" /> },
        { name: "Transaksi", href: "/dashboard/finance/transactions", icon: <ArrowRightLeft className="w-5 h-5" /> },
        { name: "Anggaran", href: "/dashboard/finance/budgets", icon: <CreditCard className="w-5 h-5" /> },
        { name: "Target Tabungan", href: "/dashboard/finance/saving-goals", icon: <Target className="w-5 h-5" /> },
        { name: "Aset & Zakat", href: "/dashboard/finance/assets", icon: <ShieldAlert className="w-5 h-5" /> },
    ];

    return (
        <div className="p-4 max-w-5xl mx-auto space-y-6 pb-20">
            <div className="bg-linear-to-br from-indigo-600 to-indigo-800 dark:from-indigo-800 dark:to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-lg border border-indigo-500/20">
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">Financial Family <span className="text-amber-300 text-lg align-top ml-1">PRO</span></h1>
                <p className="text-indigo-100 text-sm md:text-base opacity-90">Kelola keuangan keluarga dengan berkah, pantau zakat, dan capai impian bersama secara transparan.</p>
            </div>

            <div className="flex overflow-x-auto pb-4 gap-3 hide-scrollbar snap-x">
                {tabs.map((tab) => (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className="flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-base font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all whitespace-nowrap shadow-sm snap-start"
                    >
                        {tab.icon} {tab.name}
                    </Link>
                ))}
            </div>

            <div className="mt-4">
                {children}
            </div>
        </div>
    );
}
