import { NextRequest, NextResponse } from "next/server";
import { runTmdbSyncBot } from "@/lib/bot/tmdb-sync";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleSync(request);
}

export async function POST(request: NextRequest) {
  return handleSync(request);
}

async function handleSync(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const moviesCount = parseInt(searchParams.get("movies") || "10", 10);
    const tvCount = parseInt(searchParams.get("tv") || "5", 10);
    const maxSeasons = parseInt(searchParams.get("seasons") || "2", 10);

    const startTime = Date.now();
    const result = await runTmdbSyncBot({
      moviesCount,
      tvCount,
      maxSeasonsPerTv: maxSeasons,
    });
    const durationMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      durationMs,
      ...result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
