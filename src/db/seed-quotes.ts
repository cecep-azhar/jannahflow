import { db } from "./index";
import { quotes } from "./schema";

export const seedQuotes = [
  { text: "Sebaik-baik kalian adalah yang terbaik bagi keluarganya, dan aku adalah yang terbaik di antara kalian bagi keluargaku.", source: "HR. Tirmidzi", category: "keluarga" },
  { text: "Tidaklah seorang hamba menafkahkan hartanya untuk keluarganya dengan mengharap pahala dari Allah, melainkan nafkah itu bernilai sedekah baginya.", source: "HR. Bukhari", category: "keluarga" },
  { text: "Barangsiapa yang ingin dipanjangkan umurnya dan ditambahkan rezekinya, maka hendaklah ia menyambung tali silaturahim.", source: "HR. Bukhari", category: "rezeki" },
  { text: "Sesungguhnya Allah tidak akan mengubah keadaan suatu kaum sebelum mereka mengubah keadaan diri mereka sendiri.", source: "Ar-Ra'd : 11", category: "tauhid" },
  { text: "Dan Rabbmu telah memerintahkan supaya kamu jangan menyembah selain Dia dan hendaklah kamu berbuat baik pada ibu bapakmu dengan sebaik-baiknya.", source: "Al-Isra : 23", category: "keluarga" },
  { text: "Janganlah kamu bersedih, sesungguhnya Allah bersama kita.", source: "At-Taubah : 40", category: "aqidah" },
  { text: "Bertaqwalah kepada Allah dimana saja kamu berada, dan iringilah keburukan dengan kebaikan, niscaya kebaikan itu akan menghapusnya.", source: "HR. Tirmidzi", category: "ibadah" },
  { text: "Orang yang cerdas adalah orang yang mengendalikan dirinya dan bekerja untuk kehidupan setelah kematian.", source: "HR. Tirmidzi", category: "hisab" },
  { text: "Di antara tanda kebaikan Islam seseorang adalah meninggalkan hal-hal yang tidak bermanfaat baginya.", source: "HR. Tirmidzi", category: "ibadah" },
  { text: "Pedagang yang jujur dan dapat dipercaya akan bersama para nabi, shiddiqin, dan syuhada.", source: "HR. Tirmidzi", category: "dagang" },
  { text: "Sembahlah Allah dan janganlah kamu mempersekutukan-Nya dengan sesuatupun.", source: "An-Nisa : 36", category: "tauhid" },
  { text: "Sesungguhnya bersama kesulitan ada kemudahan.", source: "Al-Insyirah : 6", category: "rezeki" },
  { text: "Tidaklah beriman seseorang di antara kalian hingga ia mencintai untuk saudaranya apa yang ia cintai untuk dirinya sendiri.", source: "HR. Bukhari & Muslim", category: "keluarga" },
  { text: "Amalan yang paling dicintai Allah adalah amalan yang berkesinambungan (rutin) meskipun sedikit.", source: "HR. Bukhari & Muslim", category: "ibadah" },
  { text: "Sesungguhnya shalat itu mencegah dari (perbuatan) keji dan mungkar.", source: "Al-Ankabut : 45", category: "ibadah" },
  { text: "Barangsiapa yang bertakwa kepada Allah, niscaya Dia akan membukakan jalan keluar baginya.", source: "At-Thalaq : 2", category: "rezeki" },
  { text: "Dan Dia memberinya rezeki dari arah yang tidak disangka-sangkanya.", source: "At-Thalaq : 3", category: "rezeki" },
  { text: "Keluarga yang sakinah dibangun di atas landasan takwa dan saling mengerti.", source: "Mahfudzat", category: "sakinah" },
  { text: "Harta dan anak-anak adalah perhiasan kehidupan dunia.", source: "Al-Kahfi : 46", category: "keluarga" },
  { text: "Maka nikmat Tuhan kamu yang manakah yang kamu dustakan?", source: "Ar-Rahman : 13", category: "tauhid" },
  { text: "Barangsiapa yang tidak bersyukur kepada manusia, maka ia tidak bersyukur kepada Allah.", source: "HR. Abu Daud", category: "ibadah" },
  { text: "Senyummu di hadapan saudaramu adalah sedekah bagimu.", source: "HR. Tirmidzi", category: "ibadah" },
  { text: "Dua rakaat fajar (shubuh) lebih baik dari dunia dan seisinya.", source: "HR. Muslim", category: "ibadah" },
  { text: "Barangsiapa menempuh suatu jalan untuk menuntut ilmu, maka Allah akan memudahkan baginya jalan menuju surga.", source: "HR. Muslim", category: "ibadah" },
  { text: "Doa adalah senjata orang mukmin, tiang agama, dan cahaya langit dan bumi.", source: "HR. Hakim", category: "aqidah" },
  { text: "Jagalah Allah niscaya Dia akan menjagamu.", source: "HR. Tirmidzi", category: "aqidah" },
  { text: "Jika kamu meminta, mintalah kepada Allah. Jika kamu memohon pertolongan, mohonlah kepada Allah.", source: "HR. Tirmidzi", category: "tauhid" },
  { text: "Sesungguhnya amal itu tergantung niatnya.", source: "HR. Bukhari & Muslim", category: "ibadah" },
  { text: "Sabar adalah pada pukulan pertama.", source: "HR. Bukhari", category: "aqidah" },
  { text: "Dan barangsiapa yang bertawakkal kepada Allah niscaya Allah akan mencukupkan (keperluan)nya.", source: "At-Thalaq : 3", category: "rezeki" },
  { text: "Tidak ada paksaan untuk (memasuki) agama (Islam).", source: "Al-Baqarah : 256", category: "aqidah" },
  { text: "Menuntut ilmu itu wajib atas setiap muslim.", source: "HR. Ibnu Majah", category: "ibadah" },
  { text: "Aisyah pernah ditanya: Apa yang dilakukan Nabi di rumahnya? Ia menjawab: Beliau melayani keluarganya.", source: "HR. Bukhari", category: "keluarga" },
  { text: "Semua anak Adam pasti pernah berbuat salah, dan sebaik-baik orang yang berbuat salah adalah yang bertaubat.", source: "HR. Tirmidzi", category: "hisab" },
  { text: "Barangsiapa beriman kepada Allah dan hari akhir, hendaklah ia memuliakan tamunya.", source: "HR. Bukhari & Muslim", category: "keluarga" },
  { text: "Cintailah orang yang kamu cintai sewajarnya, bisa jadi suatu saat ia menjadi orang yang kamu benci.", source: "HR. Tirmidzi", category: "aqidah" },
  { text: "Bekerjalah untuk duniamu seakan-akan engkau hidup selamanya, dan beramallah untuk akhiratmu seakan-akan engkau mati besok.", source: "Mahfudzat", category: "dagang" },
  { text: "Orang yang bangkrut dari umatku adalah orang yang datang pada hari kiamat dengan membawa pahala shalat, puasa, dan zakat...", source: "HR. Muslim", category: "hisab" },
  { text: "Tangan yang di atas lebih baik daripada tangan yang di bawah.", source: "HR. Bukhari", category: "rezeki" },
  { text: "Malu itu sebagian dari iman.", source: "HR. Muslim", category: "aqidah" },
  { text: "Agama adalah nasehat.", source: "HR. Muslim", category: "ibadah" },
  { text: "Membaca Al-Quran akan menjadi syafaat bagi pembacanya di hari kiamat.", source: "HR. Muslim", category: "hisab" },
  { text: "Surga itu di bawah telapak kaki ibu.", source: "Mahfudzat", category: "keluarga" },
  { text: "Rida Allah terletak pada rida kedua orang tua.", source: "HR. Tirmidzi", category: "keluarga" },
  { text: "Sembunyikanlah amal kebaikanmu sebagaimana engkau menyembunyikan keburukanmu.", source: "Mahfudzat", category: "ibadah" },
  { text: "Barangsiapa membangun masjid karena Allah, maka Allah akan membangunkan untuknya rumah di surga.", source: "HR. Bukhari & Muslim", category: "ibadah" },
  { text: "Perumpamaan orang yang berinfak di jalan Allah seperti sebutir benih yang menumbuhkan tujuh tangkai.", source: "Al-Baqarah : 261", category: "rezeki" },
  { text: "Setiap kalian adalah pemimpin dan akan dimintai pertanggungjawaban atas kepemimpinannya.", source: "HR. Bukhari & Muslim", category: "hisab" },
  { text: "Sungguh menakjubkan urusan seorang mukmin, semua urusannya adalah baik baginya.", source: "HR. Muslim", category: "aqidah" },
  { text: "Peliharalah dirimu dan keluargamu dari api neraka.", source: "At-Tahrim : 6", category: "keluarga" },
  { text: "Barangsiapa meringankan beban seorang mukmin di dunia, Allah akan meringankan bebannya di hari kiamat.", source: "HR. Muslim", category: "ibadah" },
  ...Array.from({ length: 100 }).map((_, i) => ({
      text: `Quote ${i} - Kebaikan akan kembali kepada kelurga yang bersyukur dan bersabar. Mengingat janji Allah itu benar bagi hamba yang bertaqwa.`,
      source: `Mahfudzat #${i}`,
      category: ['keluarga', 'rezeki', 'ibadah', 'tauhid', 'sakinah', 'dagang', 'hisab', 'aqidah'][Math.floor(Math.random() * 8)]
  }))
];

async function seed() {
  console.log("Seeding Database...");
  // Clear existing
  await db.delete(quotes);
  
  // Insert chunks of 50 to avoid SQLite limits
  for (let i = 0; i < seedQuotes.length; i += 50) {
      const chunk = seedQuotes.slice(i, i + 50);
      await db.insert(quotes).values(chunk);
  }
  
  console.log(`Seeded ${seedQuotes.length} quotes!`);
}

// Do NOT call seed() here — call it explicitly from a setup route or script.
