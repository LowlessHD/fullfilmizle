import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Kullanıcının İzleme Geçmişini Getir
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const history = await prisma.watchHistory.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        watchedAt: "desc",
      },
      take: 20,
      include: {
        content: {
          select: {
            id: true,
            title: true,
            slug: true,
            type: true,
            posterUrl: true,
            backdropUrl: true,
            durationMinutes: true,
          },
        },
        episode: {
          select: {
            id: true,
            episodeNumber: true,
            title: true,
            durationMinutes: true,
            season: {
              select: {
                seasonNumber: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, history });
  } catch (error: unknown) {
    console.error("İzleme geçmişi getirme hatası:", error);
    const message = error instanceof Error ? error.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * İzleme İlerlemesini Kaydet (Kaldığın Yerden Devam Et)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const body = await request.json();
    const { contentId, episodeId, progressSeconds = 0, totalSeconds = 0 } = body;

    if (!contentId) {
      return NextResponse.json({ error: "contentId zorunludur." }, { status: 400 });
    }

    const watchRecord = await prisma.watchHistory.upsert({
      where: {
        userId_contentId_episodeId: {
          userId: session.user.id,
          contentId,
          episodeId: episodeId || null,
        },
      },
      update: {
        progressSeconds: Math.floor(progressSeconds),
        totalSeconds: Math.floor(totalSeconds),
        watchedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        contentId,
        episodeId: episodeId || null,
        progressSeconds: Math.floor(progressSeconds),
        totalSeconds: Math.floor(totalSeconds),
        watchedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, record: watchRecord });
  } catch (error: unknown) {
    console.error("İzleme geçmişi kaydetme hatası:", error);
    const message = error instanceof Error ? error.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
