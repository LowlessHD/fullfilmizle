import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import VideoPlayerView from "@/components/player/VideoPlayerView";
import { PlayerSource } from "@/components/player/SourceSelector";
import { demoPopulerFilmler } from "@/lib/demo-data";
import { fallbackMovies } from "@/lib/bot/fallback-data";
import {
  Star,
  Clock,
  Calendar,
  Globe,
  Film,
  User as UserIcon,
  Play,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getFilmData(slug: string) {
  try {
    // 1. Prisma Veritabanından Sorgula
    const dbMovie = await prisma.content.findFirst({
      where: {
        slug,
        type: "MOVIE",
      },
      include: {
        sources: {
          where: { isActive: true },
          orderBy: { priority: "asc" },
        },
        genres: {
          include: { genre: true },
        },
        actors: {
          include: { actor: true },
          orderBy: { displayOrder: "asc" },
        },
      },
    });

    if (dbMovie) {
      return {
        id: dbMovie.id,
        title: dbMovie.title,
        originalTitle: dbMovie.originalTitle,
        slug: dbMovie.slug,
        description: dbMovie.description,
        posterUrl: dbMovie.posterUrl,
        backdropUrl: dbMovie.backdropUrl,
        trailerUrl: dbMovie.trailerUrl,
        imdbRating: dbMovie.imdbRating,
        releaseYear: dbMovie.releaseYear,
        durationMinutes: dbMovie.durationMinutes,
        country: dbMovie.country,
        language: dbMovie.language,
        quality: dbMovie.quality || "4K Ultra HD",
        genres: dbMovie.genres.map((g) => g.genre.name),
        actors: dbMovie.actors.map((a) => ({
          name: a.actor.name,
          character: a.characterName,
          photoUrl: a.actor.photoUrl,
        })),
        sources: dbMovie.sources.map((s) => ({
          id: s.id,
          sourceName: s.sourceName,
          embedUrl: s.embedUrl,
          quality: s.quality,
          language: s.language,
          priority: s.priority,
        })) as PlayerSource[],
      };
    }
  } catch (err) {
    console.error("Veritabanından film çekilirken hata:", err);
  }

  // 2. Fallback: Veritabanında yoksa veya veritabanı henüz boşsa Fallback / Demo havuzunda ara
  const fallback = fallbackMovies.find(
    (m) =>
      `${m.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${m.tmdbId}` === slug ||
      slug.includes(String(m.tmdbId))
  );

  if (fallback) {
    return {
      id: `fallback-${fallback.tmdbId}`,
      title: fallback.title,
      originalTitle: fallback.originalTitle,
      slug,
      description: fallback.overview,
      posterUrl: `https://image.tmdb.org/t/p/w500${fallback.posterPath}`,
      backdropUrl: `https://image.tmdb.org/t/p/original${fallback.backdropPath}`,
      trailerUrl: null,
      imdbRating: fallback.voteAverage,
      releaseYear: parseInt(fallback.releaseDate.slice(0, 4)),
      durationMinutes: fallback.runtime,
      country: "ABD",
      language: "Türkçe Dublaj & Altyazılı",
      quality: "4K Ultra HD",
      genres: fallback.genres.map((g) => g.name),
      actors: fallback.actors.map((a) => ({
        name: a.name,
        character: a.character,
        photoUrl: `https://image.tmdb.org/t/p/w185${a.photo}`,
      })),
      sources: [
        {
          id: "vidsrc-1",
          sourceName: "VidSrc Pro HD",
          embedUrl: `https://vidsrc.to/embed/movie/${fallback.tmdbId}`,
          quality: "1080p Full HD",
          language: "Türkçe Altyazı / Dublaj",
          priority: 1,
        },
        {
          id: "superembed-1",
          sourceName: "SuperEmbed Ultra",
          embedUrl: `https://multiembed.mov/?video_id=${fallback.tmdbId}&tmdb=1`,
          quality: "4K Ultra HD",
          language: "Orijinal Dil (Türkçe Altyazılı)",
          priority: 2,
        },
      ] as PlayerSource[],
    };
  }

  // 3. Demo Verilerde Ara
  const demoItem = demoPopulerFilmler.find((m) => m.slug === slug);
  if (demoItem) {
    return {
      id: demoItem.id,
      title: demoItem.title,
      originalTitle: demoItem.originalTitle,
      slug: demoItem.slug,
      description: demoItem.description,
      posterUrl: demoItem.posterUrl,
      backdropUrl: demoItem.backdropUrl,
      trailerUrl: null,
      imdbRating: demoItem.imdbRating,
      releaseYear: demoItem.releaseYear,
      durationMinutes: demoItem.durationMinutes,
      country: "ABD",
      language: "Türkçe Dublaj & Altyazılı",
      quality: "HD",
      genres: demoItem.genres.map((g) => g.name),
      actors: [],
      sources: [
        {
          id: "demo-src-1",
          sourceName: "VidSrc Demo",
          embedUrl: `https://vidsrc.to/embed/movie/${demoItem.tmdbId || 693134}`,
          quality: "1080p",
          language: "Türkçe Altyazılı",
          priority: 1,
        },
      ] as PlayerSource[],
    };
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const film = await getFilmData(slug);

  if (!film) {
    return {
      title: "Film Bulunamadı",
    };
  }

  return {
    title: `${film.title} (${film.releaseYear || ""}) Full HD İzle`,
    description: `${film.title} filmini 4K Full HD kalitede, Türkçe Dublaj ve Altyazı seçenekleriyle kesintisiz tek parça izleyin.`,
  };
}

export default async function FilmIzlemePage({ params }: Props) {
  const { slug } = await params;
  const film = await getFilmData(slug);

  if (!film) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black pt-16 pb-20 space-y-8">
      {/* 1. Video Player Bölümü */}
      <section className="w-full">
        <VideoPlayerView
          title={film.title}
          poster={film.backdropUrl || film.posterUrl}
          sources={film.sources}
        />
      </section>

      {/* 2. Film Detayları ve Bilgi Alanı */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sol Kolon: Film Poster & Hızlı Bilgiler */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
              {film.posterUrl ? (
                <img
                  src={film.posterUrl}
                  alt={film.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-[#111] flex items-center justify-center">
                  <Film className="w-12 h-12 text-white/20" />
                </div>
              )}
              {film.quality && (
                <span className="absolute top-3 right-3 badge badge-quality font-bold">
                  {film.quality}
                </span>
              )}
            </div>

            <div className="glass-card p-4 rounded-xl space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[var(--color-text-muted)]">Orijinal İsim</span>
                <span className="text-white font-medium text-right line-clamp-1">
                  {film.originalTitle || film.title}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[var(--color-text-muted)]">Çıkış Yılı</span>
                <span className="text-white font-medium">{film.releaseYear || "-"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-[var(--color-text-muted)]">Süre</span>
                <span className="text-white font-medium">{film.durationMinutes ? `${film.durationMinutes} Dk` : "-"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-muted)]">Dil / Dublaj</span>
                <span className="text-white font-medium">{film.language || "Türkçe Dublaj"}</span>
              </div>
            </div>
          </div>

          {/* Sağ Kolon: Açıklama, Türler, Oyuncular */}
          <div className="lg:col-span-3 space-y-6">
            {/* Başlık ve Meta Bilgiler */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {film.genres.map((genre) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white/5 border border-white/10 text-[var(--color-text-secondary)]"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {film.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)] pt-1">
                {film.imdbRating && (
                  <div className="flex items-center gap-1 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{film.imdbRating}</span>
                    <span className="text-xs text-[var(--color-text-muted)] font-normal">/ 10</span>
                  </div>
                )}
                {film.durationMinutes && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span>{film.durationMinutes} dakika</span>
                  </div>
                )}
                {film.releaseYear && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[var(--color-text-muted)]" />
                    <span>{film.releaseYear}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Film Özeti */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
                Film Özeti
              </h3>
              <p className="text-base text-[var(--color-text-secondary)] leading-relaxed font-light">
                {film.description || "Bu film için henüz bir açıklama girilmedi."}
              </p>
            </div>

            {/* Oyuncu Kadrosu */}
            {film.actors && film.actors.length > 0 && (
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-[var(--color-accent)]" />
                  Başrol Oyuncuları
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {film.actors.map((actor, idx) => (
                    <div
                      key={idx}
                      className="glass-card p-3 rounded-xl flex items-center gap-3 border border-white/5 hover:border-white/15 transition-all"
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                        {actor.photoUrl ? (
                          <img
                            src={actor.photoUrl}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-white/40">
                            {actor.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {actor.name}
                        </p>
                        {actor.character && (
                          <p className="text-xs text-[var(--color-text-muted)] truncate">
                            {actor.character}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Önerilen Filmler Satırı */}
        <div className="space-y-4 pt-8 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <span>🍿 Benzer Önerilen Filmler</span>
            </h3>
            <Link
              href="/filmler"
              className="text-xs sm:text-sm text-[var(--color-accent)] hover:underline flex items-center gap-1"
            >
              <span>Tümünü Gör</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {demoPopulerFilmler.slice(0, 6).map((popFilm) => (
              <Link
                key={popFilm.id}
                href={`/filmler/${popFilm.slug}`}
                className="content-card group block"
              >
                <div className="relative aspect-[2/3] overflow-hidden rounded-t-[var(--radius-lg)]">
                  {popFilm.posterUrl && (
                    <img
                      src={popFilm.posterUrl}
                      alt={popFilm.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {popFilm.imdbRating && (
                    <span className="absolute top-2 left-2 badge badge-rating text-[10px]">
                      ★ {popFilm.imdbRating}
                    </span>
                  )}
                </div>
                <div className="p-2.5">
                  <h4 className="text-xs font-semibold text-white truncate group-hover:text-[var(--color-accent)] transition-colors">
                    {popFilm.title}
                  </h4>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {popFilm.releaseYear}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
