"use client";

import { useState } from "react";
import EmbedPlayer from "./EmbedPlayer";
import SourceSelector, { PlayerSource } from "./SourceSelector";
import { Share2, Heart, Flag, Bookmark } from "lucide-react";

interface VideoPlayerViewProps {
  title: string;
  poster?: string | null;
  sources: PlayerSource[];
}

export default function VideoPlayerView({
  title,
  poster,
  sources,
}: VideoPlayerViewProps) {
  const [activeSource, setActiveSource] = useState<PlayerSource>(
    sources[0] || {
      id: "default",
      sourceName: "Otomatik Oynatıcı",
      embedUrl: "",
    }
  );
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <div className="space-y-4">
      {/* Ana Oynatıcı */}
      <EmbedPlayer
        src={activeSource.embedUrl}
        poster={poster}
        title={title}
        sourceName={activeSource.sourceName}
      />

      {/* Kaynak Seçici ve Hızlı İşlem Araç Çubuğu */}
      <div className="max-w-[1400px] mx-auto space-y-3">
        <SourceSelector
          sources={sources}
          activeSourceId={activeSource.id}
          onSelect={setActiveSource}
        />

        {/* İzleme Eylemleri */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 text-xs text-[var(--color-text-secondary)]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                isLiked
                  ? "bg-red-500/20 text-red-400 border-red-500/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : ""}`} />
              <span>{isLiked ? "Beğendiniz" : "Beğen"}</span>
            </button>

            <button
              onClick={() => setIsSaved(!isSaved)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                isSaved
                  ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`} />
              <span>{isSaved ? "Listede" : "Listeme Ekle"}</span>
            </button>

            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link panoya kopyalandı!");
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Paylaş</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => alert("Bildiriminiz admin ekibine iletildi. Teşekkürler!")}
              className="flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-amber-400 transition-colors"
            >
              <Flag className="w-3 h-3" />
              <span>Hata Bildir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
