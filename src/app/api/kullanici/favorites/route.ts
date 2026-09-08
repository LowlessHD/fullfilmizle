import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Kullanıcının Favori İçeriklerini Listele
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      orderBy: { addedAt: "desc" },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            posterUrl: true,
            backdropUrl: true,
            imdbRating: true,
            releaseYear: true,
            quality: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, favorites });
  } catch (error: unknown) {
    console.error("Favoriler listelenirken hata:", error);
    const message = error instanceof Error ? error.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Favoriye Ekle / Çıkar (Toggle)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const body = await request.json();
    const { contentId } = body;

    if (!contentId) {
      return NextResponse.json({ error: "contentId zorunludur." }, { status: 400 });
    }

    // Zaten favoride mi?
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId,
        },
      },
    });

    if (existing) {
      // Varsa favorilerden çıkar
      await prisma.favorite.delete({
        where: {
          userId_contentId: {
            userId: session.user.id,
            contentId,
          },
        },
      });

      return NextResponse.json({
        success: true,
        isFavorited: false,
        message: "İçerik favorilerinizden çıkarıldı.",
      });
    } else {
      // Yoksa favorilere ekle
      await prisma.favorite.create({
        data: {
          userId: session.user.id,
          contentId,
        },
      });

      return NextResponse.json({
        success: true,
        isFavorited: true,
        message: "İçerik favorilerinize eklendi.",
      });
    }
  } catch (error: unknown) {
    console.error("Favori işlemi hatası:", error);
    const message = error instanceof Error ? error.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
