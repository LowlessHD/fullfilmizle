import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { syncMovieById, syncTvById } from "@/lib/bot/tmdb-sync";

export const dynamic = "force-dynamic";

/**
 * İçerikleri Listele (Filtreleme & Arama Desteğiyle)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type");

    const contents = await prisma.content.findMany({
      where: {
        ...(query ? { title: { contains: query, mode: "insensitive" } } : {}),
        ...(type && (type === "MOVIE" || type === "SERIES") ? { type } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        originalTitle: true,
        slug: true,
        type: true,
        posterUrl: true,
        tmdbId: true,
        imdbRating: true,
        releaseYear: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, contents });
  } catch (error: unknown) {
    console.error("İçerik listeleme hatası:", error);
    const message = error instanceof Error ? error.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * TMDB ID ile Manuel Film veya Dizi Ekle
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const body = await request.json();
    const { type, tmdbId } = body;

    const parsedId = parseInt(String(tmdbId).trim(), 10);
    if (!parsedId || isNaN(parsedId)) {
      return NextResponse.json(
        { error: "Geçerli bir TMDB ID giriniz (Örn: 693134)." },
        { status: 400 }
      );
    }

    let syncedContent;
    if (type === "MOVIE") {
      syncedContent = await syncMovieById(parsedId);
    } else if (type === "SERIES") {
      syncedContent = await syncTvById(parsedId, 2);
    } else {
      return NextResponse.json(
        { error: "Tür yalnızca 'MOVIE' veya 'SERIES' olabilir." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `"${syncedContent.title}" içeriği başarıyla veritabanına eklendi!`,
      content: syncedContent,
    });
  } catch (error: unknown) {
    console.error("Manuel içerik ekleme hatası:", error);
    const message = error instanceof Error ? error.message : "İçerik çekilemedi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * İçerik Silme
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Silinecek ID zorunludur." }, { status: 400 });
    }

    await prisma.content.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "İçerik başarıyla silindi.",
    });
  } catch (error: unknown) {
    console.error("İçerik silme hatası:", error);
    const message = error instanceof Error ? error.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
