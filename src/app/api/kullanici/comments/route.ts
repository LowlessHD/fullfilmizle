import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * İçeriğe Ait Yorumları Listele
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const contentId = searchParams.get("contentId");
    const episodeId = searchParams.get("episodeId");

    if (!contentId) {
      return NextResponse.json({ error: "contentId zorunludur." }, { status: 400 });
    }

    const comments = await prisma.comment.findMany({
      where: {
        contentId,
        episodeId: episodeId || null,
        parentId: null, // Ana yorumlar
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            role: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, comments });
  } catch (error: unknown) {
    console.error("Yorumlar alınırken hata:", error);
    const message = error instanceof Error ? error.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Yeni Yorum Gönder
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Yorum yapmak için giriş yapmalısınız." }, { status: 401 });
    }

    const body = await request.json();
    const { contentId, episodeId, body: commentBody, parentId } = body;

    if (!contentId || !commentBody || commentBody.trim().length === 0) {
      return NextResponse.json({ error: "Yorum içeriği boş olamaz." }, { status: 400 });
    }

    if (commentBody.length > 1000) {
      return NextResponse.json(
        { error: "Yorum 1000 karakterden uzun olamaz." },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.create({
      data: {
        userId: session.user.id,
        contentId,
        episodeId: episodeId || null,
        parentId: parentId || null,
        body: commentBody.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Yorumunuz başarıyla paylaşıldı.",
        comment,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Yorum gönderme hatası:", error);
    const message = error instanceof Error ? error.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
