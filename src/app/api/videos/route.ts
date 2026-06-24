import { NextResponse } from 'next/server';
import { fetchVideos } from '@/lib/videos';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'all';
  const q = searchParams.get('q')?.toLowerCase().trim() || '';

  try {
    let allVideos = await fetchVideos();

    if (sport !== 'all') {
      allVideos = allVideos.filter(v => v.sport === sport);
    }

    if (q) {
      allVideos = allVideos.filter(v => 
        v.title.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      videos: allVideos,
      count: allVideos.length
    });
  } catch (error) {
    console.error('Video fetch error:', error);
    return NextResponse.json({
      success: false,
      videos: [],
      count: 0
    });
  }
}
