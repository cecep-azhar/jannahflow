import { ArrowLeft, Utensils, Construction } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";

export default function MenuMakanPlaceholder() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100">
      <header className="bg-linear-to-br from-orange-500 to-red-600 text-white px-6 pt-8 pb-12 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-4 relative z-10 mb-4">
          <Link href="/dashboard" className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Menu Makan</h1>
        </div>
      </header>

      <main className="px-6 flex flex-col items-center justify-center py-12 text-center">
        <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-orange-200 dark:shadow-none animate-pulse">
            <Utensils className="w-10 h-10 text-orange-600 dark:text-orange-400" />
        </div>
        
        <div className="inline-block bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            Next Feature
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3">Kitchen Planner & Halal Guide</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8 leading-relaxed">
            Nantikan fitur perencanaan menu keluarga harian, daftar belanja otomatis, dan info kehalalan bahan makanan.
        </p>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex items-center gap-4">
            <Construction className="w-6 h-6 text-slate-400" />
            <div className="text-left">
                <h4 className="font-bold text-slate-800 dark:text-white">Sedang Dirancang</h4>
                <p className="text-xs text-slate-400">Tim JannahFlow sedang mematikan fitur ini untuk Anda.</p>
            </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
