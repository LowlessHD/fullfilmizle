import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  User as UserIcon,
  Film,
  Heart,
  Clock,
  Shield,
  LogOut,
  Sparkles,
  Play,
  Calendar,
  ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Profilim | FullFilmİzle",
  description: "İzleme geçmişiniz, favorileriniz ve hesap ayarlarınız.",
};

export default async function ProfilPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/giris?callbackUrl=/profil");
  }

  // Kullanıcı profil detayları, favorileri ve izleme geçmişini çek
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      favorites: {
        orderBy: { addedAt: "desc" },
        include: {
          content: true,
        },
      },
      watchHistory: {
        orderBy: { watchedAt: "desc" },
        take: 12,
        include: {
          content: true,
          episode: {
            include: {
              season: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/giris");
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-black">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-10">
        {/* Profil Başlık Kartı */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[var(--color-accent)]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-5 relative z-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-[var(--color-accent)] to-purple-600 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-red-900/30">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  {user.username}
                </h1>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    user.role === "ADMIN"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {user.role === "ADMIN" ? "Yönetici (Admin)" : "Üye"}
                </span>
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {user.email}
              </p>
              <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] pt-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  Kayıt Tarihi:{" "}
                  {new Date(user.createdAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="btn-secondary px-4 py-2.5 text-sm flex items-center gap-2 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
              >
                <Shield className="w-4 h-4" />
                <span>Yönetim Paneli</span>
              </Link>
            )}

            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold border border-white/10 transition-all flex items-center gap-2 hover:border-red-500/40 hover:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            </form>
          </div>
        </div>

        {/* 1. Kaldığın Yerden Devam Et (İzleme Geçmişi) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[var(--color-accent)]" />
              <span>İzleme Geçmişi (Kaldığın Yerden Devam Et)</span>
            </h2>
            <span className="text-xs text-[var(--color-text-muted)]">
              {user.watchHistory.length} İçerik
            </span>
          </div>

          {user.watchHistory.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center space-y-3 border border-white/5">
              <Film className="w-12 h-12 text-white/20 mx-auto" />
              <p className="text-white font-medium">Henüz izleme geçmişiniz yok.</p>
              <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
                Film veya dizi izlemeye başladığınızda kaldığınız saniye buraya otomatik kaydedilir.
              </p>
              <Link href="/filmler" className="btn-primary inline-flex text-xs px-4 py-2 mt-2">
                Filmleri Keşfet
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {user.watchHistory.map((item) => {
                const isSeries = item.content.type === "SERIES";
                const watchUrl = isSeries && item.episode
                  ? `/diziler/${item.content.slug}/${item.episode.season.seasonNumber}/${item.episode.episodeNumber}`
                  : `/filmler/${item.content.slug}`;

                const progressPercent = item.totalSeconds > 0
                  ? Math.min(100, Math.round((item.progressSeconds / item.totalSeconds) * 100))
                  : 45;

                return (
                  <Link
                    key={item.id}
                    href={watchUrl}
                    className="glass-card rounded-xl overflow-hidden group border border-white/10 hover:border-white/20 transition-all flex flex-col"
                  >
                    <div className="relative aspect-video overflow-hidden bg-black">
                      {item.content.backdropUrl || item.content.posterUrl ? (
                        <img
                          src={item.content.backdropUrl || item.content.posterUrl || ""}
                          alt={item.content.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center">
                          <Film className="w-8 h-8 text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
                        </div>
                      </div>
                      {/* İlerleme Çubuğu */}
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
                        <div
                          className="h-full bg-[var(--color-accent)]"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="p-3.5 space-y-1 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-[var(--color-accent)] transition-colors truncate">
                          {item.content.title}
                        </h3>
                        {isSeries && item.episode && (
                          <p className="text-xs text-[var(--color-text-secondary)] truncate">
                            {item.episode.season.seasonNumber}. Sezon {item.episode.episodeNumber}. Bölüm
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[var(--color-text-muted)] pt-2">
                        <span>%{progressPercent} izlendi</span>
                        <span>{new Date(item.watchedAt).toLocaleDateString("tr-TR")}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* 2. Favori İçerikler */}
        <section className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-red-500 fill-current" />
              <span>Favorilerim</span>
            </h2>
            <span className="text-xs text-[var(--color-text-muted)]">
              {user.favorites.length} İçerik
            </span>
          </div>

          {user.favorites.length === 0 ? (
            <div className="glass-card p-8 rounded-2xl text-center space-y-3 border border-white/5">
              <Heart className="w-12 h-12 text-white/20 mx-auto" />
              <p className="text-white font-medium">Favori listeniz henüz boş.</p>
              <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
                Beğendiğiniz filmlerin veya dizilerin sayfalarından "Listeme Ekle" butonuna basarak favorilerinizi oluşturabilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {user.favorites.map((fav) => {
                const href = fav.content.type === "SERIES"
                  ? `/diziler/${fav.content.slug}`
                  : `/filmler/${fav.content.slug}`;

                return (
                  <Link
                    key={fav.contentId}
                    href={href}
                    className="content-card group block"
                  >
                    <div className="relative aspect-[2/3] overflow-hidden rounded-t-[var(--radius-lg)]">
                      {fav.content.posterUrl && (
                        <img
                          src={fav.content.posterUrl}
                          alt={fav.content.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      )}
                      {fav.content.imdbRating && (
                        <span className="absolute top-2 left-2 badge badge-rating text-[10px]">
                          ★ {fav.content.imdbRating}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-xs font-semibold text-white truncate group-hover:text-[var(--color-accent)] transition-colors">
                        {fav.content.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mt-1">
                        <span>{fav.content.type === "MOVIE" ? "Film" : "Dizi"}</span>
                        <span>{fav.content.releaseYear}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
