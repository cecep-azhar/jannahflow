import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Github, Globe, Heart, Mail, MessageCircle } from "lucide-react";
import qrisImage from "../assets/qris/qris-cecep-azhar.jpeg";
import creatorPhoto from "../assets/creator/cecepazhar.png";
import appLogo from "../logo/logo-jannahflow-green.png";

export const metadata = {
  title: "Tentang JannahFlow",
  description: "Informasi tentang aplikasi JannahFlow dan pengembangan ke depan.",
};

export default function TentangPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Header Banner */}
      <div className="bg-linear-to-br from-emerald-500 to-teal-600 px-4 pt-8 pb-12 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="relative z-10 font-sans flex items-center gap-3">
          <Link href="/settings" className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Tentang Aplikasi</h1>
            <p className="text-emerald-100 text-sm">Moslem Family Management by JannahFlow</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-4 relative z-10 space-y-6">
        
        {/* Info Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-xl">
              <Image src={appLogo} alt="JannahFlow Logo" className="w-6 h-6 object-contain" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">JannahFlow</h2>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
            JannahFlow adalah aplikasi **Moslem Family Management** yang mengintegrasikan manajemen ibadah, keuangan, dan bonding keluarga untuk membantu keluarga muslim mencapai visi dunia dan akhirat secara syar&apos;i dan profesional.
          </p>

          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3 mt-4">
             <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Pengembang</h3>
             <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold overflow-hidden border border-emerald-200 dark:border-emerald-800">
                    <Image src={creatorPhoto} alt="Cecep Saeful Azhar" className="w-full h-full object-cover" />
                </div>
                <div>
                   <div className="font-bold text-slate-800 dark:text-slate-200">Cecep Saeful Azhar Hidayat, ST</div>
                   <div className="text-xs text-slate-500">Founder JannahFlow</div>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <a href="https://wa.me/6285220696117" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
                  <MessageCircle className="w-4 h-4" /> 085220696117
                </a>
                <a href="mailto:hi@cecepazhar.com" className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  <Mail className="w-4 h-4" /> hi@cecepazhar.com
                </a>
                <a href="https://github.com/cecep-azhar" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:underline">
                  <Github className="w-4 h-4" /> cecep-azhar
                </a>
                <a href="https://www.JannahFlow.my.id" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 hover:underline">
                  <Globe className="w-4 h-4" /> Website
                </a>
             </div>
          </div>
        </div>

         {/* Support/Donation Card */}
        <div className="bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-900/10 rounded-2xl shadow-xl border border-emerald-100 dark:border-emerald-800/50 p-6 text-center space-y-4">
           <div className="flex justify-center mb-2">
              <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-full">
                <Heart className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
           </div>
           <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Dukung Project Jariyah</h2>
           <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
              JannahFlow dikembangkan secara independen. Dukungan Anda akan sangat membantu operasional server dan pengembangan fitur-fitur baru demi kemaslahatan umat.
           </p>

           <div className="mt-4 bg-white dark:bg-white p-4 rounded-2xl inline-block shadow-md border border-slate-200">
              <Image 
                src={qrisImage} 
                alt="QRIS Donasi JannahFlow" 
                className="w-48 h-auto object-contain rounded-lg mx-auto"
              />
              <p className="text-xs text-slate-500 font-medium mt-3">Scan QRIS untuk Dukungan Amal Jariyah</p>
           </div>
        </div>

        {/* Future Development Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
           <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">🚀 Pengembangan Terdekat</h2>
           <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
             Kami terus berkomitmen mengembangkan fitur-fitur baru untuk melengkapi ekosistem JannahFlow:
           </p>

           <ul className="space-y-3">
              {[
                { title: "Quran Suite", desc: "Tilawah, Murojaah, Ziyadah, Storan, Tadabur" },
                { title: "AI Insight & Analitics", desc: "Analisis cerdas ibadah dan kebiasaan keluarga" },
                { title: "Bounding Keluarga", desc: "Fitur interaktif untuk kedekatan keluarga", completed: true },
                { title: "Kalender Menu Makan", desc: "Perencanaan menu makan sehat keluarga" },
                { title: "Multi Pilihan Point", desc: "Gamifikasi ibadah dengan reward fleksibel", completed: true }
              ].map((item, idx) => (
                <li key={idx} className={`flex gap-3 items-start p-3 rounded-xl border ${item.completed ? 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/50' : 'bg-slate-50 dark:bg-slate-950 border-slate-100 dark:border-slate-800'}`}>
                   <div className={`${item.completed ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'} w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5`}>
                     {idx + 1}
                   </div>
                   <div>
                     <div className={`font-semibold text-sm ${item.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>{item.title}</div>
                     <div className={`text-xs ${item.completed ? 'text-slate-400 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400'}`}>{item.desc}</div>
                   </div>
                </li>
              ))}
           </ul>
        </div>

      </div>
    </div>
  );
}
