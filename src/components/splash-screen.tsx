"use client";

import { useEffect, useState } from "react";

// Let's use Intl for Hijri as planned.

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [hijriDate, setHijriDate] = useState("");

  useEffect(() => {
    // Calculate Hijri Date
    try {
        const date = new Date();
        const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        setHijriDate(formatter.format(date));
    } catch (e) {
        setHijriDate(""); 
    }

    const timer = setTimeout(() => {
      setShow(false);
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 text-white animate-out fade-out duration-1000 fill-mode-forwards"
        style={{ animationDelay: "2.5s" }}
    >
      <div className="text-center space-y-4 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <span className="text-4xl">🕌</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-indigo-100">
          Mutabaah Keluarga Muslim
        </h1>
        <div className="text-xl md:text-2xl font-light text-indigo-200">
          (MKM)
        </div>
        
        <div className="mt-12 space-y-2">
             <p className="text-sm md:text-base font-medium text-slate-300">Version 1.0 • Tahun 2026</p>
             {hijriDate && (
                 <p className="text-xs md:text-sm text-indigo-300 font-mono tracking-wider border border-white/10 px-3 py-1 rounded-full inline-block backdrop-blur-md">
                    {hijriDate}
                 </p>
             )}
        </div>
      </div>
      
      <div className="absolute bottom-10 flex flex-col items-center gap-2 text-xs text-slate-400 w-full px-6 text-center">
         <p>
            Made with <span className="text-rose-500">❤️</span> in Bandung, Indonesia
         </p>
         <p>
            <a href="https://cecepazhar.com" target="_blank" className="hover:text-indigo-300 transition-colors">Cecep Azhar</a> © {new Date().getFullYear()}
         </p>
      </div>
    </div>
  );
}
