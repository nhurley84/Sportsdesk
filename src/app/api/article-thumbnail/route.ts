import { fetchOgMedia } from '@/lib/rss';
import sourcesData from '@/data/sources.json';

export const dynamic = 'force-dynamic';

const SOURCE_HOSTS = new Set(
      sourcesData.news.flatMap((source) => [source.url, source.rss])
            .filter((value): value is string => Boolean(value))
    .flatMap((value) => {
      try {
        return [new URL(value).hostname.replace(/^www\./, '').toLowerCase()];
      } catch {
        return [];
      }
    }),
);

function isConfiguredSourceHost(hostname: string): boolean {
  const host = hostname.replace(/^www\./, '').toLowerCase();
  return [...SOURCE_HOSTS].some((sourceHost) => (
    host === sourceHost || host.endsWith(`.${sourceHost}`)
  ));
}

function isAllowedArticleUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;

    return (
      url.hostname === 'news.google.com'
      && url.pathname.startsWith('/rss/articles/')
    ) || isConfiguredSourceHost(url.hostname);
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const articleUrl = new URL(request.url).searchParams.get('url') || '';
  if (!isAllowedArticleUrl(articleUrl)) {
    return new Response(null, { status: 400 });
  }

  const media = await fetchOgMedia(articleUrl);
  if (!media.imageUrl) {
    return new Response(null, {
      status: 404,
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' },
    });
  }

  return new Response(null, {
    status: 307,
    headers: {
      Location: media.imageUrl,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
