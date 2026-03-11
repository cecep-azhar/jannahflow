import { db } from "@/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Utensils, Shuffle, Clock, Users, ChefHat, Leaf, Sun, Sunset, MoonStar } from "lucide-react";
import Link from "next/link";
import { BottomNav } from "@/components/bottom-nav";

export const dynamic = "force-dynamic";

// ── Static food catalog (seeded) ─────────────────────────────────────────────
const FOODS = [
  // Sarapan
  { id: 1, name: "Nasi Uduk + Ayam Goreng", emoji: "🍚", mealTime: "pagi", type: "Tradisional", calories: 520, benefit: "Tinggi protein & karbohidrat untuk energi pagi", ingredients: ["Nasi uduk", "Ayam goreng", "Tempe orek", "Sambal"], price: "Rp 15.000–25.000" },
  { id: 2, name: "Bubur Ayam Kampung", emoji: "🥣", mealTime: "pagi", type: "Tradisional", calories: 380, benefit: "Mudah dicerna, hangat untuk lambung di pagi hari", ingredients: ["Beras", "Ayam kampung", "Cakwe", "Kecap", "Bawang goreng"], price: "Rp 12.000–20.000" },
  { id: 3, name: "Roti Gandum + Telur Rebus", emoji: "🍞", mealTime: "pagi", type: "Sehat", calories: 280, benefit: "Serat tinggi, protein & glukosa kompleks untuk konsentrasi", ingredients: ["Roti gandum", "Telur", "Alpukat", "Tomat"], price: "Rp 8.000–15.000" },
  { id: 4, name: "Oatmeal + Madu + Pisang", emoji: "🥣", mealTime: "pagi", type: "Sunnah", calories: 320, benefit: "Sunnah makan madu & kurma di pagi hari. Energi tahan lama", ingredients: ["Oatmeal", "Madu", "Pisang", "Susu", "Kurma"], price: "Rp 10.000–18.000" },
  { id: 5, name: "Lontong Sayur", emoji: "🫙", mealTime: "pagi", type: "Tradisional", calories: 350, benefit: "Sayuran kaya serat & vitamin untuk imun keluarga", ingredients: ["Lontong", "Santan", "Labu siam", "Kacang panjang", "Tempe"], price: "Rp 10.000–18.000" },
  { id: 6, name: "Smoothie Buah + Granola", emoji: "🥤", mealTime: "pagi", type: "Diet", calories: 260, benefit: "Antioksidan tinggi, segar & ringan untuk program diet", ingredients: ["Pisang", "Stroberi", "Yogurt", "Granola", "Madu"], price: "Rp 12.000–20.000" },
  { id: 7, name: "Kurma + Susu Murni", emoji: "🌴", mealTime: "pagi", type: "Sunnah", calories: 220, benefit: "Sarapan sunnah Nabi — kurma & susu penuh berkah & nutrisi", ingredients: ["Kurma Ajwa", "Susu murni"], price: "Rp 5.000–15.000" },
  { id: 8, name: "Ketupat Sayur", emoji: "🍱", mealTime: "pagi", type: "Tradisional", calories: 400, benefit: "Mengenyangkan & bergizi dengan santan dan sayuran hijau", ingredients: ["Ketupat", "Santan", "Labu", "Nangka muda", "Bumbu kuning"], price: "Rp 12.000–20.000" },

  // Makan Siang
  { id: 9, name: "Nasi + Ikan Bakar + Lalapan", emoji: "🐟", mealTime: "siang", type: "Sehat", calories: 480, benefit: "Omega-3 tinggi, baik untuk otak & jantung seluruh keluarga", ingredients: ["Nasi putih", "Ikan mujair/gurame", "Lalapan", "Sambal terasi", "Tempe bakar"], price: "Rp 20.000–35.000" },
  { id: 10, name: "Soto Ayam Kuning", emoji: "🍜", mealTime: "siang", type: "Tradisional", calories: 420, benefit: "Kunyit anti-inflamasi, kuah hangat menyehatkan tenggorokan", ingredients: ["Ayam", "Kunyit", "Bihun", "Telur", "Kol", "Tomat", "Seledri"], price: "Rp 15.000–25.000" },
  { id: 11, name: "Gado-Gado Jakarta", emoji: "🥗", mealTime: "siang", type: "Tradisional", calories: 380, benefit: "Sayuran beragam + protein tempe-tahu + saus kacang bergizi", ingredients: ["Tempe", "Tahu", "Kangkung", "Kecambah", "Kentang", "Saus kacang"], price: "Rp 15.000–22.000" },
  { id: 12, name: "Nasi Goreng Sayuran", emoji: "🍳", mealTime: "siang", type: "Simple", calories: 450, benefit: "Praktis, bisa habiskan sisa sayuran, ramah anak-anak", ingredients: ["Nasi", "Telur", "Wortel", "Buncis", "Bawang", "Kecap"], price: "Rp 10.000–18.000" },
  { id: 13, name: "Pecel Lele + Nasi", emoji: "🐠", mealTime: "siang", type: "Tradisional", calories: 500, benefit: "Ikan lele kaya protein, sambal lalapan kaya vitamin C", ingredients: ["Lele goreng", "Nasi", "Lalapan", "Sambal"], price: "Rp 15.000–22.000" },
  { id: 14, name: "Sup Sayur Bening", emoji: "🫕", mealTime: "siang", type: "Sehat", calories: 200, benefit: "Rendah kalori, kaya serat & mineral, cocok semua usia", ingredients: ["Bayam", "Jagung", "Wortel", "Labu", "Bawang putih"], price: "Rp 8.000–15.000" },
  { id: 15, name: "Ayam Goreng + Nasi + Sayur", emoji: "🍗", mealTime: "siang", type: "Simple", calories: 560, benefit: "Menu andalan keluarga — praktis, disukai semua umur", ingredients: ["Ayam", "Nasi", "Sayur tumis", "Sambal"], price: "Rp 18.000–28.000" },
  { id: 16, name: "Rendang Daging + Nasi", emoji: "🥩", mealTime: "siang", type: "Tradisional", calories: 600, benefit: "Rempah-rempah rendang kaya antioksidan & anti-bakteri alami", ingredients: ["Daging sapi", "Santan", "Lengkuas", "Serai", "Cabai", "Nasi"], price: "Rp 30.000–50.000" },
  { id: 17, name: "Tempe Penyet + Nasi", emoji: "🫘", mealTime: "siang", type: "Tradisional", calories: 420, benefit: "Fermentasi tempe = probiotik alami, baik untuk pencernaan", ingredients: ["Tempe goreng", "Nasi", "Sambal bawang", "Lalapan"], price: "Rp 10.000–18.000" },
  { id: 18, name: "Mie Ayam Bakso", emoji: "🍜", mealTime: "siang", type: "Simple", calories: 500, benefit: "Favorit anak-anak, sumber karbohidrat & protein", ingredients: ["Mie telur", "Ayam", "Bakso", "Pakcoy", "Kecap"], price: "Rp 15.000–25.000" },

  // Makan Malam
  { id: 19, name: "Ikan Pepes + Nasi Merah", emoji: "🫙", mealTime: "malam", type: "Sehat", calories: 380, benefit: "Pepes dimasak tanpa minyak, nasi merah serat tinggi", ingredients: ["Ikan mas/nila", "Daun kemangi", "Tomat", "Cabai", "Nasi merah"], price: "Rp 20.000–30.000" },
  { id: 20, name: "Bubur Kacang Hijau", emoji: "🟢", mealTime: "malam", type: "Sunnah", calories: 280, benefit: "Ringan untuk malam hari, kacang hijau detox & anti-radikal bebas", ingredients: ["Kacang hijau", "Santan", "Gula merah", "Jahe"], price: "Rp 8.000–15.000" },
  { id: 21, name: "Salad Buah + Yogurt", emoji: "🥗", mealTime: "malam", type: "Diet", calories: 200, benefit: "Ringan, manis alami, menjaga gula darah tetap stabil", ingredients: ["Melon", "Semangka", "Anggur", "Apel", "Yogurt plain"], price: "Rp 10.000–18.000" },
  { id: 22, name: "Sop Daging Bening", emoji: "🍲", mealTime: "malam", type: "Simple", calories: 350, benefit: "Hangat di malam hari, kolagen daging baik untuk kulit", ingredients: ["Daging sapi", "Wortel", "Kentang", "Tomat", "Daun bawang"], price: "Rp 20.000–35.000" },
  { id: 23, name: "Tumis Kangkung + Tempe", emoji: "🌿", mealTime: "malam", type: "Sehat", calories: 250, benefit: "Hijau & sehat, zat besi tinggi baik untuk anak tumbuh kembang", ingredients: ["Kangkung", "Tempe goreng", "Bawang merah", "Cabai", "Kecap"], price: "Rp 10.000–18.000" },
  { id: 24, name: "Nasi + Telur Dadar + Sambal", emoji: "🥚", mealTime: "malam", type: "Simple", calories: 380, benefit: "Simpel, ekonomis, telur = protein lengkap untuk semua usia", ingredients: ["Telur", "Nasi", "Bawang merah", "Cabai", "Garam"], price: "Rp 8.000–15.000" },
  { id: 25, name: "Kolak Pisang Ubi", emoji: "🍌", mealTime: "malam", type: "Tradisional", calories: 300, benefit: "Potasium pisang & ubi untuk otot kuat dan tidur nyenyak", ingredients: ["Pisang kepok", "Ubi jalar", "Santan", "Gula merah", "Daun pandan"], price: "Rp 8.000–15.000" },
  { id: 26, name: "Tahu Telur + Nasi", emoji: "🥗", mealTime: "malam", type: "Tradisional", calories: 420, benefit: "Protein nabati & hewani, cocok untuk seluruh keluarga", ingredients: ["Tahu", "Telur", "Kol", "Tauge", "Bawang goreng", "Kecap"], price: "Rp 12.000–20.000" },
  { id: 27, name: "Sayur Asem + Ikan Goreng", emoji: "🍋", mealTime: "malam", type: "Tradisional", calories: 380, benefit: "Asam jawa bantu pencernaan, asam-segar cocok untuk malam", ingredients: ["Kacang tanah", "Jagung", "Labu siam", "Ikan", "Asam jawa"], price: "Rp 15.000–25.000" },
];

// Helper: pick today's recommended menu
function getTodayMenu() {
  const dateSeed = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < dateSeed.length; i++) {
    hash = (hash << 5) - hash + dateSeed.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);

  const pagi = FOODS.filter(f => f.mealTime === "pagi");
  const siang = FOODS.filter(f => f.mealTime === "siang");
  const malam = FOODS.filter(f => f.mealTime === "malam");

  return {
    pagi: pagi[abs % pagi.length],
    siang: siang[(abs + 1) % siang.length],
    malam: malam[(abs + 2) % malam.length],
  };
}

const TYPE_COLORS: Record<string, string> = {
  Tradisional: "bg-amber-100 text-amber-700",
  Sehat: "bg-emerald-100 text-emerald-700",
  Simple: "bg-blue-100 text-blue-700",
  Sunnah: "bg-teal-100 text-teal-700",
  Diet: "bg-purple-100 text-purple-700",
};

function FoodCard({ food, meal }: { food: typeof FOODS[0]; meal: "Sarapan" | "Makan Siang" | "Makan Malam" }) {
  const mealIcons = { "Sarapan": "☀️", "Makan Siang": "🌤️", "Makan Malam": "🌙" };
  const mealColors = {
    "Sarapan": "from-amber-400 to-orange-500",
    "Makan Siang": "from-emerald-400 to-teal-500",
    "Makan Malam": "from-indigo-400 to-purple-500"
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
      {/* Color Header */}
      <div className={`bg-linear-to-r ${mealColors[meal]} p-4 flex items-center justify-between`}>
        <div>
          <span className="text-white/80 text-xs font-bold uppercase tracking-wider">{mealIcons[meal]} {meal}</span>
          <h3 className="text-white font-bold text-lg mt-0.5">{food.name}</h3>
        </div>
        <span className="text-4xl">{food.emoji}</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Type + Calories */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${TYPE_COLORS[food.type] || "bg-slate-100 text-slate-600"}`}>{food.type}</span>
          <span className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full font-medium">🔥 {food.calories} kkal</span>
          <span className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full font-medium">💰 {food.price}</span>
        </div>

        {/* Benefit */}
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl px-4 py-3">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">✅ Manfaat</p>
          <p className="text-sm text-emerald-800 dark:text-emerald-300">{food.benefit}</p>
        </div>

        {/* Ingredients */}
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">🥘 Bahan-bahan</p>
          <div className="flex flex-wrap gap-1.5">
            {food.ingredients.map((ing, i) => (
              <span key={i} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                {ing}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function MenuMakanPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("mutabaah-user-id")?.value;
  if (!userId) redirect("/auth");

  const todayMenu = getTodayMenu();

  // Get all unique types for filter display
  const types = [...new Set(FOODS.map(f => f.type))];
  const mealTimes = [
    { key: "pagi", label: "Sarapan", icon: "☀️", count: FOODS.filter(f => f.mealTime === "pagi").length },
    { key: "siang", label: "Makan Siang", icon: "🌤️", count: FOODS.filter(f => f.mealTime === "siang").length },
    { key: "malam", label: "Makan Malam", icon: "🌙", count: FOODS.filter(f => f.mealTime === "malam").length },
  ];

  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="bg-linear-to-br from-orange-500 to-red-600 text-white px-6 pt-8 pb-16 rounded-b-4xl shadow-lg mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-48 h-48 bg-white opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl" />
        <div className="flex items-center gap-4 relative z-10 mb-4">
          <Link href="/dashboard" className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Menu Makan Keluarga</h1>
            <p className="text-orange-100 text-sm">{today}</p>
          </div>
          <span className="ml-auto text-3xl">🍽️</span>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-sm text-orange-100">
          <ChefHat className="w-4 h-4" />
          <span>{FOODS.length} resep • {types.length} kategori tersedia</span>
        </div>
      </header>

      <main className="px-4 max-w-2xl mx-auto -mt-8 relative z-10 space-y-6">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-3 gap-3">
          {mealTimes.map(m => (
            <div key={m.key} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 text-center shadow-sm">
              <div className="text-2xl mb-1">{m.icon}</div>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{m.label}</p>
              <p className="text-lg font-black text-orange-500">{m.count}</p>
              <p className="text-[10px] text-slate-400">menu tersedia</p>
            </div>
          ))}
        </div>

        {/* ── Today's Recommended Menu ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-1.5 rounded-lg">
              <Shuffle className="w-4 h-4 text-orange-600" />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-slate-200">Rekomendasi Menu Hari Ini</h2>
            <span className="ml-auto text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">Berganti tiap hari</span>
          </div>

          <div className="space-y-4">
            <FoodCard food={todayMenu.pagi} meal="Sarapan" />
            <FoodCard food={todayMenu.siang} meal="Makan Siang" />
            <FoodCard food={todayMenu.malam} meal="Makan Malam" />
          </div>
        </section>

        {/* ── All Menu by Category ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg">
              <Utensils className="w-4 h-4 text-slate-600" />
            </div>
            <h2 className="font-bold text-slate-800 dark:text-slate-200">Semua Menu</h2>
          </div>

          {/* By meal time */}
          {mealTimes.map(mealTime => {
            const foods = FOODS.filter(f => f.mealTime === mealTime.key);
            return (
              <div key={mealTime.key} className="mb-6">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <span className="text-lg">{mealTime.icon}</span>
                  <h3 className="font-bold text-slate-700 dark:text-slate-300">{mealTime.label}</h3>
                  <span className="text-xs text-slate-400 ml-auto">{foods.length} pilihan</span>
                </div>
                <div className="space-y-3">
                  {foods.map(food => (
                    <div key={food.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex items-start gap-3 shadow-sm">
                      <span className="text-3xl">{food.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{food.name}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[food.type] || "bg-slate-100 text-slate-600"}`}>{food.type}</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-1">{food.benefit}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400">
                          <span>🔥 {food.calories} kkal</span>
                          <span>💰 {food.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* ── Tip Card ── */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/40 rounded-2xl p-5 flex items-start gap-3">
          <Leaf className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-orange-800 dark:text-orange-300 mb-1 text-sm">Tips Islami untuk Menu Keluarga</p>
            <p className="text-xs text-orange-700/80 dark:text-orange-400/80 leading-relaxed">
              Awali setiap makan dengan <strong>Bismillah</strong>, makan bersama keluarga, dan jangan berlebihan.{" "}
              <em>&ldquo;Tidaklah anak Adam memenuhi suatu wadah yang lebih buruk dari perutnya.&rdquo;</em>{" "}
              (HR. Tirmidzi)
            </p>
          </div>
        </div>

      </main>

      <BottomNav />
    </div>
  );
}
