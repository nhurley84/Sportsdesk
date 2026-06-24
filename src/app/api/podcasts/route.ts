import { NextResponse } from 'next/server';
import { fetchPodcasts, MOCK_PODCASTS } from '@/lib/podcasts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'all';

  try {
    const podcasts = await fetchPodcasts();
    let filtered = podcasts;

    if (sport !== 'all') {
      filtered = podcasts.filter(p => p.sport === sport);
    }

    if (filtered.length === 0) {
      filtered = MOCK_PODCASTS.filter(p => sport === 'all' || p.sport === sport);
    }

    return NextResponse.json({
      success: true,
      podcasts: filtered
    });
  } catch (error) {
    console.error('Error in podcasts API:', error);
    const fallback = MOCK_PODCASTS.filter(p => sport === 'all' || p.sport === sport);
    return NextResponse.json({
      success: false,
      podcasts: fallback,
      error: 'Serving offline fallback podcasts.'
    });
  }
}
