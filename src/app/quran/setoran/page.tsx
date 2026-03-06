import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSetoranList } from "../actions";
import { SetoranClient } from "./setoran-client";
import { BottomNav } from "@/components/bottom-nav";
import { GraduationCap, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SetoranPage() {
  const cookieStore = await cookies();
  const userIdStr = cookieStore.get("mutabaah-user-id")?.value;
  if (!userIdStr) redirect("/auth");
  const userId = parseInt(userIdStr);

  const list = await getSetoranList(userId);

  return (
    <div className="min-h-screen pb-24 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="bg-linear-to-br from-rose-500 to-pink-600 px-6 pt-8 pb-14 rounded-b-4xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
        <div className="flex items-center gap-3 mb-1 relative z-10">
          <Link href="/quran" className="p-2 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="p-2 bg-white/20 rounded-lg text-white">
            <GraduationCap className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold text-white">Setoran</h1>
        </div>
        <p className="text-rose-100 text-sm mt-1 ml-1 relative z-10">Verifikasi hafalan dengan guru</p>
        <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 relative z-10">
          <p className="text-rose-100 text-xs font-medium uppercase tracking-wider mb-1">Total Setoran</p>
          <p className="text-white text-3xl font-black">{list.length}</p>
          <p className="text-rose-200 text-xs mt-1">Sesungguhnya menghafal bersama guru lebih utama</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 relative z-10">
        <SetoranClient userId={userId} initialList={list} />
      </div>

      <BottomNav />
    </div>
  );
}
