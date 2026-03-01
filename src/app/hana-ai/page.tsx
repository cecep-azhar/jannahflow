import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BrainCircuit, Bot } from "lucide-react";
import { BottomNav } from "@/components/bottom-nav";
import hanaImage from "@/app/assets/ai/hana.png";

export default function HanaAiPlaceholder() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 font-sans">
      <header className="bg-linear-to-br from-slate-900 to-indigo-950 text-white px-6 pt-8 pb-12 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-4 relative z-10 mb-4">
          <Link href="/dashboard" className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Hana AI Assistant</h1>
        </div>
      </header>

      <main className="px-6 flex flex-col items-center justify-center py-6 text-center">
        <div className="relative mb-8 group">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-blue-400/20 dark:bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-400/30 transition-all duration-700"></div>
            
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 z-10 drop-shadow-2xl animate-float">
                <Image 
                    src={hanaImage} 
                    alt="Hana 3D" 
                    fill 
                    className="object-contain"
                    priority
                />
            </div>
            
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-3 rounded-2xl shadow-xl z-20 animate-bounce stagger-1">
                <BrainCircuit className="w-6 h-6 text-blue-100 fill-blue-500" />
            </div>
        </div>
        
        <div className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
            Coming Soon
        </div>
        
        <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">Your Islamic Family Intelligence</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-10 leading-relaxed text-sm">
            Hana AI by Fathforce, akan memberikan rekomendasi amalan cerdas, nasihat islami personal, dan analisis pertumbuhan spiritual keluarga Anda.
        </p>

        <div className="grid grid-cols-1 gap-4 w-full">
            <AiFeatureCard 
                icon={<Bot className="w-5 h-5 text-blue-500" />} 
                title="Smart Counseling" 
                desc="Tanya Hana seputar parenting islami." 
            />
            <AiFeatureCard 
                icon={<Activity className="w-5 h-5 text-indigo-500" />} 
                title="Spiritual Analytics" 
                desc="Tren ibadah keluarga dalam grafik cerdas." 
            />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function AiFeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4 text-left shadow-sm">
            <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{title}</h4>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">{desc}</p>
            </div>
        </div>
    )
}

import { Activity } from "lucide-react";
