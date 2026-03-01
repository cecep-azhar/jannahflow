import { db } from "@/db";
import { users, mutabaahLogs, worships, journals, bondingActivities, transactions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Activity, BookCheck, History, HeartHandshake, Wallet, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { UserAvatar } from "@/components/user-avatar";
import { BottomNav } from "@/components/bottom-nav";
import { format } from "date-fns";
import { id as localeID, enUS, type Locale } from "date-fns/locale";

export const dynamic = "force-dynamic";

type ActivityLog = {
  id: string;
  type: "mutabaah" | "journal" | "bonding" | "finance";
  title: string;
  description: string | null;
  timestamp: string;
  userId?: number;
  userName?: string;
  userAvatar?: string | null;
  userColor?: string | null;
  amount?: number;
  category?: string;
};

export default async function LogActivityPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = parseInt(searchParams.page || "1");
  const pageSize = 10;

  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("mutabaah-user-id")?.value;
  const lang = cookieStore.get("NEXT_LOCALE")?.value || "id";
  const locale = lang === "id" ? localeID : enUS;

  if (!userIdStr) {
    redirect("/auth");
  }

  const mLogs = await db.query.mutabaahLogs.findMany({
    with: {
      worship: true,
      user: true,
    },
    orderBy: [desc(mutabaahLogs.id)],
    limit: 20,
  });

  // Fetch Journals
  const jLogs = await db.query.journals.findMany({
    with: {
      user: true,
    },
    orderBy: [desc(journals.createdAt)],
    limit: 10,
  });

  // Fetch Bonding
  const bLogs = await db
    .select({
      id: bondingActivities.id,
      title: bondingActivities.title,
      insight: bondingActivities.insight,
      completedAt: bondingActivities.completedAt,
    })
    .from(bondingActivities)
    .where(eq(bondingActivities.isCompleted, true))
    .orderBy(desc(bondingActivities.completedAt))
    .limit(10);

  // Fetch Finance
  const fLogs = await db
    .select({
      id: transactions.id,
      category: transactions.category,
      description: transactions.description,
      amount: transactions.amount,
      type: transactions.type,
      dateMasehi: transactions.dateMasehi,
    })
    .from(transactions)
    .orderBy(desc(transactions.dateMasehi))
    .limit(10);

  // Normalize and Merge
  const combinedLogs: ActivityLog[] = [
    ...mLogs.map((l) => ({
      id: `m-${l.id}`,
      type: "mutabaah" as const,
      title: lang === "id" ? `Selesai ${l.worship?.name}` : `Finished ${l.worship?.name}`,
      description: null,
      timestamp: l.date || "", // Fallback to date YYYY-MM-DD
      userName: l.user?.name,
      userAvatar: l.user?.avatarUrl,
      userColor: l.user?.avatarColor,
      userId: l.user?.id,
    })),
    ...jLogs.map((l) => ({
      id: l.id,
      type: "journal" as const,
      title: lang === "id" ? "Membuat Jurnal Baru" : "Created a New Journal",
      description: l.content.substring(0, 100) + (l.content.length > 100 ? "..." : ""),
      timestamp: l.createdAt || "",
      userName: l.user?.name,
      userAvatar: l.user?.avatarUrl,
      userColor: l.user?.avatarColor,
      userId: l.user?.id,
    })),
    ...bLogs.map((l) => ({
      id: l.id,
      type: "bonding" as const,
      title: lang === "id" ? `Selesai Tantangan: ${l.title}` : `Finished Challenge: ${l.title}`,
      description: l.insight || null,
      timestamp: l.completedAt || "",
    })),
    ...fLogs.map((l) => ({
      id: l.id,
      type: "finance" as const,
      title: lang === "id" ? `Transaksi Keuangan: ${l.category}` : `Finance Transaction: ${l.category}`,
      description: l.description || null,
      timestamp: l.dateMasehi || "",
      amount: l.amount,
      category: l.type,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const totalItems = combinedLogs.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedLogs = combinedLogs.slice((page - 1) * pageSize, page * pageSize);

  const typeIcons = {
    mutabaah: <BookCheck className="w-4 h-4 text-emerald-500" />,
    journal: <History className="w-4 h-4 text-indigo-500" />,
    bonding: <HeartHandshake className="w-4 h-4 text-rose-500" />,
    finance: <Wallet className="w-4 h-4 text-amber-500" />,
  };

  const typeColors = {
    mutabaah: "bg-emerald-50 dark:bg-emerald-950/20",
    journal: "bg-indigo-50 dark:bg-indigo-950/20",
    bonding: "bg-rose-50 dark:bg-rose-950/20",
    finance: "bg-amber-50 dark:bg-amber-950/20",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100">
      <header className="bg-linear-to-br from-emerald-500 to-teal-600 text-white px-6 pt-8 pb-12 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-4 relative z-10 mb-4">
          <Link href="/dashboard" className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">{lang === "id" ? "Log Aktivitas" : "Activity Log"}</h1>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 relative z-10 w-fit">
          <Activity className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{lang === "id" ? "Lini Masa Keluarga" : "Family Timeline"}</span>
        </div>
      </header>

      <main className="px-4">
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 before:content-['']">
          {paginatedLogs.length === 0 ? (
            <div className="text-center py-20 text-slate-400 italic">
              {lang === "id" ? "Belum ada aktivitas yang tercatat." : "No activities recorded yet."}
            </div>
          ) : (
            paginatedLogs.map((log) => (
              <div key={log.id} className="relative flex items-start gap-6 group">
                {/* Dot / Icon Container */}
                <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-slate-50 dark:border-slate-950 shadow-sm transition-transform group-hover:scale-110 ${typeColors[log.type]}`}>
                  {typeIcons[log.type]}
                </div>

                {/* Content Card */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm group-hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      {log.userId ? (
                        <UserAvatar 
                          name={log.userName || "?"} 
                          avatarUrl={log.userAvatar} 
                          avatarColor={log.userColor}
                          size="sm"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Clock className="w-3 h-3 text-slate-400" />
                        </div>
                      )}
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                        {log.userId ? log.userName : (lang === 'id' ? 'Sistem' : 'System')}
                      </span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {formatTime(log.timestamp, locale)}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{log.title}</h4>
                  {log.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-2">
                      &quot;{log.description}&quot;
                    </p>
                  )}
                  
                  {log.type === 'finance' && log.amount !== undefined && (
                    <div className="mt-2 text-sm font-black text-rose-500">
                        {log.category === 'EXPENSE' ? '-' : '+'} {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(log.amount)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-12 pb-8 relative z-10 gap-4">
            <Link
              href={`/log-activity?page=${page - 1}`}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                page <= 1 
                ? "bg-slate-100 text-slate-300 pointer-events-none" 
                : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-800 active:scale-95"
              }`}
            >
              <ChevronLeft className="w-5 h-5" /> {lang === 'id' ? 'Kembali' : 'Prev'}
            </Link>

            <div className="flex flex-col items-center">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Halaman</span>
               <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{page} <span className="text-slate-400 font-normal">/ {totalPages}</span></span>
            </div>

            <Link
              href={`/log-activity?page=${page + 1}`}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                page >= totalPages 
                ? "bg-slate-100 text-slate-300 pointer-events-none" 
                : "bg-emerald-600 text-white shadow-lg shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 active:scale-95"
              }`}
            >
              {lang === 'id' ? 'Lanjut' : 'Next'} <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

function formatTime(timestamp: string, locale: Locale) {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";
    return format(date, "HH:mm • dd MMM", { locale });
  } catch {
    return "";
  }
}
