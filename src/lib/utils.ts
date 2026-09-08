import { type ClassValue, clsx } from "clsx";

/** Sınıf isimlerini birleştir */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** Slug oluştur */
export function createSlug(text: string): string {
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

/** TMDB görsel URL'i oluştur */
export function tmdbImageUrl(
  path: string | null | undefined,
  size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500"
): string {
  if (!path) return "/images/placeholder-poster.jpg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}

/** Süreyi saat:dakika formatına çevir */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}dk`;
  return `${hours}sa ${mins}dk`;
}

/** Tarihi Türkçe formatla */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Sayıyı kısalt (1200 → 1.2K) */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

/** IMDB puanı rengi */
export function ratingColor(rating: number): string {
  if (rating >= 8) return "text-emerald-400";
  if (rating >= 6) return "text-yellow-400";
  if (rating >= 4) return "text-orange-400";
  return "text-red-400";
}

/** Metni kısalt */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}
