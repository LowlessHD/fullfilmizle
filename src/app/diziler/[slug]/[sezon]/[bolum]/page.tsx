import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/db";
import VideoPlayerView from "@/components/player/VideoPlayerView";
import { PlayerSource } from "@/components/player/SourceSelector";
import { demoHeroItems, demoTrendDiziler } from "@/lib/demo-data";
import { fallbackTvShows } from "@/lib/bot/fallback-data";
import {
  ChevronLeft,
  ChevronRight,
  List,
  Sparkles,
  Tv,
  Calendar,
  Clock,
  ArrowLeft,
} from "lucide-react";

interface Props {
  params: Promise<{
    slug: string;
    sezon: string;
    bolum: string;
  }>;
}

async function getEpisodeData(slug: string, sezonNum: number, bolumNum: number) {
  try {
    // 1. Prisma Veritabanında Diziyi Ara
    const dbSeries = await prisma.content.findFirst({
      where: {
        slug,
        type: "SERIES",
      },
      include: {
        seasons: {
          include: {
            episodes: {
              include: {
                sources: {
                  where: { isActive: true },
                  orderBy: { priority: "asc" },
                },
              },
              orderBy: { episodeNumber: "asc" },
            },
          },
          orderBy: { seasonNumber: "asc" },
        },
      },
    });

    if (dbSeries) {
      const season = dbSeries.seasons.find((s) => s.seasonNumber === sezonNum);
      const episode = season?.episodes.find((e) => e.episodeNumber === bolumNum);

      if (episode) {
        // Sonraki ve önceki bölüm durumları
        const currentSeasonEpisodes = season?.episodes || [];
        const prevEp = currentSeasonEpisodes.find((e) => e.episodeNumber === bolumNum - 1);
        const nextEp = currentSeasonEpisodes.find((e) => e.episodeNumber === bolumNum + 1);

        const sources: PlayerSource[] = episode.sources.length > 0
          ? episode.sources.map((s) => ({
              id: s.id,
              sourceName: s.sourceName,
              embedUrl: s.embedUrl,
              quality: s.quality,
              language: s.language,
              priority: s.priority,
            }))
          : [
              {
                id: "vidsrc-auto",
                sourceName: "VidSrc Pro HD",
                embedUrl: `https://vidsrc.to/embed/tv/${dbSeries.tmdbId || 1396}/${sezonNum}/${bolumNum}`,
                quality: "1080p Full HD",
                language: "Türkçe Dublaj & Altyazılı",
                priority: 1,
              },
              {
                id: "superembed-auto",
                sourceName: "SuperEmbed",
                embedUrl: `https://multiembed.mov/?video_id=${dbSeries.tmdbId || 1396}&tmdb=1&s=${sezonNum}&e=${bolumNum}`,
                quality: "1080p",
                language: "Türkçe Altyazılı",
                priority: 2,
              },
            ];

        return {
          seriesTitle: dbSeries.title,
          seriesSlug: dbSeries.slug,
          seriesPoster: dbSeries.posterUrl,
          seriesBackdrop: dbSeries.backdropUrl,
          seasonNumber: sezonNum,
          episodeNumber: bolumNum,
          episodeTitle: episode.title || `${bolumNum}. Bölüm`,
          episodeDescription: episode.description,
          durationMinutes: episode.durationMinutes || 45,
          stillUrl: episode.stillUrl || dbSeries.backdropUrl,
          sources,
          allEpisodes: currentSeasonEpisodes.map((e) => ({
            number: e.episodeNumber,
            title: e.title,
            duration: e.durationMinutes,
          })),
          hasPrev: !!prevEp,
          hasNext: !!nextEp,
        };
      }
    }
  } catch (err) {
    console.error("Dizi bölümü veritabanından çekilirken hata:", err);
  }

  // 2. Fallback Dizi Havuzunda Ara
  const fallback = fallbackTvShows.find(
    (t) =>
      `${t.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${t.tmdbId}` === slug ||
      slug.includes(String(t.tmdbId))
  );

  if (fallback) {
    const season = fallback.seasons.find((s) => s.seasonNumber === sezonNum) || fallback.seasons[0];
    const episode = season?.episodes.find((e) => e.episodeNumber === bolumNum) || season?.episodes[0];

    const sources: PlayerSource[] = [
      {
        id: "fb-vidsrc",
        sourceName: "VidSrc Pro HD",
        embedUrl: `https://vidsrc.to/embed/tv/${fallback.tmdbId}/${sezonNum}/${bolumNum}`,
        quality: "1080p Full HD",
        language: "Türkçe Dublaj & Altyazılı",
        priority: 1,
      },
      {
        id: "fb-superembed",
        sourceName: "SuperEmbed Ultra",
        embedUrl: `https://multiembed.mov/?video_id=${fallback.tmdbId}&tmdb=1&s=${sezonNum}&e=${bolumNum}`,
        quality: "1080p HD",
        language: "Türkçe Altyazılı",
        priority: 2,
      },
    ];

    const totalEpisodes = season?.episodes.length || 10;

    return {
      seriesTitle: fallback.title,
      seriesSlug: slug,
      seriesPoster: `https://image.tmdb.org/t/p/w500${fallback.posterPath}`,
      seriesBackdrop: `https://image.tmdb.org/t/p/original${fallback.backdropPath}`,
      seasonNumber: sezonNum,
      episodeNumber: bolumNum,
      episodeTitle: episode?.title || `${bolumNum}. Bölüm`,
      episodeDescription: episode?.overview || fallback.overview,
      durationMinutes: episode?.duration || 48,
      stillUrl: `https://image.tmdb.org/t/p/original${fallback.backdropPath}`,
      sources,
      allEpisodes: (season?.episodes || []).map((e) => ({
        number: e.episodeNumber,
        title: e.title,
        duration: e.duration,
      })),
      hasPrev: bolumNum > 1,
      hasNext: bolumNum < totalEpisodes,
    };
  }

  // 3. Demo Verilerde Ara
  const demoItem = [...demoHeroItems, ...demoTrendDiziler].find(
    (c) => c.slug === slug && c.type === "SERIES"
  ) || demoTrendDiziler[0];

  if (demoItem) {
    return {
      seriesTitle: demoItem.title,
      seriesSlug: demoItem.slug,
      seriesPoster: demoItem.posterUrl,
      seriesBackdrop: demoItem.backdropUrl,
      seasonNumber: sezonNum,
      episodeNumber: bolumNum,
      episodeTitle: `${sezonNum}. Sezon ${bolumNum}. Bölüm`,
      episodeDescription: demoItem.description,
      durationMinutes: 50,
      stillUrl: demoItem.backdropUrl,
      sources: [
        {
          id: "demo-src-tv",
          sourceName: "VidSrc HD",
          embedUrl: `https://vidsrc.to/embed/tv/${demoItem.tmdbId || 1396}/${sezonNum}/${bolumNum}`,
          quality: "1080p",
          language: "Türkçe Dublaj",
          priority: 1,
        },
      ],
      allEpisodes: Array.from({ length: 8 }, (_, i) => ({
        number: i + 1,
        title: `${i + 1}. Bölüm`,
        duration: 50,
      })),
      hasPrev: bolumNum > 1,
      hasNext: bolumNum < 8,
    };
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const sezonNum = parseInt(resolvedParams.sezon, 10) || 1;
  const bolumNum = parseInt(resolvedParams.bolum, 10) || 1;
  const epData = await getEpisodeData(resolvedParams.slug, sezonNum, bolumNum);

  if (!epData) {
    return {
      title: "Bölüm Bulunamadı",
    };
  }

  return {
    title: `${epData.seriesTitle} ${sezonNum}. Sezon ${bolumNum}. Bölüm Full HD İzle`,
    description: `${epData.seriesTitle} ${sezonNum}. Sezon ${bolumNum}. Bölümünü kesintisiz, 1080p Full HD kalitede Türkçe Dublaj ve Altyazı ile izleyin.`,
  };
}

export default async function EpisodeWatchPage({ params }: Props) {
  const resolvedParams = await params;
  const sezonNum = parseInt(resolvedParams.sezon, 10) || 1;
  const bolumNum = parseInt(resolvedParams.bolum, 10) || 1;

  const data = await getEpisodeData(resolvedParams.slug, sezonNum, bolumNum);

  if (!data) {
    notFound();
  }

  const prevUrl = `/diziler/${data.seriesSlug}/${data.seasonNumber}/${data.episodeNumber - 1}`;
  const nextUrl = `/diziler/${data.seriesSlug}/${data.seasonNumber}/${data.episodeNumber + 1}`;

  return (
    <div className="min-h-screen bg-black pt-16 pb-20 space-y-6">
      {/* Üst Diziye Dönüş Linki */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-3 flex items-center justify-between">
        <Link
          href={`/diziler/${data.seriesSlug}`}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{data.seriesTitle} Tüm Sezonlar</span>
        </Link>

        <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white">
          {data.seasonNumber}. Sezon • {data.episodeNumber}. Bölüm
        </span>
      </div>

      {/* 1. Video Oynatıcı Bölümü */}
      <section className="w-full">
        <VideoPlayerView
          title={`${data.seriesTitle} - S${data.seasonNumber}E${data.episodeNumber}: ${data.episodeTitle}`}
          poster={data.stillUrl || data.seriesBackdrop}
          sources={data.sources}
        />
      </section>

      {/* 2. Bölüm Kontrolleri: Önceki / Sonraki Bölüm Butonları */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl glass-card">
          {/* Önceki Bölüm */}
          {data.hasPrev ? (
            <Link
              href={prevUrl}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10 transition-all hover:border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Önceki Bölüm</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 text-white/30 text-sm font-medium cursor-not-allowed border border-white/5">
              <ChevronLeft className="w-4 h-4" />
              <span>İlk Bölüm</span>
            </div>
          )}

          {/* Dizi & Bölüm Başlığı */}
          <div className="text-center hidden sm:block">
            <p className="text-sm font-bold text-white truncate max-w-md">
              {data.seriesTitle}: {data.episodeTitle}
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {data.seasonNumber}. Sezon • {data.episodeNumber}. Bölüm
            </p>
          </div>

          {/* Sonraki Bölüm */}
          {data.hasNext ? (
            <Link
              href={nextUrl}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-accent)] hover:brightness-110 text-white text-sm font-semibold shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all"
            >
              <span>Sonraki Bölüm</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <Link
              href={`/diziler/${data.seriesSlug}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium border border-white/10 transition-all"
            >
              <span>Sezon Bitti</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* 3. Bölüm Detayları ve Sezonun Diğer Bölümleri */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-8">
        {/* Bölüm Başlığı ve Özeti */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-[var(--color-accent-muted)] text-[var(--color-accent)]">
              {data.seasonNumber}. Sezon
            </span>
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-white/10 text-white">
              {data.episodeNumber}. Bölüm
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {data.episodeTitle}
          </h1>

          <div className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              {data.durationMinutes} dakika
            </span>
            <span className="flex items-center gap-1">
              <Tv className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              1080p Full HD
            </span>
          </div>

          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-3xl pt-2">
            {data.episodeDescription || "Bu bölüm için henüz detaylı bir açıklama bulunmuyor."}
          </p>
        </div>

        {/* 4. Bu Sezonun Bölümleri Grid/Listesi */}
        <div className="space-y-4 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <List className="w-5 h-5 text-[var(--color-accent)]" />
              <span>{data.seasonNumber}. Sezon Bölümleri</span>
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">
              {data.allEpisodes.length} Bölüm
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {data.allEpisodes.map((ep) => {
              const isCurrent = ep.number === data.episodeNumber;
              return (
                <Link
                  key={ep.number}
                  href={`/diziler/${data.seriesSlug}/${data.seasonNumber}/${ep.number}`}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? "bg-[var(--color-accent-muted)] border-[var(--color-accent)] text-white shadow-[0_0_15px_rgba(229,9,20,0.2)]"
                      : "glass-card border-white/5 hover:border-white/15 text-[var(--color-text-secondary)] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isCurrent
                          ? "bg-[var(--color-accent)] text-white"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {ep.number}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {ep.title || `${ep.number}. Bölüm`}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        {ep.duration ? `${ep.duration} dk` : "45 dk"}
                      </p>
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-bold text-[var(--color-accent)] uppercase tracking-wider bg-[var(--color-accent)]/10 px-2 py-0.5 rounded">
                      Şimdi İzleniyor
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
