import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getMurojaahLogs, getMurojaahReminders } from "../actions";
import { MurojaahClient } from "./murojaah-client";
import { BottomNav } from "@/components/bottom-nav";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MurojaahPage() {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("mutabaah-user-id")?.value;
  if (!userIdStr) redirect("/auth");
  const userId = parseInt(userIdStr);

  const [logs, reminders] = await Promise.all([
    getMurojaahLogs(userId),
    getMurojaahReminders(userId),
  ]);

  return (
    <div className="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="bg-linear-to-br from-blue-500 to-indigo-600 px-6 pt-8 pb-14 rounded-b-4xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
        <div className="flex items-center gap-3 mb-1 relative z-10">
          <Link href="/quran" className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="p-2 bg-white/20 rounded-lg text-white">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-white">Murojaah</h1>
        </div>
        <p className="text-blue-100 text-sm mt-1 ml-1 relative z-10">Jaga kualitas hafalan</p>
        <div className="mt-4 grid grid-cols-2 gap-3 relative z-10">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
            <p className="text-blue-100 text-xs font-medium mb-1">Total Log</p>
            <p className="text-white text-2xl font-black">{logs.length}</p>
          </div>
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 border border-white/20">
            <p className="text-blue-100 text-xs font-medium mb-1">Perlu Diulang</p>
            <p className="text-white text-2xl font-black">{reminders.length}</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-10">
        <MurojaahClient
          userId={userId}
          logs={logs}
          reminders={reminders}
        />
      </div>

      <BottomNav />
    </div>
  );
}
