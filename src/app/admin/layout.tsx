import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  LayoutDashboard,
  Film,
  Tv,
  Megaphone,
  Settings,
  ArrowLeft,
  Shield,
  Bot,
  Users,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Yönetim Güvenliği Kontrolü: Giriş yapmamış veya ADMIN olmayanları yönlendir
  // Geliştirme ortamında admin yetkisini esnetmek için gerekirse kontrol edilir
  if (!session?.user || session.user.role !== "ADMIN") {
    // Eğer veritabanında henüz admin oluşturulmamışsa geliştirici erişimini kolaylaştırmak için
    // veya admin değilse ana sayfaya yönlendir
    redirect("/giris?callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col md:flex-row pt-16">
      {/* Admin Yan Menü (Sidebar) */}
      <aside className="w-full md:w-64 bg-[#111116] border-r border-white/5 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Admin Başlık */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">Yönetici Paneli</h2>
              <p className="text-[11px] text-[var(--color-text-muted)]">FullFilmİzle v1.0</p>
            </div>
          </div>

          {/* Navigasyon Linkleri */}
          <nav className="space-y-1 text-sm font-medium">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all hover:translate-x-1"
            >
              <LayoutDashboard className="w-4 h-4 text-amber-400" />
              <span>Genel Bakış</span>
            </Link>

            <Link
              href="/admin/icerikler"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-white transition-all hover:translate-x-1"
            >
              <Film className="w-4 h-4 text-red-400" />
              <span>İçerikler & TMDB</span>
            </Link>

            <Link
              href="/admin/reklamlar"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-[var(--color-text-secondary)] hover:text-white transition-all hover:translate-x-1"
            >
              <Megaphone className="w-4 h-4 text-emerald-400" />
              <span>Reklam Yönetimi</span>
            </Link>
          </nav>
        </div>

        {/* Alt Kısım: Siteye Dön */}
        <div className="pt-6 border-t border-white/5">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[var(--color-text-muted)] hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Siteye Geri Dön</span>
          </Link>
        </div>
      </aside>

      {/* Ana İçerik Alanı */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
