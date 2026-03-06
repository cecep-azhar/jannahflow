// Metadata 114 Surah Al-Quran
// totalAyat: jumlah ayat per surah
// juz: juz di mana surah ini dimulai (first juz appearance)

export interface SurahInfo {
  number: number;
  name: string;           // Nama latin
  arabicName: string;
  totalAyat: number;
  juz: number;            // Juz pertama surah ini muncul
}

export const surahList: SurahInfo[] = [
  { number: 1,   name: "Al-Fatihah",       arabicName: "الفاتحة",    totalAyat: 7,   juz: 1 },
  { number: 2,   name: "Al-Baqarah",       arabicName: "البقرة",     totalAyat: 286, juz: 1 },
  { number: 3,   name: "Ali Imran",        arabicName: "آل عمران",   totalAyat: 200, juz: 3 },
  { number: 4,   name: "An-Nisa",          arabicName: "النساء",     totalAyat: 176, juz: 4 },
  { number: 5,   name: "Al-Ma'idah",       arabicName: "المائدة",    totalAyat: 120, juz: 6 },
  { number: 6,   name: "Al-An'am",         arabicName: "الأنعام",    totalAyat: 165, juz: 7 },
  { number: 7,   name: "Al-A'raf",         arabicName: "الأعراف",    totalAyat: 206, juz: 8 },
  { number: 8,   name: "Al-Anfal",         arabicName: "الأنفال",    totalAyat: 75,  juz: 9 },
  { number: 9,   name: "At-Taubah",        arabicName: "التوبة",     totalAyat: 129, juz: 10 },
  { number: 10,  name: "Yunus",            arabicName: "يونس",       totalAyat: 109, juz: 11 },
  { number: 11,  name: "Hud",              arabicName: "هود",        totalAyat: 123, juz: 11 },
  { number: 12,  name: "Yusuf",            arabicName: "يوسف",       totalAyat: 111, juz: 12 },
  { number: 13,  name: "Ar-Ra'd",          arabicName: "الرعد",      totalAyat: 43,  juz: 13 },
  { number: 14,  name: "Ibrahim",          arabicName: "إبراهيم",    totalAyat: 52,  juz: 13 },
  { number: 15,  name: "Al-Hijr",          arabicName: "الحجر",      totalAyat: 99,  juz: 14 },
  { number: 16,  name: "An-Nahl",          arabicName: "النحل",      totalAyat: 128, juz: 14 },
  { number: 17,  name: "Al-Isra",          arabicName: "الإسراء",    totalAyat: 111, juz: 15 },
  { number: 18,  name: "Al-Kahf",          arabicName: "الكهف",      totalAyat: 110, juz: 15 },
  { number: 19,  name: "Maryam",           arabicName: "مريم",       totalAyat: 98,  juz: 16 },
  { number: 20,  name: "Ta-Ha",            arabicName: "طه",         totalAyat: 135, juz: 16 },
  { number: 21,  name: "Al-Anbiya",        arabicName: "الأنبياء",   totalAyat: 112, juz: 17 },
  { number: 22,  name: "Al-Hajj",          arabicName: "الحج",       totalAyat: 78,  juz: 17 },
  { number: 23,  name: "Al-Mu'minun",      arabicName: "المؤمنون",   totalAyat: 118, juz: 18 },
  { number: 24,  name: "An-Nur",           arabicName: "النور",      totalAyat: 64,  juz: 18 },
  { number: 25,  name: "Al-Furqan",        arabicName: "الفرقان",    totalAyat: 77,  juz: 18 },
  { number: 26,  name: "Asy-Syu'ara",      arabicName: "الشعراء",    totalAyat: 227, juz: 19 },
  { number: 27,  name: "An-Naml",          arabicName: "النمل",      totalAyat: 93,  juz: 19 },
  { number: 28,  name: "Al-Qasas",         arabicName: "القصص",      totalAyat: 88,  juz: 20 },
  { number: 29,  name: "Al-Ankabut",       arabicName: "العنكبوت",   totalAyat: 69,  juz: 20 },
  { number: 30,  name: "Ar-Rum",           arabicName: "الروم",      totalAyat: 60,  juz: 21 },
  { number: 31,  name: "Luqman",           arabicName: "لقمان",      totalAyat: 34,  juz: 21 },
  { number: 32,  name: "As-Sajdah",        arabicName: "السجدة",     totalAyat: 30,  juz: 21 },
  { number: 33,  name: "Al-Ahzab",         arabicName: "الأحزاب",    totalAyat: 73,  juz: 21 },
  { number: 34,  name: "Saba",             arabicName: "سبأ",        totalAyat: 54,  juz: 22 },
  { number: 35,  name: "Fatir",            arabicName: "فاطر",       totalAyat: 45,  juz: 22 },
  { number: 36,  name: "Ya-Sin",           arabicName: "يس",         totalAyat: 83,  juz: 22 },
  { number: 37,  name: "As-Saffat",        arabicName: "الصافات",    totalAyat: 182, juz: 23 },
  { number: 38,  name: "Sad",              arabicName: "ص",          totalAyat: 88,  juz: 23 },
  { number: 39,  name: "Az-Zumar",         arabicName: "الزمر",      totalAyat: 75,  juz: 23 },
  { number: 40,  name: "Gafir",            arabicName: "غافر",       totalAyat: 85,  juz: 24 },
  { number: 41,  name: "Fussilat",         arabicName: "فصلت",       totalAyat: 54,  juz: 24 },
  { number: 42,  name: "Asy-Syura",        arabicName: "الشورى",     totalAyat: 53,  juz: 25 },
  { number: 43,  name: "Az-Zukhruf",       arabicName: "الزخرف",     totalAyat: 89,  juz: 25 },
  { number: 44,  name: "Ad-Dukhan",        arabicName: "الدخان",     totalAyat: 59,  juz: 25 },
  { number: 45,  name: "Al-Jasiyah",       arabicName: "الجاثية",    totalAyat: 37,  juz: 25 },
  { number: 46,  name: "Al-Ahqaf",         arabicName: "الأحقاف",    totalAyat: 35,  juz: 26 },
  { number: 47,  name: "Muhammad",         arabicName: "محمد",       totalAyat: 38,  juz: 26 },
  { number: 48,  name: "Al-Fath",          arabicName: "الفتح",      totalAyat: 29,  juz: 26 },
  { number: 49,  name: "Al-Hujurat",       arabicName: "الحجرات",    totalAyat: 18,  juz: 26 },
  { number: 50,  name: "Qaf",              arabicName: "ق",          totalAyat: 45,  juz: 26 },
  { number: 51,  name: "Az-Zariyat",       arabicName: "الذاريات",   totalAyat: 60,  juz: 26 },
  { number: 52,  name: "At-Tur",           arabicName: "الطور",      totalAyat: 49,  juz: 27 },
  { number: 53,  name: "An-Najm",          arabicName: "النجم",      totalAyat: 62,  juz: 27 },
  { number: 54,  name: "Al-Qamar",         arabicName: "القمر",      totalAyat: 55,  juz: 27 },
  { number: 55,  name: "Ar-Rahman",        arabicName: "الرحمن",     totalAyat: 78,  juz: 27 },
  { number: 56,  name: "Al-Waqi'ah",       arabicName: "الواقعة",    totalAyat: 96,  juz: 27 },
  { number: 57,  name: "Al-Hadid",         arabicName: "الحديد",     totalAyat: 29,  juz: 27 },
  { number: 58,  name: "Al-Mujadilah",     arabicName: "المجادلة",   totalAyat: 22,  juz: 28 },
  { number: 59,  name: "Al-Hasyr",         arabicName: "الحشر",      totalAyat: 24,  juz: 28 },
  { number: 60,  name: "Al-Mumtahanah",    arabicName: "الممتحنة",   totalAyat: 13,  juz: 28 },
  { number: 61,  name: "As-Saf",           arabicName: "الصف",       totalAyat: 14,  juz: 28 },
  { number: 62,  name: "Al-Jumu'ah",       arabicName: "الجمعة",     totalAyat: 11,  juz: 28 },
  { number: 63,  name: "Al-Munafiqun",     arabicName: "المنافقون",  totalAyat: 11,  juz: 28 },
  { number: 64,  name: "At-Tagabun",       arabicName: "التغابن",    totalAyat: 18,  juz: 28 },
  { number: 65,  name: "At-Talaq",         arabicName: "الطلاق",     totalAyat: 12,  juz: 28 },
  { number: 66,  name: "At-Tahrim",        arabicName: "التحريم",    totalAyat: 12,  juz: 28 },
  { number: 67,  name: "Al-Mulk",          arabicName: "الملك",      totalAyat: 30,  juz: 29 },
  { number: 68,  name: "Al-Qalam",         arabicName: "القلم",      totalAyat: 52,  juz: 29 },
  { number: 69,  name: "Al-Haqqah",        arabicName: "الحاقة",     totalAyat: 52,  juz: 29 },
  { number: 70,  name: "Al-Ma'arij",       arabicName: "المعارج",    totalAyat: 44,  juz: 29 },
  { number: 71,  name: "Nuh",              arabicName: "نوح",        totalAyat: 28,  juz: 29 },
  { number: 72,  name: "Al-Jinn",          arabicName: "الجن",       totalAyat: 28,  juz: 29 },
  { number: 73,  name: "Al-Muzzammil",     arabicName: "المزمل",     totalAyat: 20,  juz: 29 },
  { number: 74,  name: "Al-Muddassir",     arabicName: "المدثر",     totalAyat: 56,  juz: 29 },
  { number: 75,  name: "Al-Qiyamah",       arabicName: "القيامة",    totalAyat: 40,  juz: 29 },
  { number: 76,  name: "Al-Insan",         arabicName: "الإنسان",    totalAyat: 31,  juz: 29 },
  { number: 77,  name: "Al-Mursalat",      arabicName: "المرسلات",   totalAyat: 50,  juz: 29 },
  { number: 78,  name: "An-Naba",          arabicName: "النبأ",      totalAyat: 40,  juz: 30 },
  { number: 79,  name: "An-Nazi'at",       arabicName: "النازعات",   totalAyat: 46,  juz: 30 },
  { number: 80,  name: "'Abasa",           arabicName: "عبس",        totalAyat: 42,  juz: 30 },
  { number: 81,  name: "At-Takwir",        arabicName: "التكوير",    totalAyat: 29,  juz: 30 },
  { number: 82,  name: "Al-Infitar",       arabicName: "الانفطار",   totalAyat: 19,  juz: 30 },
  { number: 83,  name: "Al-Mutaffifin",    arabicName: "المطففين",   totalAyat: 36,  juz: 30 },
  { number: 84,  name: "Al-Insyiqaq",      arabicName: "الانشقاق",   totalAyat: 25,  juz: 30 },
  { number: 85,  name: "Al-Buruj",         arabicName: "البروج",     totalAyat: 22,  juz: 30 },
  { number: 86,  name: "At-Tariq",         arabicName: "الطارق",     totalAyat: 17,  juz: 30 },
  { number: 87,  name: "Al-A'la",          arabicName: "الأعلى",     totalAyat: 19,  juz: 30 },
  { number: 88,  name: "Al-Gasyiyah",      arabicName: "الغاشية",    totalAyat: 26,  juz: 30 },
  { number: 89,  name: "Al-Fajr",          arabicName: "الفجر",      totalAyat: 30,  juz: 30 },
  { number: 90,  name: "Al-Balad",         arabicName: "البلد",      totalAyat: 20,  juz: 30 },
  { number: 91,  name: "Asy-Syams",        arabicName: "الشمس",      totalAyat: 15,  juz: 30 },
  { number: 92,  name: "Al-Lail",          arabicName: "الليل",      totalAyat: 21,  juz: 30 },
  { number: 93,  name: "Ad-Duha",          arabicName: "الضحى",      totalAyat: 11,  juz: 30 },
  { number: 94,  name: "Al-Insyirah",      arabicName: "الشرح",      totalAyat: 8,   juz: 30 },
  { number: 95,  name: "At-Tin",           arabicName: "التين",      totalAyat: 8,   juz: 30 },
  { number: 96,  name: "Al-'Alaq",         arabicName: "العلق",      totalAyat: 19,  juz: 30 },
  { number: 97,  name: "Al-Qadr",          arabicName: "القدر",      totalAyat: 5,   juz: 30 },
  { number: 98,  name: "Al-Bayyinah",      arabicName: "البينة",     totalAyat: 8,   juz: 30 },
  { number: 99,  name: "Az-Zalzalah",      arabicName: "الزلزلة",    totalAyat: 8,   juz: 30 },
  { number: 100, name: "Al-'Adiyat",       arabicName: "العاديات",   totalAyat: 11,  juz: 30 },
  { number: 101, name: "Al-Qari'ah",       arabicName: "القارعة",    totalAyat: 11,  juz: 30 },
  { number: 102, name: "At-Takasur",       arabicName: "التكاثر",    totalAyat: 8,   juz: 30 },
  { number: 103, name: "Al-'Asr",          arabicName: "العصر",      totalAyat: 3,   juz: 30 },
  { number: 104, name: "Al-Humazah",       arabicName: "الهمزة",     totalAyat: 9,   juz: 30 },
  { number: 105, name: "Al-Fil",           arabicName: "الفيل",      totalAyat: 5,   juz: 30 },
  { number: 106, name: "Quraisy",          arabicName: "قريش",       totalAyat: 4,   juz: 30 },
  { number: 107, name: "Al-Ma'un",         arabicName: "الماعون",    totalAyat: 7,   juz: 30 },
  { number: 108, name: "Al-Kausar",        arabicName: "الكوثر",     totalAyat: 3,   juz: 30 },
  { number: 109, name: "Al-Kafirun",       arabicName: "الكافرون",   totalAyat: 6,   juz: 30 },
  { number: 110, name: "An-Nasr",          arabicName: "النصر",      totalAyat: 3,   juz: 30 },
  { number: 111, name: "Al-Masad",         arabicName: "المسد",      totalAyat: 5,   juz: 30 },
  { number: 112, name: "Al-Ikhlas",        arabicName: "الإخلاص",    totalAyat: 4,   juz: 30 },
  { number: 113, name: "Al-Falaq",         arabicName: "الفلق",      totalAyat: 5,   juz: 30 },
  { number: 114, name: "An-Nas",           arabicName: "الناس",      totalAyat: 6,   juz: 30 },
];

/**
 * Prefix sums: absoluteStart[i] = total ayat sebelum surah ke-i (1-indexed)
 * absoluteStart[1] = 0, absoluteStart[2] = 7, dst.
 */
const absoluteStart: number[] = [0]; // index 0 unused, index 1 = start of surah 1
(function buildPrefixSums() {
  for (const s of surahList) {
    absoluteStart[s.number + 1] = (absoluteStart[s.number] ?? 0) + s.totalAyat;
  }
})();

/** Total ayat Al-Quran: 6236 */
export const TOTAL_QURAN_AYAT = absoluteStart[115];

/**
 * Batas awal setiap juz (dalam indeks ayat absolut, 0-based).
 * Ini adalah nilai pendekatan standar mushaf Hafs.
 */
export const JUZ_BOUNDARIES: number[] = [
  0,      // Juz 1 starts at ayat absolute index 0   (Al-Fatihah:1)
  141,    // Juz 2  — Al-Baqarah:142
  282,    // Juz 3  — Al-Imran:1 (approx)
  429,    // Juz 4  — An-Nisa:24
  576,    // Juz 5  — An-Nisa:148
  698,    // Juz 6  — Al-Ma'idah:83
  848,    // Juz 7  — Al-An'am:111
  1005,   // Juz 8  — Al-A'raf:88
  1160,   // Juz 9  — Al-Anfal:41
  1235,   // Juz 10 — At-Taubah:93
  1364,   // Juz 11 — Yunus:109 / Hud
  1473,   // Juz 12 — Hud:6
  1596,   // Juz 13 — Yusuf:53
  1707,   // Juz 14 — Al-Hijr:1
  1800,   // Juz 15 — Al-Isra:1
  1901,   // Juz 16 — Al-Kahf:75
  2029,   // Juz 17 — Al-Anbiya:1
  2140,   // Juz 18 — Al-Mu'minun:1
  2251,   // Juz 19 — Al-Furqan:21
  2396,   // Juz 20 — An-Naml:56
  2496,   // Juz 21 — Al-Ankabut:46
  2611,   // Juz 22 — Al-Ahzab:31
  2750,   // Juz 23 — Ya-Sin:28 / As-Saffat
  2879,   // Juz 24 — Az-Zumar:32
  2994,   // Juz 25 — Fussilat:47
  3159,   // Juz 26 — Al-Ahqaf:1
  3251,   // Juz 27 — Az-Zariyat:31
  3339,   // Juz 28 — Al-Mujadilah:1
  3483,   // Juz 29 — Al-Mulk:1
  3606,   // Juz 30 — An-Naba:1
];

/**
 * Mengembalikan indeks ayat absolut (0-based).
 * Contoh: surah 1, ayat 1 → 0; surah 2, ayat 1 → 7
 */
export function getAbsoluteAyatIndex(surahNumber: number, ayatNumber: number): number {
  const start = absoluteStart[surahNumber] ?? 0;
  return start + ayatNumber - 1;
}

export interface TilawahProgress {
  totalAyat: number;
  juz: number;
  remainingAyat: number;
  summary: string; // e.g. "1 Juz 6 Ayat"
}

/**
 * Kalkulasi progres tilawah dari titik mulai ke titik selesai.
 * Menangani kasus lintas surah.
 */
export function calculateTilawahProgress(
  startSurah: number,
  startAyat: number,
  endSurah: number,
  endAyat: number,
): TilawahProgress {
  const startIndex = getAbsoluteAyatIndex(startSurah, startAyat);
  const endIndex = getAbsoluteAyatIndex(endSurah, endAyat);

  if (endIndex < startIndex) {
    return { totalAyat: 0, juz: 0, remainingAyat: 0, summary: "0 Ayat" };
  }

  const totalAyat = endIndex - startIndex + 1;

  // Hitung rata-rata ayat per juz yang sudah dibaca berdasarkan JUZ_BOUNDARIES
  let juzCount = 0;
  for (let j = 0; j < 30; j++) {
    const juzStart = JUZ_BOUNDARIES[j];
    const juzEnd = j < 29 ? JUZ_BOUNDARIES[j + 1] - 1 : TOTAL_QURAN_AYAT - 1;
    // Juz j+1 berlangsung dari juzStart hingga juzEnd
    const overlapStart = Math.max(startIndex, juzStart);
    const overlapEnd = Math.min(endIndex, juzEnd);
    if (overlapEnd >= overlapStart) {
      const overlapAyat = overlapEnd - overlapStart + 1;
      const juzTotal = juzEnd - juzStart + 1;
      juzCount += overlapAyat / juzTotal;
    }
  }

  const fullJuz = Math.floor(juzCount);
  // Sisa ayat setelah juz penuh (pendekatan)
  const AVG_AYAT_PER_JUZ = Math.round(TOTAL_QURAN_AYAT / 30);
  const remainingAyat = totalAyat - fullJuz * AVG_AYAT_PER_JUZ;

  let summary = "";
  if (fullJuz > 0 && remainingAyat > 0) {
    summary = `${fullJuz} Juz ${remainingAyat} Ayat`;
  } else if (fullJuz > 0) {
    summary = `${fullJuz} Juz`;
  } else {
    summary = `${totalAyat} Ayat`;
  }

  return { totalAyat, juz: fullJuz, remainingAyat: Math.max(0, remainingAyat), summary };
}

/** Nama surah berdasarkan nomor surah */
export function getSurahName(surahNumber: number): string {
  return surahList[surahNumber - 1]?.name ?? `Surah ${surahNumber}`;
}

/** Validasi ayat dalam range surah */
export function isValidAyat(surahNumber: number, ayatNumber: number): boolean {
  const surah = surahList[surahNumber - 1];
  if (!surah) return false;
  return ayatNumber >= 1 && ayatNumber <= surah.totalAyat;
}
