import { db } from "./index";
import { quotes } from "./schema";

const parsedQuotes = [
  {
    text: "Wahai Tuhan kami, anugerahkanlah kepada kami dari pasangan kami dan keturunan kami sebagai penyejuk mata yang menenangkan hati, dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa.",
    source: "QS. Al-Furqan: 74",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Sebaik-baik kalian adalah orang yang paling baik perilakunya terhadap keluarganya, dan aku adalah orang yang paling baik di antara kalian terhadap keluargaku.",
    source: "HR. Tirmidzi & Ibnu Majah",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Ketahuilah bahwa surga itu berada di bawah telapak kaki ibu; muliakanlah mereka untuk mendapatkan ridha Sang Pencipta.",
    source: "HR. Ahmad & An-Nasa'i",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Keluarga yang harmonis adalah benteng pertama dan utama bagi seorang Muslim dalam menghadapi fitnah dan ujian dunia.",
    source: "Imam Al-Ghazali - Ihya Ulumuddin",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Muliakanlah istrimu dengan penuh kasih sayang, niscaya Allah akan melapangkan jalan rezekimu dari arah yang tidak disangka-sangka.",
    source: "Nasihat Ulama Salaf",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Anak-anakmu adalah investasi akhirat yang paling berharga; didiklah mereka dengan cahaya Al-Qur'an agar menjadi penolongmu di hari kiamat.",
    source: "Imam Al-Ghazali",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Sebuah rumah tangga yang dijalankan tanpa ibadah di dalamnya bagaikan bangunan megah yang berdiri tanpa tiang penyangga.",
    source: "Imam Ahmad bin Hanbal",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Dan Kami wajibkan kepada setiap manusia agar senantiasa berbuat baik dan berbakti kepada kedua orang tuanya dengan penuh ketulusan.",
    source: "QS. Al-Ankabut: 8",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Senyum tulus seorang suami kepada istrinya adalah sedekah yang mendatangkan pahala, begitupun sebaliknya dalam hubungan rumah tangga.",
    source: "HR. Bukhari & Muslim",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Tanamkanlah kecintaan kepada Rasulullah dalam hati anak-anakmu sebelum mereka terpengaruh oleh gemerlapnya kesenangan dunia.",
    source: "Imam Malik bin Anas",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Istri yang shalihah adalah perhiasan dunia yang paling berharga dan tak tertandingi oleh harta apa pun di bawah langit.",
    source: "HR. Muslim",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Cinta sejati adalah ikatan yang tidak hanya menyatukan dua hati di dunia, tetapi juga membawa pasangan lebih dekat menuju pintu Jannah.",
    source: "Ibnul Qayyim",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Jangan biarkan layar gadget mencuri waktu berharga yang seharusnya kau habiskan untuk bercengkerama dengan keluargamu.",
    source: "Nasihat Kontemporer Ulama",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Ayah yang paling bijak adalah dia yang memimpin keluarganya dengan memberikan teladan nyata, bukan sekadar memberikan perintah.",
    source: "Ali bin Abi Thalib",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Hormatilah kakakmu sebagaimana engkau menghormati ayahmu sendiri, karena mereka adalah pelindungmu setelah orang tuamu.",
    source: "HR. Al-Baihaqi",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Sayangilah adikmu dengan penuh kesabaran, karena ia adalah amanah kecil yang Allah titipkan di tanganmu untuk kau bimbing.",
    source: "Imam Nawawi",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Ketahuilah bahwa ridha Allah sangat bergantung pada ridha kedua orang tuamu, maka janganlah sekali-kali kau sakiti hati mereka.",
    source: "HR. Tirmidzi",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Rumah yang tidak pernah digunakan untuk shalat dan berzikir bagaikan kuburan yang sepi dari cahaya kedamaian.",
    source: "HR. Muslim",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Jadikanlah rumahmu sebagai madrasah pertama bagi keturunanmu, tempat di mana akhlak dan adab mulia mulai ditanamkan.",
    source: "Imam Syafi'i",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Kebahagiaan dalam sebuah keluarga bermula dari keberkahan rezeki yang dicari dengan cara yang halal dan diridhai Allah.",
    source: "Imam Abu Hanifah",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Rasulullah adalah teladan terbaik yang tidak pernah mencela makanan; jika beliau suka beliau makan, jika tidak beliau meninggalkannya.",
    source: "HR. Bukhari",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Doa seorang ibu yang tulus adalah perisai paling kuat dan tak tertembus yang menjaga seorang anak dari segala marabahaya.",
    source: "Imam Dzahabi",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Keharmonisan rumah tangga adalah buah dari kedewasaan dalam saling memaafkan dan menutupi kekurangan satu sama lain.",
    source: "Hasan Al-Basri",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Saling mendoakan dalam diam tanpa sepengetahuan orang yang didoakan adalah bentuk cinta yang paling murni di hadapan Allah.",
    source: "HR. Muslim",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Sesungguhnya setiap orang mukmin itu bersaudara, maka perbaikilah hubungan di antara saudaramu agar rahmat Allah selalu turun.",
    source: "QS. Al-Hujurat: 10",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Berikanlah perhatian penuh dan dengarkanlah dengan seksama ketika anakmu berbicara agar ia merasa dihargai dan dicintai.",
    source: "Adab Nabawi",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Kelembutan tidaklah berada pada sesuatu melainkan ia akan menghiasinya, dan tidaklah dicabut dari sesuatu melainkan akan memperburuknya.",
    source: "HR. Muslim",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Harta terbaik yang dikeluarkan oleh seseorang adalah dinar yang ia infakkan untuk mencukupi kebutuhan keluarganya.",
    source: "HR. Muslim",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Jauhkanlah segala bentuk perdebatan dan amarah dari hadapan anak-anak agar mental dan spiritual mereka tumbuh dengan sehat.",
    source: "Imam Al-Ghazali",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Ketegasan seorang ayah dalam mendidik harus selalu dibalut dengan kehangatan kasih sayang agar anak merasa aman dan terlindungi.",
    source: "Umar bin Khattab",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Seorang ibu adalah sekolah pertama bagi anak-anaknya; jika kau menyiapkannya dengan baik, kau telah menyiapkan generasi yang mulia.",
    source: "Penyair Hafiz Ibrahim",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Berlakulah adil di antara anak-anakmu dalam memberikan pemberian, agar tidak timbul rasa iri dan benci di antara mereka.",
    source: "HR. Bukhari",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Setiap anak dilahirkan dalam keadaan fitrah yang suci, dan orang tuanyalah yang akan membentuk keyakinan dan karakternya.",
    source: "HR. Bukhari",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Tidak ada warisan yang lebih mulia yang diberikan oleh orang tua kepada anaknya selain adab dan akhlak yang baik.",
    source: "HR. Tirmidzi",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Barangsiapa yang ingin diluangkan rezekinya dan dipanjangkan umurnya, maka hendaklah ia menyambung tali silaturahmi.",
    source: "HR. Bukhari",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Maafkanlah segala kekhilafan orang tuamu dan tetaplah bertutur kata yang mulia kepada mereka meski dalam keadaan sulit.",
    source: "QS. Al-Isra: 23-24",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Keluarga yang bersama-sama menjaga shalat lima waktu akan selalu berada dalam perlindungan dan pengawasan Allah.",
    source: "Imam Ahmad",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Canda tawa yang sehat bersama anggota keluarga adalah penawar penat yang paling efektif setelah lelah beraktivitas di luar.",
    source: "Ali bin Abi Thalib",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Kesetiaan dalam pernikahan adalah janji suci yang sangat berat timbangannya di sisi Allah, maka jagalah amanah tersebut.",
    source: "QS. An-Nisa: 21",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Tujuan akhir dari setiap keluarga mukmin adalah agar dapat berkumpul kembali di dalam surga-Nya dengan penuh kebahagiaan.",
    source: "QS. Az-Zukhruf: 70",
    category: "Pondasi Keluarga & Kasih Sayang (1-40)"
  },
  {
    text: "Barangsiapa bertakwa kepada Allah niscaya Dia akan memberikan jalan keluar bagi setiap masalahnya dan memberinya rezeki dari arah yang tidak pernah ia sangka-sangka sebelumnya.",
    source: "QS. At-Talaq: 2-3",
    category: "Rezeki & Keberkahan Hidup (41-80)"
  },
  {
    text: "Sesungguhnya jika kalian bersyukur atas nikmat-Ku, pasti Aku akan menambah nikmat itu kepadamu, namun jika kalian mengingkari nikmat-Ku, maka ketahuilah azab-Ku sangat pedih.",
    source: "QS. Ibrahim: 7",
    category: "Rezeki & Keberkahan Hidup (41-80)"
  },
  {
    text: "Ketahuilah bahwa rezeki itu tidak akan bisa ditarik oleh ambisi orang yang rakus, dan tidak pula bisa ditolak oleh kebencian orang yang tidak menyukainya.",
    source: "Hadits Riwayat Al-Hakim",
    category: "Rezeki & Keberkahan Hidup (41-80)"
  },
  {
    text: "Barangsiapa yang menjadikan akhirat sebagai puncak ambisinya, maka Allah akan menjadikan kekayaan di hatinya dan dunia akan datang kepadanya dengan tunduk.",
    source: "HR. Tirmidzi",
    category: "Rezeki & Keberkahan Hidup (41-80)"
  },
  {
    text: "Rezeki yang halal meskipun jumlahnya sedikit jauh lebih membawa keberkahan dan ketenangan daripada harta haram yang melimpah ruah.",
    source: "Imam Syafi'i",
    category: "Rezeki & Keberkahan Hidup (41-80)"
  },
  {
    text: "Ketahuilah dengan pasti, bahwa hanya dengan senantiasa mengingat Allah, hati setiap manusia akan menemukan kedamaian dan ketenteraman yang hakiki.",
    source: "QS. Ar-Ra'd: 28",
    category: "Kebahagiaan & Ketenangan Jiwa (81-120)"
  },
  {
    text: "Kebahagiaan yang sejati tidak ditemukan dalam kemaksiatan, melainkan hanya ada di dalam ketaatan yang tulus kepada Allah.",
    source: "Imam Al-Ghazali",
    category: "Kebahagiaan & Ketenangan Jiwa (81-120)"
  },
  {
    text: "Menerima dan ridha terhadap segala ketetapan takdir Allah adalah kunci utama untuk merasakan surga sebelum surga yang sebenarnya.",
    source: "Ibnul Qayyim",
    category: "Kebahagiaan & Ketenangan Jiwa (81-120)"
  },
  {
    text: "Keadaan yang paling dekat antara seorang hamba dengan Tuhannya adalah ketika ia sedang bersujud, maka perbanyaklah doa dan permintaan di dalamnya.",
    source: "HR. Muslim",
    category: "Keikhlasan, Ibadah & Cinta Kepada Allah (289-320)"
  },
  {
    text: "Janganlah engkau hanya terpaku pada banyaknya jumlah amalanmu, tetapi perhatikanlah kualitas kekhusyukan dan tingkat keikhlasan hati dalam menjalaninya.",
    source: "Imam Al-Ghazali",
    category: "Keikhlasan, Ibadah & Cinta Kepada Allah (289-320)"
  },
  {
    text: "Jadikanlah setiap detak jantungmu sebagai kerinduan untuk bertemu dengan Allah, karena kerinduan itulah yang akan menjaga langkahmu dari kemaksiatan.",
    source: "HR. Bukhari",
    category: "Keikhlasan, Ibadah & Cinta Kepada Allah (289-320)"
  },
  {
    text: "Mencintai Rasulullah melebihi cintamu kepada dirimu sendiri dan harta bendamu adalah syarat mutlak untuk merasakan manisnya kesempurnaan iman.",
    source: "HR. Bukhari",
    category: "Keikhlasan, Ibadah & Cinta Kepada Allah (289-320)"
  },
  {
    text: "Ikhlas yang murni adalah ketika engkau melakukan sesuatu hanya demi Allah, tanpa mengharapkan pujian manusia dan tidak takut akan celaan mereka.",
    source: "Ibnul Qayyim",
    category: "Keikhlasan, Ibadah & Cinta Kepada Allah (289-320)"
  },
  {
    text: "Ya Allah, akhirilah perjalanan hidup kami dengan akhir yang baik (husnul khatimah), dan janganlah Engkau akhiri hidup kami dengan akhir yang buruk (su'ul khatimah).",
    source: "Doa Penutup yang Masyhur di Kalangan Ulama",
    category: "Keikhlasan, Ibadah & Cinta Kepada Allah (289-320)"
  }
];

export function parseQuotes() {
    return parsedQuotes;
}

export const seedQuotes = parseQuotes();

async function seed() {
  console.log("Seeding Database...");
  await db.delete(quotes);
  
  const data = parseQuotes();
  for (let i = 0; i < data.length; i += 50) {
      const chunk = data.slice(i, i + 50);
      await db.insert(quotes).values(chunk);
  }
}
