"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play, Info, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { truncate } from "@/lib/utils";
import type { ContentCard } from "@/types/content";

interface HeroSliderProps {
  items: ContentCard[];
}

export default function HeroSlider({ items }: HeroSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [isTransitioning]
  );

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, goToSlide]);

  // Otomatik geçiş
  useEffect(() => {
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (items.length === 0) return null;

  const current = items[currentIndex];
  const href =
    current.type === "SERIES"
      ? `/diziler/${current.slug}`
      : `/filmler/${current.slug}`;

  return (
    <section className="hero-section" id="hero-slider">
      {/* Backdrop Görseli */}
      {items.map((item, index) => (
        <div
          key={item.id}
          className="hero-backdrop"
          style={{
            backgroundImage: item.backdropUrl
              ? `url(${item.backdropUrl})`
              : undefined,
            opacity: index === currentIndex ? 1 : 0,
            zIndex: index === currentIndex ? 0 : -1,
          }}
        />
      ))}

      {/* İçerik */}
      <div className="relative z-10 h-full max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center">
        <div
          className="max-w-2xl space-y-5 animate-fade-in"
          key={currentIndex}
        >
          {/* Badges */}
          <div className="flex items-center gap-3">
            <span className="badge badge-accent">
              {current.type === "SERIES" ? "Dizi" : "Film"}
            </span>
            {current.quality && (
              <span className="badge badge-quality">{current.quality}</span>
            )}
            {current.imdbRating && (
              <span className="badge badge-gold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-current" />
                {current.imdbRating.toFixed(1)}
              </span>
            )}
            {current.releaseYear && (
              <span className="text-sm text-[var(--color-text-secondary)]">
                {current.releaseYear}
              </span>
            )}
          </div>

          {/* Başlık */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight">
            {current.title}
          </h1>

          {/* Açıklama */}
          {current.description && (
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-xl">
              {truncate(current.description, 200)}
            </p>
          )}

          {/* Tür Etiketleri */}
          {current.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {current.genres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/kategoriler/${genre.slug}`}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/8 text-[var(--color-text-secondary)] hover:bg-white/12 hover:text-[var(--color-text-primary)] transition-all"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          )}

          {/* Butonlar */}
          <div className="flex items-center gap-3 pt-2">
            <Link href={href} className="btn-primary text-base px-6 py-3">
              <Play className="w-5 h-5 fill-current" />
              Hemen İzle
            </Link>
            <Link href={href} className="btn-secondary text-base px-6 py-3">
              <Info className="w-5 h-5" />
              Detaylar
            </Link>
          </div>
        </div>
      </div>

      {/* Navigasyon Okları */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 btn-icon w-10 h-10 bg-black/40 hover:bg-black/60 border-none"
        aria-label="Önceki"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 btn-icon w-10 h-10 bg-black/40 hover:bg-black/60 border-none"
        aria-label="Sonraki"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot Göstergeleri */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`transition-all duration-300 rounded-full ${
              index === currentIndex
                ? "w-8 h-2 bg-[var(--color-accent)]"
                : "w-2 h-2 bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Slayt ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
