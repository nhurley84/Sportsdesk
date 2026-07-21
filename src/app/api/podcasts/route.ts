import { NextResponse } from 'next/server';
import { fetchPodcasts } from '@/lib/podcasts';

const RESPONSE_CACHE_CONTROL = 'public, max-age=300, s-maxage=1800, stale-while-revalidate=3600';

const pendingPodcastRequests = new Map<string, Promise<Awaited<ReturnType<typeof fetchPodcasts>>>>();

function loadPodcasts(sport: string) {
  const existing = pendingPodcastRequests.get(sport);
  if (existing) return existing;

  const request = fetchPodcasts(sport).finally(() => pendingPodcastRequests.delete(sport));
  pendingPodcastRequests.set(sport, request);
  return request;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'all';

  try {
    const fetchedPodcasts = await loadPodcasts(sport);
    const podcasts = sport === 'all'
      ? fetchedPodcasts
      : fetchedPodcasts.filter((podcast) => podcast.sport === sport);

    return NextResponse.json(
      {
        success: true,
        podcasts,
      },
      { headers: { 'Cache-Control': RESPONSE_CACHE_CONTROL } },
    );
  } catch (error) {
    console.error('Error in podcasts API:', error);
    return NextResponse.json({
      success: false,
      podcasts: [],
      error: 'Podcast feeds are unavailable.',
    });
  }
}
