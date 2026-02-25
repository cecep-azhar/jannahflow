import React from 'react';
import { BookOpen, Headphones, CheckCircle, Heart, Star } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/header';

export default function Quran() {
  const dummyUser = {
    name: "Abi Cecep",
    avatarUrl: null,
  };

  return (
    <main className="min-h-screen pb-24 bg-slate-50 dark:bg-slate-900">
      <Header familyName="KELUARGA CECEP" isPro={true} user={dummyUser} />
      
      {/* Overlay Under Development */}
      <div className="absolute inset-0 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-sm w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-emerald-400 to-teal-500"></div>
            <BookOpen className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Segera Hadir!</h2>
            <p className="text-slate-600 dark:text-slate-400">
                Fitur Al-Quran dengan pelacakan Tilawah, Murojaah, Ziyadah, Setoran, dan Tadabur sedang dalam tahap pengembangan.
            </p>
            <Link href="/dashboard" className="block mt-6 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors">
                Kembali ke Beranda
            </Link>
        </div>
      </div>

      <div className="p-6">
        <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                Al-Quran & Hafalan
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Lacak pencapaian interaksi dengan Al-Quran setiap hari.</p>
        </header>

        <div className="grid grid-cols-2 gap-4">
            {/* Tilawah */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                        <BookOpen className="w-5 h-5" />
                    </div>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Tilawah</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bacaan harian</p>
                <div className="mt-3 text-lg font-bold text-slate-700 dark:text-slate-100">0 <span className="text-xs font-normal text-slate-500">Halaman</span></div>
            </div>

            {/* Murojaah */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                        <Headphones className="w-5 h-5" />
                    </div>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Murojaah</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Mengulang hafalan</p>
                <div className="mt-3 text-lg font-bold text-slate-700 dark:text-slate-100">0 <span className="text-xs font-normal text-slate-500">Baris</span></div>
            </div>

            {/* Ziyadah */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400">
                        <Star className="w-5 h-5" />
                    </div>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Ziyadah</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hafalan baru</p>
                <div className="mt-3 text-lg font-bold text-slate-700 dark:text-slate-100">0 <span className="text-xs font-normal text-slate-500">Baris</span></div>
            </div>

            {/* Setoran */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-600 dark:text-amber-400">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Setoran</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Disimak guru</p>
                <div className="mt-3 text-lg font-bold text-slate-700 dark:text-slate-100">0 <span className="text-xs font-normal text-slate-500">Halaman</span></div>
            </div>
            
            {/* Tadabur */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 col-span-2">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Heart className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Tadabur & Sahadah</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Merenungi makna dan mengamalkan</p>
                    </div>
                </div>
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 overflow-hidden line-clamp-2">
                     <p className="text-sm italic text-slate-600 dark:text-slate-400">&quot;Maka apakah mereka tidak memperhatikan Al Quran ataukah hati mereka terkunci?&quot; (Muhammad: 24)</p>
                </div>
            </div>
        </div>
      </div>
    </main>
  );
}
