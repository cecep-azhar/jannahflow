"use client";

import { useEffect, useState } from "react";

// Let's use Intl for Hijri as planned.

export function SplashScreen() {
  const [show, setShow] = useState(true);
  const [hijriDate] = useState(() => {
    try {
        const date = new Date();
        const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        return formatter.format(date);
    } catch {
        return ""; 
    }
  });

  useEffect(() => {
    // Check if splash has been shown in this session
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    if (hasSeenSplash) {
        setTimeout(() => setShow(false), 0);
        return; // Skip animation and timer
    }

    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("hasSeenSplash", "true");
    }, 3000); // 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-linear-to-br from-emerald-600 via-emerald-800 to-emerald-950 text-white animate-out fade-out duration-1000 fill-mode-forwards"
        style={{ animationDelay: "2.5s" }}
    >
      <div className="text-center space-y-4 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/20">
            <span className="text-4xl">🕌</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-emerald-200 to-emerald-100">
          JannahFlow
        </h1>
        <div className="text-xl md:text-2xl font-light text-emerald-200">
          Family Management
        </div>
        
        <div className="mt-12 space-y-2">
             <p className="text-sm md:text-base font-medium text-slate-300">Version 1.0 • Tahun 2026</p>
             {hijriDate && (
                 <p className="text-xs md:text-sm text-emerald-300 font-mono tracking-wider border border-white/10 px-3 py-1 rounded-full inline-block backdrop-blur-md">
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
             <a href="https://cecepazhar.com" target="_blank" className="hover:text-emerald-300 transition-colors">Cecep Azhar</a> © {new Date().getFullYear()}
         </p>
      </div>
    </div>
  );
}
