import prisma from "@/lib/db";
import {
  getMovieDetail,
  getTvDetail,
  getTvSeasonDetail,
  getPopularMovies,
  getTopRatedMovies,
  getPopularTvShows,
  posterUrl,
  backdropUrl,
  TmdbMovieDetail,
  TmdbTvDetail,
  TmdbCast,
} from "@/lib/tmdb";
import { fallbackMovies, fallbackTvShows } from "@/lib/bot/fallback-data";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Türleri kontrol et ve veritabanına ekle / getir
 */
async function ensureGenres(genres: { id: number; name: string }[]) {
  const genreIds: number[] = [];
  for (const g of genres) {
    const slug = slugify(g.name);
    if (!slug) continue;
    
    // Veritabanında var mı bak
    const existing = await prisma.genre.upsert({
      where: { slug },
      update: { name: g.name },
      create: { name: g.name, slug },
    });
    genreIds.push(existing.id);
  }
  return genreIds;
}

/**
 * Oyuncuları kontrol et ve veritabanına ekle / bağla
 */
async function syncActors(contentId: string, castList: TmdbCast[] = []) {
  // İlk 8 ana oyuncuyu al
  const topCast = castList.slice(0, 8);

  for (let i = 0; i < topCast.length; i++) {
    const actor = topCast[i];
    try {
      // Aktörü upsert et
      const dbActor = await prisma.actor.upsert({
        where: { tmdbId: actor.id },
        update: {
          name: actor.name,
          photoUrl: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null,
        },
        create: {
          name: actor.name,
          tmdbId: actor.id,
          photoUrl: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : null,
        },
      });

      // İçerikle aktörü bağla
      await prisma.contentActor.upsert({
        where: {
          contentId_actorId: {
            contentId,
            actorId: dbActor.id,
          },
        },
        update: {
          characterName: actor.character || null,
          displayOrder: i,
        },
        create: {
          contentId,
          actorId: dbActor.id,
          characterName: actor.character || null,
          displayOrder: i,
        },
      });
    } catch {
      // Bir oyuncuda hata olursa diğerlerine devam et
    }
  }
}

/**
 * Tek bir filmi TMDB ID ile çekip veritabanına senkronize eder
 */
export async function syncMovieById(tmdbId: number) {
  const detail: TmdbMovieDetail = await getMovieDetail(tmdbId);
  const title = detail.title || detail.original_title;
  const slug = `${slugify(title)}-${detail.id}`;

  const releaseYear = detail.release_date ? parseInt(detail.release_date.slice(0, 4)) : undefined;
  const trailer = detail.videos?.results?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );

  // Content kaydını oluştur veya güncelle
  const content = await prisma.content.upsert({
    where: { tmdbId: detail.id },
    update: {
      title,
      originalTitle: detail.original_title,
      slug,
      type: "MOVIE",
      description: detail.overview || "",
      posterUrl: posterUrl(detail.poster_path, "w500"),
      backdropUrl: backdropUrl(detail.backdrop_path, "original"),
      trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      imdbRating: detail.vote_average ? Math.round(detail.vote_average * 10) / 10 : null,
      releaseYear: releaseYear || null,
      durationMinutes: detail.runtime || null,
      country: detail.production_countries?.[0]?.name || null,
      language: detail.spoken_languages?.[0]?.name || "Türkçe Dublaj & Altyazılı",
      quality: "4K Ultra HD",
      status: "ACTIVE",
    },
    create: {
      title,
      originalTitle: detail.original_title,
      slug,
      type: "MOVIE",
      description: detail.overview || "",
      posterUrl: posterUrl(detail.poster_path, "w500"),
      backdropUrl: backdropUrl(detail.backdrop_path, "original"),
      trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      tmdbId: detail.id,
      imdbRating: detail.vote_average ? Math.round(detail.vote_average * 10) / 10 : null,
      releaseYear: releaseYear || null,
      durationMinutes: detail.runtime || null,
      country: detail.production_countries?.[0]?.name || null,
      language: detail.spoken_languages?.[0]?.name || "Türkçe Dublaj & Altyazılı",
      quality: "4K Ultra HD",
      viewCount: Math.floor(detail.popularity * 50) + 120,
      status: "ACTIVE",
    },
  });

  // Türleri bağla
  if (detail.genres && detail.genres.length > 0) {
    const genreDbIds = await ensureGenres(detail.genres);
    for (const genreId of genreDbIds) {
      await prisma.contentGenre.upsert({
        where: {
          contentId_genreId: {
            contentId: content.id,
            genreId,
          },
        },
        update: {},
        create: {
          contentId: content.id,
          genreId,
        },
      });
    }
  }

  // Oyuncuları bağla
  if (detail.credits?.cast) {
    await syncActors(content.id, detail.credits.cast);
  }

  // Standart Stream/Embed Oynatıcı Kaynaklarını otomatik ekle
  const sources = [
    {
      sourceName: "VidSrc Pro HD",
      embedUrl: `https://vidsrc.to/embed/movie/${detail.id}`,
      quality: "1080p Full HD",
      language: "Türkçe Altyazı / Dublaj",
      priority: 1,
    },
    {
      sourceName: "SuperEmbed Ultra",
      embedUrl: `https://multiembed.mov/?video_id=${detail.id}&tmdb=1`,
      quality: "4K Ultra HD",
      language: "Orijinal Dil (Türkçe Altyazılı)",
      priority: 2,
    },
    {
      sourceName: "2Embed Fast",
      embedUrl: `https://www.2embed.cc/embed/${detail.id}`,
      quality: "720p HD",
      language: "Türkçe Altyazılı",
      priority: 3,
    },
  ];

  for (const src of sources) {
    const existing = await prisma.watchSource.findFirst({
      where: {
        contentId: content.id,
        sourceName: src.sourceName,
      },
    });

    if (!existing) {
      await prisma.watchSource.create({
        data: {
          contentId: content.id,
          sourceName: src.sourceName,
          embedUrl: src.embedUrl,
          quality: src.quality,
          language: src.language,
          priority: src.priority,
          isActive: true,
        },
      });
    }
  }

  return content;
}

/**
 * Tek bir diziyi, sezonları ve bölümlerini TMDB ID ile çekip senkronize eder
 */
export async function syncTvById(tmdbId: number, maxSeasons = 3) {
  const detail: TmdbTvDetail = await getTvDetail(tmdbId);
  const title = detail.name || detail.original_name;
  const slug = `${slugify(title)}-${detail.id}`;

  const releaseYear = detail.first_air_date ? parseInt(detail.first_air_date.slice(0, 4)) : undefined;
  const trailer = detail.videos?.results?.find(
    (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
  );

  // Content (SERIES) kaydı oluştur veya güncelle
  const content = await prisma.content.upsert({
    where: { tmdbId: detail.id },
    update: {
      title,
      originalTitle: detail.original_name,
      slug,
      type: "SERIES",
      description: detail.overview || "",
      posterUrl: posterUrl(detail.poster_path, "w500"),
      backdropUrl: backdropUrl(detail.backdrop_path, "original"),
      trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      imdbRating: detail.vote_average ? Math.round(detail.vote_average * 10) / 10 : null,
      releaseYear: releaseYear || null,
      durationMinutes: detail.episode_run_time?.[0] || 45,
      country: detail.production_countries?.[0]?.name || detail.origin_country?.[0] || null,
      language: "Türkçe Dublaj & Altyazılı",
      quality: "1080p Full HD",
      status: "ACTIVE",
    },
    create: {
      title,
      originalTitle: detail.original_name,
      slug,
      type: "SERIES",
      description: detail.overview || "",
      posterUrl: posterUrl(detail.poster_path, "w500"),
      backdropUrl: backdropUrl(detail.backdrop_path, "original"),
      trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      tmdbId: detail.id,
      imdbRating: detail.vote_average ? Math.round(detail.vote_average * 10) / 10 : null,
      releaseYear: releaseYear || null,
      durationMinutes: detail.episode_run_time?.[0] || 45,
      country: detail.production_countries?.[0]?.name || detail.origin_country?.[0] || null,
      language: "Türkçe Dublaj & Altyazılı",
      quality: "1080p Full HD",
      viewCount: Math.floor(detail.popularity * 60) + 200,
      status: "ACTIVE",
    },
  });

  // Türleri bağla
  if (detail.genres && detail.genres.length > 0) {
    const genreDbIds = await ensureGenres(detail.genres);
    for (const genreId of genreDbIds) {
      await prisma.contentGenre.upsert({
        where: {
          contentId_genreId: {
            contentId: content.id,
            genreId,
          },
        },
        update: {},
        create: {
          contentId: content.id,
          genreId,
        },
      });
    }
  }

  // Oyuncuları bağla
  if (detail.credits?.cast) {
    await syncActors(content.id, detail.credits.cast);
  }

  // Sezonları ve Bölümleri çek (Özel bölümler hariç, seasonNumber > 0)
  const regularSeasons = (detail.seasons || [])
    .filter((s) => s.season_number > 0)
    .slice(0, maxSeasons);

  for (const s of regularSeasons) {
    const seasonRecord = await prisma.season.upsert({
      where: {
        contentId_seasonNumber: {
          contentId: content.id,
          seasonNumber: s.season_number,
        },
      },
      update: {
        title: s.name || `${s.season_number}. Sezon`,
        posterUrl: posterUrl(s.poster_path, "w500"),
        episodeCount: s.episode_count,
      },
      create: {
        contentId: content.id,
        seasonNumber: s.season_number,
        title: s.name || `${s.season_number}. Sezon`,
        posterUrl: posterUrl(s.poster_path, "w500"),
        episodeCount: s.episode_count,
      },
    });

    // Sezonun bölümlerini detaylı çek
    try {
      const seasonDetails = await getTvSeasonDetail(detail.id, s.season_number);
      if (seasonDetails.episodes && seasonDetails.episodes.length > 0) {
        for (const ep of seasonDetails.episodes) {
          const episodeRecord = await prisma.episode.upsert({
            where: {
              seasonId_episodeNumber: {
                seasonId: seasonRecord.id,
                episodeNumber: ep.episode_number,
              },
            },
            update: {
              title: ep.name || `${ep.episode_number}. Bölüm`,
              description: ep.overview || null,
              durationMinutes: ep.runtime || 45,
              stillUrl: ep.still_path ? `https://image.tmdb.org/t/p/w780${ep.still_path}` : null,
              airDate: ep.air_date ? new Date(ep.air_date) : null,
            },
            create: {
              seasonId: seasonRecord.id,
              episodeNumber: ep.episode_number,
              title: ep.name || `${ep.episode_number}. Bölüm`,
              description: ep.overview || null,
              durationMinutes: ep.runtime || 45,
              stillUrl: ep.still_path ? `https://image.tmdb.org/t/p/w780${ep.still_path}` : null,
              airDate: ep.air_date ? new Date(ep.air_date) : null,
            },
          });

          // Bölüm için otomatik Stream Embed kaynakları ekle
          const epSources = [
            {
              sourceName: "VidSrc Pro HD",
              embedUrl: `https://vidsrc.to/embed/tv/${detail.id}/${s.season_number}/${ep.episode_number}`,
              quality: "1080p Full HD",
              language: "Türkçe Dublaj & Altyazılı",
              priority: 1,
            },
            {
              sourceName: "SuperEmbed",
              embedUrl: `https://multiembed.mov/?video_id=${detail.id}&tmdb=1&s=${s.season_number}&e=${ep.episode_number}`,
              quality: "1080p HD",
              language: "Türkçe Altyazılı",
              priority: 2,
            },
          ];

          for (const src of epSources) {
            const existingEpSrc = await prisma.watchSource.findFirst({
              where: {
                episodeId: episodeRecord.id,
                sourceName: src.sourceName,
              },
            });

            if (!existingEpSrc) {
              await prisma.watchSource.create({
                data: {
                  contentId: content.id,
                  episodeId: episodeRecord.id,
                  sourceName: src.sourceName,
                  embedUrl: src.embedUrl,
                  quality: src.quality,
                  language: src.language,
                  priority: src.priority,
                  isActive: true,
                },
              });
            }
          }
        }
      }
    } catch (seasonErr) {
      console.error(`Sezon ${s.season_number} bölümleri alınırken hata:`, seasonErr);
    }
  }

  return content;
}

/**
 * API anahtarı olmadığında veya TMDB erişilemezken çalışan yedek senkronizasyon
 */
async function syncFallbackData() {
  console.log("ℹ️ TMDB API anahtarı algılanmadı veya geçersiz. Zengin yerel film ve dizi paketi yükleniyor...");
  let syncedMovies = 0;
  let syncedTv = 0;

  // Filmleri aktar
  for (const m of fallbackMovies) {
    const slug = `${slugify(m.title)}-${m.tmdbId}`;
    const releaseYear = parseInt(m.releaseDate.slice(0, 4));

    const content = await prisma.content.upsert({
      where: { tmdbId: m.tmdbId },
      update: {
        title: m.title,
        originalTitle: m.originalTitle,
        slug,
        type: "MOVIE",
        description: m.overview,
        posterUrl: `https://image.tmdb.org/t/p/w500${m.posterPath}`,
        backdropUrl: `https://image.tmdb.org/t/p/original${m.backdropPath}`,
        imdbRating: m.voteAverage,
        releaseYear,
        durationMinutes: m.runtime,
        quality: "4K Ultra HD",
        language: "Türkçe Dublaj & Altyazılı",
        status: "ACTIVE",
      },
      create: {
        title: m.title,
        originalTitle: m.originalTitle,
        slug,
        type: "MOVIE",
        description: m.overview,
        posterUrl: `https://image.tmdb.org/t/p/w500${m.posterPath}`,
        backdropUrl: `https://image.tmdb.org/t/p/original${m.backdropPath}`,
        tmdbId: m.tmdbId,
        imdbRating: m.voteAverage,
        releaseYear,
        durationMinutes: m.runtime,
        quality: "4K Ultra HD",
        language: "Türkçe Dublaj & Altyazılı",
        viewCount: 1540,
        status: "ACTIVE",
      },
    });

    // Türler
    const genreDbIds = await ensureGenres(m.genres);
    for (const genreId of genreDbIds) {
      await prisma.contentGenre.upsert({
        where: { contentId_genreId: { contentId: content.id, genreId } },
        update: {},
        create: { contentId: content.id, genreId },
      });
    }

    // Oyuncular
    for (let i = 0; i < m.actors.length; i++) {
      const act = m.actors[i];
      const dbActor = await prisma.actor.upsert({
        where: { tmdbId: act.id },
        update: { name: act.name, photoUrl: `https://image.tmdb.org/t/p/w185${act.photo}` },
        create: { name: act.name, tmdbId: act.id, photoUrl: `https://image.tmdb.org/t/p/w185${act.photo}` },
      });
      await prisma.contentActor.upsert({
        where: { contentId_actorId: { contentId: content.id, actorId: dbActor.id } },
        update: { characterName: act.character, displayOrder: i },
        create: { contentId: content.id, actorId: dbActor.id, characterName: act.character, displayOrder: i },
      });
    }

    // İzleme Kaynağı
    const defaultSrc = {
      sourceName: "VidSrc Pro HD",
      embedUrl: `https://vidsrc.to/embed/movie/${m.tmdbId}`,
      quality: "1080p Full HD",
      language: "Türkçe Altyazı & Dublaj",
    };
    const existingSrc = await prisma.watchSource.findFirst({
      where: { contentId: content.id, sourceName: defaultSrc.sourceName },
    });
    if (!existingSrc) {
      await prisma.watchSource.create({
        data: {
          contentId: content.id,
          sourceName: defaultSrc.sourceName,
          embedUrl: defaultSrc.embedUrl,
          quality: defaultSrc.quality,
          language: defaultSrc.language,
          priority: 1,
          isActive: true,
        },
      });
    }

    syncedMovies++;
  }

  // Dizileri aktar
  for (const tv of fallbackTvShows) {
    const slug = `${slugify(tv.title)}-${tv.tmdbId}`;
    const releaseYear = parseInt(tv.firstAirDate.slice(0, 4));

    const content = await prisma.content.upsert({
      where: { tmdbId: tv.tmdbId },
      update: {
        title: tv.title,
        originalTitle: tv.originalTitle,
        slug,
        type: "SERIES",
        description: tv.overview,
        posterUrl: `https://image.tmdb.org/t/p/w500${tv.posterPath}`,
        backdropUrl: `https://image.tmdb.org/t/p/original${tv.backdropPath}`,
        imdbRating: tv.voteAverage,
        releaseYear,
        quality: "1080p Full HD",
        language: "Türkçe Dublaj & Altyazılı",
        status: "ACTIVE",
      },
      create: {
        title: tv.title,
        originalTitle: tv.originalTitle,
        slug,
        type: "SERIES",
        description: tv.overview,
        posterUrl: `https://image.tmdb.org/t/p/w500${tv.posterPath}`,
        backdropUrl: `https://image.tmdb.org/t/p/original${tv.backdropPath}`,
        tmdbId: tv.tmdbId,
        imdbRating: tv.voteAverage,
        releaseYear,
        quality: "1080p Full HD",
        language: "Türkçe Dublaj & Altyazılı",
        viewCount: 2300,
        status: "ACTIVE",
      },
    });

    // Türler
    const genreDbIds = await ensureGenres(tv.genres);
    for (const genreId of genreDbIds) {
      await prisma.contentGenre.upsert({
        where: { contentId_genreId: { contentId: content.id, genreId } },
        update: {},
        create: { contentId: content.id, genreId },
      });
    }

    // Sezonlar ve Bölümler
    for (const s of tv.seasons) {
      const season = await prisma.season.upsert({
        where: { contentId_seasonNumber: { contentId: content.id, seasonNumber: s.seasonNumber } },
        update: { title: s.title, episodeCount: s.episodes.length },
        create: { contentId: content.id, seasonNumber: s.seasonNumber, title: s.title, episodeCount: s.episodes.length },
      });

      for (const ep of s.episodes) {
        const episode = await prisma.episode.upsert({
          where: { seasonId_episodeNumber: { seasonId: season.id, episodeNumber: ep.episodeNumber } },
          update: { title: ep.title, description: ep.overview, durationMinutes: ep.duration },
          create: { seasonId: season.id, episodeNumber: ep.episodeNumber, title: ep.title, description: ep.overview, durationMinutes: ep.duration },
        });

        // Bölüm izleme kaynağı
        const epSrc = {
          sourceName: "VidSrc Pro HD",
          embedUrl: `https://vidsrc.to/embed/tv/${tv.tmdbId}/${s.seasonNumber}/${ep.episodeNumber}`,
          quality: "1080p Full HD",
        };
        const existEpSrc = await prisma.watchSource.findFirst({
          where: { episodeId: episode.id, sourceName: epSrc.sourceName },
        });
        if (!existEpSrc) {
          await prisma.watchSource.create({
            data: {
              contentId: content.id,
              episodeId: episode.id,
              sourceName: epSrc.sourceName,
              embedUrl: epSrc.embedUrl,
              quality: epSrc.quality,
              language: "Türkçe Dublaj & Altyazılı",
              priority: 1,
              isActive: true,
            },
          });
        }
      }
    }

    syncedTv++;
  }

  return { syncedMovies, syncedTv };
}

/**
 * Toplu Otomasyon Botu Çalıştırıcısı
 */
export async function runTmdbSyncBot(options: {
  moviesCount?: number;
  tvCount?: number;
  maxSeasonsPerTv?: number;
} = {}) {
  const { moviesCount = 10, tvCount = 8, maxSeasonsPerTv = 2 } = options;

  const results = {
    syncedMovies: 0,
    syncedTv: 0,
    errors: [] as string[],
    isFallback: false,
  };

  const apiKey = process.env.TMDB_API_KEY;
  const isInvalidKey = !apiKey || apiKey === "your-tmdb-api-key" || apiKey.trim() === "";

  if (isInvalidKey) {
    console.log("⚠️ Geçerli bir TMDB_API_KEY bulunamadı. Fallback veri paketi yükleniyor...");
    const fallbackRes = await syncFallbackData();
    results.syncedMovies = fallbackRes.syncedMovies;
    results.syncedTv = fallbackRes.syncedTv;
    results.isFallback = true;
    return results;
  }

  console.log("🚀 Canlı TMDB API Botu Başlatılıyor...");

  // 1. Popüler & Vizyondaki Filmleri Çek
  try {
    const popularMoviesData = await getPopularMovies(1);
    const movies = popularMoviesData.results.slice(0, moviesCount);

    for (const movie of movies) {
      try {
        console.log(`🎬 Film Senkronize Ediliyor: ${movie.title} (ID: ${movie.id})`);
        await syncMovieById(movie.id);
        results.syncedMovies++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        results.errors.push(`Film (ID: ${movie.id}) hatası: ${message}`);
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    results.errors.push(`Popüler filmler listesi alınamadı: ${message}`);
    // Canlı TMDB başarısız olursa güvenli fallback uygula
    const fallbackRes = await syncFallbackData();
    results.syncedMovies += fallbackRes.syncedMovies;
    results.syncedTv += fallbackRes.syncedTv;
    results.isFallback = true;
    return results;
  }

  // 2. Popüler Dizileri Çek
  try {
    const popularTvData = await getPopularTvShows(1);
    const tvShows = popularTvData.results.slice(0, tvCount);

    for (const tv of tvShows) {
      try {
        console.log(`📺 Dizi Senkronize Ediliyor: ${tv.name} (ID: ${tv.id})`);
        await syncTvById(tv.id, maxSeasonsPerTv);
        results.syncedTv++;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        results.errors.push(`Dizi (ID: ${tv.id}) hatası: ${message}`);
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    results.errors.push(`Popüler diziler listesi alınamadı: ${message}`);
  }

  console.log("✅ TMDB Botu İşlemi Tamamlandı!");
  return results;
}

