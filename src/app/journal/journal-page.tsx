"use client"

import { useState, useRef } from "react"
import { format, parseISO } from "date-fns"
import { id as localeID } from "date-fns/locale"
import { createJournalEntry, deleteJournalEntry } from "./actions"
import { BottomNav } from "@/components/bottom-nav"
import { ImagePlus, Send, SmilePlus, Trash2, Heart } from "lucide-react"
import { toast } from "@/components/ui/toast"

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

export default function JournalPage({ initialJournals, currentUserId }: { initialJournals: JournalEntry[], currentUserId: number }) {
    const [journals, setJournals] = useState<JournalEntry[]>(initialJournals)
    const [content, setContent] = useState("")
    const [mood, setMood] = useState("")
    const [mediaUrl, setMediaUrl] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

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
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width
                        width = MAX_SIZE
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height
                        height = MAX_SIZE
                    }
                }

                const canvas = document.createElement("canvas")
                canvas.width = width
                canvas.height = height
                const ctx = canvas.getContext("2d")
                ctx?.drawImage(img, 0, 0, width, height)

                // Convert to compressed base64 JPEG
                const dataUrl = canvas.toDataURL("image/jpeg", 0.7)
                setMediaUrl(dataUrl)
                
                if (fileInputRef.current) fileInputRef.current.value = ""
            }
            img.src = event.target?.result as string
        }
        reader.readAsDataURL(file)
    }

    const moodOptions = ["😊 Bahagia", "🙏 Bersyukur", "😌 Tenang", "💪 Semangat", " خ Lelah", "😔 Sedih"]

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!content.trim()) return

        setIsSubmitting(true)
        const result = await createJournalEntry(content, mood, mediaUrl ? JSON.stringify([mediaUrl]) : null)
        
        if (result.success) {
            toast("Jurnal berhasil ditambahkan 📝", "success")
            setContent("")
            setMood("")
            setMediaUrl("")
            // In a real app we'd optimistic update or re-fetch. 
            // Server Action revalidatePath handles the reload, 
            // but we might need to force a hard refresh or rely on RSC payload.
            window.location.reload() 
        } else {
            toast("Gagal menyimpan jurnal", "error")
        }
        setIsSubmitting(false)
    }

    async function handleDelete(id: string) {
        if (!confirm("Hapus catatan jurnal ini?")) return
        const result = await deleteJournalEntry(id)
        if (result.success) {
            setJournals(journals.filter(j => j.id !== id))
            toast("Jurnal dihapus", "success")
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100">
            {/* Header Area */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 px-6 pt-8 pb-12 rounded-b-[2rem] shadow-lg mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
                <h1 className="text-3xl font-bold text-white mb-2">Jurnal Jannah</h1>
                <p className="text-indigo-100 text-sm">Bagikan momen, cerita, dan rasa syukur hari ini bersama keluarga tercinta.</p>
            </div>

            <div className="max-w-2xl mx-auto px-4 -mt-10 relative z-10">
                
                {/* Compose Form */}
                <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-4 mb-8 border border-slate-100 dark:border-slate-800">
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Apa cerita berkesan hari ini?"
                        className="w-full bg-transparent resize-none outline-none text-slate-700 dark:text-slate-200 min-h-[100px] text-lg mb-4"
                        disabled={isSubmitting}
                    />
                    
                    {/* Media Preview */}
                    {mediaUrl && (
                        <div className="mb-4 relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm group bg-slate-100 dark:bg-slate-800">
                            <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                                type="button" 
                                onClick={() => setMediaUrl("")} 
                                className="absolute top-1 right-1 bg-black/50 hover:bg-black text-white rounded-full p-1 transition-colors"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex gap-2">
                           <div className="relative group">
                                <button type="button" className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" title="Pilih Mood">
                                    <SmilePlus className="w-5 h-5" />
                                </button>
                                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:flex bg-white dark:bg-slate-800 shadow-xl rounded-xl p-2 gap-1 border border-slate-100 dark:border-slate-700 z-20">
                                    {moodOptions.map(m => (
                                        <button 
                                            key={m} 
                                            type="button"
                                            onClick={() => setMood(m)}
                                            className={`px-3 py-1.5 text-sm rounded-lg whitespace-nowrap ${mood === m ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                           </div>
                           
                           <input 
                               type="file" 
                               accept="image/*" 
                               className="hidden" 
                               ref={fileInputRef} 
                               onChange={handleImageUpload} 
                           />
                           <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" 
                                title="Lampirkan Foto/Media"
                            >
                                <ImagePlus className="w-5 h-5" />
                           </button>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            {mood && <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{mood}</span>}
                            <button 
                                type="submit" 
                                disabled={!content.trim() || isSubmitting}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-full font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                                <Send className="w-4 h-4" /> 
                                {isSubmitting ? 'Mengirim...' : 'Posting'}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Timeline Feed */}
                <div className="space-y-6">
                    {journals.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <span className="text-4xl block mb-4">✍️</span>
                            <p>Belum ada catatan jurnal.<br/>Mulai hari ini dengan cerita manismu!</p>
                        </div>
                    ) : (
                        journals.map((entry) => (
                            <div key={entry.id} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3 items-center">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xl overflow-hidden">
                                           {entry.user.avatarUrl ? (
                                               <img src={entry.user.avatarUrl} alt={entry.user.name} className="w-full h-full object-cover" />
                                           ) : (
                                                <span>🧑‍💻</span>
                                           )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 dark:text-slate-100">{entry.user.name}</h3>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {entry.createdAt ? format(parseISO(entry.createdAt), "dd MMM yyyy • HH:mm", { locale: localeID }) : 'Baru saja'} 
                                                {entry.mood && <span className="ml-2 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{entry.mood}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    {entry.userId === currentUserId && (
                                        <button onClick={() => handleDelete(entry.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                
                                <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap ml-13">
                                    {entry.content}
                                </p>
                                
                                {entry.mediaUrls && (() => {
                                    try {
                                        const urls = JSON.parse(entry.mediaUrls);
                                        return urls.map((url: string, idx: number) => (
                                            <div key={idx} className="mt-4 ml-13 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                                                <img src={url} alt="Journal Attachment" className="w-full max-h-[300px] object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                            </div>
                                        ))
                                    } catch(e) { return null }
                                })()}
                                
                                <div className="ml-13 mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex gap-4">
                                     <button className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-rose-500 transition-colors">
                                        <Heart className="w-4 h-4" /> <span>Suka</span>
                                     </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <BottomNav />
        </div>
    )
}
