"use client"

import { useState, useRef } from "react"
import { format, parseISO } from "date-fns"
import { id as localeID, enUS } from "date-fns/locale"
import { createJournalEntry, deleteJournalEntry } from "./actions"
import { BottomNav } from "@/components/bottom-nav"
import { ImagePlus, Send, SmilePlus, Trash2, Heart, ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react"
import { toast } from "@/components/ui/toast"
import { useLanguage } from "@/lib/language-context"

type JournalUser = {
    name: string
    role: string
    avatarUrl: string | null
}

export type JournalEntry = {
    id: string
    userId: number
    content: string
    mediaUrls: string | null
    mood: string | null
    createdAt: string | null
    user: JournalUser
}

const AVATAR_COLORS = [
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300",
    "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300",
]

function getAvatarColor(name: string) {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name: string) {
    return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

const ITEMS_PER_PAGE = 5

function todayString() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function JournalPage({ initialJournals, currentUserId }: { initialJournals: JournalEntry[], currentUserId: number }) {
    const { lang, t } = useLanguage()
    const locale = lang === "id" ? localeID : enUS

    const [journals, setJournals] = useState<JournalEntry[]>(initialJournals)
    const [content, setContent] = useState("")
    const [mood, setMood] = useState("")
    const [mediaUrl, setMediaUrl] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [filterDate, setFilterDate] = useState<string>(todayString())
    const [currentPage, setCurrentPage] = useState(1)

    const formRef = useRef<HTMLFormElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            const img = new Image()
            img.onload = () => {
                const MAX_SIZE = 320
                let width = img.width
                let height = img.height

                if (width > height) {
                    if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE }
                } else {
                    if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE }
                }

                const canvas = document.createElement("canvas")
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext("2d")
                ctx?.drawImage(img, 0, 0, width, height)
                const dataUrl = canvas.toDataURL("image/jpeg", 0.7)
                setMediaUrl(dataUrl)
                if (fileInputRef.current) fileInputRef.current.value = ""
            }
            img.src = event.target?.result as string
        }
        reader.readAsDataURL(file)
    }

    const moodOptions = lang === "id"
        ? ["😊 Bahagia", "🙏 Bersyukur", "😌 Tenang", "💪 Semangat", "😴 Lelah", "😔 Sedih"]
        : ["😊 Happy", "🙏 Grateful", "😌 Calm", "💪 Energized", "😴 Tired", "😔 Sad"]

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        const result = await createJournalEntry(content, mood, mediaUrl ? JSON.stringify([mediaUrl]) : undefined)

        if (result.success) {
            toast(t.journalAdded, "success")
            setContent("")
            setMood("")
            setMediaUrl("")
            setFilterDate(todayString())
            setCurrentPage(1)
            window.location.reload()
        } else {
            toast(t.journalFailed, "error")
        }
        setIsSubmitting(false)
    }

    async function handleDelete(id: string) {
        if (!confirm(t.confirmDelete)) return
        const result = await deleteJournalEntry(id)
        if (result.success) {
            setJournals(journals.filter(j => j.id !== id))
            toast(t.journalDeleted, "success")
        }
    }

    // Filter by date
    const filteredJournals = filterDate
        ? journals.filter((j) => j.createdAt && j.createdAt.slice(0, 10) === filterDate)
        : journals

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredJournals.length / ITEMS_PER_PAGE))
    const safePage = Math.min(currentPage, totalPages)
    const pagedJournals = filteredJournals.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)

    const handleDateChange = (val: string) => { setFilterDate(val); setCurrentPage(1) }
    const clearFilter = () => { setFilterDate(""); setCurrentPage(1) }
    const setToday = () => { setFilterDate(todayString()); setCurrentPage(1) }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100">
            {/* Header Area */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-6 pt-8 pb-12 rounded-b-[2rem] shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <h1 className="text-3xl font-bold text-white mb-2">{t.journalTitle}</h1>
                <p className="text-indigo-100 text-sm">{t.journalSubtitle}</p>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-10 relative z-10">

                {/* Compose Form */}
                <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={t.journalPlaceholder}
                        className="w-full bg-transparent resize-none outline-none text-slate-700 dark:text-slate-200 min-h-[100px] text-lg mb-4"
                        disabled={isSubmitting}
                    />

                    {/* Media Preview */}
                    {mediaUrl && (
                        <div className="mb-4 relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-slate-100 dark:bg-slate-800">
                            <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setMediaUrl("")} title="Hapus gambar" aria-label="Hapus gambar" className="absolute top-1 right-1 bg-black/50 hover:bg-black text-white rounded-full p-1 transition-colors">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex gap-2">
                            <div className="relative group">
                                <button type="button" className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" title={t.pickMood}>
                                    <SmilePlus className="w-5 h-5" />
                                </button>
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:flex flex-wrap bg-white dark:bg-slate-800 shadow-xl rounded-xl p-2 gap-1 border border-slate-100 dark:border-slate-700 z-20 max-w-[260px]">
                                    {moodOptions.map(m => (
                                        <button key={m} type="button" onClick={() => setMood(m)}
                                            className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap ${mood === m ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <input type="file" accept="image/*" title="Upload gambar" aria-label="Upload gambar" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                            <button type="button" onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" title={t.attachMedia}>
                                <ImagePlus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            {mood && <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{mood}</span>}
                            <button type="submit" disabled={!content.trim() || isSubmitting}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg">
                                <Send className="w-4 h-4" />
                                {isSubmitting ? t.sending : t.posting}
                            </button>
                        </div>
                    </div>
                </form>

                {/* ── Date Filter ── */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 px-4 py-3 mb-6 flex flex-wrap items-center gap-3">
                    <CalendarDays className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 shrink-0">{t.filterDate}:</span>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => handleDateChange(e.target.value)}
                        title="Filter tanggal"
                        aria-label="Filter tanggal"
                        className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <button type="button" onClick={setToday}
                        className="text-sm px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-medium transition-colors">
                        {t.today}
                    </button>
                    {filterDate && (
                        <button type="button" onClick={clearFilter}
                            className="text-sm px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center gap-1 transition-colors">
                            <X className="w-3 h-3" /> {t.allDates}
                        </button>
                    )}
                    <span className="ml-auto text-xs text-slate-400">
                        {filteredJournals.length} {lang === "id" ? "catatan" : "entries"}
                    </span>
                </div>

                {/* ── Timeline Feed ── */}
                <div className="space-y-6">
                    {pagedJournals.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <span className="text-4xl block mb-4">✍️</span>
                            <p className="whitespace-pre-line">{filterDate ? t.noJournalFiltered : t.noJournal}</p>
                        </div>
                    ) : (
                        pagedJournals.map((entry) => {
                            const initials = getInitials(entry.user.name)
                            const avatarColor = getAvatarColor(entry.user.name)
                            return (
                                <div key={entry.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-3 items-center">
                                            {/* Avatar with initials fallback */}
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden ${!entry.user.avatarUrl ? avatarColor : ""}`}>
                                                {entry.user.avatarUrl ? (
                                                    <img src={entry.user.avatarUrl} alt={entry.user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span>{initials}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 dark:text-slate-100">{entry.user.name}</h3>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {entry.createdAt ? format(parseISO(entry.createdAt), "dd MMM yyyy • HH:mm", { locale }) : (lang === "id" ? "Baru saja" : "Just now")}
                                                    {entry.mood && <span className="ml-2 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{entry.mood}</span>}
                                                </p>
                                            </div>
                                        </div>
                                        {entry.userId === currentUserId && (
                                            <button onClick={() => handleDelete(entry.id)} title="Hapus jurnal" aria-label="Hapus jurnal" className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap ml-[52px]">
                                        {entry.content}
                                    </p>

                                    {entry.mediaUrls && (() => {
                                        try {
                                            const urls = JSON.parse(entry.mediaUrls)
                                            return urls.map((url: string, idx: number) => (
                                                <div key={idx} className="mt-4 ml-[52px] rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                                                    <img src={url} alt="Journal Attachment" className="w-full max-h-[300px] object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                </div>
                                            ))
                                        } catch { return null }
                                    })()}

                                    <div className="ml-[52px] mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex gap-4">
                                        <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-500 transition-colors">
                                            <Heart className="w-4 h-4" /> <span>{t.like}</span>
                                        </button>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-center gap-3">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <ChevronLeft className="w-4 h-4" /> {t.prevPage}
                        </button>
                        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {t.page} {safePage} {t.of} {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            {t.nextPage} <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <BottomNav />
        </div>
    )
}
