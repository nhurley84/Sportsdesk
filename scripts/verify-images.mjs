// Quick verification that our extractImage logic works on real feed data
import Parser from 'rss-parser';

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

function isValidImageUrl(url) {
  if (!url || !url.startsWith('http')) return false;
  const lower = url.toLowerCase();
  if (lower.includes('analytics') || lower.includes('pixel') || lower.includes('beacon')) return false;
  if (lower.includes('logo') && lower.includes('rss')) return false;
  if (lower.endsWith('.gif') && lower.includes('1x1')) return false;
  return true;
}

function pickBestMediaContent(items) {
  let best;
  for (const mc of items) {
    const attrs = mc.$ || mc;
    const url = attrs.url || attrs.href;
    if (!isValidImageUrl(url)) continue;
    const medium = (attrs.medium || attrs.type || '').toLowerCase();
    if (medium === 'video' || medium === 'audio') continue;
    const w = parseInt(attrs.width || '0', 10) || 0;
    if (!best || w > best.width) best = { url, width: w };
  }
  return best?.url;
}

function extractImage(item) {
  if (item.mediaContent) {
    const list = Array.isArray(item.mediaContent) ? item.mediaContent : [item.mediaContent];
    const url = pickBestMediaContent(list);
    if (url) return url;
  }
  if (item.mediaGroup) {
    const raw = item.mediaGroup['media:content'] || item.mediaGroup.mediaContent || item.mediaGroup.content;
    if (raw) {
      const list = Array.isArray(raw) ? raw : [raw];
      const url = pickBestMediaContent(list);
      if (url) return url;
    }
  }
  if (item.mediaThumbnail) {
    const thumbs = Array.isArray(item.mediaThumbnail) ? item.mediaThumbnail : [item.mediaThumbnail];
    let bestThumb;
    for (const thumb of thumbs) {
      const url = thumb?.$ ? thumb.$.url : thumb?.url;
      const w = parseInt(thumb?.$ ? (thumb.$.width || '0') : (thumb?.width || '0'), 10) || 0;
      if (isValidImageUrl(url) && (!bestThumb || w > bestThumb.width)) bestThumb = { url, width: w };
    }
    if (bestThumb) return bestThumb.url;
  }
  if (item.enclosure) {
    const enc = item.enclosure.$ || item.enclosure;
    const type = (enc.type || '').toLowerCase();
    const url = enc.url;
    if (isValidImageUrl(url) && (!type || type.startsWith('image/'))) return url;
  }
  const htmlSources = [item.contentEncoded, item['content:encoded'], item['content:encodedSnippet'], item.content, item.description, item.summary]
    .filter(h => typeof h === 'string' && h.length > 10);
  for (const html of htmlSources) {
    for (const imgTag of (html.match(/<img[^>]+>/gi) || [])) {
      const dataSrc = imgTag.match(/data-src=["']([^"']+)["']/i);
      if (dataSrc && isValidImageUrl(dataSrc[1])) return dataSrc[1];
      const src = imgTag.match(/\bsrc=["']([^"']+)["']/i);
      if (src && isValidImageUrl(src[1])) return src[1];
    }
    const yt = html.match(/<iframe[^>]+src=["'](?:https?:)?\/\/(?:www\.)?youtube\.com\/embed\/([^"'>?&]+)/i);
    if (yt?.[1]) return `https://img.youtube.com/vi/${yt[1]}/maxresdefault.jpg`;
  }
  return undefined;
}

const FEEDS = [
  { name: 'ABC AFL', url: 'https://www.abc.net.au/news/feed/7077144/rss.xml' },
  { name: 'The Guardian Football', url: 'https://www.theguardian.com/football/rss' },
  { name: 'BBC Cricket', url: 'https://feeds.bbci.co.uk/sport/cricket/rss.xml' },
  { name: 'The Roar AFL', url: 'https://www.theroar.com.au/afl/feed/' },
  { name: 'CBS Sports NFL', url: 'https://www.cbssports.com/rss/headlines/nfl/' },
];

for (const feed of FEEDS) {
  try {
    const res = await fetch(feed.url, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/91' } });
    const xml = await res.text();
    const data = await parser.parseString(xml);
    const results = data.items.slice(0, 3).map(item => ({
      title: item.title?.substring(0, 50),
      img: extractImage(item) ? '✅ ' + extractImage(item).substring(0, 80) : '❌ NO IMAGE'
    }));
    console.log(`\n📰 ${feed.name}`);
    for (const r of results) console.log(`  ${r.img}\n    "${r.title}"`);
  } catch (e) {
    console.log(`\n❌ ${feed.name}: ${e.message}`);
  }
}
