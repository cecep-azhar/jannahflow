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
    Send,
    Search,
    ListFilter,
    X
} from "lucide-react"
import { toast } from "@/components/ui/toast"
import { compressImage } from "@/lib/image-utils"
import Image from "next/image"

export type Activity = {
    id: string
    title: string
    description: string | null
    category: string
    target: "COUPLE" | "FAMILY"
    isCompleted: boolean | null
    completedAt: string | null
    insight?: string | null
    photoUrl?: string | null
    mood?: string | null
}

const CATEGORY_MAP: Record<string, { label: string, icon: LucideIcon, color: string, bg: string, border: string }> = {
    SPIRITUAL: { 
        label: "Spiritual", 
        icon: Sparkles, 
        color: "text-emerald-600 dark:text-emerald-400", 
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        border: "border-emerald-100 dark:border-emerald-800/50"
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

export default function BondingPageClient({ activities, lang }: { activities: Activity[], lang: string }) {
    const [view, setView] = useState<"SELECT" | "AYAH_BUNDA" | "KELUARGA">("SELECT")
    const [optimisticActivities, setOptimisticActivities] = useState(activities)
    const [insightText, setInsightText] = useState("")
    const [photoBase64, setPhotoBase64] = useState<string | null>(null)
    const [selectedMood, setSelectedMood] = useState<string>("😊")
    const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState<"SURPRISE" | "LIST">("SURPRISE")
    const [isSubmitting, setIsSubmitting] = useState(false)
    // Use a stable random challenge based on the date and available uncompleted activities
    const filteredActivities = useMemo(() => {
        const target = view === "AYAH_BUNDA" ? "COUPLE" : "FAMILY"
        return optimisticActivities.filter(a => a.target === target)
    }, [optimisticActivities, view])

    const surpriseChallenge = useMemo(() => {
        const uncompleted = filteredActivities.filter(a => !a.isCompleted)
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
    }, [filteredActivities])

    const completedActivities = useMemo(() => {
        return filteredActivities
            .filter(a => a.isCompleted)
            .sort((a, b) => new Date(b.completedAt || 0).getTime() - new Date(a.completedAt || 0).getTime())
    }, [filteredActivities])

    const progress = useMemo(() => {
        const total = filteredActivities.length
        const completed = filteredActivities.filter(a => a.isCompleted).length
        return total === 0 ? 0 : Math.round((completed / total) * 100)
    }, [filteredActivities])

    const listActivities = useMemo(() => {
        return filteredActivities
            .filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                if (a.isCompleted && !b.isCompleted) return 1
                if (!a.isCompleted && b.isCompleted) return -1
                return 0
            })
            .slice(0, 5)
    }, [filteredActivities, searchQuery])

    const activeActivity = selectedActivityId 
        ? optimisticActivities.find(a => a.id === selectedActivityId) 
        : null

    async function handleComplete(id: string) {
        if (isSubmitting) return
        setIsSubmitting(true)

        const result = await toggleBondingActivity(id, false, insightText, photoBase64, selectedMood)
        
        if (result.success) {
            setOptimisticActivities(prev => prev.map(a => 
                a.id === id ? { 
                    ...a, 
                    isCompleted: true, 
                    completedAt: new Date().toISOString(),
                    insight: insightText,
                    photoUrl: photoBase64,
                    mood: selectedMood
                } : a
            ))
            setInsightText("")
            setPhotoBase64(null)
            setSelectedMood("😊")
            setSelectedActivityId(null)
        }
        setIsSubmitting(false)
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            const compressedBase64 = await compressImage(file, 500, 0.7)
            setPhotoBase64(compressedBase64)
        } catch (error) {
            console.error("Error compressing image:", error)
            toast("Gagal memproses gambar", "error")
        }
    }

    const allPhotos = useMemo(() => {
        return optimisticActivities
            .filter(a => a.photoUrl)
            .map(a => a.photoUrl as string)
            .slice(0, 12)
    }, [optimisticActivities])

    if (view === "SELECT") {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 relative overflow-hidden">
                {/* Animated Photo Collage Background */}
                <AnimatedPhotoBackground photos={allPhotos} />

                {/* Header Area */}
                <div className="bg-linear-to-br from-emerald-500/90 to-teal-600/90 px-6 pt-8 pb-12 shadow-lg mb-6 relative overflow-hidden z-10 rounded-b-4xl backdrop-blur-sm">
                    <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-lg text-white shadow-lg shadow-black/10 backdrop-blur-sm">
                            <HeartHandshake className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold text-white">Bounding Keluarga</h1>
                    </div>
                    <p className="text-emerald-100 text-sm">Pilih konsep kebersamaan yang ingin dilakukan hari ini.</p>
                </div>

                <div className="max-w-md mx-auto px-4 -mt-10 relative z-20 space-y-4">
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

                        <button 
                            onClick={() => setView("KELUARGA")}
                            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-transparent hover:border-teal-500 transition-all text-left shadow-sm group relative overflow-hidden"
                        >
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Users className="w-32 h-32 text-teal-500" />
                            </div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-2xl text-teal-600 dark:text-teal-400">
                                    <Users className="w-8 h-8" />
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-teal-500 transition-colors" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-1">Keluarga Besar</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Kegiatan seru untuk seluruh anggota keluarga bersama anak.</p>
                        </button>
                    </div>
                </div>
                <BottomNav />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100 relative overflow-hidden">
            {/* Animated Photo Collage Background */}
            <AnimatedPhotoBackground photos={allPhotos} />

            {/* Header */}
            <div className={`bg-linear-to-br ${view === 'AYAH_BUNDA' ? 'from-emerald-500/90 to-emerald-600/90' : 'from-teal-500/90 to-teal-600/90'} px-6 pt-8 pb-24 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden backdrop-blur-sm z-10`}>
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
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {view === 'AYAH_BUNDA' ? 'Ayah Bunda' : 'Keluarga Besar'}
                    </h1>
                    <p className="text-emerald-50-50 text-sm mb-6 max-w-sm mx-auto opacity-90">
                        {view === 'AYAH_BUNDA' 
                            ? 'Tantangan kejutan untuk hari ini. Selesaikan dengan penuh cinta!' 
                            : 'Tantangan seru untuk seluruh keluarga. Lakukan bersama-sama!'}
                    </p>
                    
                    {/* Progress Bar */}
                    <div className="max-w-xs mx-auto bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                        <div className="flex justify-between items-end mb-2">
                             <span className="text-xs font-medium text-white">Progres Kebersamaan</span>
                             <span className="text-xl font-bold text-white">
                                {filteredActivities.filter(a => a.isCompleted).length} / {filteredActivities.length}
                             </span>
                        </div>
                        <div className="w-full bg-emerald-900/30 rounded-full h-2.5">
                            <div className="bg-white h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
                
                {/* View Toggle */}
                <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl mb-6 border border-white/20">
                    <button 
                        onClick={() => setActiveTab("SURPRISE")}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'SURPRISE' ? 'bg-white text-emerald-600 shadow-lg' : 'text-white hover:bg-white/10'}`}
                    >
                        <Sparkles className="w-4 h-4" /> Tantangan Kejutan
                    </button>
                    <button 
                        onClick={() => setActiveTab("LIST")}
                        className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'LIST' ? 'bg-white text-emerald-600 shadow-lg' : 'text-white hover:bg-white/10'}`}
                    >
                        <ListFilter className="w-4 h-4" /> Daftar Kegiatan
                    </button>
                </div>
                
                {/* Surprise Challenge Card */}
                {activeTab === "SURPRISE" ? (
                    surpriseChallenge ? (
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
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Tulis Insight / Kenangan</label>
                                    <textarea 
                                        value={insightText}
                                        onChange={(e) => setInsightText(e.target.value)}
                                        placeholder="Apa yang kalian rasakan saat melakukan ini?"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 min-h-[100px] transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Perasaan (Emoticon)</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["😊", "🥰", "😇", "🤩", "💖", "🤝", "🤲", "🔥"].map((emo) => (
                                            <button 
                                                key={emo}
                                                onClick={() => setSelectedMood(emo)}
                                                className={`text-2xl p-2 rounded-xl border-2 transition-all ${selectedMood === emo ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 scale-110' : 'border-transparent bg-slate-50 dark:bg-slate-800'}`}
                                            >
                                                {emo}
                                            </button>
                                        ))}
                                    </div>
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
                                                    <Camera className="w-4 h-4" /> Foto Terlampir
                                                </div>
                                            ) : (
                                                <>
                                                    <Camera className="w-4 h-4" /> Lampirkan Foto
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleComplete(surpriseChallenge.id)}
                                        disabled={isSubmitting || !insightText.trim()}
                                        className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 px-8 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none"
                                    >
                                        {isSubmitting ? "Menyimpan..." : (
                                            <>
                                                Selesaikan <Send className="w-4 h-4" />
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
                            <p className="text-emerald-600/80 dark:text-emerald-400/80 mb-6">
                                {filteredActivities.length === 0 
                                    ? 'Belum ada tantangan tersedia untuk kategori ini.' 
                                    : 'Kalian telah menyelesaikan semua tantangan. Nantikan tantangan berikutnya!'}
                            </p>
                        </div>
                    )
                ) : (
                    /* List View */
                    <div className="space-y-4 mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Cari kegiatan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border-none rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {listActivities.map((activity) => {
                                const catData = CATEGORY_MAP[activity.category] || CATEGORY_MAP.SPIRITUAL;
                                const Icon = catData.icon;
                                return (
                                    <button 
                                        key={activity.id}
                                        onClick={() => !activity.isCompleted && setSelectedActivityId(activity.id)}
                                        className={`p-4 rounded-2xl border flex items-center gap-4 transition-all text-left ${activity.isCompleted ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-emerald-500 shadow-sm'}`}
                                    >
                                        <div className={`p-2.5 rounded-xl shrink-0 ${catData.bg} ${catData.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`font-bold text-sm ${activity.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                                {activity.title}
                                            </h4>
                                            <p className="text-[10px] text-slate-400 truncate">{activity.description}</p>
                                        </div>
                                        {activity.isCompleted ? (
                                            <span className="text-emerald-500 text-xs font-bold shrink-0">Selesai</span>
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-slate-300" />
                                        )}
                                    </button>
                                )
                            })}
                        </div>
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
                                const dateStr = activity.completedAt ? new Intl.DateTimeFormat(lang === 'id' ? 'id-ID' : 'en-US', {
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
                                                    &quot;{activity.insight}&quot; {activity.mood}
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

            {/* Completion Modal */}
            {activeActivity && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setSelectedActivityId(null)}></div>
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 relative z-10 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setSelectedActivityId(null)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">{activeActivity.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{activeActivity.description}</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Tulis Insight / Kenangan</label>
                                <textarea 
                                    value={insightText}
                                    onChange={(e) => setInsightText(e.target.value)}
                                    placeholder="Apa yang kalian rasakan saat melakukan ini?"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-emerald-500 min-h-[100px] transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Perasaan (Emoticon)</label>
                                <div className="flex flex-wrap gap-2">
                                    {["😊", "🥰", "😇", "🤩", "💖", "🤝", "🤲", "🔥"].map((emo) => (
                                        <button 
                                            key={emo}
                                            onClick={() => setSelectedMood(emo)}
                                            className={`text-2xl p-2 rounded-xl border-2 transition-all ${selectedMood === emo ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 scale-110' : 'border-transparent bg-slate-50 dark:bg-slate-800'}`}
                                        >
                                            {emo}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-center gap-2 text-sm text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-colors h-14">
                                        {photoBase64 ? (
                                            <div className="flex items-center gap-2 text-emerald-500 font-medium">
                                                <Camera className="w-4 h-4" /> Foto Terlampir
                                            </div>
                                        ) : (
                                            <>
                                                <Camera className="w-4 h-4" /> Lampirkan Foto
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleComplete(activeActivity.id)}
                                    disabled={isSubmitting || !insightText.trim()}
                                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none h-14"
                                >
                                    {isSubmitting ? "Menyimpan..." : "Selesaikan Kegiatan"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
function AnimatedPhotoBackground({ photos }: { photos: string[] }) {
    if (photos.length === 0) return null;

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-20 dark:opacity-10">
            <style jsx>{`
                @keyframes float {
                    0% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                    100% { transform: translateY(0) rotate(0deg); }
                }
                @keyframes drift {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(10px); }
                }
            `}</style>
            <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 gap-8 p-8 rotate-3 scale-110">
                {photos.map((url, i) => (
                    <div 
                        key={i}
                        className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800"
                        style={{
                            animation: `float ${10 + (i % 5)}s ease-in-out infinite, drift ${15 + (i % 7)}s linear infinite alternate`,
                            animationDelay: `${i * -2}s`,
                            opacity: 0.8
                        }}
                    >
                        <Image src={url} alt="Memory" fill className="object-cover" />
                    </div>
                ))}
            </div>
            <div className="absolute inset-0 bg-linear-to-b from-slate-50/50 via-transparent to-slate-50/80 dark:from-slate-950/50 dark:via-transparent dark:to-slate-950/80"></div>
        </div>
    );
}
