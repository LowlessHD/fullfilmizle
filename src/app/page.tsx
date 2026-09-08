import HeroSlider from "@/components/sections/HeroSlider";
import ContentRow from "@/components/sections/ContentRow";
import {
  demoHeroItems,
  demoTrendDiziler,
  demoPopulerFilmler,
  demoYeniEklenenler,
} from "@/lib/demo-data";
import { Flame, TrendingUp, Sparkles, Film } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Slider */}
      <HeroSlider items={demoHeroItems} />

      {/* İçerik Bölümleri */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 space-y-12 pb-16 -mt-16 relative z-10">
        {/* Trend Diziler */}
        <ContentRow
          title="🔥 Trend Diziler"
          href="/diziler"
          items={demoTrendDiziler}
        />

        {/* Popüler Filmler */}
        <ContentRow
          title="🎬 Popüler Filmler"
          href="/filmler"
          items={demoPopulerFilmler}
        />

        {/* Yeni Eklenenler */}
        <ContentRow
          title="✨ Yeni Eklenenler"
          items={demoYeniEklenenler}
        />

        {/* Kategoriler Bölümü */}
        <section className="space-y-4">
          <h2 className="section-title">🎭 Kategoriler</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { name: "Aksiyon", slug: "aksiyon", emoji: "💥", gradient: "from-red-600/20 to-orange-600/20" },
              { name: "Komedi", slug: "komedi", emoji: "😂", gradient: "from-yellow-600/20 to-amber-600/20" },
              { name: "Drama", slug: "drama", emoji: "🎭", gradient: "from-blue-600/20 to-indigo-600/20" },
              { name: "Bilim Kurgu", slug: "bilim-kurgu", emoji: "🚀", gradient: "from-cyan-600/20 to-teal-600/20" },
              { name: "Korku", slug: "korku", emoji: "👻", gradient: "from-purple-600/20 to-violet-600/20" },
              { name: "Romantik", slug: "romantik", emoji: "💕", gradient: "from-pink-600/20 to-rose-600/20" },
              { name: "Gerilim", slug: "gerilim", emoji: "🔪", gradient: "from-gray-600/20 to-slate-600/20" },
              { name: "Fantastik", slug: "fantastik", emoji: "🧙", gradient: "from-emerald-600/20 to-green-600/20" },
              { name: "Animasyon", slug: "animasyon", emoji: "🎨", gradient: "from-fuchsia-600/20 to-pink-600/20" },
              { name: "Belgesel", slug: "belgesel", emoji: "📽️", gradient: "from-amber-600/20 to-yellow-600/20" },
              { name: "Suç", slug: "suc", emoji: "🔫", gradient: "from-stone-600/20 to-zinc-600/20" },
              { name: "Macera", slug: "macera", emoji: "⚔️", gradient: "from-orange-600/20 to-red-600/20" },
            ].map((cat) => (
              <a
                key={cat.slug}
                href={`/kategoriler/${cat.slug}`}
                className={`glass-card p-4 text-center space-y-2 bg-gradient-to-br ${cat.gradient} hover:scale-105`}
              >
                <span className="text-2xl">{cat.emoji}</span>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  {cat.name}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="relative overflow-hidden rounded-2xl p-8 sm:p-12 bg-gradient-to-r from-[var(--color-accent)]/20 via-purple-900/20 to-pink-900/20 border border-[var(--color-accent)]/20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[var(--color-accent)]/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-pink-600/10 blur-3xl" />
          </div>
          <div className="relative z-10 text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold">
              Hemen Ücretsiz Üye Olun
            </h2>
            <p className="text-[var(--color-text-secondary)] max-w-lg mx-auto">
              İzleme listenizi oluşturun, kaldığınız yerden devam edin ve yeni
              bölüm bildirimlerini kaçırmayın.
            </p>
            <a
              href="/kayit"
              className="btn-primary inline-flex text-base px-8 py-3.5"
            >
              <Sparkles className="w-5 h-5" />
              Kayıt Ol
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
