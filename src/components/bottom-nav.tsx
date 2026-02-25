"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Wallet, BookOpen, BookHeart, HeartHandshake, Star } from "lucide-react";
import { useLoading } from "@/components/loading-provider";

export function BottomNav() {
  const pathname = usePathname();
  const { showLoading } = useLoading();

  const navItems = [
    { name: "Beranda", href: "/dashboard", icon: <Home className="w-6 h-6" /> },
    { name: "Mutabaah", href: "/mutabaah", icon: <ClipboardList className="w-6 h-6" /> },
    { name: "Al-Quran", href: "/quran", icon: <BookOpen className="w-6 h-6" /> },
    { name: "Jurnal", href: "/journal", icon: <BookHeart className="w-6 h-6" /> },
    { name: "Bounding", href: "/bonding", icon: <HeartHandshake className="w-6 h-6" />, pro: true },
    { name: "Keuangan", href: "/finance", icon: <Wallet className="w-6 h-6" />, pro: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] z-50">
      <div className="flex justify-around items-center h-16 w-full max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard" 
            : pathname?.startsWith(item.href);
            
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (pathname !== item.href) {
                  showLoading();
                }
              }}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors ${
                isActive ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-300"
              }`}
            >
              {item.pro && (
                <div className="absolute top-1 right-2 z-10">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 drop-shadow-[0_0_2px_rgba(251,191,36,0.5)]" />
                </div>
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
