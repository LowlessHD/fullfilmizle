"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ContentCard from "@/components/cards/ContentCard";
import type { ContentCard as ContentCardType } from "@/types/content";

interface ContentRowProps {
  title: string;
  href?: string;
  items: ContentCardType[];
}

export default function ContentRow({ title, href, items }: ContentRowProps) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <h2 className="section-title">{title}</h2>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            Tümünü Gör
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* İçerik Kaydırma */}
      <div className="horizontal-scroll">
        {items.map((item, index) => (
          <ContentCard key={item.id} content={item} index={index} />
        ))}
      </div>
    </section>
  );
}
