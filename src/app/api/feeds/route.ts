import { NextResponse } from 'next/server';
import { fetchAllFeeds, Article } from '@/lib/rss';

// Prevent Next.js from statically caching this route at build time
export const dynamic = 'force-dynamic';

// Fallback articles from sportsdesk_v5.html in case fetching is empty or fails
const MOCK_ARTICLES = [
  {
    id: "a1",
    sport: "nrl",
    publisher: "smh",
    publisherName: "Sydney Morning Herald",
    publisherColor: "#0061C2",
    headline: "Broncos survive late Raiders scare to stay top of NRL ladder",
    snippet: "Brisbane held off a spirited comeback from Canberra in a hard-fought 24-18 victory at Suncorp, keeping their spot at the summit.",
    timeAgo: "2h ago",
    url: "https://smh.com.au/sport/nrl",
    img: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&q=75&auto=format",
    kw: ["broncos", "raiders"],
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "a2",
    sport: "nrl",
    publisher: "foxsports",
    publisherName: "Fox Sports",
    publisherColor: "#E8230A",
    headline: "Bulldogs re-sign Leota; Ciraldo locks in forward pack for Origin push",
    snippet: "Canterbury secured the powerful prop ahead of the June 30 deadline in a major boost for their defensive stocks.",
    timeAgo: "3h ago",
    url: "https://foxsports.com.au/nrl",
    img: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=75&auto=format",
    kw: ["bulldogs"],
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "a3",
    sport: "afl",
    publisher: "theage",
    publisherName: "The Age",
    publisherColor: "#007A3D",
    headline: "Collingwood v Richmond Friday Night Football: Everything you need to know",
    snippet: "The MCG will be packed for the traditional rivalry clash, with both clubs desperate for a bounce-back performance.",
    timeAgo: "1h ago",
    url: "https://theage.com.au/sport/afl",
    img: "https://images.unsplash.com/photo-1540747913346-19212a4b423b?w=600&q=75&auto=format",
    isLive: true,
    kw: ["collingwood", "richmond"],
    publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "a4",
    sport: "cricket",
    publisher: "smh",
    publisherName: "Sydney Morning Herald",
    publisherColor: "#0061C2",
    headline: "Australia declare at 8/312 as India face daunting final-day chase",
    snippet: "Pat Cummins declared with an hour remaining on Day 3, setting India an almost impossible target at the MCG.",
    timeAgo: "45m ago",
    url: "https://smh.com.au/sport/cricket",
    img: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&q=75&auto=format",
    isLive: true,
    kw: ["cummins"],
    publishedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
  },
  {
    id: "a5",
    sport: "afl",
    publisher: "foxsports",
    publisherName: "Fox Sports",
    publisherColor: "#E8230A",
    headline: "De Goey handed four-week ban; Pies miss key midfielder for crucial stretch",
    snippet: "Collingwood will be without their gun midfielder after the tribunal upheld the Match Review charge.",
    timeAgo: "3h ago",
    url: "https://foxsports.com.au/afl",
    img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=75&auto=format",
    kw: ["collingwood", "degoeey"],
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "a6",
    sport: "aleague",
    publisher: "smh",
    publisherName: "Sydney Morning Herald",
    publisherColor: "#0061C2",
    headline: "Sydney FC climb to A-League summit after clinical 3-1 win over Victory",
    snippet: "Goals from le Fondre, Ninković and Galeano sealed a dominant performance cementing the Sky Blues as title favourites.",
    timeAgo: "8h ago",
    url: "https://smh.com.au/sport/football",
    img: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&q=75&auto=format",
    kw: ["sydfc", "melvictory"],
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "a7",
    sport: "rugby",
    publisher: "smh",
    publisherName: "Sydney Morning Herald",
    publisherColor: "#0061C2",
    headline: "Wallabies 35-man squad named for July Lions series — two shock inclusions",
    snippet: "Joe Schmidt made several bold calls as Australia prepare to host rugby's greatest touring side.",
    timeAgo: "2h ago",
    url: "https://smh.com.au/sport/rugby-union",
    img: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&q=75&auto=format",
    kw: ["reds", "waratahs", "brumbies"],
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "a8",
    sport: "tennis",
    publisher: "smh",
    publisherName: "Sydney Morning Herald",
    publisherColor: "#0061C2",
    headline: "De Minaur reaches Miami Open quarter-finals with dominant straight-sets win",
    snippet: "The Australian No.1 dispatched his opponent in 68 minutes, setting up a blockbuster clash with Alcaraz.",
    timeAgo: "3h ago",
    url: "https://smh.com.au/sport/tennis",
    img: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&q=75&auto=format",
    kw: ["deminaur"],
    publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "a9",
    sport: "motorsport",
    publisher: "foxsports",
    publisherName: "Fox Sports",
    publisherColor: "#E8230A",
    headline: "Van Gisbergen dominates Race 1 at Taupo to extend Supercars championship lead",
    snippet: "The triple champion was untouchable in New Zealand, converting pole to a dominant victory.",
    timeAgo: "6h ago",
    url: "https://foxsports.com.au/motorsport",
    img: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=75&auto=format",
    kw: ["vangis"],
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "a10",
    sport: "nrl",
    publisher: "dailytelegraph",
    publisherName: "Daily Telegraph",
    publisherColor: "#C8970A",
    headline: "Latrell Mitchell injury scare: Souths star limps off after heavy contact",
    snippet: "South Sydney are sweating on scans after the fullback failed to return from the sheds.",
    timeAgo: "4h ago",
    url: "https://dailytelegraph.com.au/sport/nrl",
    img: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=600&q=75&auto=format",
    kw: ["rabbitohs", "latrell"],
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'all';
  const publisher = searchParams.get('publisher') || 'all';

  try {
    const allFeeds = await fetchAllFeeds();
    let articles: Article[] = [];

    if (sport === 'all') {
      articles = Object.values(allFeeds).flat();
    } else {
      articles = allFeeds[sport] || [];
    }

    // Filter by publisher if specified
    if (publisher !== 'all') {
      articles = articles.filter(a => a.publisher === publisher);
    }

    // De-duplicate articles by URL or headline to avoid React duplicate key collisions
    const seen = new Set<string>();
    articles = articles.filter(a => {
      const key = a.url || a.headline;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // Always blend in fallbacks for any sport that has fewer than 4 live articles,
    // so the UI never shows a blank panel (offline-resilient by design).
    const BLEND_THRESHOLD = 4;
    if (articles.length < BLEND_THRESHOLD) {
      const mocks = MOCK_ARTICLES.filter(a =>
        (sport === 'all' || a.sport === sport) &&
        (publisher === 'all' || a.publisher === publisher)
      );
      // Merge, de-dupe by URL, newest first
      const seen = new Set(articles.map(a => a.url));
      for (const m of mocks) {
        if (!seen.has(m.url)) {
          articles.push(m as Article);
          seen.add(m.url);
        }
      }
    }

    // Sort aggregated feed by publication date (newest first)
    articles.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

    return NextResponse.json({
      success: true,
      articles,
      count: articles.length
    });
  } catch (error) {
    console.error('Error fetching feeds:', error);
    // Return mock data on error so UI never breaks
    const fallback = MOCK_ARTICLES.filter(a =>
      (sport === 'all' || a.sport === sport) &&
      (publisher === 'all' || a.publisher === publisher)
    );
    return NextResponse.json({
      success: false,
      articles: fallback,
      count: fallback.length,
      error: 'Failed to fetch active feeds. Serving offline fallback.'
    });
  }
}
