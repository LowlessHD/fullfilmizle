import Link from "next/link";
import { Film, ExternalLink } from "lucide-react";

// Sosyal medya ikonları (lucide-react'te artık yok, inline SVG kullanıyoruz)
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const footerLinks = {
  kesfet: [
    { href: "/diziler", label: "Diziler" },
    { href: "/filmler", label: "Filmler" },
    { href: "/kategoriler/aksiyon", label: "Aksiyon" },
    { href: "/kategoriler/komedi", label: "Komedi" },
    { href: "/kategoriler/bilim-kurgu", label: "Bilim Kurgu" },
  ],
  bilgi: [
    { href: "/hakkimizda", label: "Hakkımızda" },
    { href: "/iletisim", label: "İletişim" },
    { href: "/gizlilik", label: "Gizlilik Politikası" },
    { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
    { href: "/sss", label: "Sıkça Sorulan Sorular" },
  ],
};

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/5">
      {/* Gradient üst çizgi */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/50 to-transparent" />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Açıklama */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--color-accent)] to-purple-700 flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                <span className="text-[var(--color-text-primary)]">Full</span>
                <span className="gradient-text">Film</span>
                <span className="text-[var(--color-text-primary)]">İzle</span>
              </span>
            </Link>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed max-w-md mb-6">
              En güncel dizi ve filmleri HD kalitede, Türkçe altyazılı ve
              dublajlı olarak izleyebileceğiniz ücretsiz platform. Yeni
              bölümler eklendikçe otomatik güncellenir.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="btn-icon"
                aria-label="Twitter"
                target="_blank"
                rel="noopener noreferrer"
              >
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="btn-icon"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="btn-icon"
                aria-label="Github"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Keşfet */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">
              Keşfet
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.kesfet.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Bilgi */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-text-primary)] uppercase tracking-wider mb-4">
              Bilgi
            </h4>
            <ul className="space-y-2.5">
              {footerLinks.bilgi.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Alt Kısım */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-muted)]">
            © {new Date().getFullYear()} FullFilmİzle. Tüm hakları saklıdır.
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Bu sitede yer alan içerikler bilgilendirme amaçlıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
