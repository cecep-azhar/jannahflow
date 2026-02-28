"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export function HeaderClock() {
    const [now, setNow] = useState<Date | null>(null);

    useEffect(() => {
        // Use timeout to avoid synchronous setState in effect
        const timer = setTimeout(() => {
            setNow(new Date());
        }, 0);
        
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);
        
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, []);

    if (!now) return <div className="h-10 w-32 ml-auto" />; // Skeleton-like spacer

    return (
        <div className="text-right ml-auto mr-4">
            <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-tighter opacity-80 mb-0.5">
                {format(now, "EEEE, dd MMMM yyyy", { locale: id })}
            </p>
            <p className="text-xl font-bold font-mono tracking-tight leading-none text-white drop-shadow-sm">
                {format(now, "HH:mm:ss")}
            </p>
        </div>
    );
}
