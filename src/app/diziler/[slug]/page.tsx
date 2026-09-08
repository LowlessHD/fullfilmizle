import type { Metadata } from "next";
import Link from "next/link";
import { demoHeroItems, demoTrendDiziler } from "@/lib/demo-data";
import ContentRow from "@/components/sections/ContentRow";
import {
  Play,
  Heart,
  Star,
  Clock,
  Calendar,
  Globe,
  Info,
  MessageSquare,
  Share2,
  ChevronRight,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

// Demo dizi detayları için yardımcı
function findDemoContent(slug: string) {
  return [...demoHeroItems, ...demoTrendDiziler].find(
    (c) => c.slug === slug && c.type === "SERIES"
  );
}

export async function generateMetadata(
  props: PageProps<"/diziler/[slug]">
): Promise<Metadata> {
  const params = await props.params;
  const content = findDemoContent(params.slug);
  return {
    title: content?.title ?? "Dizi Detay",
    description: content?.description ?? "Dizi detay sayfası",
  };
}

// Demo sezon verileri
const demoSeasons = [
  {
    id: "s1",
    seasonNumber: 1,
    title: "Sezon 1",
    episodeCount: 9,
    episodes: Array.from({ length: 9 }, (_, i) => ({
      id: `s1e${i + 1}`,
      episodeNumber: i + 1,
      title: `Bölüm ${i + 1}`,
      description: "Bu bölümde karakterler yeni maceralara atılır ve beklenmedik gelişmeler yaşanır.",
      durationMinutes: 45 + Math.floor(Math.random() * 20),
      stillUrl: null as string | null,
    })),
  },
  {
    id: "s2",
    seasonNumber: 2,
    title: "Sezon 2",
    episodeCount: 7,
    episodes: Array.from({ length: 7 }, (_, i) => ({
      id: `s2e${i + 1}`,
      episodeNumber: i + 1,
      title: `Bölüm ${i + 1}`,
      description: "Heyecan verici olaylar devam ediyor. Hikaye beklenmedik yönlere gidiyor.",
      durationMinutes: 48 + Math.floor(Math.random() * 20),
      stillUrl: null as string | null,
    })),
  },
];

// Demo oyuncular
const demoActors = [
  { id: "a1", name: "Pedro Pascal", characterName: "Joel", photoUrl: "https://image.tmdb.org/t/p/w185/nmaN7ViGCjSD6fAuBUdGhdqeLr5.jpg" },
  { id: "a2", name: "Bella Ramsey", characterName: "Ellie", photoUrl: "https://image.tmdb.org/t/p/w185/jJfo2Ve9pB8xAMHVkDzCOGmXsAi.jpg" },
  { id: "a3", name: "Anna Torv", characterName: "Tess", photoUrl: "https://image.tmdb.org/t/p/w185/pvJnaMNxAFecTW7v6T7dFKCm27E.jpg" },
  { id: "a4", name: "Nick Offerman", characterName: "Bill", photoUrl: "https://image.tmdb.org/t/p/w185/dDsMpJiSRWemFETcryM27OX5DUL.jpg" },
];

export default async function DiziDetayPage(
  props: PageProps<"/diziler/[slug]">
) {
  const params = await props.params;
  const content = findDemoContent(params.slug) || demoHeroItems[0];

  return (
    <div className="min-h-screen">
      {/* Hero Backdrop */}
      <div className="relative h-[60vh] min-h-[450px] max-h-[650px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: content.backdropUrl
              ? `url(${content.backdropUrl})`
              : undefined,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-[var(--color-bg-primary)]/30" />
        </div>

        {/* İçerik Bilgisi */}
        <div className="relative z-10 h-full max-w-[1400px] mx-auto px-4 sm:px-6 flex items-end pb-12">
          <div className="flex gap-8 items-end">
            {/* Poster */}
            <div className="hidden md:block shrink-0 w-[200px] lg:w-[240px] rounded-xl overflow-hidden shadow-2xl border border-white/10">
              {content.posterUrl && (
                <img
                  src={content.posterUrl}
                  alt={content.title}
                  className="w-full aspect-[2/3] object-cover"
                />
              )}
            </div>

            {/* Bilgi */}
            <div className="space-y-4 max-w-2xl pb-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-accent">Dizi</span>
                {content.quality && (
                  <span className="badge badge-quality">{content.quality}</span>
                )}
                {content.imdbRating && (
                  <span className="badge badge-gold flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {content.imdbRating.toFixed(1)}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
                {content.title}
              </h1>

              {content.originalTitle && content.originalTitle !== content.title && (
                <p className="text-[var(--color-text-muted)] text-sm italic">
                  {content.originalTitle}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                {content.releaseYear && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {content.releaseYear}
                  </span>
                )}
                {content.durationMinutes && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatDuration(content.durationMinutes)} / bölüm
                  </span>
                )}
                {content.country && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4" />
                    {content.country}
                  </span>
                )}
              </div>

              {/* Türler */}
              <div className="flex flex-wrap gap-2">
                {content.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/kategoriler/${genre.slug}`}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/8 text-[var(--color-text-secondary)] hover:bg-white/12 transition-all"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              {/* Aksiyon Butonları */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={`/diziler/${content.slug}/1/1`}
                  className="btn-primary text-base px-6 py-3"
                >
                  <Play className="w-5 h-5 fill-current" />
                  İzlemeye Başla
                </Link>
                <button className="btn-secondary text-base px-6 py-3">
                  <Heart className="w-5 h-5" />
                  Favorilere Ekle
                </button>
                <button className="btn-icon w-11 h-11">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alt Bölüm */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-10 pb-16">
        {/* Açıklama */}
        {content.description && (
          <section className="glass-card p-6 sm:p-8">
            <h2 className="section-title text-xl mb-4">📖 Özet</h2>
            <p className="text-[var(--color-text-secondary)] leading-relaxed text-base">
              {content.description}
            </p>
          </section>
        )}

        {/* Sezon & Bölüm Seçimi */}
        <section className="space-y-6">
          <h2 className="section-title">📺 Sezonlar & Bölümler</h2>

          {demoSeasons.map((season) => (
            <div key={season.id} className="glass-card overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {season.title}{" "}
                  <span className="text-sm text-[var(--color-text-muted)] font-normal">
                    ({season.episodeCount} bölüm)
                  </span>
                </h3>
              </div>
              <div className="divide-y divide-white/5">
                {season.episodes.map((ep) => (
                  <Link
                    key={ep.id}
                    href={`/diziler/${content.slug}/${season.seasonNumber}/${ep.episodeNumber}`}
                    className="flex items-center gap-4 p-4 sm:px-6 hover:bg-white/3 transition-colors group"
                  >
                    <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--color-accent-muted)] flex items-center justify-center text-sm font-semibold text-[var(--color-accent)] group-hover:bg-[var(--color-accent)] group-hover:text-white transition-all">
                      {ep.episodeNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium group-hover:text-[var(--color-accent)] transition-colors">
                        {ep.title}
                      </h4>
                      {ep.description && (
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 line-clamp-1">
                          {ep.description}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                      <span className="flex items-center gap-1 hidden sm:flex">
                        <Clock className="w-3.5 h-3.5" />
                        {ep.durationMinutes}dk
                      </span>
                      <Play className="w-4 h-4 text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Oyuncu Kadrosu */}
        <section className="space-y-4">
          <h2 className="section-title">🎭 Oyuncu Kadrosu</h2>
          <div className="horizontal-scroll gap-4">
            {demoActors.map((actor) => (
              <div
                key={actor.id}
                className="glass-card p-3 text-center w-[130px] shrink-0"
              >
                <div className="w-20 h-20 rounded-full mx-auto mb-3 overflow-hidden bg-[var(--color-bg-tertiary)]">
                  {actor.photoUrl && (
                    <img
                      src={actor.photoUrl}
                      alt={actor.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <h4 className="text-xs font-semibold line-clamp-1">
                  {actor.name}
                </h4>
                {actor.characterName && (
                  <p className="text-[0.65rem] text-[var(--color-text-muted)] mt-0.5">
                    {actor.characterName}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Benzer Diziler */}
        <ContentRow
          title="🔗 Benzer Diziler"
          href="/diziler"
          items={demoTrendDiziler}
        />
      </div>
    </div>
  );
}
