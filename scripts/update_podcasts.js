const fs = require('fs');
const path = require('path');

const resolvedPath = path.join(__dirname, '../../resolved_podcasts_search.json');
const resolved = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));

const code = `import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['itunes:duration', 'duration'],
      ['itunes:summary', 'summary'],
      ['itunes:image', 'image']
    ]
  }
});

export interface PodcastEpisode {
  id: string;
  sport: string;
  title: string;
  ep: string; // Episode name/desc
  dur: string; // Duration (e.g. 54:22)
  subs: string; // Mock subscribers count or downloads
  trending?: boolean;
  ico: string;
  url: string;
  audioUrl?: string;
}

// Fallback mock podcasts from sportsdesk_v5.html
export const MOCK_PODCASTS: PodcastEpisode[] = [
  { id: 'p1', sport: 'nrl', title: 'The Rugby League Wrap', ep: 'Ep 218 — Origin debate, Broncos preview & big calls', dur: '1:04:22', subs: '92k', trending: true, ico: '🏉', url: 'https://podcasts.apple.com/au/podcast/afl-daily/id1450057092' },
  { id: 'p2', sport: 'afl', title: 'On the Couch', ep: 'Ep 341 — Trading period preview, Fyfe future, Friday preview', dur: '58:11', subs: '140k', trending: true, ico: '🏈', url: 'https://podcasts.apple.com/au/podcast/on-the-couch/id1438823511' },
  { id: 'p3', sport: 'cricket', title: 'The Grade Cricketer', ep: "Ep 189 — Smith century, Starc's resurgence, India preview", dur: '72:04', subs: '68k', trending: false, ico: '🏏', url: 'https://podcasts.apple.com/au/podcast/the-grade-cricketer/id1042947524' },
  { id: 'p4', sport: 'afl', title: 'Supercoach Podcast', ep: 'Ep 112 — R6 preview, trade targets, injury updates', dur: '44:30', subs: '55k', trending: true, ico: '🏈', url: 'https://podcasts.apple.com/au' },
  { id: 'p5', sport: 'multi', title: 'The Front Bar', ep: 'Ep 205 — Best of Round 6, funny moments, legends chat', dur: '66:15', subs: '210k', trending: true, ico: '🍺', url: 'https://podcasts.apple.com' },
  { id: 'p6', sport: 'nrl', title: 'NRL 360', ep: 'Ep 301 — Souths crisis, ladder leaders deep dive', dur: '51:00', subs: '78k', trending: false, ico: '🏉', url: 'https://podcasts.apple.com/au/podcast/nrl-360/id1126668112' }
];

const SPORT_EMOJIS: Record<string, string> = {
  afl: '🏈',
  nrl: '🏉',
  cricket: '🏏',
  rugby: '🏉',
  aleague: '⚽',
  basketball: '🏀',
  nfl: '🏈',
  motorsport: '🏎️',
  general: '🎙️'
};

// Simple cache
let cache: {
  timestamp: number;
  data: PodcastEpisode[];
} = {
  timestamp: 0,
  data: []
};

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache for podcasts

const TOP_PODCASTS = ${JSON.stringify(resolved, null, 2)};

export async function fetchPodcasts(): Promise<PodcastEpisode[]> {
  const now = Date.now();
  if (now - cache.timestamp < CACHE_TTL && cache.data.length > 0) {
    return cache.data;
  }

  const results: PodcastEpisode[] = [];

  const promises = TOP_PODCASTS.map(async (pod) => {
    if (!pod.feedUrl) return;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 4000);
      
      const feedResponse = await fetch(pod.feedUrl, { signal: ctrl.signal });
      clearTimeout(timer);
      
      if (!feedResponse.ok) return;
      const xml = await feedResponse.text();
      const feed = await parser.parseString(xml);

      const latestEp = feed.items?.[0];
      if (latestEp) {
        let dur = latestEp.duration || (latestEp as any).itunesDuration || '00:00';
        if (!dur.includes(':')) {
           const sec = parseInt(dur);
           if (!isNaN(sec)) {
             const m = Math.floor(sec / 60);
             const s = sec % 60;
             dur = \`\${m}:\${s.toString().padStart(2, '0')}\`;
           }
        }

        const episodeLink = latestEp.link || feed.link || pod.url || \`https://podcasts.apple.com/podcast/id\${pod.id}\`;

        results.push({
          id: \`pod-\${pod.id}\`,
          sport: pod.sport,
          title: pod.name || feed.title || 'Podcast',
          ep: latestEp.title || 'Latest Episode',
          dur: dur.toString(),
          subs: \`\${Math.floor(Math.random() * 80 + 20)}k\`, 
          ico: SPORT_EMOJIS[pod.sport] || '🎙️',
          url: episodeLink,
          audioUrl: latestEp.enclosure?.url
        });
      }
    } catch (e) {
      // Ignore
    }
  });

  await Promise.allSettled(promises);

  if (results.length === 0) {
    return MOCK_PODCASTS;
  }

  cache = {
    timestamp: now,
    data: results
  };

  return results;
}
`;

const destPath = path.join(__dirname, '../src/lib/podcasts.ts');
fs.writeFileSync(destPath, code);
console.log('Successfully wrote to: ' + destPath);
