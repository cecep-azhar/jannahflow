"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, CreditCard, ArrowRightLeft, Target, ShieldAlert, BadgeDollarSign } from "lucide-react";

export function FinanceNav() {
    const pathname = usePathname();

    const tabs = [
        { name: "Ringkasan", href: "/finance", icon: <BadgeDollarSign className="w-5 h-5 shrink-0" /> },
        { name: "Dompet", href: "/finance/accounts", icon: <Wallet className="w-5 h-5 shrink-0" /> },
        { name: "Transaksi", href: "/finance/transactions", icon: <ArrowRightLeft className="w-5 h-5 shrink-0" /> },
        { name: "Anggaran", href: "/finance/budgets", icon: <CreditCard className="w-5 h-5 shrink-0" /> },
        { name: "Target Tabungan", href: "/finance/saving-goals", icon: <Target className="w-5 h-5 shrink-0" /> },
        { name: "Aset & Zakat", href: "/finance/assets", icon: <ShieldAlert className="w-5 h-5 shrink-0" /> },
    ];

    return (
        <div className="flex overflow-x-auto pb-4 gap-3 hide-scrollbar snap-x relative items-center">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href;
                return (
                    <Link
                        key={tab.name}
                        href={tab.href}
                        className={`
                            flex items-center gap-2 px-5 py-3 rounded-full text-base font-semibold transition-all whitespace-nowrap shadow-sm snap-start select-none
                            ${isActive 
                                ? "bg-indigo-600 text-white border border-indigo-700 shadow-indigo-500/30" 
                                : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30"
                            }
                        `}
                    >
                        {tab.icon} {tab.name}
                    </Link>
                );
            })}
        </div>
    );
}
