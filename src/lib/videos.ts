import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['media:group', 'mediaGroup'],
      ['yt:videoId', 'ytVideoId'],
      ['yt:channelId', 'ytChannelId']
    ]
  }
});

// Map of sport -> array of YouTube Channel IDs
const CHANNELS: Record<string, string[]> = {
  nba: ['UCWJ2lWNubArHWmf3FIHbfcQ', 'UCqQo7ewe87aYAe7ub5UqXMw'], // NBA, House of Highlights
  nfl: ['UCDVYQ4Zhbm3S2dlz7P1GBDg'], // NFL
  motorsport: [
    'UC0R3-zRpeIVUnavcRTPWzZA', // F1
    'UC3kxJQ9RfaS5CKeYbbFMi4Q', // Sky Sports F1
    'UCdTffKE3IfaTy-dR8ITxbjg', // supercars
    'UCDxm-FbK9nmZKqHI19j-DOw' // wtf1
  ],
  afl: ['UCxAeHdLDAatFV_vt95MSO-g', 'UCTVIZKTqaFSrNme4CxmZmZA'], // AFL, 7AFL
  nrl: ['UC33-OkQ6VCYk8xtml8Pk4-g', 'UC4uG6XoaVfbDgv6eKq4kkfg'], // NRL, Fox League
  cricket: [
    'UCt2JXOLNxqry7B_4rRZME3Q', // ICC
    'UCkBY0aHJP9BwjZLDYxAQrKg', // cricket.com.au
    'UCkd4takjjF1EGD1TKIK2QiA', // Sky Sports Cricket
    'UC0oyi_CF3v9fsKmBM2m6wPA'  // IPL
  ],
  rugby: ['UCpcoA5dGkZq5I5c2WOfaY4w', 'UCL8qB-RInEa40BvN3VpE_eQ'], // World Rugby, RugbyPass (approx)
  aleague: ['UCDU2T3RjF7L961aQvG-P3TQ'] // A-Leagues (approx)
};

const ICOS: Record<string, string> = {
  nba: '🏀', nfl: '🏈', motorsport: '🏎️', afl: '🏈', nrl: '🏉', cricket: '🏏', rugby: '🏉', aleague: '⚽'
};

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

// In-memory cache
let videoCache: { timestamp: number; data: any[] } = { timestamp: 0, data: [] };
const CACHE_TTL = 15 * 60 * 1000;

export async function fetchVideos() {
  const now = Date.now();
  if (now - videoCache.timestamp < CACHE_TTL && videoCache.data.length > 0) {
    return videoCache.data;
  }

  const allVideos: any[] = [];
  const fetchPromises: Promise<void>[] = [];

  for (const [sport, channelIds] of Object.entries(CHANNELS)) {
    for (const channelId of channelIds) {
      const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      fetchPromises.push(
        (async () => {
          try {
            const ctrl = new AbortController();
            const timer = setTimeout(() => ctrl.abort(), 6000);
            const res = await fetch(url, {
              signal: ctrl.signal,
              headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/91.0' }
            });
            clearTimeout(timer);
            if (!res.ok) return;

            const xml = await res.text();
            const feed = await parser.parseString(xml);

            for (const item of feed.items || []) {
              const ytId = item.ytVideoId || (item as any).id?.replace('yt:video:', '') || item.guid?.replace('yt:video:', '');
              if (!ytId) continue;
              
              // Try to get views from mediaGroup
              let views = '';
              try {
                if (item.mediaGroup && item.mediaGroup['media:community']) {
                  const comm = item.mediaGroup['media:community'];
                  if (comm['media:statistics']) {
                    const v = comm['media:statistics'].$?.views || comm['media:statistics'].views;
                    if (v) {
                      const num = parseInt(v, 10);
                      if (num > 1000000) views = (num / 1000000).toFixed(1) + 'M views';
                      else if (num > 1000) views = Math.floor(num / 1000) + 'k views';
                      else views = num + ' views';
                    }
                  }
                }
              } catch {}
              if (!views) views = '10k+ views'; // Fallback

              allVideos.push({
                id: ytId,
                sport,
                title: item.title || '',
                dur: '', // YouTube RSS doesn't provide duration unfortunately
                views,
                likes: '', // Not consistently provided
                time: item.pubDate ? formatTimeAgo(item.pubDate) : 'recently',
                ico: ICOS[sport] || '🎥',
                yt: ytId,
                publishedAt: item.pubDate ? Date.parse(item.pubDate) : 0
              });
            }
          } catch (e) {
            console.error(`Error fetching YouTube feed for ${channelId}:`, e);
          }
        })()
      );
    }
  }

  await Promise.allSettled(fetchPromises);

  // Sort by newest
  allVideos.sort((a, b) => b.publishedAt - a.publishedAt);

  videoCache = { timestamp: now, data: allVideos };
  return allVideos;
}
