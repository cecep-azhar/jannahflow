"use client";

import { useEffect, useState } from "react";
import { getSystemStats, incrementViewCount } from "@/app/stats-actions";
import { Eye, Clock } from "lucide-react";

export function FooterStats() {
    const [stats, setStats] = useState<{ views: number, lastUpdate: string } | null>(null);

    useEffect(() => {
        // Increment view count on mount (once per session/load)
        incrementViewCount();

        // Fetch stats
        getSystemStats().then(setStats);
    }, []);

    if (!stats) return <div className="text-xs text-slate-400 animate-pulse">Memuat statistik...</div>;

    return (
        <div className="flex flex-col items-center gap-1 text-xs text-slate-500 mt-2">
            <div className="flex items-center gap-1" title="Jumlah Dilihat">
                <Eye className="w-3 h-3" /> <span>{stats.views} views</span>
            </div>
            <div className="flex items-center gap-1" title="Terakhir Update">
                <Clock className="w-3 h-3" /> <span>{stats.lastUpdate}</span>
            </div>
        </div>
    );
}
