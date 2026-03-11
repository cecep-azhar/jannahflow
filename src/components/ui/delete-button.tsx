"use client";

import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { useRef, useState, useTransition } from "react";

interface DeleteButtonProps {
    confirmMessage?: string;
    title?: string;
    className?: string;
}

export function DeleteButton({
    confirmMessage = "Apakah yakin akan dihapus? Tindakan ini tidak dapat dibatalkan.",
    title = "Hapus",
    className = "text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors p-1",
}: DeleteButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [isPending, startTransition] = useTransition();
    const formRef = useRef<HTMLFormElement | null>(null);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        // Find parent form
        const btn = e.currentTarget as HTMLElement;
        formRef.current = btn.closest("form");
        setShowModal(true);
    };

    const handleConfirm = () => {
        if (!formRef.current) return;
        startTransition(() => {
            formRef.current!.requestSubmit();
        });
        setShowModal(false);
    };

    return (
        <>
            {/* Loading overlay — shown while server action is running */}
            {isPending && (
                <div className="fixed inset-0 z-9999 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3 border border-slate-200 dark:border-slate-700">
                        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
                        <p className="text-slate-700 dark:text-slate-300 font-semibold">Menghapus data…</p>
                        <p className="text-xs text-slate-400">Mohon tunggu sebentar</p>
                    </div>
                </div>
            )}

            {/* Confirm Modal */}
            {showModal && (
                <div className="fixed inset-0 z-9998 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 px-6 py-4 border-b border-red-100 dark:border-red-900/30">
                            <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-full">
                                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 flex-1">{title}</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="px-6 py-5">
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{confirmMessage}</p>
                        </div>
                        <div className="flex gap-3 px-6 pb-6">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <button
                type="button"
                title={title}
                className={className}
                onClick={handleClick}
                disabled={isPending}
            >
                {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
            </button>
        </>
    );
}
