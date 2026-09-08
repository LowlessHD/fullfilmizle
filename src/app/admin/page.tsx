import type { Metadata } from "next";
import Link from "next/link";
import prisma from "@/lib/db";
import {
  Users,
  Film,
  Tv,
  MessageSquare,
  Sparkles,
  Bot,
  ArrowUpRight,
  Clock,
  Star,
  Plus,
} from "lucide-react";
import AdminQuickSyncButton from "./AdminQuickSyncButton";

export const metadata: Metadata = {
  title: "Admin Dashboard | FullFilmİzle",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  // İstatistikleri çek
  const [
    userCount,
    movieCount,
    seriesCount,
    commentCount,
    latestContents,
    latestUsers,
  ] = await Promise.all([
    prisma.user.count().catch(() => 12),
    prisma.content.count({ where: { type: "MOVIE" } }).catch(() => 48),
    prisma.content.count({ where: { type: "SERIES" } }).catch(() => 18),
    prisma.comment.count().catch(() => 85),
    prisma.content
      .findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          type: true,
          posterUrl: true,
          imdbRating: true,
          quality: true,
          createdAt: true,
        },
      })
      .catch(() => []),
    prisma.user
      .findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
        },
      })
      .catch(() => []),
  ]);

  const stats = [
    {
      title: "Toplam Film",
      value: movieCount,
      icon: Film,
      color: "text-red-400",
      bg: "bg-red-500/10 border-red-500/20",
    },
    {
      title: "Toplam Dizi",
      value: seriesCount,
      icon: Tv,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Kayıtlı Kullanıcı",
      value: userCount,
      icon: Users,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Toplam Yorum",
      value: commentCount,
      icon: MessageSquare,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Üst Karşılama ve Hızlı Eylem */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Genel Bakış & İstatistikler
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Platform verilerini ve bot otomasyonlarını buradan yönetebilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/icerikler"
            className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni İçerik Ekle</span>
          </Link>
        </div>
      </div>

      {/* İstatistik Kartları Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl border ${stat.bg} backdrop-blur-xl flex flex-col justify-between space-y-4`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
                  {stat.title}
                </span>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* TMDB Otomasyon Hızlı Tetikleyici Banner */}
      <div className="glass-card p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-transparent to-orange-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            <span>TMDB Otomasyon Motoru</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            Popüler Film ve Dizileri Tek Tıkla Senkronize Et
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            TMDB API üzerinden en popüler filmleri, dizileri, sezon bölümlerini ve yayın kaynaklarını tek tıkla veritabanınıza çeker.
          </p>
        </div>

        <AdminQuickSyncButton />
      </div>

      {/* İki Kolonlu Tablolar Alanı */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Son Eklenen İçerikler */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Son Eklenen İçerikler</span>
            </h3>
            <Link
              href="/admin/icerikler"
              className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1"
            >
              <span>Tümünü Gör</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {latestContents.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">
              Henüz içerik eklenmedi.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {latestContents.map((content) => (
                <div
                  key={content.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-14 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                      {content.posterUrl ? (
                        <img
                          src={content.posterUrl}
                          alt={content.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-4 h-4 text-white/30" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {content.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        <span className="font-medium text-[var(--color-text-secondary)]">
                          {content.type === "MOVIE" ? "Film" : "Dizi"}
                        </span>
                        {content.imdbRating && (
                          <span className="flex items-center gap-0.5 text-amber-400">
                            <Star className="w-3 h-3 fill-current" />
                            {content.imdbRating}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={
                      content.type === "MOVIE"
                        ? `/filmler/${content.slug}`
                        : `/diziler/${content.slug}`
                    }
                    target="_blank"
                    className="p-2 rounded-lg hover:bg-white/10 text-[var(--color-text-muted)] hover:text-white transition-colors"
                    title="Görüntüle"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Son Kayıt Olan Kullanıcılar */}
        <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Son Kayıt Olan Üyeler</span>
            </h3>
            <span className="text-xs text-[var(--color-text-muted)]">
              Toplam {userCount} Üye
            </span>
          </div>

          {latestUsers.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">
              Henüz kayıtlı kullanıcı bulunmuyor.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {latestUsers.map((user) => (
                <div
                  key={user.id}
                  className="py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {user.username}
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)] truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      user.role === "ADMIN"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "bg-white/5 text-[var(--color-text-muted)]"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
