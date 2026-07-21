import Parser from 'rss-parser';
import sourcesData from '../data/sources.json';

const parser = new Parser({
  customFields: {
    item: [
      ['itunes:duration', 'duration'],
      ['itunes:summary', 'summary'],
      ['itunes:image', 'itunesImage'],
    ],
  },
});

type SportKey =
  | 'afl'
  | 'nrl'
  | 'cricket'
  | 'rugby'
  | 'aleague'
  | 'basketball'
  | 'nfl'
  | 'motorsport';

interface PodcastSource {
  name: string;
  hosts: string;
  url: string;
  rss?: string;
  sport: SportKey;
}

interface FeedMappedPodcast extends PodcastSource {
  feedUrl?: string;
}

type ParsedPodcastFeed = Awaited<ReturnType<typeof parser.parseString>>;
type ParsedPodcastItem = NonNullable<ParsedPodcastFeed['items']>[number];

export interface PodcastEpisode {
  id: string;
  sport: string;
  title: string;
  ep: string;
  dur: string;
  subs: string;
  trending?: boolean;
  ico: string;
  artwork?: string;
  url: string;
  audioUrl?: string;
}

const SPORT_EMOJIS: Record<string, string> = {
  afl: '🏈',
  nrl: '🏉',
  cricket: '🏏',
  rugby: '🏉',
  aleague: '⚽',
  basketball: '🏀',
  nfl: '🏈',
  motorsport: '🏎️',
  general: '🎙️',
};

const PODCAST_FEEDS: Record<string, string> = {
  'afl daily':
    'https://www.omnycontent.com/d/playlist/8ae80818-a88e-475b-9776-ad05005c36ff/8c30cfe4-8785-4fb1-8b38-ad570072390d/487a8045-ed6a-43af-816d-ad5700723925/podcast.rss',
  'the front bar': 'https://www.spreaker.com/show/1691699/episodes/feed',
  'on the couch': 'https://media.rss.com/on-the-couch-podcast/feed.xml',
  'triple m footy':
    'https://www.omnycontent.com/d/playlist/566281f8-200e-4c9f-8378-a4870055423b/928bc824-9f04-418c-a263-b12401588f7d/b71648a7-44f1-4565-84f2-b1240158f880/podcast.rss',
  gettable:
    'https://www.omnycontent.com/d/playlist/8ae80818-a88e-475b-9776-ad05005c36ff/c51c2cb3-a792-4e1e-ac07-ad570072394a/c76de3a7-bac4-4b7b-b977-ad5700723954/podcast.rss',
  'pti australia': 'http://feeds.feedburner.com/PardonTheInterruptionaus',
  'nrl 360':
    'https://www.omnycontent.com/d/playlist/2fb3740d-3436-44af-8cc0-a91900716aa5/54e30b5c-13b5-4c51-8a65-ac84006f3b30/c8ff9274-6646-4ba1-ac8a-ac84006f3b39/podcast.rss',
  'matty and cronk':
    'https://www.omnycontent.com/d/playlist/2fb3740d-3436-44af-8cc0-a91900716aa5/10c4a2d2-5fcf-4695-8da4-ac2a00524d6b/37490026-349b-4102-8c4e-ac2a00524d6b/podcast.rss',
  'stories of origin':
    'https://www.omnycontent.com/d/playlist/88b564ea-a9a6-4751-910a-a5d800019396/f3f73f8a-681a-4d9f-9fce-ae7d017cce0e/39311293-7e61-4e20-9440-ae7d0180c007/podcast.rss',
  'sc playbook nrl': 'https://feeds.acast.com/public/shows/65b19ce2e0107a001669df26',
  'sunday triple m nrl':
    'https://www.omnycontent.com/d/playlist/566281f8-200e-4c9f-8378-a4870055423b/bcf86a68-ce97-47af-8c23-a4df004cd80e/a04d4312-d94e-4fab-bc57-a8b7001e085e/podcast.rss',
  'boom rookies': 'https://feeds.megaphone.fm/ESP4236775808',
  'cricket unfiltered': 'https://feeds.megaphone.fm/COMG4173210327',
  'the grade cricketer':
    'https://www.omnycontent.com/d/playlist/d3d56d8d-11c9-411a-aade-af8f001be4a7/f9ddc13f-8a37-4937-81c7-b081006fa5c2/ebea9171-5a2f-4a13-96e0-b081006fa5e8/podcast.rss',
  'wisden cricket weekly': 'https://feeds.megaphone.fm/COMG4211358924',
  'the switch hit': 'https://anchor.fm/s/1139baa00/podcast/rss',
  'test match special': 'https://podcasts.files.bbci.co.uk/p02nrsl2.rss',
  'the final word cricket podcast':
    'https://feeds.redcircle.com/1e813486-8ec8-41b2-b6d3-ffecd78c55ca',
  'rugbypass offload': 'https://feed.podbean.com/thebigchillpodcast/feed.xml',
  'whistle watch': 'https://feeds.acast.com/public/shows/686e3764fe0897380e0b5205',
  'rugby union weekly': 'https://podcasts.files.bbci.co.uk/p04q5p2n.rss',
  'eggchasers podcast': 'https://feeds.acast.com/public/shows/5e6512b6-b4d3-44e2-8514-b623b288dc55',
  'give em rugby': 'https://anchor.fm/s/10a8a47c8/podcast/rss',
  'two aussies and a kiwi': 'https://feeds.acast.com/public/shows/60d71393ce26f00019ab7541',
  'football weekly': 'https://www.theguardian.com/football/series/footballweekly/podcast.xml',
  'the totally football show': 'https://feeds.acast.com/public/shows/6818cd43eb146d8e35d312c7',
  'football ramble': 'https://feeds.acast.com/public/shows/8af0c347-5e6e-48e2-8fae-3f4e765c84ab',
  'the 2 robbies':
    'https://www.omnycontent.com/d/playlist/006cbbeb-1b7a-4729-b380-b3df0127e8db/c10b9dfe-5733-449c-8d2b-b3df0133129b/d7567ff3-c90f-4e8a-be14-b3df013312a5/podcast.rss',
  'men in blazers': 'https://rss.art19.com/men-in-blazers',
  'keep up': 'https://rss.buzzsprout.com/1165370.rss',
  'the zach lowe show': 'https://feeds.megaphone.fm/zach-lowe',
  'the ringer nba show': 'https://feeds.megaphone.fm/the-ringer-nba-show',
  'nba today': 'https://feeds.megaphone.fm/ESP4224222588',
  'the woj pod': 'https://feeds.megaphone.fm/ESP5609644567',
  "duncd on basketball": 'https://feeds.simplecast.com/JGGpY1xu',
  'no dunks':
    'https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/170a762b-6e4b-4cb5-a181-b36a00f64617/64cb7714-6ad9-4029-887f-b36a00f64628/podcast.rss',
  'the pat mcafee show': 'https://feeds.megaphone.fm/ESP7297553965',
  'the bill simmons podcast': 'https://feeds.megaphone.fm/the-bill-simmons-podcast',
  'around the nfl':
    'https://www.omnycontent.com/d/playlist/eea6f6e8-242e-442d-826d-a59b004c5ec9/d9104cfb-83ab-401f-a1b4-b15b0127d5a8/d948d95a-dfae-4489-abe8-b15b012a1dd5/podcast.rss',
  'move the sticks':
    'https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/0e61fe66-e985-446f-bc46-ae27003599da/c1b3eaa8-db6b-4865-ac29-ae27003599f6/podcast.rss',
  'the ringer nfl show': 'https://feeds.megaphone.fm/the-ringer-nfl-show',
  'pardon my take': 'https://mcsorleys.barstoolsports.com/feed/pardon-my-take',
  'f1 beyond the grid': 'https://audioboom.com/channels/4964339.rss',
  'f1 nation': 'https://audioboom.com/channels/5024396.rss',
  'f1 chequered flag': 'https://podcasts.files.bbci.co.uk/p02nrsjn.rss',
  'the race f1 podcast': 'https://feeds.acast.com/public/shows/6819ae2bf30c20bff775e8a1',
  'shift+f1': 'https://feeds.megaphone.fm/NYOOM4196406795',
  'beyond the racing line': 'https://rss.libsyn.com/shows/97272/destinations/503248.xml',
};

const AFL_PODCAST_KEYS = new Set([
  'afl daily',
  'dan does footy',
  'the rush hour with jb and billy',
  'fox footy podcasts',
  'triple m footy',
  '3aw is football',
  'real footy',
]);

const cache = new Map<string, { timestamp: number; data: PodcastEpisode[] }>();
const CACHE_TTL = 30 * 60 * 1000;
const FETCH_TIMEOUT_MS = 5_000;
const MAX_EPISODES_PER_FEED = 10;

function normalizeKey(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, 'and')
    .replace(/[()]/g, ' ')
    .replace(/[^a-zA-Z0-9+ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function podcastKeyCandidates(name: string): string[] {
  const withoutParenthetical = name.replace(/\([^)]*\)/g, ' ');
  const dashParts = withoutParenthetical.split(/[—-]/g);
  const candidates = [
    name,
    withoutParenthetical,
    dashParts[dashParts.length - 1] || '',
  ].map(normalizeKey).filter(Boolean);

  return [...new Set(candidates)];
}

function slugify(value: string): string {
  return normalizeKey(value).replace(/[^a-z0-9]+/g, '-');
}

function normalizeFeedUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const value = url.trim();
  if (!value) return undefined;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function normalizeUrlForCompare(url: string | undefined): string {
  const normalized = normalizeFeedUrl(url);
  if (!normalized) return '';

  try {
    const parsed = new URL(normalized);
    parsed.hash = '';
    parsed.search = '';
    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    return parsed.toString().toLowerCase();
  } catch {
    return normalized.toLowerCase();
  }
}

function isKnownBadPodcastPage(url: string | undefined): boolean {
  const normalized = normalizeFeedUrl(url);
  if (!normalized) return true;

  try {
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, '').toLowerCase();

    return (
      host === 'podcast.sport-social.co.uk' ||
      (host === 'wisden.com' && path === '/podcasts')
    );
  } catch {
    return true;
  }
}

function stableSubscribers(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `${20 + (hash % 81)}k`;
}

function normalizeDuration(raw: unknown): string {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return '00:00';
  }

  const value = raw.trim();
  if (value.includes(':')) {
    return value;
  }

  const totalSeconds = Number.parseInt(value, 10);
  if (Number.isNaN(totalSeconds)) {
    return '00:00';
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function extractArtwork(xml: string): string | undefined {
  const itunesImageMatch = xml.match(/<itunes:image[^>]+href=["']([^"']+)["']/i);
  if (itunesImageMatch?.[1]) {
    return itunesImageMatch[1];
  }

  const imageUrlMatch = xml.match(/<image>[\s\S]*?<url>(https?:\/\/[^<]+)<\/url>/i);
  if (imageUrlMatch?.[1]) {
    return imageUrlMatch[1];
  }

  return undefined;
}

function resolvePodcastFeedUrl(podcast: PodcastSource): string | undefined {
  const sourceUrl = normalizeFeedUrl(podcast.rss);
  if (sourceUrl) return sourceUrl;

  for (const key of podcastKeyCandidates(podcast.name)) {
    const feedUrl = normalizeFeedUrl(PODCAST_FEEDS[key]);
    if (feedUrl) return feedUrl;
  }

  return undefined;
}

function choosePodcastPageUrl(
  source: FeedMappedPodcast,
  feed: ParsedPodcastFeed,
  episode: ParsedPodcastItem
): string {
  const sourceUrl = normalizeFeedUrl(source.url);
  const feedUrl = normalizeFeedUrl(source.feedUrl);
  const feedLink = normalizeFeedUrl(feed.link);
  const episodeLink = normalizeFeedUrl(episode.link);
  const audioUrl = normalizeFeedUrl(episode.enclosure?.url);

  const sourceIsFeed = normalizeUrlForCompare(sourceUrl) === normalizeUrlForCompare(feedUrl);
  const pageFallbacks = [feedLink, !sourceIsFeed ? sourceUrl : undefined]
    .filter((url): url is string => Boolean(url));
  const isDirectEpisodePage = episodeLink && pageFallbacks.every(
    (fallback) => normalizeUrlForCompare(episodeLink) !== normalizeUrlForCompare(fallback)
  );
  const candidates = [
    isDirectEpisodePage ? episodeLink : undefined,
    audioUrl,
    episodeLink,
    feedLink,
    !sourceIsFeed ? sourceUrl : undefined,
    sourceUrl,
  ];

  return candidates.find((candidate) => candidate && !isKnownBadPodcastPage(candidate)) || audioUrl || feedUrl || '#';
}

function getPodcastSources(sport: string): FeedMappedPodcast[] {
  const allSources = (sourcesData.podcasts as PodcastSource[]).map((podcast) => ({
    ...podcast,
    feedUrl: resolvePodcastFeedUrl(podcast),
  })).filter((podcast) => podcast.sport !== 'afl' || AFL_PODCAST_KEYS.has(normalizeKey(podcast.name)));

  if (sport === 'all') {
    return allSources.filter((podcast) => podcast.feedUrl);
  }

  return allSources.filter((podcast) => podcast.sport === sport && podcast.feedUrl);
}

async function fetchPodcastFeed(source: FeedMappedPodcast): Promise<PodcastEpisode[]> {
  if (!source.feedUrl) {
    return [];
  }

  try {
    const response = await fetch(source.feedUrl, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: {
        'user-agent': 'Mozilla/5.0 SportsDesk/1.0',
        accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    const xmlStart = xml.trimStart().slice(0, 32).toLowerCase();
    if (
      contentType.includes('text/html') ||
      (!xmlStart.startsWith('<?xml') && !xmlStart.startsWith('<rss') && !xmlStart.startsWith('<feed'))
    ) {
      return [];
    }

    const feed = await parser.parseString(xml);
    const episodes = feed.items?.slice(0, MAX_EPISODES_PER_FEED) ?? [];
    if (episodes.length === 0) {
      return [];
    }

    const title = source.name || feed.title || 'Podcast';
    const artwork = extractArtwork(xml);

    const mappedEpisodes = episodes.map((episode, index) => {
      const episodeLink = choosePodcastPageUrl(source, feed, episode);
      const duration = normalizeDuration(
        episode.duration || (episode as { itunesDuration?: string }).itunesDuration
      );
      const episodeSeed = episode.guid || episode.link || `${title}-${episode.title || index}`;

      return {
        id: `${source.sport}-${slugify(title)}-${slugify(String(episodeSeed))}`,
        sport: source.sport,
        title,
        ep: episode.title || `Episode ${index + 1}`,
        dur: duration,
        subs: stableSubscribers(title),
        trending: index < 3,
        ico: SPORT_EMOJIS[source.sport] || SPORT_EMOJIS.general,
        artwork,
        url: episodeLink,
        audioUrl: episode.enclosure?.url,
      };
    });

    const hasSharedDestination = mappedEpisodes.length > 1
      && new Set(mappedEpisodes.map((episode) => episode.url)).size === 1;

    if (!hasSharedDestination) {
      return mappedEpisodes;
    }

    return mappedEpisodes.map((episode) => (
      episode.audioUrl ? { ...episode, url: episode.audioUrl } : episode
    ));
  } catch {
    return [];
  }
}

export async function fetchPodcasts(sport = 'all'): Promise<PodcastEpisode[]> {
  const cacheKey = sport;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const allSportsCache = cache.get('all');
  if (sport !== 'all' && allSportsCache && now - allSportsCache.timestamp < CACHE_TTL) {
    return allSportsCache.data.filter((episode) => episode.sport === sport);
  }

  const sources = getPodcastSources(sport);
  const settled = await Promise.allSettled(sources.map(fetchPodcastFeed));
  const results = settled.flatMap((result) => (
    result.status === 'fulfilled' ? result.value : []
  ));

  cache.set(cacheKey, {
    timestamp: now,
    data: results,
  });

  if (sport === 'all') {
    for (const sportKey of Object.keys(SPORT_EMOJIS)) {
      if (sportKey === 'general') continue;
      cache.set(sportKey, {
        timestamp: now,
        data: results.filter((episode) => episode.sport === sportKey),
      });
    }
  }

  return results;
}
