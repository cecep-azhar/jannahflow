/**
 * Advanced Hijri-Gregorian Calendar utilities
 * In a real-world scenario, you might want to use a robust library like `hijri-converter`,
 * `moment-hijri`, or standard Intl.DateTimeFormat with 'islamic-civil' calendar.
 */

// Simple formatting of current Date to Masehi (Gregorian) YYYY-MM-DD
export function formatMasehiDate(date: Date = new Date()): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Format date to full format: Hari, Tanggal Bulan Tahun Jam:Menit
 */
export function formatMasehiDateTime(date: Date = new Date()): string {
  const formatter = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  return formatter.format(date).replace("pukul ", "").replace(/\./g, ":");
}

/**
 * Converts Masehi Date to Hijri Date (YYYY-MM-DD string) 
 * using Intl.DateTimeFormat.
 */
export function convertToHijri(date: Date = new Date()): string {
  // Using native Intl API for Islamic calendar
  const formatter = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  });

  const parts = formatter.formatToParts(date);
  
  let d = '', m = '', y = '';
  for (const part of parts) {
    if (part.type === 'day') d = part.value.padStart(2, '0');
    if (part.type === 'month') m = part.value.padStart(2, '0');
    if (part.type === 'year') {
      // Sometimes Intl API returns "1446 AH", we just want "1446"
      const match = part.value.match(/\d+/);
      if (match) {
        y = match[0];
      } else {
        y = part.value;
      }
    }
  }

  return `${y}-${m}-${d}`;
}

const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi'ul Awal", "Rabi'ul Akhir",
  "Jumadil Awal", "Jumadil Akhir", "Rajab", "Sya'ban",
  "Ramadhan", "Syawwal", "Dzulqa'dah", "Dzulhijjah"
];

/**
 * Get readable Hijri month name
 */
export function getHijriMonthName(monthNumber: number): string {
  if (monthNumber < 1 || monthNumber > 12) return "";
  return HIJRI_MONTHS[monthNumber - 1];
}

/**
 * Format Hijri string (YYYY-MM-DD) into readable (e.g., 01 Ramadhan 1446)
 */
export function formatHijriReadable(hijriDateStr: string): string {
  if (!hijriDateStr) return "";
  const [y, m, d] = hijriDateStr.split('-');
  const monthName = getHijriMonthName(parseInt(m));
  return `${d} ${monthName} ${y}`;
}
