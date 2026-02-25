"use client"

import { Shield, Heart, Star, Smile, User, LucideIcon } from "lucide-react"

const IconMap: Record<string, LucideIcon> = {
  "user-check": Shield,
  "heart": Heart,
  "star": Star,
  "smile": Smile,
  "default": User,
  "user": User,
}

const AVATAR_COLORS = [
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300",
    "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300",
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

interface UserAvatarProps {
    name: string
    avatarUrl?: string | null
    size?: "sm" | "md" | "lg"
    className?: string
}

export function UserAvatar({ name, avatarUrl, size = "md", className = "" }: UserAvatarProps) {
    const initials = getInitials(name)
    const avatarColor = getAvatarColor(name)
    const Icon = avatarUrl && IconMap[avatarUrl] ? IconMap[avatarUrl] : null

    const sizeClasses = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-12 h-12 text-base",
    }

    return (
        <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold shrink-0 overflow-hidden ${!avatarUrl || Icon ? avatarColor : ""} ${className}`}>
            {Icon ? (
                <Icon className={size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : "w-6 h-6"} />
            ) : avatarUrl && (avatarUrl.startsWith("http") || avatarUrl.startsWith("/") || avatarUrl.startsWith("data:")) ? (
                <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    )
}
