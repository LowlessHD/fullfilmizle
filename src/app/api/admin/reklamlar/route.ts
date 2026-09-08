import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

const DEFAULT_SLOTS = [
  {
    name: "Video Öncesi Reklam (Video Pre-Roll)",
    position: "PRE_ROLL" as const,
    vastUrl: "https://example.com/vast.xml",
    fallbackImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800",
    fallbackLink: "https://example.com",
    isActive: true,
  },
  {
    name: "Oynatıcı İçi Banner (Player Overlay)",
    position: "POPUP" as const,
    fallbackImage: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800",
    fallbackLink: "https://example.com",
    isActive: false,
  },
  {
    name: "Kenar Çubuğu Reklamı (Sidebar Banner)",
    position: "BANNER" as const,
    fallbackImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800",
    fallbackLink: "https://example.com",
    isActive: true,
  },
];

/**
 * Reklam Slotlarını Listele
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    let ads = await prisma.adPlacement.findMany({
      orderBy: { name: "asc" },
    });

    // Eğer henüz hiç reklam eklenmediyse varsayılanları oluştur
    if (ads.length === 0) {
      for (const slot of DEFAULT_SLOTS) {
        await prisma.adPlacement.create({ data: slot });
      }
      ads = await prisma.adPlacement.findMany({
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json({ success: true, ads });
  } catch (error: unknown) {
    console.error("Reklam listeleme hatası:", error);
    const message = error instanceof Error ? error.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Reklam Slotu Güncelle / Ekle
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, position, vastUrl, fallbackImage, fallbackLink, isActive } = body;

    if (!name || !position) {
      return NextResponse.json(
        { error: "İsim ve pozisyon zorunludur." },
        { status: 400 }
      );
    }

    let ad;
    if (id) {
      ad = await prisma.adPlacement.update({
        where: { id },
        data: {
          name,
          position,
          vastUrl: vastUrl || null,
          fallbackImage: fallbackImage || null,
          fallbackLink: fallbackLink || null,
          isActive: typeof isActive === "boolean" ? isActive : true,
        },
      });
    } else {
      ad = await prisma.adPlacement.create({
        data: {
          name,
          position,
          vastUrl: vastUrl || null,
          fallbackImage: fallbackImage || null,
          fallbackLink: fallbackLink || null,
          isActive: typeof isActive === "boolean" ? isActive : true,
        },
      });
    }

    return NextResponse.json({ success: true, ad });
  } catch (error: unknown) {
    console.error("Reklam kaydetme hatası:", error);
    const message = error instanceof Error ? error.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Reklam Aktif/Pasif Durumu Değiştir (Toggle)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 403 });
    }

    const body = await request.json();
    const { id, isActive } = body;

    if (!id || typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "id ve isActive zorunludur." },
        { status: 400 }
      );
    }

    const ad = await prisma.adPlacement.update({
      where: { id },
      data: { isActive },
    });

    return NextResponse.json({ success: true, ad });
  } catch (error: unknown) {
    console.error("Reklam durumu güncelleme hatası:", error);
    const message = error instanceof Error ? error.message : "Sunucu hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
