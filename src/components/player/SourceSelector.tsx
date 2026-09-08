"use client";

import { Server, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

export interface PlayerSource {
  id: string;
  sourceName: string;
  embedUrl: string;
  quality?: string | null;
  language?: string | null;
  priority?: number;
}

interface SourceSelectorProps {
  sources: PlayerSource[];
  activeSourceId: string;
  onSelect: (source: PlayerSource) => void;
}

export default function SourceSelector({
  sources,
  activeSourceId,
  onSelect,
}: SourceSelectorProps) {
  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div className="glass-card p-4 rounded-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <Server className="w-4 h-4 text-[var(--color-accent)]" />
          <h4 className="text-sm font-semibold text-white">Yayın Kaynakları</h4>
          <span className="text-xs text-[var(--color-text-muted)]">
            ({sources.length} alternatif sunucu)
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Sorun yaşarsanız diğer kaynağa geçin</span>
        </div>
      </div>

      {/* Kaynak Butonları Grid/Flex */}
      <div className="flex flex-wrap gap-2.5">
        {sources.map((source, index) => {
          const isActive = source.id === activeSourceId;
          return (
            <button
              key={source.id}
              onClick={() => onSelect(source)}
              className={`group relative flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                isActive
                  ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-[0_0_15px_rgba(229,9,20,0.35)] scale-[1.02]"
                  : "bg-white/5 hover:bg-white/10 text-[var(--color-text-secondary)] hover:text-white border-white/10"
              }`}
            >
              {isActive ? (
                <CheckCircle2 className="w-4 h-4 text-white" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
              )}
              
              <span className="font-semibold">{source.sourceName}</span>

              {/* Kalite Etiketi */}
              {source.quality && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isActive
                      ? "bg-black/30 text-white"
                      : "bg-white/10 text-[var(--color-text-muted)]"
                  }`}
                >
                  {source.quality}
                </span>
              )}

              {/* Dil Etiketi */}
              {source.language && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {source.language}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
