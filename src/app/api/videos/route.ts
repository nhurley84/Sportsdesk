import { NextResponse } from 'next/server';
import { fetchVideos } from '@/lib/videos';

export const dynamic = 'force-dynamic';

const RESPONSE_CACHE_CONTROL = 'public, max-age=300, s-maxage=900, stale-while-revalidate=1800';

const pendingVideoRequests = new Map<string, Promise<Awaited<ReturnType<typeof fetchVideos>>>>();

function loadVideos(sport: string) {
  const existing = pendingVideoRequests.get(sport);
  if (existing) return existing;

  const request = fetchVideos(sport).finally(() => pendingVideoRequests.delete(sport));
  pendingVideoRequests.set(sport, request);
  return request;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'all';
  const q = searchParams.get('q')?.toLowerCase().trim() || '';

  try {
    let allVideos = await loadVideos(sport);

    if (sport !== 'all') {
      allVideos = allVideos.filter(v => v.sport === sport);
    }

    if (q) {
      allVideos = allVideos.filter(v => 
        v.title.toLowerCase().includes(q)
      );
    }

    return NextResponse.json(
      {
        success: true,
        videos: allVideos,
        count: allVideos.length
      },
      { headers: { 'Cache-Control': RESPONSE_CACHE_CONTROL } },
    );
  } catch (error) {
    console.error('Video fetch error:', error);
    return NextResponse.json({
      success: false,
      videos: [],
      count: 0
    });
  }
}
