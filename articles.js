// src/feedFetcher.js
// ─────────────────────────────────────────────────────────────────────────────
// RSS FEED FETCHER & CACHE
// Fetches all configured RSS feeds, normalises article shape,
// deduplicates by URL, classifies by sport, and caches in memory.
// Cache TTL: 15 minutes (configurable via CACHE_TTL_SECONDS env var)
// ─────────────────────────────────────────────────────────────────────────────

const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const { formatDistanceToNow } = require('date-fns');
const { FEEDS } = require('../config/feeds');
const { classifyBatch } = require('./classifier');

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'TheSportsdesk/1.0 (+https://thesportsdesk.com.au; RSS aggregator)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['enclosure', 'enclosure'],
      ['description', 'description'],
    ]
  }
});

const CACHE_TTL = parseInt(process.env.CACHE_TTL_SECONDS || '900'); // 15 min default
const cache = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 120 });

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function extractImage(item) {
  // Try various RSS image formats
  if (item.mediaContent?.['$']?.url) return item.mediaContent['$'].url;
  if (item.mediaThumbnail?.['$']?.url) return item.mediaThumbnail['$'].url;
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) return item.enclosure.url;
  // Try to extract from description HTML
  if (item.description) {
    const match = item.description.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match) return match[1];
  }
  return null;
}

function extractSnippet(item) {
  let text = item.contentSnippet || item.description || item.content || '';
  // Strip HTML tags
  text = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  // Truncate to ~200 chars at a word boundary
  if (text.length > 200) {
    text = text.substring(0, 200).replace(/\s+\S*$/, '') + '…';
  }
  return text;
}

function formatTime(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recently';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'Recently';
  }
}

function normaliseArticle(item, publisher, feedSport) {
  return {
    id: Buffer.from(item.link || item.guid || item.title || '').toString('base64').slice(0, 16),
    headline: item.title?.trim() || '',
    snippet: extractSnippet(item),
    url: item.link || item.guid || '#',
    image: extractImage(item),
    publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
    timeAgo: formatTime(item.isoDate || item.pubDate),
    publisher: publisher.publisher,
    publisherName: publisher.name,
    publisherColor: publisher.color,
    sport: feedSport, // will be classified below if null
  };
}

// ─── SINGLE FEED FETCH ────────────────────────────────────────────────────────

async function fetchFeed(publisher, feedConfig) {
  const cacheKey = `feed:${feedConfig.url}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    console.log(`  [cache hit] ${feedConfig.url}`);
    return cached;
  }

  try {
    console.log(`  [fetch] ${feedConfig.url}`);
    const feed = await parser.parseURL(feedConfig.url);
    const articles = feed.items
      .slice(0, 20) // max 20 items per feed
      .map(item => normaliseArticle(item, publisher, feedConfig.sport));

    cache.set(cacheKey, articles);
    return articles;
  } catch (err) {
    console.error(`  [error] ${feedConfig.url}: ${err.message}`);
    return [];
  }
}

// ─── ALL FEEDS ────────────────────────────────────────────────────────────────

async function fetchAllFeeds() {
  const allArticlesKey = 'articles:all';
  const cached = cache.get(allArticlesKey);
  if (cached) {
    console.log('[feedFetcher] Returning cached articles');
    return cached;
  }

  console.log('[feedFetcher] Fetching all feeds...');
  const promises = [];

  for (const publisher of FEEDS) {
    for (const feedConfig of publisher.feeds) {
      promises.push(fetchFeed(publisher, feedConfig));
    }
  }

  const results = await Promise.allSettled(promises);
  let articles = results
    .filter(r => r.status === 'fulfilled')
    .flatMap(r => r.value);

  // Deduplicate by URL
  const seen = new Set();
  articles = articles.filter(a => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });

  // Auto-classify articles with no sport tag
  articles = classifyBatch(articles);

  // Sort by published date descending
  articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  console.log(`[feedFetcher] Done. ${articles.length} unique articles.`);
  cache.set(allArticlesKey, articles);
  return articles;
}

// ─── FILTERED QUERIES ─────────────────────────────────────────────────────────

async function getArticles({ sport = null, publisher = null, limit = 50, offset = 0 } = {}) {
  let articles = await fetchAllFeeds();

  if (sport && sport !== 'all') {
    articles = articles.filter(a => a.sport === sport);
  }
  if (publisher && publisher !== 'all') {
    articles = articles.filter(a => a.publisher === publisher);
  }

  return {
    articles: articles.slice(offset, offset + limit),
    total: articles.length,
    cached: true,
    lastUpdated: new Date().toISOString(),
  };
}

async function getTrending(limit = 10) {
  const articles = await fetchAllFeeds();
  // Trending = most recent articles, shuffled slightly to show variety
  return articles
    .filter(a => a.sport) // only classified articles
    .slice(0, 30)
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);
}

async function getPublisherCounts(sport = null) {
  let articles = await fetchAllFeeds();
  if (sport && sport !== 'all') {
    articles = articles.filter(a => a.sport === sport);
  }
  const counts = {};
  articles.forEach(a => {
    counts[a.publisher] = (counts[a.publisher] || 0) + 1;
  });
  return counts;
}

// Force a cache refresh (call from cron job)
async function refreshCache() {
  console.log('[feedFetcher] Force refreshing all feeds...');
  cache.flushAll();
  return fetchAllFeeds();
}

module.exports = { getArticles, getTrending, getPublisherCounts, refreshCache, fetchAllFeeds };
