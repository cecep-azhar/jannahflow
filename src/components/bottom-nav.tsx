"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Wallet, PieChart, Settings, BookHeart } from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Beranda", href: "/dashboard", icon: <Home className="w-6 h-6" /> },
    { name: "Mutabaah", href: "/mutabaah", icon: <ClipboardList className="w-6 h-6" /> },
    { name: "Jurnal", href: "/journal", icon: <BookHeart className="w-6 h-6" /> },
    { name: "Keuangan", href: "/finance", icon: <Wallet className="w-6 h-6" />, pro: true },
    { name: "Laporan", href: "/report", icon: <PieChart className="w-6 h-6" /> },
    { name: "Pengaturan", href: "/settings", icon: <Settings className="w-6 h-6" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] z-50">
      <div className="flex justify-around items-center h-16 w-full max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          // Exact match for dashboard, prefix match for others
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname?.startsWith(item.href);
            
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors ${
                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300"
              }`}
            >
              {item.pro && (
                <span className="absolute top-1 mt-0.5 right-4 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white dark:border-slate-900 shadow-sm z-10 animate-pulse"></span>
              )}
              {item.icon}
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
