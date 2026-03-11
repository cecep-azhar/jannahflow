"use client";

import { Trash2 } from "lucide-react";

interface DeleteButtonProps {
    confirmMessage?: string;
    title?: string;
    className?: string;
}

export function DeleteButton({
    confirmMessage = "Apakah yakin akan dihapus?",
    title = "Hapus",
    className = "text-slate-400 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors p-1",
}: DeleteButtonProps) {
    return (
        <button
            type="submit"
            title={title}
            className={className}
            onClick={(e) => {
                if (!confirm(confirmMessage)) {
                    e.preventDefault();
                }
            }}
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
