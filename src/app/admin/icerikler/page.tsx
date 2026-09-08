"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Film,
  Tv,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Star,
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  originalTitle: string | null;
  slug: string;
  type: "MOVIE" | "SERIES";
  posterUrl: string | null;
  tmdbId: number | null;
  imdbRating: number | null;
  releaseYear: number | null;
  status: string;
  createdAt: string;
}

export default function AdminIceriklerPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("ALL");

  // Manuel Ekleme Formu State'leri
  const [type, setType] = useState<"MOVIE" | "SERIES">("MOVIE");
  const [tmdbId, setTmdbId] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const url = new URL("/api/admin/icerikler", window.location.origin);
      if (searchQuery) url.searchParams.set("q", searchQuery);
      if (filterType !== "ALL") url.searchParams.set("type", filterType);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setContents(data.contents);
      }
    } catch {
      setNotification({ text: "İçerikler yüklenirken hata oluştu.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContents();
  };

  const handleAddContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmdbId.trim()) return;

    setAdding(true);
    setNotification(null);

    try {
      const res = await fetch("/api/admin/icerikler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, tmdbId }),
      });
      const data = await res.json();

      if (data.success) {
        setNotification({ text: data.message, type: "success" });
        setTmdbId("");
        fetchContents();
      } else {
        setNotification({ text: data.error || "İçerik eklenemedi.", type: "error" });
      }
    } catch {
      setNotification({ text: "Bağlantı hatası oluştu.", type: "error" });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" içeriğini silmek istediğinize emin misiniz?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/icerikler?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setContents((prev) => prev.filter((c) => c.id !== id));
        setNotification({ text: `"${title}" başarıyla silindi.`, type: "success" });
      }
    } catch {
      setNotification({ text: "Silme işlemi sırasında hata oluştu.", type: "error" });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
          <Film className="w-7 h-7 text-red-500" />
          <span>İçerik Yönetimi & TMDB İçe Aktarma</span>
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">
          TMDB ID kullanarak tekil film/dizi ekleyebilir veya mevcut içerikleri yönetebilirsiniz.
        </p>
      </div>

      {/* Bildirim Alanı */}
      {notification && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm animate-fade-in ${
            notification.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* 1. Manuel TMDB İle Ekleme Kartı */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>TMDB ID ile Tekil İçerik Ekle</span>
        </h2>

        <form onSubmit={handleAddContent} className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Tür Seçimi */}
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setType("MOVIE")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  type === "MOVIE"
                    ? "bg-[var(--color-accent)] text-white shadow"
                    : "text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>Film</span>
              </button>
              <button
                type="button"
                onClick={() => setType("SERIES")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  type === "SERIES"
                    ? "bg-[var(--color-accent)] text-white shadow"
                    : "text-[var(--color-text-secondary)] hover:text-white"
                }`}
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Dizi</span>
              </button>
            </div>

            {/* TMDB ID Input */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                required
                placeholder="TMDB ID girin (Örn: Film için 693134, Dizi için 1396)"
                value={tmdbId}
                onChange={(e) => setTmdbId(e.target.value)}
                className="input-field w-full px-4 py-2.5 text-sm"
              />
            </div>

            {/* Ekle Butonu */}
            <button
              type="submit"
              disabled={adding || !tmdbId.trim()}
              className="btn-primary py-2.5 px-5 text-sm font-bold flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {adding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>TMDB'den Çekiliyor...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>İçeriği Çek & Ekle</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-[var(--color-text-muted)]">
            İpucu: themoviedb.org adresindeki film veya dizi sayfasının URL'sindeki ID numarasını girin. (Örn: /movie/<b>693134</b>-dune-part-two)
          </p>
        </form>
      </div>

      {/* 2. İçerik Arama ve Filtreleme */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="İçerik başlığı ile ara..."
            className="input-field w-full pl-10 pr-4 py-2 text-sm"
          />
        </form>

        <div className="flex items-center gap-2">
          {["ALL", "MOVIE", "SERIES"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterType === tab
                  ? "bg-white/20 text-white font-bold"
                  : "bg-white/5 text-[var(--color-text-secondary)] hover:text-white"
              }`}
            >
              {tab === "ALL" ? "Tümü" : tab === "MOVIE" ? "Filmler" : "Diziler"}
            </button>
          ))}
        </div>
      </div>

      {/* 3. İçerikler Tablosu */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-[var(--color-accent)] animate-spin mx-auto" />
            <p className="text-xs text-[var(--color-text-muted)]">İçerikler yükleniyor...</p>
          </div>
        ) : contents.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Film className="w-10 h-10 text-white/20 mx-auto" />
            <p className="text-sm font-semibold text-white">İçerik bulunamadı.</p>
            <p className="text-xs text-[var(--color-text-muted)]">
              Üstteki form ile TMDB ID girerek ilk içeriğinizi ekleyebilirsiniz.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-xs text-[var(--color-text-muted)] uppercase tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-4">İçerik</th>
                  <th className="py-3 px-4">Tür</th>
                  <th className="py-3 px-4">TMDB ID</th>
                  <th className="py-3 px-4">IMDB Puanı</th>
                  <th className="py-3 px-4">Yıl</th>
                  <th className="py-3 px-4 text-right">Eylemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contents.map((item) => {
                  const watchUrl =
                    item.type === "MOVIE"
                      ? `/filmler/${item.slug}`
                      : `/diziler/${item.slug}`;

                  return (
                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-9 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                          {item.posterUrl ? (
                            <img
                              src={item.posterUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Film className="w-4 h-4 text-white/30" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-xs">
                            {item.title}
                          </p>
                          {item.originalTitle && (
                            <p className="text-xs text-[var(--color-text-muted)] truncate max-w-xs">
                              {item.originalTitle}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            item.type === "MOVIE"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                          }`}
                        >
                          {item.type === "MOVIE" ? "Film" : "Dizi"}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs text-[var(--color-text-secondary)]">
                        {item.tmdbId || "-"}
                      </td>

                      <td className="py-3 px-4">
                        {item.imdbRating ? (
                          <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            {item.imdbRating}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="py-3 px-4 text-xs text-[var(--color-text-secondary)]">
                        {item.releaseYear || "-"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={watchUrl}
                            target="_blank"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-[var(--color-text-muted)] hover:text-white transition-colors"
                            title="İzle"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(item.id, item.title)}
                            disabled={deletingId === item.id}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-[var(--color-text-muted)] hover:text-red-400 transition-colors disabled:opacity-50"
                            title="Sil"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-400" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
