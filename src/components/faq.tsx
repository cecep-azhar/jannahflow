"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "Apa itu Aplikasi Mutabaah Keluarga Muslim?",
    answer: "Aplikasi ini dirancang untuk membantu keluarga muslim memantau ibadah harian dan mengevaluasi perkembangan spiritual anggota keluarga secara terstruktur dan digital."
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
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h2 className="text-2xl font-bold text-center text-slate-800 mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="border border-slate-200 rounded-lg bg-white overflow-hidden shadow-sm">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left p-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
            >
              <span className="font-medium text-slate-700">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="w-5 h-5 text-indigo-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </button>
            {openIndex === index && (
              <div className="p-4 pt-0 text-slate-600 text-sm bg-slate-50 border-t border-slate-100">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
