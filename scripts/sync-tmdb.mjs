// scripts/sync-tmdb.mjs
// TMDB İçerik Senkronizasyon CLI Tetikleyici

const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api/bot/sync?movies=15&tv=10&seasons=2`;

console.log("=========================================");
console.log("🎬 FullFilmİzle — TMDB Otomasyon Botu");
console.log("=========================================\n");
console.log(`İstek gönderiliyor: ${API_URL}`);

try {
  const response = await fetch(API_URL);
  const data = await response.json();

  if (response.ok && data.success) {
    console.log("\n✅ SENKRONİZASYON BAŞARILI!");
    console.log(`⏱️ Süre: ${(data.durationMs / 1000).toFixed(2)} saniye`);
    console.log(`🎬 Eklenen / Güncellenen Film: ${data.syncedMovies}`);
    console.log(`📺 Eklenen / Güncellenen Dizi: ${data.syncedTv}`);
    
    if (data.errors && data.errors.length > 0) {
      console.log("\n⚠️ Bazı uyarilar:");
      data.errors.forEach((err) => console.log(` - ${err}`));
    }
  } else {
    console.error("\n❌ Senkronizasyon başarısız oldu:");
    console.error(data.error || data);
  }
} catch (err) {
  console.error("\n❌ Sunucuya bağlanılamadı!");
  console.error("Lütfen önce 'npm run dev' ile geliştirme sunucusunu başlattığınızdan emin olun.");
  console.error("Hata detayı:", err.message);
}
