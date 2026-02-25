"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Star, Settings } from "lucide-react";
import { useLanguage } from "@/lib/language-context";
import Image from "next/image";
import Link from "next/link";
import logoTextGreen from "@/app/logo/logo-jannahflow-logo-text-green.png";
import logoTextWhite from "@/app/logo/logo-jannahflow-logo-text-white.png";
import { UserAvatar } from "./user-avatar";

export function Header({ 
    familyName = "Family", 
    isPro = false,
    user
}: { 
    familyName?: string, 
    isPro?: boolean,
    user?: { name: string; avatarUrl: string | null }
}) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { t } = useLanguage();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <header className="w-full py-4 px-6 flex justify-between items-center bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <Link href="/dashboard" className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
         {resolvedTheme === "dark" ? (
             <Image src={logoTextWhite} alt="JannahFlow" height={28} className="w-auto" />
         ) : (
             <Image src={logoTextGreen} alt="JannahFlow" height={28} className="w-auto" />
         )}
         <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">{familyName}</span>
         {isPro && (
            <span className="flex items-center gap-0.5 text-[10px] bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-500 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
               <Star className="w-3 h-3 fill-current" />
            </span>
         )}
      </Link>
      
      <div className="flex items-center gap-2">
         {user && (
           <div className="flex items-center gap-2 mr-1">
             <UserAvatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
           </div>
         )}
         <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            title={t.changeTheme}
         >
            {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
         </button>

         <Link
            href="/settings"
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
            title="Pengaturan"
         >
            <Settings className="w-4 h-4" />
         </Link>
      </div>
    </header>
  );
}
