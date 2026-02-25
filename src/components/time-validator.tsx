"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function TimeValidator({ serverTime }: { serverTime: number }) {
  const [showWarning, setShowWarning] = useState(false);
  const [closed, setClosed] = useState(false);
  const { lang } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
        const clientTime = Date.now();
        const drift = Math.abs(clientTime - serverTime);
        if (drift > 5 * 60 * 1000) {
          setShowWarning(true);
        }
    }, 1000);
    return () => clearTimeout(timer);
  }, [serverTime]);

  if (!showWarning || closed) return null;

  return (
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900 rounded-xl p-4 shadow-lg z-[9999] flex gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="shrink-0 text-amber-500 mt-0.5">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
          {lang === "id" ? "Peringatan Waktu Perangkat" : "Device Time Warning"}
        </h3>
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed mb-2">
          {lang === "id"
            ? "Waktu di perangkat Anda tampaknya tidak sinkron dengan server standar kami. Mohon perbaiki pengaturan waktu dan tanggal di perangkat Anda agar fitur pencatatan Mutabaah dan Keuangan dapat berjalan akurat."
            : "Your device time appears to be out of sync with our server. Please correct your device's date and time settings to ensure Mutabaah and Finance features work accurately."}
        </p>
      </div>
      <button
        onClick={() => setClosed(true)}
        className="shrink-0 self-start text-amber-500 hover:text-amber-700 dark:hover:text-amber-300 transition-colors p-1"
        title={lang === "id" ? "Tutup" : "Close"}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
