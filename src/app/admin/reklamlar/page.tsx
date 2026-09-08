"use client";

import { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Tv,
  Layers,
  LayoutGrid,
  ExternalLink,
} from "lucide-react";

interface AdItem {
  id: string;
  name: string;
  position: "PRE_ROLL" | "MID_ROLL" | "BANNER" | "POPUP" | "SIDEBAR";
  vastUrl: string | null;
  fallbackImage: string | null;
  fallbackLink: string | null;
  isActive: boolean;
}

export default function AdminReklamlarPage() {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Düzenleme durumu
  const [editingAd, setEditingAd] = useState<AdItem | null>(null);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/reklamlar");
      const data = await res.json();
      if (data.success) {
        setAds(data.ads);
      }
    } catch {
      setMessage({ text: "Reklamlar yüklenirken bir hata oluştu.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleToggle = async (ad: AdItem) => {
    setSavingId(ad.id);
    try {
      const res = await fetch("/api/admin/reklamlar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ad.id, isActive: !ad.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setAds((prev) =>
          prev.map((item) => (item.id === ad.id ? { ...item, isActive: !item.isActive } : item))
        );
        setMessage({
          text: `"${ad.name}" reklamı ${!ad.isActive ? "aktif edildi" : "pasife alındı"}.`,
          type: "success",
        });
      }
    } catch {
      setMessage({ text: "Durum güncellenirken hata oluştu.", type: "error" });
    } finally {
      setSavingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAd) return;

    setSavingId(editingAd.id);
    try {
      const res = await fetch("/api/admin/reklamlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingAd),
      });
      const data = await res.json();
      if (data.success) {
        setAds((prev) =>
          prev.map((item) => (item.id === data.ad.id ? data.ad : item))
        );
        setEditingAd(null);
        setMessage({ text: "Reklam ayarları başarıyla kaydedildi.", type: "success" });
      }
    } catch {
      setMessage({ text: "Kaydedilirken bir hata oluştu.", type: "error" });
    } finally {
      setSavingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Megaphone className="w-7 h-7 text-emerald-400" />
            <span>Reklam Alanları & VAST Yönetimi</span>
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Player içi ve sayfa banner alanlarını tek tıkla aktif veya pasif yapabilirsiniz.
          </p>
        </div>
      </div>

      {/* Bildirim */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl text-sm animate-fade-in ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border border-red-500/30 text-red-300"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Yükleniyor İskeleti */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 rounded-2xl animate-pulse space-y-4">
              <div className="h-5 bg-white/10 rounded w-2/3" />
              <div className="h-20 bg-white/5 rounded-xl" />
              <div className="h-8 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ads.map((ad) => (
            <div
              key={ad.id}
              className={`glass-card p-6 rounded-2xl border transition-all flex flex-col justify-between space-y-5 ${
                ad.isActive
                  ? "border-emerald-500/30 bg-emerald-500/5 shadow-lg shadow-emerald-950/20"
                  : "border-white/10 opacity-75"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {ad.position === "PRE_ROLL" && <Tv className="w-5 h-5 text-amber-400" />}
                    {ad.position === "POPUP" && <Layers className="w-5 h-5 text-purple-400" />}
                    {ad.position === "BANNER" && <LayoutGrid className="w-5 h-5 text-blue-400" />}
                    <h3 className="font-bold text-base text-white">{ad.name}</h3>
                  </div>

                  {/* Toggle Anahtarı */}
                  <button
                    onClick={() => handleToggle(ad)}
                    disabled={savingId === ad.id}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      ad.isActive ? "bg-emerald-500" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        ad.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-[var(--color-text-muted)]">Slot Tipi:</span>
                    <span className="font-semibold text-white">{ad.position}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-1">
                    <span className="text-[var(--color-text-muted)]">Durum:</span>
                    <span
                      className={`font-bold ${
                        ad.isActive ? "text-emerald-400" : "text-[var(--color-text-muted)]"
                      }`}
                    >
                      {ad.isActive ? "Yayında (Aktif)" : "Pasif"}
                    </span>
                  </div>
                  {ad.vastUrl && (
                    <div className="pt-1">
                      <span className="text-[var(--color-text-muted)] block mb-0.5">VAST Tag:</span>
                      <p className="text-[11px] font-mono text-white/70 truncate bg-black/40 p-1.5 rounded">
                        {ad.vastUrl}
                      </p>
                    </div>
                  )}
                  {ad.fallbackLink && (
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-[var(--color-text-muted)]">Yönlendirme:</span>
                      <a
                        href={ad.fallbackLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
                      >
                        <span>Ziyaret Et</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Düzenle Butonu */}
              <button
                onClick={() => setEditingAd(ad)}
                className="btn-secondary w-full justify-center py-2 text-xs font-semibold"
              >
                Ayarları Düzenle
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Düzenleme Modalı */}
      {editingAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/20 w-full max-w-lg space-y-5 animate-scale-up">
            <h3 className="text-xl font-bold text-white">
              Reklam Slotunu Düzenle: {editingAd.name}
            </h3>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div className="space-y-1">
                <label className="text-xs text-[var(--color-text-secondary)]">Slot Adı</label>
                <input
                  type="text"
                  required
                  value={editingAd.name}
                  onChange={(e) => setEditingAd({ ...editingAd, name: e.target.value })}
                  className="input-field w-full px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[var(--color-text-secondary)]">
                  Reklam Kodu (HTML / JavaScript) veya VAST URL
                </label>
                <textarea
                  rows={4}
                  placeholder="<script>...</script> veya https://adserver.com/vast.xml veya <div>...</div>"
                  value={editingAd.vastUrl || ""}
                  onChange={(e) => setEditingAd({ ...editingAd, vastUrl: e.target.value })}
                  className="input-field w-full px-3 py-2 text-xs font-mono"
                />
                <span className="text-[10px] text-[var(--color-text-muted)]">
                  Özel HTML banner kodunu, Google AdSense veya VAST XML etiketini buraya yapıştırabilirsiniz.
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[var(--color-text-secondary)]">Görsel / Banner URL (Opsiyonel)</label>
                <input
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  value={editingAd.fallbackImage || ""}
                  onChange={(e) => setEditingAd({ ...editingAd, fallbackImage: e.target.value })}
                  className="input-field w-full px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-[var(--color-text-secondary)]">Yönlendirme Linki (Hedef URL)</label>
                <input
                  type="url"
                  placeholder="https://reklamverenin-sitesi.com"
                  value={editingAd.fallbackLink || ""}
                  onChange={(e) => setEditingAd({ ...editingAd, fallbackLink: e.target.value })}
                  className="input-field w-full px-3 py-2 text-sm"
                />
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingAd(null)}
                  className="btn-secondary flex-1 justify-center py-2.5 text-xs"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={savingId === editingAd.id}
                  className="btn-primary flex-1 justify-center py-2.5 text-xs font-bold"
                >
                  {savingId === editingAd.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Kaydet"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
