// TMDB API İstemcisi
// Dokümantasyon: https://developer.themoviedb.org/reference

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.TMDB_API_KEY || "";
const TMDB_IMAGE = "https://image.tmdb.org/t/p";

// ─── Yardımcı ───────────────────────────────────────

function tmdbUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", TMDB_API_KEY);
  url.searchParams.set("language", "tr-TR");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const res = await fetch(tmdbUrl(path, params), {
    next: { revalidate: 3600 }, // 1 saat önbellek
  });
  if (!res.ok) {
    throw new Error(`TMDB API hatası: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

// ─── Görsel URL Yardımcıları ────────────────────────

export function posterUrl(path: string | null, size: "w185" | "w342" | "w500" | "w780" | "original" = "w500"): string {
  if (!path) return "";
  return `${TMDB_IMAGE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size: "w780" | "w1280" | "original" = "original"): string {
  if (!path) return "";
  return `${TMDB_IMAGE}/${size}${path}`;
}

export function profileUrl(path: string | null, size: "w45" | "w185" | "h632" | "original" = "w185"): string {
  if (!path) return "";
  return `${TMDB_IMAGE}/${size}${path}`;
}

// ─── TMDB Tip Tanımları ─────────────────────────────

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  adult: boolean;
  runtime?: number;
}

export interface TmdbTv {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  origin_country: string[];
  episode_run_time?: number[];
  number_of_seasons?: number;
}

export interface TmdbMovieDetail extends TmdbMovie {
  runtime: number;
  genres: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  spoken_languages: { iso_639_1: string; name: string }[];
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
  imdb_id: string | null;
  videos?: { results: TmdbVideo[] };
  credits?: { cast: TmdbCast[]; crew: TmdbCrew[] };
}

export interface TmdbTvDetail extends TmdbTv {
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  production_countries: { iso_3166_1: string; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: TmdbSeason[];
  status: string;
  tagline: string;
  created_by: { id: number; name: string; profile_path: string | null }[];
  networks: { id: number; name: string; logo_path: string | null }[];
  videos?: { results: TmdbVideo[] };
  credits?: { cast: TmdbCast[]; crew: TmdbCrew[] };
}

export interface TmdbSeason {
  id: number;
  season_number: number;
  name: string;
  overview: string;
  poster_path: string | null;
  episode_count: number;
  air_date: string | null;
}

export interface TmdbSeasonDetail extends TmdbSeason {
  episodes: TmdbEpisode[];
}

export interface TmdbEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string;
  runtime: number | null;
  vote_average: number;
  season_number: number;
}

export interface TmdbCast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
  known_for_department: string;
}

export interface TmdbCrew {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TmdbVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface TmdbGenre {
  id: number;
  name: string;
}

interface TmdbPagedResponse<T> {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
}

// ─── FİLM FONKSİYONLARI ────────────────────────────

/** Popüler filmler */
export async function getPopularMovies(page = 1): Promise<TmdbPagedResponse<TmdbMovie>> {
  return tmdbFetch(`/movie/popular`, { page: String(page) });
}

/** En çok puan alan filmler */
export async function getTopRatedMovies(page = 1): Promise<TmdbPagedResponse<TmdbMovie>> {
  return tmdbFetch(`/movie/top_rated`, { page: String(page) });
}

/** Vizyondaki filmler */
export async function getNowPlayingMovies(page = 1): Promise<TmdbPagedResponse<TmdbMovie>> {
  return tmdbFetch(`/movie/now_playing`, { page: String(page) });
}

/** Yakında gelecek filmler */
export async function getUpcomingMovies(page = 1): Promise<TmdbPagedResponse<TmdbMovie>> {
  return tmdbFetch(`/movie/upcoming`, { page: String(page) });
}

/** Film detayı (videolar + oyuncular dahil) */
export async function getMovieDetail(id: number): Promise<TmdbMovieDetail> {
  return tmdbFetch(`/movie/${id}`, { append_to_response: "videos,credits" });
}

/** Benzer filmler */
export async function getSimilarMovies(id: number): Promise<TmdbPagedResponse<TmdbMovie>> {
  return tmdbFetch(`/movie/${id}/similar`);
}

// ─── DİZİ FONKSİYONLARI ────────────────────────────

/** Popüler diziler */
export async function getPopularTvShows(page = 1): Promise<TmdbPagedResponse<TmdbTv>> {
  return tmdbFetch(`/tv/popular`, { page: String(page) });
}

/** En çok puan alan diziler */
export async function getTopRatedTvShows(page = 1): Promise<TmdbPagedResponse<TmdbTv>> {
  return tmdbFetch(`/tv/top_rated`, { page: String(page) });
}

/** Şu an yayınlanan diziler */
export async function getOnTheAirTvShows(page = 1): Promise<TmdbPagedResponse<TmdbTv>> {
  return tmdbFetch(`/tv/on_the_air`, { page: String(page) });
}

/** Dizi detayı (videolar + oyuncular dahil) */
export async function getTvDetail(id: number): Promise<TmdbTvDetail> {
  return tmdbFetch(`/tv/${id}`, { append_to_response: "videos,credits" });
}

/** Dizi sezon detayı (bölüm listesi) */
export async function getTvSeasonDetail(tvId: number, seasonNumber: number): Promise<TmdbSeasonDetail> {
  return tmdbFetch(`/tv/${tvId}/season/${seasonNumber}`);
}

/** Benzer diziler */
export async function getSimilarTvShows(id: number): Promise<TmdbPagedResponse<TmdbTv>> {
  return tmdbFetch(`/tv/${id}/similar`);
}

// ─── TREND & KEŞFET ─────────────────────────────────

/** Trend içerikler (film + dizi) */
export async function getTrending(
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "week"
): Promise<TmdbPagedResponse<TmdbMovie & TmdbTv & { media_type: "movie" | "tv" }>> {
  return tmdbFetch(`/trending/${mediaType}/${timeWindow}`);
}

/** Türe göre filmleri keşfet */
export async function discoverMovies(params: Record<string, string> = {}): Promise<TmdbPagedResponse<TmdbMovie>> {
  return tmdbFetch(`/discover/movie`, params);
}

/** Türe göre dizileri keşfet */
export async function discoverTvShows(params: Record<string, string> = {}): Promise<TmdbPagedResponse<TmdbTv>> {
  return tmdbFetch(`/discover/tv`, params);
}

// ─── ARAMA ──────────────────────────────────────────

/** Çoklu arama (film + dizi + kişi) */
export async function searchMulti(query: string, page = 1): Promise<TmdbPagedResponse<(TmdbMovie | TmdbTv) & { media_type: string }>> {
  return tmdbFetch(`/search/multi`, { query, page: String(page) });
}

/** Film arama */
export async function searchMovies(query: string, page = 1): Promise<TmdbPagedResponse<TmdbMovie>> {
  return tmdbFetch(`/search/movie`, { query, page: String(page) });
}

/** Dizi arama */
export async function searchTvShows(query: string, page = 1): Promise<TmdbPagedResponse<TmdbTv>> {
  return tmdbFetch(`/search/tv`, { query, page: String(page) });
}

// ─── TÜRLER ─────────────────────────────────────────

/** Film türleri */
export async function getMovieGenres(): Promise<{ genres: TmdbGenre[] }> {
  return tmdbFetch(`/genre/movie/list`);
}

/** Dizi türleri */
export async function getTvGenres(): Promise<{ genres: TmdbGenre[] }> {
  return tmdbFetch(`/genre/tv/list`);
}

// ─── DÖNÜŞTÜRÜCÜLER (TMDB → İç format) ─────────────

import type { ContentCard, Genre } from "@/types/content";

/** TMDB tür ID'lerini isimlerle eşleştir */
const GENRE_MAP: Record<number, { name: string; slug: string }> = {
  28: { name: "Aksiyon", slug: "aksiyon" },
  12: { name: "Macera", slug: "macera" },
  16: { name: "Animasyon", slug: "animasyon" },
  35: { name: "Komedi", slug: "komedi" },
  80: { name: "Suç", slug: "suc" },
  99: { name: "Belgesel", slug: "belgesel" },
  18: { name: "Drama", slug: "drama" },
  10751: { name: "Aile", slug: "aile" },
  14: { name: "Fantastik", slug: "fantastik" },
  36: { name: "Tarih", slug: "tarih" },
  27: { name: "Korku", slug: "korku" },
  10402: { name: "Müzik", slug: "muzik" },
  9648: { name: "Gizem", slug: "gizem" },
  10749: { name: "Romantik", slug: "romantik" },
  878: { name: "Bilim Kurgu", slug: "bilim-kurgu" },
  10770: { name: "TV Film", slug: "tv-film" },
  53: { name: "Gerilim", slug: "gerilim" },
  10752: { name: "Savaş", slug: "savas" },
  37: { name: "Vahşi Batı", slug: "vahsi-bati" },
  // TV türleri
  10759: { name: "Aksiyon & Macera", slug: "aksiyon-macera" },
  10762: { name: "Çocuk", slug: "cocuk" },
  10763: { name: "Haber", slug: "haber" },
  10764: { name: "Reality", slug: "reality" },
  10765: { name: "Bilim Kurgu & Fantastik", slug: "bilim-kurgu-fantastik" },
  10766: { name: "Pembe Dizi", slug: "pembe-dizi" },
  10767: { name: "Talk Show", slug: "talk-show" },
  10768: { name: "Savaş & Politik", slug: "savas-politik" },
};

function mapGenreIds(ids: number[]): Genre[] {
  return ids
    .map((id) => {
      const genre = GENRE_MAP[id];
      if (!genre) return null;
      return { id, name: genre.name, slug: genre.slug };
    })
    .filter(Boolean) as Genre[];
}

function createSlug(title: string): string {
  return title
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

/** TMDB Film → İç ContentCard formatı */
export function tmdbMovieToCard(movie: TmdbMovie): ContentCard {
  return {
    id: `movie-${movie.id}`,
    title: movie.title || movie.original_title,
    originalTitle: movie.original_title,
    slug: `${createSlug(movie.original_title || movie.title)}-${movie.id}`,
    type: "MOVIE",
    description: movie.overview || undefined,
    posterUrl: posterUrl(movie.poster_path),
    backdropUrl: backdropUrl(movie.backdrop_path),
    tmdbId: movie.id,
    imdbRating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : undefined,
    releaseYear: movie.release_date ? parseInt(movie.release_date.slice(0, 4)) : undefined,
    durationMinutes: movie.runtime || undefined,
    country: undefined,
    language: movie.original_language === "en" ? "İngilizce" : movie.original_language,
    quality: "HD",
    viewCount: Math.floor(movie.popularity * 100),
    status: "ACTIVE",
    genres: mapGenreIds(movie.genre_ids || []),
  };
}

/** TMDB Dizi → İç ContentCard formatı */
export function tmdbTvToCard(tv: TmdbTv): ContentCard {
  return {
    id: `tv-${tv.id}`,
    title: tv.name || tv.original_name,
    originalTitle: tv.original_name,
    slug: `${createSlug(tv.original_name || tv.name)}-${tv.id}`,
    type: "SERIES",
    description: tv.overview || undefined,
    posterUrl: posterUrl(tv.poster_path),
    backdropUrl: backdropUrl(tv.backdrop_path),
    tmdbId: tv.id,
    imdbRating: tv.vote_average ? Math.round(tv.vote_average * 10) / 10 : undefined,
    releaseYear: tv.first_air_date ? parseInt(tv.first_air_date.slice(0, 4)) : undefined,
    durationMinutes: tv.episode_run_time?.[0] || undefined,
    country: tv.origin_country?.[0] || undefined,
    language: tv.original_language === "en" ? "İngilizce" : tv.original_language,
    quality: "HD",
    viewCount: Math.floor(tv.popularity * 100),
    status: "ACTIVE",
    genres: mapGenreIds(tv.genre_ids || []),
  };
}

/** TMDB trend sonuçlarını ContentCard'a dönüştür */
export function tmdbTrendToCards(
  results: (TmdbMovie & TmdbTv & { media_type: "movie" | "tv" })[]
): ContentCard[] {
  return results
    .filter((r) => r.media_type === "movie" || r.media_type === "tv")
    .map((r) => {
      if (r.media_type === "movie") {
        return tmdbMovieToCard(r as TmdbMovie);
      }
      return tmdbTvToCard(r as TmdbTv);
    });
}
