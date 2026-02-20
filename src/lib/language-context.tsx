"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type Lang = "id" | "en";

export const translations = {
  id: {
    // Header
    changeLanguage: "Ganti Bahasa",
    changeTheme: "Ganti Tema",
    // Journal
    journalTitle: "Jurnal Jannah",
    journalSubtitle: "Bagikan momen, cerita, dan rasa syukur hari ini bersama keluarga tercinta.",
    journalPlaceholder: "Apa cerita berkesan hari ini?",
    posting: "Posting",
    sending: "Mengirim...",
    pickMood: "Pilih Mood",
    attachMedia: "Lampirkan Foto/Media",
    like: "Suka",
    noJournal: "Belum ada catatan jurnal.\nMulai hari ini dengan cerita manismu!",
    noJournalFiltered: "Tidak ada jurnal pada tanggal ini.",
    // Filter / Pagination
    filterDate: "Filter Tanggal",
    today: "Hari Ini",
    allDates: "Semua Tanggal",
    prevPage: "Sebelumnya",
    nextPage: "Berikutnya",
    page: "Halaman",
    of: "dari",
    // Toast
    journalAdded: "Jurnal berhasil ditambahkan 📝",
    journalFailed: "Gagal menyimpan jurnal",
    journalDeleted: "Jurnal dihapus",
    confirmDelete: "Hapus catatan jurnal ini?",
    // Nav
    home: "Beranda",
    mutabaah: "Mutabaah",
    journal: "Jurnal",
    finance: "Keuangan",
    report: "Laporan",
    settings: "Pengaturan",
    langSwitched: (to: string) => `Bahasa diubah ke ${to}`,
  },
  en: {
    // Header
    changeLanguage: "Change Language",
    changeTheme: "Change Theme",
    // Journal
    journalTitle: "Jannah Journal",
    journalSubtitle: "Share moments, stories, and gratitude today with your beloved family.",
    journalPlaceholder: "What's your memorable story today?",
    posting: "Post",
    sending: "Sending...",
    pickMood: "Pick Mood",
    attachMedia: "Attach Photo/Media",
    like: "Like",
    noJournal: "No journal entries yet.\nStart today with your sweet story!",
    noJournalFiltered: "No journals on this date.",
    // Filter / Pagination
    filterDate: "Filter Date",
    today: "Today",
    allDates: "All Dates",
    prevPage: "Previous",
    nextPage: "Next",
    page: "Page",
    of: "of",
    // Toast
    journalAdded: "Journal entry saved 📝",
    journalFailed: "Failed to save journal",
    journalDeleted: "Journal deleted",
    confirmDelete: "Delete this journal entry?",
    // Nav
    home: "Home",
    mutabaah: "Mutabaah",
    journal: "Journal",
    finance: "Finance",
    report: "Report",
    settings: "Settings",
    langSwitched: (to: string) => `Language changed to ${to}`,
  },
} as const;

type Translations = typeof translations.id;

interface LanguageContextValue {
  lang: Lang;
  t: Translations;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "id",
  t: translations.id,
  toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("id");

  const toggleLanguage = () => {
    setLang((prev) => (prev === "id" ? "en" : "id"));
  };

  const t = translations[lang] as Translations;

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
