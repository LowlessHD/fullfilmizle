"use client";

import { useState, useEffect, useRef } from "react";
import { Loader2, Maximize2, Minimize2, Tv, AlertCircle } from "lucide-react";

interface EmbedPlayerProps {
  src: string;
  poster?: string | null;
  title?: string;
  sourceName?: string;
}

export default function EmbedPlayer({
  src,
  poster,
  title = "Video Oynatıcı",
  sourceName,
}: EmbedPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Kaynak değiştiğinde yükleme durumunu sıfırla
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  // Tam ekran modu
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      className={`transition-all duration-300 w-full ${
        isCinemaMode ? "max-w-none px-0" : "max-w-[1400px] mx-auto"
      }`}
    >
      {/* Player Frame Container */}
      <div
        ref={containerRef}
        className="relative w-full aspect-video bg-black rounded-b-xl overflow-hidden shadow-2xl border-b border-white/10 group"
      >
        {/* Yükleniyor veya Hazırlanıyor Ekranı */}
        {isLoading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md transition-opacity">
            {poster && (
              <img
                src={poster}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-20 blur-md pointer-events-none"
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-3 p-6 text-center">
              <Loader2 className="w-10 h-10 text-[var(--color-accent)] animate-spin" />
              <p className="text-white font-medium text-base sm:text-lg">
                Video Oynatıcı Yükleniyor...
              </p>
              {sourceName && (
                <span className="text-xs px-3 py-1 rounded-full bg-white/10 text-[var(--color-text-secondary)] border border-white/5">
                  Kaynak: {sourceName}
                </span>
              )}
              <p className="text-xs text-[var(--color-text-muted)] max-w-sm mt-1">
                İçerik harici güvenli stream sunucularından yükleniyor.
              </p>
            </div>
          </div>
        )}

        {/* Hata Durumu */}
        {hasError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/95 p-6 text-center">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">
              Kaynak Yüklenemedi
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-md mb-4">
              Bu stream kaynağı geçici olarak yanıt vermiyor olabilir. Lütfen üstteki veya alttaki diğer kaynakları deneyin.
            </p>
          </div>
        )}

        {/* Iframe Embed Player */}
        {src ? (
          <iframe
            key={src}
            src={src}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-center p-6">
            <p className="text-[var(--color-text-muted)]">
              Bu içerik için henüz bir izleme kaynağı eklenmedi.
            </p>
          </div>
        )}

        {/* Player Üst Kontrol Barı (Hover ile görünür) */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <h3 className="text-white text-sm sm:text-base font-medium drop-shadow">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Sinema Modu */}
            <button
              onClick={() => setIsCinemaMode(!isCinemaMode)}
              className={`p-2 rounded-lg backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all ${
                isCinemaMode ? "bg-[var(--color-accent)] text-white" : "bg-black/60"
              }`}
              title={isCinemaMode ? "Normal Görünüm" : "Sinema Modu"}
            >
              <Tv className="w-4 h-4" />
            </button>
            {/* Tam Ekran */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-all"
              title="Tam Ekran"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
