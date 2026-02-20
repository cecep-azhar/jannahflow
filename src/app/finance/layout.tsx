import Link from "next/link";
import { Lock } from "lucide-react";
import { FinanceNav } from "./finance-nav";
import { BottomNav } from "@/components/bottom-nav";

import { db } from "@/db";
import { accounts, systemStats } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { verifyProToken } from "@/lib/pro-utils";
import { headers } from "next/headers";

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

    let isPro = false;
    try {
        const tokenStat = await db.query.systemStats.findFirst({
            where: eq(systemStats.key, "pro_token")
        });
        const headersList = await headers();
        const host = headersList.get("host") || "localhost";
        const hostname = host.split(":")[0];
        isPro = await verifyProToken(tokenStat?.value, hostname);
    } catch {
       // defaults to false
    }

    if (!isPro) {
        return (
            <>
                <div className="p-4 max-w-5xl w-full min-w-0 mx-auto space-y-6 pb-20 flex flex-col items-center justify-center min-h-[70vh] text-center">
                <div className="bg-slate-100 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full shadow-sm flex flex-col items-center">
                    <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6">
                        <Lock className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-3">Fitur Terkunci</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        Fitur pencatatan keuangan (Financial Family) merupakan fitur eksklusif untuk lisensi Pro. Silakan aktivasi lisensi Pro untuk mulai menggunakannya.
                    </p>
                    <Link href="/settings" className="bg-indigo-600 text-white px-6 py-3 rounded-full font-medium hover:bg-indigo-700 transition-colors w-full">
                        Buka Halaman Aktivasi
                    </Link>
                </div>
            </div>
            <BottomNav />
            </>
        );
    }

    return (
        <>
            <div className="p-4 max-w-5xl w-full min-w-0 mx-auto space-y-6 pb-20">
                <div className="bg-linear-to-br from-indigo-600 to-indigo-800 dark:from-indigo-800 dark:to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-lg border border-indigo-500/20">
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">Financial Family <span className="text-amber-300 text-lg align-top ml-1">PRO</span></h1>
                <p className="text-indigo-100 text-sm md:text-base opacity-90">Kelola keuangan keluarga dengan berkah, pantau zakat, dan capai impian bersama secara transparan.</p>
            </div>

            <FinanceNav />


            <div className="mt-4">
                {children}
            </div>
        </div>
        <BottomNav />
        </>
    );
}
