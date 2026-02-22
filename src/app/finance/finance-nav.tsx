"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, CreditCard, ArrowRightLeft, Target, ShieldAlert, BadgeDollarSign } from "lucide-react";

export function FinanceNav() {
    const pathname = usePathname();

    const tabs = [
        { name: "Ringkasan", href: "/finance", icon: <BadgeDollarSign className="w-4 h-4 shrink-0" /> },
        { name: "Dompet", href: "/finance/accounts", icon: <Wallet className="w-4 h-4 shrink-0" /> },
        { name: "Transaksi", href: "/finance/transactions", icon: <ArrowRightLeft className="w-4 h-4 shrink-0" /> },
        { name: "Anggaran", href: "/finance/budgets", icon: <CreditCard className="w-4 h-4 shrink-0" /> },
        { name: "Tabungan", href: "/finance/saving-goals", icon: <Target className="w-4 h-4 shrink-0" /> },
        { name: "Aset & Zakat", href: "/finance/assets", icon: <ShieldAlert className="w-4 h-4 shrink-0" /> },
    ];

    return (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={`
                            flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs font-semibold transition-all select-none text-center
                            ${isActive
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            }
                        `}
                    >
                        {tab.icon}
                        <span className="leading-tight">{tab.name}</span>
                    </Link>
                );
            })}
        </div>
    );
}
