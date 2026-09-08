"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Play, Clock } from "lucide-react";
import { formatDuration, truncate } from "@/lib/utils";
import type { ContentCard as ContentCardType } from "@/types/content";

interface ContentCardProps {
  content: ContentCardType;
  index?: number;
}

export default function ContentCard({ content, index = 0 }: ContentCardProps) {
  const href =
    content.type === "SERIES"
      ? `/diziler/${content.slug}`
      : `/filmler/${content.slug}`;

  return (
    <Link
      href={href}
      className="content-card group block w-[180px] sm:w-[200px] lg:w-[220px]"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-[var(--radius-lg)]">
        {content.posterUrl ? (
          <Image
            src={content.posterUrl}
            alt={content.title}
            fill
            sizes="(max-width: 640px) 180px, (max-width: 1024px) 200px, 220px"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-[var(--color-bg-tertiary)] flex items-center justify-center">
            <Play className="w-10 h-10 text-[var(--color-text-muted)]" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="content-card-overlay">
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </div>
          {content.description && (
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              {truncate(content.description, 100)}
            </p>
          )}
        </div>

        {/* Kalite Badge */}
        {content.quality && (
          <span className="absolute top-2 left-2 badge badge-quality text-[0.65rem]">
            {content.quality}
          </span>
        )}

        {/* IMDB Badge */}
        {content.imdbRating && (
          <span className="absolute top-2 right-2 badge badge-gold flex items-center gap-1 text-[0.65rem]">
            <Star className="w-3 h-3 fill-current" />
            {content.imdbRating.toFixed(1)}
          </span>
        )}
      </div>

      {/* Bilgi */}
      <div className="p-3 space-y-1.5">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">
          {content.title}
        </h3>
        <div className="flex items-center gap-2 text-[0.7rem] text-[var(--color-text-muted)]">
          {content.releaseYear && <span>{content.releaseYear}</span>}
          {content.durationMinutes && (
            <>
              <span className="w-1 h-1 rounded-full bg-[var(--color-text-muted)]" />
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {formatDuration(content.durationMinutes)}
              </span>
            </>
          )}
        </div>
        {content.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {content.genres.slice(0, 2).map((genre) => (
              <span
                key={genre.id}
                className="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-white/5 text-[var(--color-text-muted)]"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
