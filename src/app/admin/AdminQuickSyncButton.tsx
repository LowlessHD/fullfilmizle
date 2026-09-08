"use client";

import { useState } from "react";
import { Bot, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminQuickSyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");

  const handleSync = async () => {
    setLoading(true);
    setStatusText("İçerikler senkronize ediliyor...");

    try {
      const res = await fetch("/api/bot/sync?movies=10&tv=5", {
        method: "POST",
      });
      const data = await res.json();

      if (data.success) {
        setStatusText(
          `Tamamlandı! ${data.syncedMovies} film, ${data.syncedTv} dizi eklendi.`
        );
        router.refresh();
      } else {
        setStatusText("Senkronizasyon sırasında bir sorun oluştu.");
      }
    } catch {
      setStatusText("Sunucuya bağlanırken hata oluştu.");
    } finally {
      setLoading(false);
      setTimeout(() => setStatusText(""), 6000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
      {statusText && (
        <span className="text-xs text-amber-300 animate-fade-in font-medium">
          {statusText}
        </span>
      )}

      <button
        onClick={handleSync}
        disabled={loading}
        className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 border-0 shadow-lg shadow-amber-900/30 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
        <span>{loading ? "Çekiliyor..." : "Botu Şimdi Çalıştır"}</span>
      </button>
    </div>
  );
}
