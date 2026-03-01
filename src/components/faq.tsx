"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "Apa itu JannahFlow - Moslem Family Management?",
    answer: "JannahFlow adalah aplikasi Moslem Family Management yang dirancang untuk membantu keluarga muslim mengelola ibadah, keuangan, dan kedekatan keluarga secara terstruktur dan digital."
  },
  {
    question: "Bagaimana cara mengisi data harian?",
    answer: "Anda dapat mengisi data harian melalui halaman Dashboard. Cukup klik 'Log Harian', pilih anggota keluarga (jika login sebagai Orang Tua), dan centang atau isi poin ibadah yang telah dilakukan."
  },
  {
    question: "Apakah data saya aman?",
    answer: "InsyaAllah data Anda aman. Aplikasi ini hanya dapat diakses oleh Anda dan anggota keluarga yang telah Anda daftarkan. Kami tidak membagikan data pribadi Anda kepada pihak ketiga."
  },
  {
    question: "Bagaimana cara menambah anggota keluarga?",
    answer: "Masuk ke menu Pengaturan (ikon gear), pilih tab 'Kelola Keluarga', lalu klik tombol 'Tambah Anggota'. Anda bisa menambahkan anak atau pasangan."
  },
  {
    question: "Apa fungsi poin dan target?",
    answer: "Poin digunakan sebagai indikator capaian ibadah. Target poin adalah motivasi harian. Anda bisa melihat persentase capaian untuk mengevaluasi konsistensi ibadah."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-8">Tanya Jawab (FAQ)</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-colors">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left p-5 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <span className="font-medium text-base text-slate-800 dark:text-slate-200">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-6 h-6 text-emerald-500 dark:text-emerald-400 shrink-0 ml-4" />
              ) : (
                <ChevronDown className="w-6 h-6 text-slate-400 dark:text-slate-500 shrink-0 ml-4" />
              )}
            </button>
            {openIndex === index && (
              <div className="p-5 pt-0 text-slate-600 dark:text-slate-400 text-base bg-white dark:bg-slate-900 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
