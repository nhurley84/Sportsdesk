import { NextResponse } from 'next/server';
import { fetchSocialFeed } from '@/lib/social';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'all';
  const plat = searchParams.get('plat') || 'all';
  const sort = searchParams.get('sort') || 'trending';
  const q = searchParams.get('q')?.toLowerCase().trim() || '';

  try {
    let posts = await fetchSocialFeed();

    // Filter by sport
    if (sport !== 'all') {
      posts = posts.filter(p => p.sport === sport);
    }

    // Filter by platform
    if (plat !== 'all') {
      posts = posts.filter(p => p.plat === plat);
    }

    // Filter by search query
    if (q) {
      posts = posts.filter(p =>
        p.text.toLowerCase().includes(q) ||
        p.handle.toLowerCase().includes(q) ||
        p.uname.toLowerCase().includes(q)
      );
    }

    // Sort
    posts = [...posts].sort((a, b) => {
      if (sort === 'latest') return 0; // already in arrival order
      // trending: by score
      return b.score - a.score;
    });

    return NextResponse.json({
      success: true,
      posts,
      count: posts.length
    });
  } catch (error) {
    console.error('Social feed error:', error);
    return NextResponse.json({
      success: false,
      posts: [],
      count: 0
    });
  }
}
