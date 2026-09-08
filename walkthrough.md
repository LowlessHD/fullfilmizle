# 🎬 FullFilmİzle — Kapsamlı Proje Özeti & Walkthrough

FullFilmİzle; modern web standartları, en güncel Next.js mimarisi, TMDB API otomasyonu ve kurumsal streaming platformu (Netflix / Disney+ kalitesinde) estetiğiyle geliştirilmiş uçtan uca tam teşekküllü bir **HD Film ve Dizi İzleme Platformudur**.

---

## 🏗️ 1. Mimari & Teknoloji Yığını

| Katman | Teknoloji / Kütüphane | Açıklama |
|---|---|---|
| **Framework** | **Next.js 16.3.4 (App Router)** | Hibrit Server & Client Component mimarisi, Edge/Node Runtime |
| **Dil** | **TypeScript 5** | %100 tip güvenliği, katı tip tanımları ve model arayüzleri |
| **Stil & Tasarım** | **Tailwind CSS 4 + Glassmorphism** | Koyu tema, akıcı mikro animasyonlar, özel CSS değişkenleri |
| **Veritabanı & ORM** | **PostgreSQL + Prisma 6** | 13 ilişkisel tablo, migration ve indeksleme altyapısı |
| **Kimlik Doğrulama** | **NextAuth.js v5 (Beta) + bcryptjs** | JWT oturum yönetimi, Role-based access (USER/ADMIN), Google OAuth |
| **Önbellek & Kuyruk** | **Redis (ioredis)** | Yüksek trafik yönetimi ve hızlı veri önbellekleme modülü |
| **Konteyner & Proxy** | **Docker Compose + Nginx** | Reverse proxy, rate limiting, gzip ve güvenlik başlıkları |
| **Veri Kaynağı & Bot**| **TMDB API v3 Client & Sync Bot** | Film, dizi, sezon/bölüm ve oyuncu kadrosu otomatik aktarım motoru |
| **Video Oynatıcı** | **Korumalı Sandboxed Embed Player** | VidSrc, SuperEmbed, 2Embed sağlayıcıları ile pop-up korumalı oynatıcı |

---

## 📦 2. Tamamlanan Fazlar ve Modüller

### 🎨 Faz 1: Temel Altyapı, Veri Şeması ve Tasarım Sistemi
- **13 Tablolu Veritabanı Şeması ([`prisma/schema.prisma`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/prisma/schema.prisma)):**
  - `User`, `Content`, `Genre`, `ContentGenre`, `Season`, `Episode`, `WatchSource`, `Subtitle`, `Actor`, `ContentActor`, `WatchHistory`, `Favorite`, `Comment`, `AdPlacement`, `SiteSetting`.
- **Tasarım Sistemi ([`src/app/globals.css`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/globals.css)):**
  - Premium sinematik koyu arka plan (`#0d0d0f`, `#141419`).
  - Netflix kırmızısı vurgu rengi (`#e50914`), parlayan neon gölgeler ve glassmorphism kart efektleri.
  - Mobil, tablet ve masaüstü tam uyumlu responsive ızgara sistemi.
- **Global Layout Bileşenleri:**
  - [`Header`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/components/layout/Header.tsx): Scroll duyarlı, arama çubuğu, profil ve mobil çekmece menü.
  - [`Footer`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/components/layout/Footer.tsx): Kategoriler, yasal uyarılar ve sosyal medya bağlantıları.
  - [`HeroSlider`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/components/sections/HeroSlider.tsx) & [`ContentRow`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/components/sections/ContentRow.tsx): Dinamik içerik vitrini.

---

### 🛡️ Faz 2: NextAuth.js Kimlik Doğrulama & Kullanıcı Etkileşim Sistemi
- **NextAuth.js v5 Yapılandırması ([`src/lib/auth.ts`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/lib/auth.ts)):**
  - `Credentials Provider`: E-posta ve şifre doğrulaması (`bcrypt.compare`).
  - `Google Provider`: Hızlı sosyal giriş altyapısı.
  - `JWT Session Callback`: Oturum token'ına kullanıcı `id`, `username` ve `role` (`USER` / `ADMIN`) ekleme.
- **Kullanıcı Kayıt API'si ([`src/app/api/auth/register/route.ts`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/api/auth/register/route.ts)):**
  - `bcrypt.hash(password, 12)` ile tuzlanmış şifreleme ve benzersiz e-posta/kullanıcı adı kontrolleri.
- **Güvenlik Middleware ([`src/middleware.ts`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/middleware.ts)):**
  - Giriş yapmamış kullanıcıların `/profil` sayfasına erişimi engellenir ve `/giris?callbackUrl=%2Fprofil` adresine yönlendirilir.
  - `/admin` yönetim paneline yetkisiz girişler filtrelenir (`role === 'ADMIN'`).
- **Kullanıcı Etkileşim API'leri:**
  - **İzleme Geçmişi ([`/api/kullanici/history`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/api/kullanici/history/route.ts)):** Videoda kalınan saniyeyi (`progressSeconds`) kaydedip kaldığın yerden devam ettirme.
  - **Favoriler ([`/api/kullanici/favorites`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/api/kullanici/favorites/route.ts)):** Tek tıkla favorilere ekleme/çıkarma (toggle).
  - **Yorumlar ([`/api/kullanici/comments`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/api/kullanici/comments/route.ts)):** Film ve dizi bölümlerine onaylı yorum yapma ve yanıtlama.
- **Kullanıcı Profil Sayfası ([`src/app/profil/page.tsx`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/profil/page.tsx)):**
  - Kullanıcı kartı, ilerleme çubuklu izleme geçmişi ("Kaldığın Yerden Devam Et"), favoriler listesi ve güvenli çıkış butonu.
- **Giriş / Kayıt Sayfası ([`src/app/giris/page.tsx`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/giris/page.tsx)):**
  - Akıcı sekme geçişi, form doğrulaması ve Google ile giriş.

---

### 🤖 Faz 3: TMDB API İstemcisi & Otomasyon Botu
- **TMDB API İstemcisi ([`src/lib/tmdb.ts`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/lib/tmdb.ts)):**
  - Vizyondaki, popüler ve en çok puan alan filmler/diziler, fragmanlar, tür eşlemeleri ve oyuncu kadrosu.
- **Senkronizasyon Motoru ([`src/lib/bot/tmdb-sync.ts`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/lib/bot/tmdb-sync.ts)):**
  - `syncMovieById`: Film detaylarını, türlerini, oyuncu kadrosunu ve otomatik stream oynatıcı linklerini (`VidSrc`, `SuperEmbed`, `2Embed`) veritabanına aktarır.
  - `syncTvById`: Dizinin tüm sezonlarını ve her bölümünü ayrı ayrı gezerek bölüm izleme linkleriyle birlikte kaydeder.
  - **Akıllı Çift Mod:** Canlı TMDB API anahtarı girildiğinde doğrudan TMDB'den çeker; anahtar girilmediğinde veya bağlantı koptuğunda [`fallback-data.ts`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/lib/bot/fallback-data.ts) üzerinden popüler içerikleri aktararak sistemin kesintisiz çalışmasını sağlar.
- **Tetikleme Kanalları:**
  - Web / Cron API Endpoint: [`/api/bot/sync`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/api/bot/sync/route.ts)
  - CLI Script: `npm run sync:tmdb` ([`scripts/sync-tmdb.mjs`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/scripts/sync-tmdb.mjs))

---

### 🎬 Faz 4: Video Oynatıcı & Dinamik İzleme Sayfaları
- **Güvenli Embed Player ([`src/components/player/EmbedPlayer.tsx`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/components/player/EmbedPlayer.tsx)):**
  - `sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"` ile zararlı yönlendirmeler ve istenmeyen pop-up reklamlar engellenir.
  - Özel glassmorphic yükleniyor animasyonu, hata ekranı, sinema modu ve tam ekran kontrolleri.
- **Kaynak Seçici ([`src/components/player/SourceSelector.tsx`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/components/player/SourceSelector.tsx)):**
  - `VidSrc Pro HD`, `SuperEmbed Ultra`, `2Embed Fast` gibi çoklu sunucu butonları, kalite (`1080p`, `4K`) ve dil (`Dublaj / Altyazılı`) etiketleriyle canlı geçiş.
- **Dinamik Film İzleme Sayfası ([`src/app/filmler/[slug]/page.tsx`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/filmler/[slug]/page.tsx)):**
  - Slug parametresine göre Prisma'dan filmi, kaynakları, oyuncuları ve özeti yükler. Beğen, Listeme Ekle ve Paylaş eylemleri.
- **Dinamik Dizi Bölüm İzleme Sayfası ([`src/app/diziler/[slug]/[sezon]/[bolum]/page.tsx`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/diziler/[slug]/[sezon]/[bolum]/page.tsx)):**
  - İlgili sezon ve bölüm kaynağını oynatır.
  - "Önceki Bölüm" ve "Sonraki Bölüm" butonlarıyla bölümler arası kesintisiz geçiş.
  - O sezonun tüm bölümlerini listeleyen interaktif bölüm seçici menüsü.

---

### 👑 Faz 6: Gelişmiş Admin Yönetim Paneli
- **Admin Dashboard ([`src/app/admin/page.tsx`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/admin/page.tsx)):**
  - Canlı istatistik kartları (Toplam Film, Dizi, Üye, Yorum).
  - Tek Tıkla TMDB Bot Tetikleyici ([`AdminQuickSyncButton.tsx`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/admin/AdminQuickSyncButton.tsx)).
  - Son eklenen içerikler ve son kayıt olan üyeler tablosu.
- **Dinamik Reklam & VAST Yönetimi ([`src/app/admin/reklamlar/page.tsx`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/admin/reklamlar/page.tsx)):**
  - `video_pre_roll`, `player_overlay`, `sidebar_banner` slotları.
  - Tek tıkla aktif/pasif switch'i, VAST XML URL, HTML/JS reklam kodu ve görsel düzenleme modalı.
  - API: [`/api/admin/reklamlar`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/api/admin/reklamlar/route.ts).
- **Manuel TMDB İçerik Ekleme ([`src/app/admin/icerikler/page.tsx`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/admin/icerikler/page.tsx)):**
  - Film/Dizi seçip TMDB ID girerek tek tıkla veritabanına ekleme formu.
  - Canlı arama çubuğu, tür filtreleme, izleme sayfasına doğrudan erişim ve içerik silme (`DELETE`) desteği.
  - API: [`/api/admin/icerikler`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/api/admin/icerikler/route.ts).
- **Yönetim Güvenlik Koruması ([`src/app/admin/layout.tsx`](file:///c:/Users/Yusufhan/Desktop/fullfilmizle/src/app/admin/layout.tsx)):**
  - Server Component seviyesinde `session.user.role === 'ADMIN'` doğrulaması.

---

## 🧭 3. Sayfa & Rota Haritası

| Rota | Sayfa Tanımı | Güvenlik / Erişim |
|---|---|---|
| `/` | Ana Sayfa (Hero Slider, Trendler, Kategoriler, CTA) | Herkese Açık |
| `/filmler` | Tüm Filmler Listesi, Filtreler & Sıralama | Herkese Açık |
| `/filmler/[slug]` | Film İzleme & Detay Sayfası (Player + Kaynaklar) | Herkese Açık |
| `/diziler` | Tüm Diziler Listesi, Filtreler | Herkese Açık |
| `/diziler/[slug]` | Dizi Detay Sayfası (Sezonlar & Bölümler) | Herkese Açık |
| `/diziler/[slug]/[sezon]/[bolum]` | Dizi Bölüm İzleme Sayfası (Player + Navigasyon) | Herkese Açık |
| `/giris` | Kullanıcı Giriş & Kayıt Sayfası (Sekmeli) | Herkese Açık |
| `/profil` | Kullanıcı Profili, İzleme Geçmişi & Favoriler | 🔒 Giriş Yapmış Kullanıcı |
| `/admin` | Yönetici Dashboard & İstatistikler | 👑 Sadece ADMIN |
| `/admin/icerikler` | TMDB Manuel İçe Aktarma & İçerik Yönetimi | 👑 Sadece ADMIN |
| `/admin/reklamlar` | Reklam Alanları, VAST & Kod Yönetimi | 👑 Sadece ADMIN |

---

## ⚡ 4. API Uç Noktaları (Endpoints)

| Endpoint | Metotlar | Açıklama |
|---|---|---|
| `/api/auth/[...nextauth]` | `GET`, `POST` | NextAuth oturum ve kimlik doğrulama işlemleri |
| `/api/auth/register` | `POST` | Yeni kullanıcı kaydı (`bcryptjs` hash'leme) |
| `/api/bot/sync` | `GET`, `POST` | TMDB popüler film ve dizileri toplu senkronize etme |
| `/api/kullanici/history` | `GET`, `POST` | İzleme geçmişini listeleme ve kaldığın saniyeyi kaydetme |
| `/api/kullanici/favorites`| `GET`, `POST` | Favori içerikleri listeleme ve ekle/çıkar (toggle) |
| `/api/kullanici/comments` | `GET`, `POST` | İçeriklere ait yorumları listeleme ve yeni yorum gönderme |
| `/api/admin/icerikler` | `GET`, `POST`, `DELETE` | İçerik arama, TMDB ID ile tekil çekme ve silme |
| `/api/admin/reklamlar` | `GET`, `POST`, `PATCH` | Reklam slotlarını listeleme, güncelleme ve aktif/pasif toggle |

---

## 📸 5. Canlı Tarayıcı Testleri & Ekran Görüntüleri

Tüm sayfalar ve akışlar Chrome tarayıcısı üzerinde canlı olarak test edilmiş ve doğrulanmıştır:

### 1. Film İzleme Sayfası (`Dune: Part Two`)
![Dune Film İzleme](C:/Users/Yusufhan/.gemini/antigravity-ide/brain/f00db67d-7c8e-4612-a5bb-7bae7770106c/dune_film_page_1788857319282.png)

### 2. Dizi Bölüm İzleme Sayfası (`Breaking Bad S01E01`)
![Breaking Bad Bölüm İzleme](C:/Users/Yusufhan/.gemini/antigravity-ide/brain/f00db67d-7c8e-4612-a5bb-7bae7770106c/breaking_bad_episode_page_1788857343203.png)

### 3. Bölüm Listesi & Navigasyon
![Bölüm Listesi](C:/Users/Yusufhan/.gemini/antigravity-ide/brain/f00db67d-7c8e-4612-a5bb-7bae7770106c/breaking_bad_episode_list_1788857352930.png)

### 4. Giriş ve Kayıt Sayfası
![Giriş ve Kayıt](C:/Users/Yusufhan/.gemini/antigravity-ide/brain/f00db67d-7c8e-4612-a5bb-7bae7770106c/giris_kayit_sayfasi_1788857625724.png)

---

## 🚀 6. Kurulum ve Çalıştırma

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Ortam değişkenlerini ayarlayın (.env.local)
# DATABASE_URL, NEXTAUTH_SECRET, TMDB_API_KEY vb.

# 3. Veritabanı şemasını uygulayın
npx prisma db push # veya npx prisma migrate dev

# 4. Geliştirme sunucusunu başlatın
npm run dev

# 5. (İsteğe Bağlı) TMDB botu ile içerikleri içeri aktarın
npm run sync:tmdb
```

FullFilmİzle projesi; performans, güvenlik, kullanıcı deneyimi ve zengin içerik yönetimi ile yayına hazır durumdadır! 🎉
