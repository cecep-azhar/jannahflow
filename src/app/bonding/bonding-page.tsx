"use client"

import { useState } from "react"
import { toggleBondingActivity } from "./actions"
import { BottomNav } from "@/components/bottom-nav"
import { CheckCircle2, Circle, HeartHandshake, Sparkles, MessageCircleHeart, HelpingHand, PartyPopper, LucideIcon } from "lucide-react"

type Activity = {
    id: string
    title: string
    description: string | null
    category: string
    isCompleted: boolean | null
    completedAt: string | null
}

const CATEGORY_MAP: Record<string, { label: string, icon: LucideIcon, color: string }> = {
    SPIRITUAL: { label: "Spiritual", icon: Sparkles, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400" },
    DEEP_TALK: { label: "Deep Talk", icon: MessageCircleHeart, color: "text-rose-500 bg-rose-50 dark:bg-rose-900/30 dark:text-rose-400" },
    SERVICE: { label: "Service", icon: HelpingHand, color: "text-teal-500 bg-teal-50 dark:bg-teal-900/30 dark:text-teal-400" },
    FUN: { label: "Fun", icon: PartyPopper, color: "text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" },
}

export default function BondingPageClient({ activities }: { activities: Activity[] }) {
    const [optimisticActivities, setOptimisticActivities] = useState(activities)
    const [filter, setFilter] = useState<string>("ALL")
    
    // Calculate progress
    const total = optimisticActivities.length
    const completed = optimisticActivities.filter(a => a.isCompleted).length
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100)

    async function handleToggle(id: string, currentStatus: boolean) {
        // Optimistic Update
        setOptimisticActivities(prev => prev.map(a => 
            a.id === id ? { ...a, isCompleted: !currentStatus } : a
        ))
        
        const result = await toggleBondingActivity(id, currentStatus)
        if (!result.success) {
            // Revert on failure
            setOptimisticActivities(prev => prev.map(a => 
                a.id === id ? { ...a, isCompleted: currentStatus } : a
            ))
        }
    }

    const filteredActivities = filter === "ALL" 
        ? optimisticActivities 
        : optimisticActivities.filter(a => a.category === filter)

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="bg-linear-to-br from-emerald-500 to-teal-600 px-6 pt-8 pb-12 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <HeartHandshake className="w-40 h-40 text-white" />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Bounding Card</h1>
                    <p className="text-emerald-100 text-sm mb-6 max-w-sm">
                        Selesaikan 100 tantangan ini bersama pasangan untuk memperkuat ikatan cinta keluarga.
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                        <div className="flex justify-between items-end mb-2">
                             <span className="text-sm font-medium text-white">Harmony Level</span>
                             <span className="text-2xl font-bold text-white">{progress}%</span>
                        </div>
                        <div className="w-full bg-emerald-900/30 rounded-full h-3">
                            <div className="bg-white h-3 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="mt-2 text-xs text-emerald-100 text-right">
                           {completed} dari {total} tantangan selesai
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-6">
                
                {/* Filters */}
                <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide mb-2">
                    <button 
                        onClick={() => setFilter("ALL")}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === "ALL" ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-md" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"}`}
                    >
                        Semua Kategori
                    </button>
                    {Object.entries(CATEGORY_MAP).map(([key, data]) => {
                        const Icon = data.icon;
                        return (
                            <button 
                                key={key}
                                onClick={() => setFilter(key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${filter === key ? data.color + " shadow-md border-transparent" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800"}`}
                            >
                                <Icon className="w-4 h-4" /> {data.label}
                            </button>
                        )
                    })}
                </div>

                {/* List */}
                <div className="space-y-3">
                    {filteredActivities.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                             Belum ada data tantangan untuk kategori ini.
                        </div>
                    ) : (
                        filteredActivities.map((activity) => {
                            const catData = CATEGORY_MAP[activity.category] || CATEGORY_MAP.SPIRITUAL;
                            const Icon = catData.icon;
                            const isDone = activity.isCompleted;

                            return (
                                <div 
                                    key={activity.id}
                                    onClick={() => handleToggle(activity.id, Boolean(isDone))}
                                    className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${isDone ? 'bg-slate-50 dark:bg-slate-900/50 border-transparent opacity-70' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md'}`}
                                >
                                    <button className={`mt-0.5 shrink-0 ${isDone ? 'text-green-500' : 'text-slate-300 dark:text-slate-600 hover:text-rose-400'}`}>
                                        {isDone ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                                    </button>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1 ${catData.color}`}>
                                                <Icon className="w-3 h-3" /> {catData.label}
                                            </span>
                                        </div>
                                        <h3 className={`font-semibold ${isDone ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-800 dark:text-slate-200'}`}>
                                            {activity.title}
                                        </h3>
                                        {activity.description && !isDone && (
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                                {activity.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
