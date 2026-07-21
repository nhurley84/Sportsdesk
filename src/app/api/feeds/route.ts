import { NextResponse } from 'next/server';
import { dedupeArticles, fetchAllFeeds, type Article } from '@/lib/rss';

export const dynamic = 'force-dynamic';

const RESPONSE_CACHE_CONTROL = 'public, max-age=60, s-maxage=300, stale-while-revalidate=900';

const pendingFeedRequests = new Map<string, Promise<Awaited<ReturnType<typeof fetchAllFeeds>>>>();

function loadFeeds(sport: string) {
  const existing = pendingFeedRequests.get(sport);
  if (existing) return existing;

  const request = fetchAllFeeds(sport).finally(() => pendingFeedRequests.delete(sport));
  pendingFeedRequests.set(sport, request);
  return request;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'all';
  const publisher = searchParams.get('publisher') || 'all';

  try {
    const feedsBySport = await loadFeeds(sport);
    let articles: Article[] = sport === 'all'
      ? Object.values(feedsBySport).flat()
      : feedsBySport[sport] || [];

    if (publisher !== 'all') {
      articles = articles.filter((article) => article.publisher === publisher);
    }

    articles = dedupeArticles(articles);

    return NextResponse.json(
      {
        success: true,
        articles,
        count: articles.length,
      },
      { headers: { 'Cache-Control': RESPONSE_CACHE_CONTROL } },
    );
  } catch (error) {
    console.error('Error fetching feeds:', error);
    return NextResponse.json(
      {
        success: false,
        articles: [],
        count: 0,
        error: 'Live RSS feeds are temporarily unavailable.',
      },
      { status: 503 },
    );
  }
}
