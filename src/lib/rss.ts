import Parser from 'rss-parser';
import sourcesData from '../data/sources.json';

// Initialize RSS Parser with comprehensive custom field support
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
      ['media:group', 'mediaGroup'],
      ['enclosure', 'enclosure'],
      ['content:encoded', 'contentEncoded'],
      ['itunes:image', 'itunesImage']
    ]
  }
});

export interface Article {
  id: string;
  sport: string;
  publisher: string;
  publisherName: string;
  publisherColor: string;
  headline: string;
  snippet: string;
  timeAgo: string;
  url: string;
  img?: string;
  isLive?: boolean;
  kw?: string[];
  publishedAt: string;
}

// Map publisher domain/name to keys and colors from sportsdesk_v5.html
export const PUBLISHERS: Record<string, { name: string; color: string }> = {
  smh: { name: 'Sydney Morning Herald', color: '#0061C2' },
  theage: { name: 'The Age', color: '#007A3D' },
  foxsports: { name: 'Fox Sports', color: '#E8230A' },
  dailytelegraph: { name: 'Daily Telegraph', color: '#C8970A' },
  abc: { name: 'ABC Sport', color: '#7B2D8B' },
  heraldsun: { name: 'Herald Sun', color: '#F56600' },
  espn: { name: 'ESPN', color: '#CC0000' },
  bbc: { name: 'BBC Sport', color: '#FFD230' },
  sky: { name: 'Sky Sports', color: '#00A3E0' },
  guardian: { name: 'The Guardian', color: '#005689' },
  cricinfo: { name: 'ESPNcricinfo', color: '#03A9F4' },
  cbs: { name: 'CBS Sports', color: '#0B2265' },
  autosport: { name: 'Autosport', color: '#E10600' },
  motorsport: { name: 'Motorsport.com', color: '#000000' },
  theroar: { name: 'The Roar', color: '#FF9800' }
};

function getPublisherKey(sourceName: string, url: string): string {
  const s = sourceName.toLowerCase();
  const u = url.toLowerCase();
  if (s.includes('smh') || u.includes('smh.com.au')) return 'smh';
  if (s.includes('the age') || u.includes('theage.com.au')) return 'theage';
  if (s.includes('fox') || u.includes('foxsports.com.au')) return 'foxsports';
  if (s.includes('telegraph') || u.includes('dailytelegraph.com.au')) return 'dailytelegraph';
  if (s.includes('abc') || u.includes('abc.net.au')) return 'abc';
  if (s.includes('herald sun') || u.includes('heraldsun.com.au')) return 'heraldsun';
  if (s.includes('espn') || u.includes('espn.com')) return 'espn';
  if (s.includes('bbc') || u.includes('bbc.co.uk') || u.includes('bbc.com')) return 'bbc';
  if (s.includes('sky') || u.includes('skysports.com')) return 'sky';
  if (s.includes('guardian') || u.includes('theguardian.com')) return 'guardian';
  if (s.includes('cricinfo') || u.includes('espncricinfo.com')) return 'cricinfo';
  if (s.includes('cbs') || u.includes('cbssports.com')) return 'cbs';
  if (s.includes('autosport') || u.includes('autosport.com')) return 'autosport';
  if (s.includes('motorsport') || u.includes('motorsport.com')) return 'motorsport';
  if (s.includes('roar') || u.includes('theroar.com.au')) return 'theroar';
  return 'general';
}

/** Helper: check if a URL looks like a real image (not a tracker pixel or icon) */
function isValidImageUrl(url: string | undefined): boolean {
  if (!url || !url.startsWith('http')) return false;
  const lower = url.toLowerCase();
  // Filter out tracking pixels, logos, tiny icons
  if (lower.includes('analytics') || lower.includes('pixel') || lower.includes('beacon')) return false;
  if (lower.includes('logo') && lower.includes('rss')) return false;
  if (lower.endsWith('.gif') && lower.includes('1x1')) return false;
  return true;
}

/** Helper: pick the best (largest by width) media:content from an array */
function pickBestMediaContent(items: any[]): string | undefined {
  let best: { url: string; width: number } | undefined;
  for (const mc of items) {
    const attrs = mc.$ || mc;
    const url = attrs.url || attrs.href;
    if (!isValidImageUrl(url)) continue;
    const medium = (attrs.medium || attrs.type || '').toLowerCase();
    // Skip if explicitly marked as video or audio
    if (medium === 'video' || medium === 'audio') continue;
    const w = parseInt(attrs.width || '0', 10) || 0;
    if (!best || w > best.width) best = { url, width: w };
  }
  return best?.url;
}

function extractImage(item: any): string | undefined {
  // ── 1. media:content (Guardian — array with $, pick largest width) ──
  if (item.mediaContent) {
    const list = Array.isArray(item.mediaContent) ? item.mediaContent : [item.mediaContent];
    const url = pickBestMediaContent(list);
    if (url) return url;
  }

  // ── 2. media:group (ABC News — nested key is 'media:content', not 'mediaContent') ──
  if (item.mediaGroup) {
    const raw = item.mediaGroup['media:content'] || item.mediaGroup.mediaContent || item.mediaGroup.content;
    if (raw) {
      const list = Array.isArray(raw) ? raw : [raw];
      const url = pickBestMediaContent(list);
      if (url) return url;
    }
  }

  // ── 3. media:thumbnail (BBC — array, each item has $ with url/width/height) ──
  if (item.mediaThumbnail) {
    const thumbs = Array.isArray(item.mediaThumbnail) ? item.mediaThumbnail : [item.mediaThumbnail];
    let bestThumb: { url: string; width: number } | undefined;
    for (const thumb of thumbs) {
      const url = thumb?.$ ? thumb.$.url : thumb?.url;
      const w = parseInt(thumb?.$ ? (thumb.$.width || '0') : (thumb?.width || '0'), 10) || 0;
      if (isValidImageUrl(url) && (!bestThumb || w > bestThumb.width)) bestThumb = { url, width: w };
    }
    if (bestThumb) return bestThumb.url;
  }

  // ── 4. enclosure (CBS Sports — direct { url, length, type } no $ wrapper) ──
  if (item.enclosure) {
    const enc = item.enclosure.$ || item.enclosure;
    const type = (enc.type || '').toLowerCase();
    const url = enc.url;
    if (isValidImageUrl(url) && (!type || type.startsWith('image/'))) return url;
  }

  // ── 5. itunes:image ──
  if (item.itunesImage) {
    const url = item.itunesImage.$?.href ?? item.itunesImage.href ?? item.itunesImage;
    if (typeof url === 'string' && isValidImageUrl(url)) return url;
  }

  // ── 6. HTML deep-scan: contentEncoded (The Roar), content (Guardian inline), description ──
  const htmlSources = [
    item.contentEncoded,
    item['content:encoded'],
    item['content:encodedSnippet'],
    item.content,
    item.description,
    item.summary,
  ].filter((h): h is string => typeof h === 'string' && h.length > 10);

  for (const html of htmlSources) {
    // 6a. All <img> tags — data-src first (lazy-load), then src, then srcset
    for (const imgTag of (html.match(/<img[^>]+>/gi) || [])) {
      const dataSrc = imgTag.match(/data-src=["']([^"']+)["']/i);
      if (dataSrc && isValidImageUrl(dataSrc[1])) return dataSrc[1];

      const src = imgTag.match(/\bsrc=["']([^"']+)["']/i);
      if (src && isValidImageUrl(src[1])) return src[1];

      const srcset = imgTag.match(/srcset=["']([^"']+)["']/i);
      if (srcset) {
        const firstUrl = srcset[1].split(',')[0].trim().split(/\s+/)[0];
        if (isValidImageUrl(firstUrl)) return firstUrl;
      }
    }

    // 6b. YouTube iframe → thumbnail
    const yt = html.match(/<iframe[^>]+src=["'](?:https?:)?\/\/(?:www\.)?youtube\.com\/embed\/([^"'>?&]+)/i);
    if (yt?.[1]) return `https://img.youtube.com/vi/${yt[1]}/maxresdefault.jpg`;

    // 6c. CSS background-image
    const bg = html.match(/background(?:-image)?:\s*url\(["']?([^"')]+)["']?\)/i);
    if (bg && isValidImageUrl(bg[1])) return bg[1];
  }

  return undefined;
}

function cleanHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ') // normalize spaces
    .trim();
}

function formatTimeAgo(dateStr: string): string {
  try {
    const parsed = Date.parse(dateStr);
    if (isNaN(parsed)) return 'recently';
    const seconds = Math.floor((Date.now() - parsed) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  } catch (e) {
    return 'recently';
  }
}

// In-memory cache for feeds to prevent hammering and slow loads
let cache: {
  timestamp: number;
  data: Record<string, Article[]>;
} = {
  timestamp: 0,
  data: {}
};

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Hand-curated Unsplash IDs for guaranteed high-quality, sport-relevant fallback imagery
const SPORT_FALLBACKS: Record<string, string[]> = {
  afl: [
    'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1508344928928-7165b67de128?w=600&q=80&auto=format&fit=crop'
  ],
  nrl: [
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540826978432-84196144e531?w=600&q=80&auto=format&fit=crop'
  ],
  cricket: [
    'https://images.unsplash.com/photo-1531415074968-03611b674b0f?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80&auto=format&fit=crop'
  ],
  rugby: [
    'https://images.unsplash.com/photo-1583448368793-6f62ac2024e8?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616428784180-2a8bbba7814b?w=600&q=80&auto=format&fit=crop'
  ],
  aleague: [
    'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&q=80&auto=format&fit=crop'
  ],
  basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80&auto=format&fit=crop'
  ],
  nfl: [
    'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1611340632313-1f14840d5bfa?w=600&q=80&auto=format&fit=crop'
  ],
  motorsport: [
    'https://images.unsplash.com/photo-1541447271487-09612b3f49f7?w=600&q=80&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80&auto=format&fit=crop'
  ]
};

function getFallbackImage(sport: string, seed: number): string {
  const list = SPORT_FALLBACKS[sport] || SPORT_FALLBACKS['aleague'];
  return list[Math.abs(seed) % list.length];
}

// Small in-memory OG image cache to avoid re-fetching same article URLs
const ogCache = new Map<string, string>();

async function fetchOgImage(articleUrl: string): Promise<string | undefined> {
  if (!articleUrl || !articleUrl.startsWith('http')) return undefined;
  if (ogCache.has(articleUrl)) return ogCache.get(articleUrl);
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch(articleUrl, {
      signal: ctrl.signal,
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html'
      }
    });
    clearTimeout(timer);
    if (!res.ok) return undefined;

    // Only read first 15KB — meta tags are always in <head>
    const reader = res.body?.getReader();
    if (!reader) return undefined;
    let html = '';
    while (html.length < 15000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += new TextDecoder().decode(value);
    }
    reader.cancel();

    // Try og:image (both attribute orders)
    const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (og?.[1]) {
      try {
        const resolved = new URL(og[1], articleUrl).href;
        if (isValidImageUrl(resolved)) {
          ogCache.set(articleUrl, resolved);
          return resolved;
        }
      } catch { }
    }

    // Try twitter:image
    const tw = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (tw?.[1]) {
      try {
        const resolved = new URL(tw[1], articleUrl).href;
        if (isValidImageUrl(resolved)) {
          ogCache.set(articleUrl, resolved);
          return resolved;
        }
      } catch { }
    }

    // Try og:video for embedded YouTube videos
    const video = html.match(/<meta[^>]+property=["']og:video(:url|:secure_url)?["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(:url|:secure_url)?["']/i);
    if (video?.[2]) {
      const ytMatch = video[2].match(/(?:youtube\.com\/embed\/|youtu\.be\/|youtube\.com\/v\/)([^?&"'>]+)/i);
      if (ytMatch && ytMatch[1]) {
        const thumb = `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
        ogCache.set(articleUrl, thumb);
        return thumb;
      }
    }

    // Try a standard image tag in the loaded head/body snippet as a final resort
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch?.[1]) {
      try {
        const resolved = new URL(imgMatch[1], articleUrl).href;
        if (isValidImageUrl(resolved)) {
          ogCache.set(articleUrl, resolved);
          return resolved;
        }
      } catch { }
    }
  } catch {
    // timeout or network error — silently ignored
  }
  return undefined;
}

export async function fetchAllFeeds(): Promise<Record<string, Article[]>> {
  const now = Date.now();
  if (now - cache.timestamp < CACHE_TTL && Object.keys(cache.data).length > 0) {
    return cache.data;
  }

  const feeds = sourcesData.news.filter(n => n.rss);
  const results: Record<string, Article[]> = {
    afl: [],
    nrl: [],
    cricket: [],
    rugby: [],
    aleague: [],
    basketball: [],
    nfl: [],
    motorsport: []
  };

  const promises = feeds.map(async (feed) => {
    try {
      // Fetch with timeout
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 8000); // 8s timeout

      const response = await fetch(feed.rss!, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      clearTimeout(id);

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const xml = await response.text();
      const feedData = await parser.parseString(xml);

      const pubKey = getPublisherKey(feed.name, feed.rss!);
      const pubMeta = PUBLISHERS[pubKey] || { name: feed.name, color: '#666' };

      const articles = await Promise.all(
        (feedData.items || []).slice(0, 15).map(async (item, idx) => {
          const headline = item.title || 'Untitled Article';
          const snippet = cleanHtml(item.contentSnippet || item.content || (item as any).summary || (item as any).description || '');
          const publishedAt = item.pubDate || item.isoDate || new Date().toISOString();
          const timeAgo = formatTimeAgo(publishedAt);
          const url = item.link || feed.url;

          // Build a stable, unique ID
          const rawId = url || `${pubKey}-${headline}`;
          const hash = rawId.split('').reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0);
          const uid = `${pubKey}-${Math.abs(hash).toString(36)}-${idx}`;

          // Layer 1: extract from RSS feed fields
          let img = extractImage(item);

          // Layer 2: scrape og:image from the article page
          if (!img && url && url !== feed.url) {
            img = await fetchOgImage(url);
          }

          // Layer 3: sport-specific curated fallback
          if (!img) {
            img = getFallbackImage(feed.sport, Math.abs(hash));
          }

          return {
            id: uid,
            sport: feed.sport,
            publisher: pubKey,
            publisherName: pubMeta.name,
            publisherColor: pubMeta.color,
            headline,
            snippet: snippet.length > 180 ? `${snippet.substring(0, 180)}...` : snippet,
            timeAgo,
            url,
            img,
            publishedAt
          };
        })
      );

      if (results[feed.sport]) {
        results[feed.sport].push(...articles);
      }
    } catch (e) {
      console.error(`Failed to fetch ${feed.name}:`, e);
    }
  });

  await Promise.allSettled(promises);

  // Sort articles by publication date (newest first)
  for (const sport of Object.keys(results)) {
    results[sport].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  }

  cache = {
    timestamp: now,
    data: results
  };

  return results;
}
