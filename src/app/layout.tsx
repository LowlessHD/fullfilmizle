import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AuthProvider from "@/components/providers/AuthProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FullFilmİzle — HD Film ve Dizi İzle",
    template: "%s | FullFilmİzle",
  },
  description:
    "En güncel dizi ve filmleri HD kalitede, Türkçe altyazılı ve dublajlı olarak ücretsiz izleyin. Yeni bölümler anında eklenir.",
  keywords: [
    "film izle",
    "dizi izle",
    "HD film",
    "türkçe altyazılı",
    "yabancı dizi",
    "online film",
    "fullfilmizle",
  ],
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "FullFilmİzle",
    title: "FullFilmİzle — HD Film ve Dizi İzle",
    description:
      "En güncel dizi ve filmleri HD kalitede, Türkçe altyazılı ve dublajlı olarak ücretsiz izleyin.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FullFilmİzle",
    description: "HD Film ve Dizi İzleme Platformu",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] font-[var(--font-sans)]">
        <AuthProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
