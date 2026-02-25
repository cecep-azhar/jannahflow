"use client"

import { useState, useMemo } from "react"
import { toggleBondingActivity } from "./actions"
import { BottomNav } from "@/components/bottom-nav"
import { 
    HeartHandshake, 
    Sparkles, 
    MessageCircleHeart, 
    HelpingHand, 
    PartyPopper, 
    LucideIcon,
    Camera,
    ChevronRight,
    Users,
    Heart,
    ArrowLeft,
    Send
} from "lucide-react"
import Image from "next/image"

type Activity = {
    id: string
    title: string
    description: string | null
    category: string
    isCompleted: boolean | null
    completedAt: string | null
    insight?: string | null
    photoUrl?: string | null
}

const CATEGORY_MAP: Record<string, { label: string, icon: LucideIcon, color: string, bg: string, border: string }> = {
    SPIRITUAL: { 
        label: "Spiritual", 
        icon: Sparkles, 
        color: "text-indigo-600 dark:text-indigo-400", 
        bg: "bg-indigo-50 dark:bg-indigo-900/20",
        border: "border-indigo-100 dark:border-indigo-800/50"
    },
    DEEP_TALK: { 
        label: "Deep Talk", 
        icon: MessageCircleHeart, 
        color: "text-rose-600 dark:text-rose-400", 
        bg: "bg-rose-50 dark:bg-rose-900/20",
        border: "border-rose-100 dark:border-rose-800/50"
    },
    SERVICE: { 
        label: "Service", 
        icon: HelpingHand, 
        color: "text-teal-600 dark:text-teal-400", 
        bg: "bg-teal-50 dark:bg-teal-900/20",
        border: "border-teal-100 dark:border-teal-800/50"
    },
    FUN: { 
        label: "Fun", 
        icon: PartyPopper, 
        color: "text-amber-600 dark:text-amber-400", 
        bg: "bg-amber-50 dark:bg-amber-900/20",
        border: "border-amber-100 dark:border-amber-800/50"
    },
}

export default function BondingPageClient({ activities }: { activities: Activity[] }) {
    const [view, setView] = useState<"SELECT" | "AYAH_BUNDA" | "KELUARGA">("SELECT")
    const [optimisticActivities, setOptimisticActivities] = useState(activities)
    const [insightText, setInsightText] = useState("")
    const [photoBase64, setPhotoBase64] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    // Use a stable random challenge based on the date and available uncompleted activities
    const surpriseChallenge = useMemo(() => {
        const uncompleted = optimisticActivities.filter(a => !a.isCompleted)
        if (uncompleted.length === 0) return null
        
        // Use the current date as a seed to pick a stable "challenge of the day"
        const dateSeed = new Date().toDateString()
        let hash = 0
        for (let i = 0; i < dateSeed.length; i++) {
            hash = (hash << 5) - hash + dateSeed.charCodeAt(i)
            hash |= 0
        }
        const index = Math.abs(hash) % uncompleted.length
        return uncompleted[index]
    }, [optimisticActivities])

    const completedActivities = useMemo(() => {
        return optimisticActivities
            .filter(a => a.isCompleted)
            .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
    }, [optimisticActivities])

    const progress = useMemo(() => {
        const total = optimisticActivities.length
        const completed = optimisticActivities.filter(a => a.isCompleted).length
        return total === 0 ? 0 : Math.round((completed / total) * 100)
    }, [optimisticActivities])

    async function handleComplete(id: string) {
        if (isSubmitting) return
        setIsSubmitting(true)

        const result = await toggleBondingActivity(id, false, insightText, photoBase64)
        
        if (result.success) {
            setOptimisticActivities(prev => prev.map(a => 
                a.id === id ? { 
                    ...a, 
                    isCompleted: true, 
                    completedAt: new Date().toISOString(),
                    insight: insightText,
                    photoUrl: photoBase64
                } : a
            ))
            setInsightText("")
            setPhotoBase64(null)
        }
        setIsSubmitting(false)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhotoBase64(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    if (view === "SELECT") {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 px-4 pt-12">
                <div className="max-w-md mx-auto space-y-8">
                    <div className="text-center space-y-2">
                        <HeartHandshake className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Bounding Keluarga</h1>
                        <p className="text-slate-500 dark:text-slate-400">Pilih konsep kebersamaan yang ingin dilakukan hari ini.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <button 
                            onClick={() => setView("AYAH_BUNDA")}
                            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-transparent hover:border-emerald-500 transition-all text-left shadow-sm group relative overflow-hidden"
                        >
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Heart className="w-32 h-32 text-emerald-500" />
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600 dark:text-emerald-400">
                                    <Heart className="w-8 h-8" />
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">Ayah Bunda</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tantangan spesial untuk memperkuat *chemistry* pasangan.</p>
                        </button>

                        <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-3xl border-2 border-transparent text-left relative overflow-hidden cursor-not-allowed opacity-60">
                            <div className="absolute top-4 right-4 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold text-slate-500">
                                Coming Soon
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-slate-200 dark:bg-slate-800 rounded-2xl text-slate-400">
                                    <Users className="w-8 h-8" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">Keluarga Besar</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Kegiatan seru untuk seluruh anggota keluarga (Segera hadir).</p>
                        </div>
                    </div>
                </div>
                <BottomNav />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="bg-linear-to-br from-indigo-500 to-purple-600 px-6 pt-8 pb-24 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
                <button 
                    onClick={() => setView("SELECT")}
                    className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-colors z-20"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sparkles className="w-40 h-40 text-white" />
                </div>
                <div className="relative z-10 text-center">
                    <h1 className="text-3xl font-bold text-white mb-2">Ayah Bunda</h1>
                    <p className="text-indigo-100 text-sm mb-6 max-w-sm mx-auto">
                        Tantangan kejutan untuk hari ini. Selesaikan dengan penuh cinta!
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="max-w-xs mx-auto bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                        <div className="flex justify-between items-end mb-2">
                             <span className="text-xs font-medium text-white">Progress Bounding</span>
                             <span className="text-xl font-bold text-white">{progress}%</span>
                        </div>
                        <div className="w-full bg-indigo-900/30 rounded-full h-2.5">
                            <div className="bg-white h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
                
                {/* Surprise Challenge Card */}
                {surpriseChallenge ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 mb-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500 opacity-5 rounded-bl-full"></div>
                        
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3 h-3" /> Surprise Challenge
                            </span>
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{surpriseChallenge.title}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
                            {surpriseChallenge.description || "Lakukan tantangan ini bersama pasangan untuk memperkuat keharmonisan keluarga."}
                        </p>

                        <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Write your insight / memory</label>
                                <textarea 
                                    value={insightText}
                                    onChange={(e) => setInsightText(e.target.value)}
                                    placeholder="Apa yang kalian rasakan saat melakukan ini?"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[100px] transition-all"
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex-1 relative">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-center gap-2 text-sm text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-colors h-full">
                                        {photoBase64 ? (
                                            <div className="flex items-center gap-2 text-emerald-500 font-medium">
                                                <Camera className="w-4 h-4" /> Photo Attached
                                            </div>
                                        ) : (
                                            <>
                                                <Camera className="w-4 h-4" /> Attach Photo
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleComplete(surpriseChallenge.id)}
                                    disabled={isSubmitting || !insightText.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
                                >
                                    {isSubmitting ? "Saving..." : (
                                        <>
                                            Finish Challenge <Send className="w-4 h-4" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-12 text-center border border-emerald-100 dark:border-emerald-800 mb-8">
                        <PartyPopper className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-emerald-800 dark:text-emerald-200 mb-2">Luar Biasa!</h2>
                        <p className="text-emerald-600/80 dark:text-emerald-400/80">Kalian telah menyelesaikan semua tantangan Ayah Bunda. Nantikan tantangan berikutnya!</p>
                    </div>
                )}

                {/* History Section */}
                <div className="space-y-6">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 px-2">
                        <span>✨</span> Riwayat Kebersamaan
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        {completedActivities.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 border-dashed">
                                 Belum ada kegiatan yang diselesaikan. Mulai tantangan pertama kalian!
                            </div>
                        ) : (
                            completedActivities.map((activity) => {
                                const catData = CATEGORY_MAP[activity.category] || CATEGORY_MAP.SPIRITUAL;
                                const Icon = catData.icon;
                                const dateStr = activity.completedAt ? new Intl.DateTimeFormat('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }).format(new Date(activity.completedAt)) : "";

                                return (
                                    <div 
                                        key={activity.id}
                                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col sm:flex-row"
                                    >
                                        {activity.photoUrl && (
                                            <div className="sm:w-32 h-40 sm:h-auto relative shrink-0">
                                                <Image 
                                                    src={activity.photoUrl} 
                                                    alt={activity.title} 
                                                    fill
                                                    className="object-cover" 
                                                />
                                            </div>
                                        )}
                                        <div className="p-5 flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <span className={`${catData.bg} ${catData.color} ${catData.border} border px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5`}>
                                                    <Icon className="w-3.5 h-3.5" /> {catData.label}
                                                </span>
                                                <span className="text-[10px] font-medium text-slate-400">{dateStr}</span>
                                            </div>
                                            
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{activity.title}</h4>
                                                <p className="text-sm text-slate-500 italic mt-1 leading-relaxed">
                                                    &quot;{activity.insight}&quot;
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
