"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Search,
  Menu,
  X,
  Film,
  Tv,
  Home,
  User,
  LogIn,
  Heart,
  Bell,
} from "lucide-react";
import { useSession } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/diziler", label: "Diziler", icon: Tv },
  { href: "/filmler", label: "Filmler", icon: Film },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mobil menüyü sayfa değiştiğinde kapat
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/arama?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-[var(--color-bg-primary)]/95 backdrop-blur-xl shadow-lg border-b border-white/5"
          : "bg-gradient-to-b from-black/60 to-transparent"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-purple-700 flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-lg bg-[var(--color-accent)]/20 blur-md -z-10" />
            </div>
            <span className="text-lg font-bold tracking-tight hidden sm:block">
              <span className="text-[var(--color-text-primary)]">Full</span>
              <span className="gradient-text">Film</span>
              <span className="text-[var(--color-text-primary)]">İzle</span>
            </span>
          </Link>

          {/* Desktop Navigasyon */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Sağ Taraf Aksiyonları */}
          <div className="flex items-center gap-2">
            {/* Desktop Arama */}
            <div className="hidden md:block relative">
              <form onSubmit={handleSearch}>
                <div
                  className={`flex items-center transition-all duration-300 ${
                    isSearchOpen ? "w-72" : "w-10"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="btn-icon shrink-0"
                    aria-label="Ara"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  {isSearchOpen && (
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Film veya dizi ara..."
                      className="input-field ml-2 py-2 text-sm animate-fade-in"
                      autoFocus
                    />
                  )}
                </div>
              </form>
            </div>

            {/* Bildirimler */}
            <button className="btn-icon hidden sm:flex" aria-label="Bildirimler">
              <Bell className="w-4 h-4" />
            </button>

            {/* Favoriler */}
            <Link href="/profil" className="btn-icon hidden sm:flex" aria-label="Favoriler">
              <Heart className="w-4 h-4" />
            </Link>

            {/* Giriş / Profil */}
            {session?.user ? (
              <Link
                href="/profil"
                className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-xs font-bold">
                  {session.user.username ? session.user.username.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate">
                  {session.user.username || "Profilim"}
                </span>
              </Link>
            ) : (
              <Link
                href="/giris"
                className="btn-primary py-2 px-4 text-sm hidden sm:flex"
              >
                <LogIn className="w-4 h-4" />
                <span>Giriş Yap</span>
              </Link>
            )}

            {/* Mobil Menü Butonu */}
            <button
              className="btn-icon lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menü"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Menü */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[var(--color-bg-secondary)]/98 backdrop-blur-xl border-t border-white/5 animate-slide-up">
          <div className="px-4 py-4 space-y-2">
            {/* Mobil Arama */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Film veya dizi ara..."
                  className="input-field pl-10 py-3"
                />
              </div>
            </form>

            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "text-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                      : "text-[var(--color-text-secondary)] hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-2 border-t border-white/5">
              <Link
                href="/giris"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[var(--color-text-secondary)] hover:bg-white/5"
              >
                <User className="w-5 h-5" />
                Giriş Yap / Kayıt Ol
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
