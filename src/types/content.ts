// ─── İçerik Tipleri ─────────────────────────────────

export type ContentType = "MOVIE" | "SERIES";
export type ContentStatus = "ACTIVE" | "DRAFT" | "REMOVED";

export interface ContentBase {
  id: string;
  title: string;
  originalTitle?: string;
  slug: string;
  type: ContentType;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  tmdbId?: number;
  imdbRating?: number;
  releaseYear?: number;
  durationMinutes?: number;
  country?: string;
  language?: string;
  quality?: string;
  viewCount: number;
  status: ContentStatus;
}

export interface Genre {
  id: number;
  name: string;
  slug: string;
}

export interface Season {
  id: string;
  contentId: string;
  seasonNumber: number;
  title?: string;
  posterUrl?: string;
  episodeCount: number;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  seasonId: string;
  episodeNumber: number;
  title?: string;
  description?: string;
  durationMinutes?: number;
  stillUrl?: string;
  airDate?: string;
}

export interface WatchSource {
  id: string;
  sourceName: string;
  embedUrl: string;
  quality: string;
  language: string;
  priority: number;
  isActive: boolean;
}

export interface Subtitle {
  id: string;
  language: string;
  label: string;
  fileUrl: string;
  format: "VTT" | "SRT";
}

export interface Actor {
  id: string;
  name: string;
  photoUrl?: string;
  characterName?: string;
  displayOrder?: number;
}

export interface ContentDetail extends ContentBase {
  genres: Genre[];
  seasons?: Season[];
  sources?: WatchSource[];
  subtitles?: Subtitle[];
  actors?: Actor[];
}

export interface ContentCard extends ContentBase {
  genres: Genre[];
}

// ─── Kullanıcı Tipleri ──────────────────────────────

export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

// ─── Yorum Tipleri ──────────────────────────────────

export interface Comment {
  id: string;
  userId: string;
  contentId: string;
  episodeId?: string;
  parentId?: string;
  body: string;
  likes: number;
  createdAt: string;
  user: {
    username: string;
    avatarUrl?: string;
  };
  replies?: Comment[];
}

// ─── İzleme Geçmişi ────────────────────────────────

export interface WatchHistoryItem {
  id: string;
  contentId: string;
  episodeId?: string;
  progressSeconds: number;
  totalSeconds: number;
  watchedAt: string;
  content: ContentBase;
  episode?: Episode;
}

// ─── API Response ───────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
