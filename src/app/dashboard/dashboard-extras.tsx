import { db } from "@/db";
import {
    users, mutabaahLogs, worships, journals, bondingActivities,
    quranLogs, accounts, transactions
} from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { getLocalTodayStr } from "@/lib/date-utils";
import Link from "next/link";
import {
    Wallet, Lock, Star, BookOpen, Heart,
    BookMarked, Trophy, Utensils, TrendingUp, TrendingDown, ChevronRight, Clock
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────
function formatRupiah(v: number) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(v);
}
function timeAgo(dateStr: string) {
    const d = new Date(dateStr);
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 60) return "baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    return `${Math.floor(diff / 86400)} hari lalu`;
}
function getMoodEmoji(mood: string | null) {
    const map: Record<string, string> = { happy: "😄", sad: "😢", neutral: "😐", grateful: "🤲", excited: "🎉", anxious: "😰", peaceful: "☮️" };
    return mood && map[mood] ? map[mood] : "📝";
}
function getWeekRange() {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return {
        from: monday.toISOString().slice(0, 10),
        to: sunday.toISOString().slice(0, 10),
    };
}

// ─── PRO Lock Overlay ────────────────────────────────────────────────────────
function ProLockCard({ title, icon, feature }: { title: string; icon: React.ReactNode; feature: string }) {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-5 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800">
                {icon}
                <h3 className="font-bold text-slate-800 dark:text-slate-200">{title}</h3>
            </div>
            <div className="p-6 flex flex-col items-center justify-center text-center gap-3">
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center">
                    <Lock className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">Fitur PRO</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">{feature} hanya tersedia untuk pengguna PRO.</p>
                </div>
                <Link
                    href="/settings"
                    className="mt-1 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-sm font-bold transition-colors"
                >
                    Aktifkan PRO →
                </Link>
            </div>
        </div>
    );
}

// ─── Main Export ─────────────────────────────────────────────────────────────
export async function DashboardExtras({ userId, isPro }: { userId: number; isPro: boolean }) {
    const today = await getLocalTodayStr();
    const { from: weekFrom, to: weekTo } = getWeekRange();
    const allUsers = await db.select().from(users);

    // 1. Financial summary (PRO)
    let financialData: { totalBalance: number; todayIncome: number; todayExpense: number } | null = null;
    if (isPro) {
        try {
            const allAccounts = await db.select().from(accounts);
            const totalBalance = allAccounts.reduce((s, a) => s + a.balance, 0);
            const todayTx = await db.select().from(transactions).where(eq(transactions.dateMasehi, today));
            const todayIncome = todayTx.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
            const todayExpense = todayTx.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
            financialData = { totalBalance, todayIncome, todayExpense };
        } catch { financialData = null; }
    }

    // 2. Activity log — last 10 across ALL members
    const recentLogs = await db.select().from(mutabaahLogs)
        .orderBy(desc(mutabaahLogs.timestamp))
        .limit(10);
    const allWorships = await db.select().from(worships);
    const activityItems = recentLogs.map(l => {
        const w = allWorships.find(w => w.id === l.worshipId);
        const u = allUsers.find(u => u.id === l.userId);
        return { worship: w?.name || "Ibadah", member: u?.name || "Anggota", value: l.value, timestamp: l.timestamp || "", date: l.date };
    });

    // 3. Today's journals
    const todayJournals = await db.select().from(journals).where(
        and(
            gte(journals.createdAt, today + "T00:00:00"),
            lte(journals.createdAt, today + "T23:59:59")
        )
    ).orderBy(desc(journals.createdAt)).limit(3);
    const journalUsers = todayJournals.map(j => allUsers.find(u => u.id === j.userId));

    // 4. Quran logs today
    const todayQuranLogs = await db.select().from(quranLogs)
        .where(eq(quranLogs.date, today))
        .orderBy(desc(quranLogs.createdAt))
        .limit(5);

    // 5. Weekly leaderboard — correct point calc, matching leaderboard/page.tsx
    const allWorships = await db.select().from(worships);
    const weeklyData = await Promise.all(allUsers.map(async (member) => {
        const weekLogs = await db.select().from(mutabaahLogs).where(
            and(
                eq(mutabaahLogs.userId, member.id),
                gte(mutabaahLogs.date, weekFrom),
                lte(mutabaahLogs.date, weekTo)
            )
        );
        const points = weekLogs.reduce((acc, log) => {
            const worship = allWorships.find(w => w.id === log.worshipId);
            if (!worship) return acc;
            if (log.value <= 0) return acc;
            // Leveled worship: log.value already stores the earned points
            if (worship.levels) return acc + log.value;
            // Boolean / counter worship: each positive log earns worship.points
            return acc + worship.points;
        }, 0);
        return { id: member.id, name: member.name, points, avatarColor: member.avatarColor, role: member.role };
    }));
    weeklyData.sort((a, b) => b.points - a.points);

    // 6. Bonding — today's date-seeded surprise challenge (same algorithm as bonding-page.tsx)
    let pendingBonding: { id: string; title: string; category: string; description: string | null }[] = [];
    if (isPro) {
        try {
            const allBonding = await db.select().from(bondingActivities)
                .where(eq(bondingActivities.isCompleted, false));

            if (allBonding.length > 0) {
                // Pick today's FAMILY challenge
                const familyItems = allBonding.filter(b => b.target === 'FAMILY');
                const coupleItems = allBonding.filter(b => b.target === 'COUPLE');

                const pickTodayChallenge = (items: typeof allBonding) => {
                    if (items.length === 0) return null;
                    const dateSeed = new Date().toDateString();
                    let hash = 0;
                    for (let i = 0; i < dateSeed.length; i++) {
                        hash = (hash << 5) - hash + dateSeed.charCodeAt(i);
                        hash |= 0;
                    }
                    return items[Math.abs(hash) % items.length];
                };

                const todayFamily = pickTodayChallenge(familyItems);
                const todayCouple = pickTodayChallenge(coupleItems);

                pendingBonding = [todayFamily, todayCouple]
                    .filter(Boolean)
                    .map(b => ({ id: b!.id, title: b!.title, category: b!.category, description: b!.description }));
            }
        } catch { pendingBonding = []; }
    }

    // 7. Menu rekomendasi — static for now (Menu Makan module placeholder)
    const menuRecs = [
        { emoji: "🍚", name: "Nasi & Ikan Bakar", time: "Makan Siang", type: "Sehat" },
        { emoji: "🥣", name: "Bubur Oatmeal + Madu", time: "Sarapan", type: "Sunnah" },
        { emoji: "🍉", name: "Buah Segar Penutup", time: "Makan Malam", type: "Diet" },
    ];

    const quranTypeLabel: Record<string, string> = {
        tilawah: "Tilawah", ziyadah: "Ziyadah Baru", murojaah: "Muraja'ah",
        tadabur: "Tadabur", setoran: "Setoran"
    };
    const categoryEmoji: Record<string, string> = { SPIRITUAL: "🤲", FUN: "🎉", SERVICE: "🌸", DEEP_TALK: "💬" };

    return (
        <div className="space-y-5">

            {/* ── 1. Posisi Keuangan ─────────────────── */}
            {isPro && financialData ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl">
                                <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Posisi Keuangan</h3>
                        </div>
                        <Link href="/finance" className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                            Lihat <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="p-5 space-y-3">
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 text-center">
                            <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mb-1">Total Saldo</p>
                            <p className="text-2xl font-black text-amber-700 dark:text-amber-300">{formatRupiah(financialData.totalBalance)}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                                    <span className="text-xs text-green-600 dark:text-green-400 font-semibold">Masuk Hari Ini</span>
                                </div>
                                <p className="font-bold text-green-700 dark:text-green-300 text-sm">{formatRupiah(financialData.todayIncome)}</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 text-center">
                                <div className="flex items-center justify-center gap-1 mb-1">
                                    <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                                    <span className="text-xs text-red-500 dark:text-red-400 font-semibold">Keluar Hari Ini</span>
                                </div>
                                <p className="font-bold text-red-600 dark:text-red-300 text-sm">{formatRupiah(financialData.todayExpense)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : !isPro ? (
                <ProLockCard
                    title="Posisi Keuangan"
                    icon={<div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl"><Wallet className="w-5 h-5 text-amber-600" /></div>}
                    feature="Ringkasan keuangan keluarga"
                />
            ) : null}

            {/* ── 2. Log Aktivitas 10 Terakhir ──────── */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                            <Clock className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Log Aktivitas</h3>
                    </div>
                    <Link href="/log-activity" className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                        Semua <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activityItems.length === 0 ? (
                        <p className="text-center py-6 text-sm text-slate-400">Belum ada aktivitas hari ini</p>
                    ) : activityItems.map((a, i) => (
                        <div key={i} className="px-5 py-3 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{a.worship}</p>
                                <p className="text-xs text-slate-400">{a.member} · {a.date}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.value > 0 ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/30 text-red-500"}`}>
                                {a.value > 0 ? `+${a.value}` : a.value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 3. Jurnal Hari Ini ─────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-xl">
                            <BookMarked className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Jurnal Hari Ini</h3>
                    </div>
                    <Link href="/journal" className="text-xs text-indigo-500 font-semibold flex items-center gap-1">
                        Tulis <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="p-5 space-y-3">
                    {todayJournals.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-sm text-slate-400 mb-2">Belum ada jurnal hari ini</p>
                            <Link href="/journal/new" className="text-sm font-semibold text-indigo-500 hover:text-indigo-600">+ Tulis Jurnal Sekarang</Link>
                        </div>
                    ) : todayJournals.map((j, i) => {
                        const jUser = journalUsers[i];
                        return (
                            <div key={j.id} className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{getMoodEmoji(j.mood)}</span>
                                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{jUser?.name || "Anggota"}</span>
                                    <span className="text-xs text-slate-400 ml-auto">{timeAgo(j.createdAt || "")}</span>
                                </div>
                                <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">{j.content}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── 4. Quran Tracking ─────────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-xl">
                            <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Quran Hari Ini</h3>
                    </div>
                    <Link href="/quran" className="text-xs text-teal-600 font-semibold flex items-center gap-1">
                        Input <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="p-5">
                    {todayQuranLogs.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-sm text-slate-400 mb-2">Belum ada log Quran hari ini</p>
                            <Link href="/quran" className="text-sm font-semibold text-teal-500 hover:text-teal-600">Mulai Tilawah Hari Ini →</Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {todayQuranLogs.map((log) => {
                                const logUser = allUsers.find(u => u.id === log.userId);
                                return (
                                    <div key={log.id} className="flex items-center justify-between bg-teal-50 dark:bg-teal-900/20 rounded-xl px-4 py-3">
                                        <div>
                                            <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">{quranTypeLabel[log.type] || log.type}</p>
                                            <p className="text-xs text-slate-400">{logUser?.name || "Anggota"}</p>
                                        </div>
                                        {log.type === "tilawah" && log.totalAyat && (
                                            <span className="text-xs bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 font-bold px-2 py-1 rounded-full">
                                                {log.totalAyat} ayat
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── 5. Peringkat Pekan Ini ────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
                            <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Peringkat Pekan Ini</h3>
                    </div>
                    <Link href="/leaderboard" className="text-xs text-blue-500 font-semibold flex items-center gap-1">
                        Lengkap <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="p-5 space-y-3">
                    {weeklyData.map((member, i) => {
                        const medals = ["🥇", "🥈", "🥉"];
                        const isMe = member.id === userId;
                        return (
                            <div key={member.id} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${isMe ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30" : "bg-slate-50 dark:bg-slate-800/50"}`}>
                                <span className="text-xl w-7 text-center">{medals[i] || `#${i + 1}`}</span>
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                                    style={{ backgroundColor: member.avatarColor || "#6366f1" }}
                                >
                                    {member.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 truncate">
                                        {member.name} {isMe && <span className="text-xs text-blue-500 font-normal">(Saya)</span>}
                                    </p>
                                </div>
                                <span className={`font-black text-sm ${i === 0 ? "text-amber-500" : "text-slate-600 dark:text-slate-400"}`}>
                                    {member.points} pts
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── 6. Menu Rekomendasi ───────────────── */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl">
                            <Utensils className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200">Menu Rekomendasi</h3>
                    </div>
                    <Link href="/menu-makan" className="text-xs text-orange-500 font-semibold flex items-center gap-1">
                        Planner <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
                <div className="p-5 grid grid-cols-3 gap-3">
                    {menuRecs.map((m, i) => (
                        <div key={i} className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-3 text-center">
                            <div className="text-3xl mb-2">{m.emoji}</div>
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight mb-1">{m.name}</p>
                            <span className="text-[10px] bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full font-semibold">{m.type}</span>
                            <p className="text-[10px] text-slate-400 mt-1">{m.time}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 7. Bonding Belum Selesai ──────────── */}
            {isPro ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-xl">
                                <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Bonding Belum Selesai</h3>
                        </div>
                        <Link href="/bonding" className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                            Lihat <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <div className="p-5 space-y-3">
                        {pendingBonding.length === 0 ? (
                            <div className="text-center py-4">
                                <Star className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Semua challenge hari ini selesai!</p>
                                <p className="text-xs text-slate-400">MasyaAllah, keluarga yang luar biasa 🌟</p>
                            </div>
                        ) : pendingBonding.map((b, i) => (
                            <Link key={b.id} href="/bonding" className="flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 rounded-2xl px-4 py-3 hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-colors">
                                <span className="text-2xl mt-0.5">{categoryEmoji[b.category] || "💝"}</span>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 mb-1 block">
                                        {i === 0 ? "🏠 Challenge Keluarga Hari Ini" : "💑 Challenge Pasangan Hari Ini"}
                                    </span>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{b.title}</p>
                                    {b.description && <p className="text-xs text-slate-400 truncate mt-0.5">{b.description}</p>}
                                </div>
                                <span className="text-xs bg-rose-100 dark:bg-rose-900/50 text-rose-600 font-bold px-2 py-1 rounded-full whitespace-nowrap shrink-0">Mulai →</span>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : (
                <ProLockCard
                    title="Bonding Belum Selesai"
                    icon={<div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-xl"><Heart className="w-5 h-5 text-rose-600" /></div>}
                    feature="Activity tracker bonding keluarga"
                />
            )}

        </div>
    );
}
