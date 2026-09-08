import type { Metadata } from "next";
import { demoPopulerFilmler } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Tüm Filmler",
  description: "En güncel filmleri HD kalitede, Türkçe altyazılı ve dublajlı olarak izleyin.",
};

export default function FilmlerPage() {
  const filmler = [...demoPopulerFilmler, ...demoPopulerFilmler];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-10">
        {/* Sayfa Başlığı */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold">🎬 Tüm Filmler</h1>
          <p className="text-[var(--color-text-secondary)]">
            En yeni ve popüler filmleri keşfedin, HD kalitede izleyin.
          </p>
        </div>

        {/* Filtreler */}
        <div className="flex flex-wrap gap-3">
          {["Tümü", "Aksiyon", "Komedi", "Drama", "Bilim Kurgu", "Gerilim", "Romantik", "Korku"].map(
            (filter, i) => (
              <button
                key={filter}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  i === 0
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-white/5 text-[var(--color-text-secondary)] hover:bg-white/10 hover:text-white border border-white/5"
                }`}
              >
                {filter}
              </button>
            )
          )}
        </div>

        {/* Sıralama */}
        <div className="flex items-center gap-4 text-sm">
          <span className="text-[var(--color-text-muted)]">Sırala:</span>
          {["En Yeni", "IMDB Puanı", "En Çok İzlenen"].map((sort, i) => (
            <button
              key={sort}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                i === 0
                  ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                  : "text-[var(--color-text-secondary)] hover:text-white"
              }`}
            >
              {sort}
            </button>
          ))}
        </div>

        {/* Film Listesi Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filmler.map((item, index) => {
            const href = `/filmler/${item.slug}`;
            return (
              <a
                key={`${item.id}-${index}`}
                href={href}
                className="content-card group block animate-fade-in"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-t-[var(--radius-lg)]">
                  {item.posterUrl && (
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  )}
                  <div className="content-card-overlay">
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] flex items-center justify-center shadow-lg">
                        <svg
                          className="w-5 h-5 text-white ml-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  {item.quality && (
                    <span className="absolute top-2 left-2 badge badge-quality text-[0.65rem]">
                      {item.quality}
                    </span>
                  )}
                  {item.imdbRating && (
                    <span className="absolute top-2 right-2 badge badge-gold text-[0.65rem]">
                      ⭐ {item.imdbRating.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mt-1">
                    <span>{item.releaseYear}</span>
                    {item.durationMinutes && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]" />
                        <span>{Math.floor(item.durationMinutes / 60)}sa {item.durationMinutes % 60}dk</span>
                      </>
                    )}
                  </div>
                </div>
              </a>
            );
          })}
        </div>

        {/* Daha Fazla Yükle */}
        <div className="text-center pt-4">
          <button className="btn-secondary px-8 py-3">
            Daha Fazla Göster
          </button>
        </div>
      </div>
    </div>
  );
}
