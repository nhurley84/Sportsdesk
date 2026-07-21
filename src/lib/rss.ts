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
      ['itunes:image', 'itunesImage'],
      ['source', 'source']
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
  media?: ArticleMedia;
  img?: string;
  isLive?: boolean;
  kw?: string[];
  publishedAt: string;
}

export type ArticleMedia =
  | {
      type: 'image';
      url: string;
    }
  | {
      type: 'video';
      thumbnailUrl?: string;
      embedUrl?: string;
      provider?: 'youtube' | 'vimeo' | 'video';
    };

type RssNodeAttributes = {
  href?: unknown;
  src?: unknown;
  medium?: unknown;
  type?: unknown;
  url?: unknown;
  width?: unknown;
};

type RssNode = RssNodeAttributes & {
  $?: RssNodeAttributes;
};

type FeedItem = Parser.Item & {
  contentEncoded?: string;
  description?: string;
  itunesImage?: unknown;
  mediaContent?: unknown;
  mediaGroup?: Record<string, unknown>;
  mediaThumbnail?: unknown;
  source?: unknown;
  'content:encoded'?: string;
  'content:encodedSnippet'?: string;
};

// Map publisher domain/name to keys and colors from sportsdesk_v5.html
export const PUBLISHERS: Record<string, { name: string; color: string }> = {
  afl: { name: 'AFL.com.au', color: '#E8230A' },
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
  theroar: { name: 'The Roar', color: '#FF9800' },
  sen: { name: 'SEN', color: '#111111' }
};

function getPublisherKey(sourceName: string, url: string): string {
  const s = sourceName.toLowerCase();
  const u = url.toLowerCase();
  if (s.includes('afl.com.au') || u.includes('afl.com.au')) return 'afl';
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
  if (s.includes('sen') || u.includes('sen.com.au')) return 'sen';
  return 'general';
}

/** Helper: check if a URL looks like a real image (not a tracker pixel or icon) */
function isValidImageUrl(url: string | undefined): boolean {
  if (!url || !url.startsWith('http')) return false;
  const lower = url.toLowerCase();
  // Filter out tracking pixels, logos, tiny icons
  if (lower.includes('analytics') || lower.includes('pixel') || lower.includes('beacon')) return false;
  if (lower.includes('google.com/news')) return false;
  if (lower.includes('logo') && lower.includes('rss')) return false;
  if (lower.endsWith('.gif') && lower.includes('1x1')) return false;
  return true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringField(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function rssNodes(value: unknown): RssNode[] {
  const values = Array.isArray(value) ? value : [value];
  return values.filter(isRecord).map((item) => item as RssNode);
}

function nodeAttrs(node: RssNode): RssNodeAttributes {
  return isRecord(node.$) ? node.$ : node;
}

function numericField(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseInt(stringField(value), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function imageUrlFromNode(value: unknown): string | undefined {
  if (typeof value === 'string' && isValidImageUrl(value)) return value;

  for (const node of rssNodes(value)) {
    const attrs = nodeAttrs(node);
    const url = stringField(attrs.url) || stringField(attrs.href) || stringField(attrs.src);
    if (isValidImageUrl(url)) return url;
  }

  return undefined;
}

/** Helper: pick the best (largest by width) media:content from an array */
function pickBestMediaContent(items: RssNode[]): string | undefined {
  let best: { url: string; width: number } | undefined;
  for (const mc of items) {
    const attrs = nodeAttrs(mc);
    const url = stringField(attrs.url) || stringField(attrs.href);
    if (!isValidImageUrl(url)) continue;
    const medium = (stringField(attrs.medium) || stringField(attrs.type)).toLowerCase();
    // Skip if explicitly marked as video or audio
    if (medium === 'video' || medium === 'audio') continue;
    const w = numericField(attrs.width);
    if (!best || w > best.width) best = { url, width: w };
  }
  return best?.url;
}

function extractImage(item: FeedItem): string | undefined {
  // ── 1. media:content (Guardian — array with $, pick largest width) ──
  if (item.mediaContent) {
    const url = pickBestMediaContent(rssNodes(item.mediaContent));
    if (url) return url;
  }

  // ── 2. media:group (ABC News — nested key is 'media:content', not 'mediaContent') ──
  if (item.mediaGroup) {
    const raw = item.mediaGroup['media:content'] || item.mediaGroup.mediaContent || item.mediaGroup.content;
    if (raw) {
      const url = pickBestMediaContent(rssNodes(raw));
      if (url) return url;
    }
  }

  // ── 3. media:thumbnail (BBC — array, each item has $ with url/width/height) ──
  if (item.mediaThumbnail) {
    let bestThumb: { url: string; width: number } | undefined;
    for (const thumb of rssNodes(item.mediaThumbnail)) {
      const attrs = nodeAttrs(thumb);
      const url = stringField(attrs.url);
      const w = numericField(attrs.width);
      if (isValidImageUrl(url) && (!bestThumb || w > bestThumb.width)) bestThumb = { url, width: w };
    }
    if (bestThumb) return bestThumb.url;
  }

  // ── 4. enclosure (CBS Sports — direct { url, length, type } no $ wrapper) ──
  if (item.enclosure) {
    const enc = nodeAttrs(item.enclosure);
    const type = stringField(enc.type).toLowerCase();
    const url = enc.url;
    if (typeof url === 'string' && isValidImageUrl(url) && (!type || type.startsWith('image/'))) return url;
  }

  // ── 5. itunes:image ──
  if (item.itunesImage) {
    const imageNode = rssNodes(item.itunesImage)[0];
    const url = imageNode ? stringField(nodeAttrs(imageNode).href) : stringField(item.itunesImage);
    if (isValidImageUrl(url)) return url;
  }

  const rawItem = item as Record<string, unknown>;
  const additionalImageFields = [
    rawItem.image,
    rawItem.thumbnail,
    rawItem['media:image'],
    rawItem['atom:link'],
  ];
  for (const field of additionalImageFields) {
    const url = imageUrlFromNode(field);
    if (url) return url;
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

function resolveImageUrl(value: string | undefined, baseUrl: string): string | undefined {
  if (!value) return undefined;
  try {
    const resolved = new URL(value, baseUrl).href;
    return isValidImageUrl(resolved) ? resolved : undefined;
  } catch {
    return undefined;
  }
}

function metaContent(html: string, property: string): string | undefined {
  const expected = property.toLowerCase();
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const key = tag.match(/\b(?:property|name|itemprop)=['"]([^'"]+)['"]/i)?.[1]?.toLowerCase();
    if (key !== expected) continue;
    const content = tag.match(/\bcontent=['"]([^'"]+)['"]/i)?.[1];
    if (content) return content;
  }
  return undefined;
}

function youtubeVideoId(value: string): string | undefined {
  const match = value.match(/(?:youtube\.com\/(?:embed\/|watch\?v=|shorts\/|v\/)|youtu\.be\/)([^?&"'>/\s]+)/i);
  return match?.[1];
}

function vimeoVideoId(value: string): string | undefined {
  const match = value.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  return match?.[1];
}

function mediaFromVideoUrl(videoUrl: string): ArticleMedia {
  const ytId = youtubeVideoId(videoUrl);
  if (ytId) {
    return {
      type: 'video',
      provider: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
    };
  }

  const vimeoId = vimeoVideoId(videoUrl);
  if (vimeoId) {
    return {
      type: 'video',
      provider: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
    };
  }

  return {
    type: 'video',
    provider: 'video',
    embedUrl: videoUrl,
  };
}

function extractVideoFromHtml(html: string): ArticleMedia | undefined {
  const iframe = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
  if (iframe?.[1] && (youtubeVideoId(iframe[1]) || vimeoVideoId(iframe[1]))) {
    return mediaFromVideoUrl(iframe[1]);
  }

  const videoSource = html.match(/<video[^>]+src=["']([^"']+)["']/i)
    || html.match(/<source[^>]+src=["']([^"']+)["'][^>]+type=["']video\//i);
  if (videoSource?.[1]) {
    return mediaFromVideoUrl(videoSource[1]);
  }

  return undefined;
}

function extractVideo(item: FeedItem): ArticleMedia | undefined {
  const mediaNodes = [
    ...rssNodes(item.mediaContent),
    ...(isRecord(item.mediaGroup) ? rssNodes(item.mediaGroup['media:content'] || item.mediaGroup.mediaContent) : []),
  ];

  for (const node of mediaNodes) {
    const attrs = nodeAttrs(node);
    const type = stringField(attrs.type).toLowerCase();
    const medium = stringField(attrs.medium).toLowerCase();
    const url = stringField(attrs.url) || stringField(attrs.href);
    if (url && (medium === 'video' || type.startsWith('video/') || youtubeVideoId(url) || vimeoVideoId(url))) {
      return mediaFromVideoUrl(url);
    }
  }

  if (item.enclosure) {
    const enc = nodeAttrs(item.enclosure);
    const type = stringField(enc.type).toLowerCase();
    const url = stringField(enc.url);
    if (url && (type.startsWith('video/') || youtubeVideoId(url) || vimeoVideoId(url))) {
      return mediaFromVideoUrl(url);
    }
  }

  const htmlSources = [
    item.contentEncoded,
    item['content:encoded'],
    item['content:encodedSnippet'],
    item.content,
    item.description,
    item.summary,
  ].filter((h): h is string => typeof h === 'string' && h.length > 10);

  for (const html of htmlSources) {
    const video = extractVideoFromHtml(html);
    if (video) return video;
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
  } catch {
    return 'recently';
  }
}

// Per-sport cache prevents one section from waiting on every other sport's sources.
const feedCache = new Map<string, {
  timestamp: number;
  data: Record<string, Article[]>;
}>();

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const RSS_FETCH_TIMEOUT_MS = 6_000;
const LATEST_ARTICLE_WINDOW_MS = 24 * 60 * 60 * 1000;
const ARTICLE_HEAD_LIMIT = 128_000;
const GOOGLE_NEWS_HEAD_LIMIT = 700_000;
const THUMBNAIL_RESOLVER_VERSION = 3;

type OgMedia = {
  imageUrl?: string;
  video?: ArticleMedia;
};

// Small in-memory OG media cache to avoid re-fetching same article URLs.
const ogCache = new Map<string, OgMedia>();
const pendingOgRequests = new Map<string, Promise<OgMedia>>();

function isGoogleNewsArticleUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:'
      && parsed.hostname === 'news.google.com'
      && parsed.pathname.startsWith('/rss/articles/');
  } catch {
    return false;
  }
}

async function resolveGoogleNewsPublisherUrl(articleUrl: string, html: string): Promise<string | undefined> {
  const articleId = new URL(articleUrl).pathname.split('/').pop();
  const timestamp = html.match(/data-n-a-ts="([^"]+)/)?.[1];
  const signature = html.match(/data-n-a-sg="([^"]+)/)?.[1];
  if (!articleId || !timestamp || !signature) return undefined;

  const requestPayload = [
    'garturlreq',
    [['X', 'X', ['X', 'X'], null, null, 1, 1, 'US:en', null, 1, null, null, null, null, null, 0, 1], 'X', 'X', 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0],
    articleId,
    Number(timestamp),
    signature,
  ];
  const body = new URLSearchParams({
    'f.req': JSON.stringify([[['Fbv4je', JSON.stringify(requestPayload)]]]),
  });

  try {
    const response = await fetch('https://news.google.com/_/DotsSplashUi/data/batchexecute', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body,
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
    });
    if (!response.ok) return undefined;

    const sections = (await response.text()).split('\n\n');
    const rows: unknown = JSON.parse(sections[1] || '[]');
    if (!Array.isArray(rows)) return undefined;

    for (const row of rows) {
      if (!Array.isArray(row) || typeof row[2] !== 'string') continue;
      try {
        const decoded: unknown = JSON.parse(row[2]);
        if (!Array.isArray(decoded) || typeof decoded[1] !== 'string') continue;
        const publisherUrl = new URL(decoded[1]);
        if (publisherUrl.protocol === 'http:' || publisherUrl.protocol === 'https:') {
          return publisherUrl.href;
        }
      } catch {}
    }
  } catch {}

  return undefined;
}

export async function fetchOgMedia(articleUrl: string): Promise<OgMedia> {
  if (!articleUrl || !articleUrl.startsWith('http')) return {};
  if (ogCache.has(articleUrl)) return ogCache.get(articleUrl) ?? {};

  const pending = pendingOgRequests.get(articleUrl);
  if (pending) return pending;

  const request = fetchOgMediaUncached(articleUrl)
    .finally(() => pendingOgRequests.delete(articleUrl));
  pendingOgRequests.set(articleUrl, request);
  return request;
}

async function fetchOgMediaUncached(articleUrl: string): Promise<OgMedia> {
  try {
    const res = await fetch(articleUrl, {
      signal: AbortSignal.timeout(15_000),
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-AU,en;q=0.9'
      }
    });
    if (!res.ok) return {};

    // Only read first 15KB — meta tags are always in <head>
    const htmlLimit = isGoogleNewsArticleUrl(articleUrl)
      ? GOOGLE_NEWS_HEAD_LIMIT
      : ARTICLE_HEAD_LIMIT;
    const reader = res.body?.getReader();
    if (!reader) return {};
    let html = '';
    const decoder = new TextDecoder();
    while (html.length < htmlLimit && !html.toLowerCase().includes('</head>')) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
    }
    html += decoder.decode();
    await reader.cancel();

    if (isGoogleNewsArticleUrl(articleUrl)) {
      const publisherUrl = await resolveGoogleNewsPublisherUrl(articleUrl, html);
      if (publisherUrl) {
        const publisherMedia = await fetchOgMedia(publisherUrl);
        ogCache.set(articleUrl, publisherMedia);
        return publisherMedia;
      }

      const unavailable = {};
      ogCache.set(articleUrl, unavailable);
      return unavailable;
    }

    let imageUrl: string | undefined;
    let videoMedia: ArticleMedia | undefined;

    const metadataImage = [
      metaContent(html, 'og:image:secure_url'),
      metaContent(html, 'og:image'),
      metaContent(html, 'twitter:image'),
      metaContent(html, 'twitter:image:src'),
      metaContent(html, 'image'),
    ].find((candidate) => Boolean(resolveImageUrl(candidate, articleUrl)));
    imageUrl = resolveImageUrl(metadataImage, articleUrl);

    // Try og:video for embedded YouTube videos
    const video = html.match(/<meta[^>]+property=["']og:video(:url|:secure_url)?["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:video(:url|:secure_url)?["']/i);
    if (video?.[2]) {
      videoMedia = mediaFromVideoUrl(video[2]);
    } else {
      videoMedia = extractVideoFromHtml(html);
    }

    // Try a standard image tag in the loaded head/body snippet as a final resort
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (!imageUrl && imgMatch?.[1]) imageUrl = resolveImageUrl(imgMatch[1], articleUrl);
    const media = { imageUrl, video: videoMedia };
    ogCache.set(articleUrl, media);
    return media;
  } catch {
    // timeout or network error — silently ignored
  }
  const unavailable = {};
  ogCache.set(articleUrl, unavailable);
  return unavailable;
}

const TRACKING_PARAMS = new Set([
  'fbclid',
  'gclid',
  'igshid',
  'mc_cid',
  'mc_eid',
  'ref',
]);

function normalizeHeadline(value: string): string {
  return value
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function canonicalArticleUrl(url: string): string {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();

    for (const key of [...parsed.searchParams.keys()]) {
      if (key.startsWith('utm_') || TRACKING_PARAMS.has(key.toLowerCase())) {
        parsed.searchParams.delete(key);
      }
    }

    parsed.hash = '';
    parsed.hostname = host;
    parsed.pathname = parsed.pathname.replace(/\/+$/, '');

    if (host === 'news.google.com') {
      return '';
    }

    return parsed.toString();
  } catch {
    return url.trim().toLowerCase();
  }
}

export function articleDedupeKey(article: Pick<Article, 'headline' | 'publisher' | 'url'>): string {
  const canonicalUrl = canonicalArticleUrl(article.url);
  if (canonicalUrl) return `url:${canonicalUrl}`;
  return `headline:${article.publisher}:${normalizeHeadline(article.headline)}`;
}

export function dedupeArticles(articles: Article[]): Article[] {
  const seen = new Set<string>();
  const sorted = [...articles].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));

  return sorted.filter((article) => {
    const key = articleDedupeKey(article);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const SPORT_RELEVANCE: Record<string, RegExp> = {
  afl: /\b(afl|aflw|australian football|aussie rules|adelaide crows|brisbane lions|carlton|collingwood|essendon|fremantle|geelong|gold coast suns|gws|hawthorn|melbourne demons|north melbourne|port adelaide|richmond|st kilda|sydney swans|west coast|western bulldogs)\b/i,
  nrl: /\b(nrl|rugby league|state of origin|super league|brisbane broncos|canberra raiders|canterbury bulldogs|cronulla|dolphins|gold coast titans|manly|melbourne storm|newcastle knights|new zealand warriors|north queensland|parramatta|penrith|south sydney|st george illawarra|sydney roosters|wests tigers)\b/i,
  cricket: /\b(cricket|cricketer|test match|ashes|ipl|big bash|bbl|wbbl|county championship|ranji trophy|sheffield shield|one[- ]day|t20|t-20|wicket|batting|bowling)\b/i,
  rugby: /\b(rugby union|wallabies|all blacks|springboks|six nations|super rugby|rugby championship|bkt united rugby|premiership rugby|waratahs|brumbies|queensland reds|western force|lions tour)\b/i,
  aleague: /\b(soccer|football|a-league|premier league|champions league|europa league|world cup|fifa|uefa|serie a|la liga|bundesliga|socceroos|matildas|liverpool|arsenal|chelsea|manchester united|manchester city|real madrid|barcelona|bayern)\b/i,
  basketball: /\b(basketball|nba|wnba|nbl|euroleague|nba draft|playoffs|lakers|celtics|warriors|knicks|bucks|mavericks|thunder)\b/i,
  nfl: /\b(nfl|american football|super bowl|touchdown|quarterback|playoffs|chiefs|eagles|cowboys|packers|patriots|ravens|bills|49ers|seahawks)\b/i,
  motorsport: /\b(formula ?1|f1|motorsport|supercars|nascar|motogp|indycar|grand prix|grand prix|race[rs]?|racing|ferrari|mclaren|mercedes|red bull)\b/i,
};

function isSportRelevant(sport: string, item: FeedItem): boolean {
  const matcher = SPORT_RELEVANCE[sport];
  if (!matcher) return false;

  const text = [item.title, item.link, item.contentSnippet, item.content, item.summary, item.description]
    .filter((value): value is string => typeof value === 'string')
    .join(' ');

  if (sport === 'rugby' && /\b(nrl|rugby league)\b/i.test(text)) return false;
  if (sport === 'aleague' && /\b(afl|nrl|american football|nfl)\b/i.test(text)) return false;

  return matcher.test(text);
}

function isPublishedWithinLatestDay(item: FeedItem, now: number): boolean {
  const publishedAt = item.isoDate || item.pubDate;
  if (!publishedAt) return false;

  const timestamp = Date.parse(publishedAt);
  return !Number.isNaN(timestamp)
    && timestamp >= now - LATEST_ARTICLE_WINDOW_MS
    && timestamp <= now + 60_000;
}

export async function fetchAllFeeds(sport = 'all'): Promise<Record<string, Article[]>> {
  const now = Date.now();
  const cached = feedCache.get(sport);
  if (cached && now - cached.timestamp < CACHE_TTL && Object.keys(cached.data).length > 0) {
    return cached.data;
  }

  const allSportsCache = feedCache.get('all');
  if (
    sport !== 'all'
    && allSportsCache
    && now - allSportsCache.timestamp < CACHE_TTL
    && Object.keys(allSportsCache.data).length > 0
  ) {
    return allSportsCache.data;
  }

  const feeds = sourcesData.news.filter((source) => source.rss && (sport === 'all' || source.sport === sport));
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
  const unavailableSources: string[] = [];

  const promises = feeds.map(async (feed) => {
    try {
      const response = await fetch(feed.rss!, {
        signal: AbortSignal.timeout(RSS_FETCH_TIMEOUT_MS),
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const xml = await response.text();
      const feedData = await parser.parseString(xml);

      const pubKey = getPublisherKey(feed.name, feed.rss!);
      const pubMeta = PUBLISHERS[pubKey] || { name: feed.name, color: '#666' };

      const recentItems = ((feedData.items || []) as FeedItem[])
        .filter((item) => isSportRelevant(feed.sport, item) && isPublishedWithinLatestDay(item, now))
        .sort((a, b) => Date.parse(b.isoDate || b.pubDate || '') - Date.parse(a.isoDate || a.pubDate || ''));

      const articles = await Promise.all(
        recentItems
          .map(async (item, idx) => {
          const headline = item.title || 'Untitled Article';
          const snippet = cleanHtml(item.contentSnippet || item.content || item.summary || item.description || '');
          const publishedAt = item.pubDate || item.isoDate || new Date().toISOString();
          const timeAgo = formatTimeAgo(publishedAt);
          const url = item.link || feed.url;

          // Build a stable, unique ID
          const rawId = url || `${pubKey}-${headline}`;
          const hash = rawId.split('').reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0);
          const uid = `${pubKey}-${Math.abs(hash).toString(36)}-${idx}`;

          // Layer 1: extract from RSS feed fields
          let img = extractImage(item);
          const video = extractVideo(item);

          // Resolve missing metadata outside the feed response's critical path.
          // Browser-native lazy loading means only visible cards request it.
          if (!img && url && url !== feed.url) {
            img = `/api/article-thumbnail?v=${THUMBNAIL_RESOLVER_VERSION}&url=${encodeURIComponent(url)}`;
          }

          let media: ArticleMedia | undefined;
          if (img) {
            media = { type: 'image', url: img };
          } else if (video?.type === 'video') {
            media = video;
            img = video.thumbnailUrl;
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
            media,
            img,
            publishedAt
          };
        })
      );

      if (results[feed.sport]) {
        results[feed.sport].push(...articles);
      }
    } catch {
      unavailableSources.push(feed.name);
    }
  });

  await Promise.allSettled(promises);

  if (unavailableSources.length > 0) {
    console.warn(`RSS unavailable: ${unavailableSources.length}/${feeds.length} sources (${unavailableSources.join(', ')})`);
  }

  // Sort articles by publication date (newest first)
  for (const sport of Object.keys(results)) {
    results[sport] = dedupeArticles(results[sport]);
  }

  const hasLiveArticles = Object.values(results).some((articles) => articles.length > 0);
  if (hasLiveArticles) {
    feedCache.set(sport, {
      timestamp: now,
      data: results
    });
  } else {
    // Do not cache a temporary network outage. The next request should retry
    // the configured sources instead of serving the mock fallback for 10 min.
    feedCache.delete(sport);
  }

  return results;
}
