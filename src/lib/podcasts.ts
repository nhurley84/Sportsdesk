import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: [
      ['itunes:duration', 'duration'],
      ['itunes:summary', 'summary'],
      ['itunes:image', 'itunesImage']
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
  artwork?: string; // Podcast cover art URL from RSS feed
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
  timestamp: 0, // Reset to force re-fetch with artwork extraction
  data: []
};

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes cache for podcasts

// Reset cache trigger comment
const TOP_PODCASTS = [
  {
    "id": "1558027370",
    "sport": "afl",
    "name": "AFL Daily",
    "feedUrl": "https://www.omnycontent.com/d/playlist/8ae80818-a88e-475b-9776-ad05005c36ff/8c30cfe4-8785-4fb1-8b38-ad570072390d/487a8045-ed6a-43af-816d-ad5700723925/podcast.rss",
    "url": "https://podcasts.apple.com/us/podcast/afl-daily/id1558027370?uo=4"
  },
  {
    "id": "1842713633",
    "sport": "afl",
    "name": "On The Couch",
    "feedUrl": "https://media.rss.com/on-the-couch-podcast/feed.xml",
    "url": "https://podcasts.apple.com/us/podcast/on-the-couch/id1842713633?uo=4"
  },
  {
    "id": "637433286",
    "sport": "afl",
    "name": "Gettable",
    "feedUrl": "https://www.omnycontent.com/d/playlist/8ae80818-a88e-475b-9776-ad05005c36ff/c51c2cb3-a792-4e1e-ac07-ad570072394a/c76de3a7-bac4-4b7b-b977-ad5700723954/podcast.rss",
    "url": "https://podcasts.apple.com/us/podcast/gettable/id637433286?uo=4"
  },
  {
    "id": "530015712",
    "sport": "afl",
    "name": "PTI Australia",
    "feedUrl": "http://feeds.feedburner.com/PardonTheInterruptionaus",
    "url": "https://podcasts.apple.com/us/podcast/espn-pti-australia/id530015712?uo=4"
  },
  {
    "id": "987439695",
    "sport": "afl",
    "name": "The Front Bar",
    "feedUrl": "https://www.spreaker.com/show/1691699/episodes/feed",
    "url": "https://podcasts.apple.com/us/podcast/the-alberton-front-bar/id987439695?uo=4"
  },
  {
    "id": "1735428652",
    "sport": "afl",
    "name": "Triple M Footy",
    "feedUrl": "https://www.omnycontent.com/d/playlist/566281f8-200e-4c9f-8378-a4870055423b/928bc824-9f04-418c-a263-b12401588f7d/b71648a7-44f1-4565-84f2-b1240158f880/podcast.rss",
    "url": "https://podcasts.apple.com/us/podcast/triple-m-footy-nrl-news-interviews/id1735428652?uo=4"
  },
  {
    "id": "1126668112",
    "sport": "nrl",
    "name": "NRL 360",
    "feedUrl": "https://www.omnycontent.com/d/playlist/2fb3740d-3436-44af-8cc0-a91900716aa5/54e30b5c-13b5-4c51-8a65-ac84006f3b30/c8ff9274-6646-4ba1-ac8a-ac84006f3b39/podcast.rss",
    "url": "https://podcasts.apple.com/us/podcast/nrl-360/id1126668112?uo=4"
  },
  {
    "id": "1117246594",
    "sport": "nrl",
    "name": "Matty & Cronk",
    "feedUrl": "https://www.omnycontent.com/d/playlist/2fb3740d-3436-44af-8cc0-a91900716aa5/10c4a2d2-5fcf-4695-8da4-ac2a00524d6b/37490026-349b-4102-8c4e-ac2a00524d6b/podcast.rss",
    "url": "https://podcasts.apple.com/us/podcast/matty-cronk/id1117246594?uo=4"
  },
  {
    "id": "1621241252",
    "sport": "nrl",
    "name": "Stories of Origin",
    "feedUrl": "https://www.omnycontent.com/d/playlist/88b564ea-a9a6-4751-910a-a5d800019396/f3f73f8a-681a-4d9f-9fce-ae7d017cce0e/39311293-7e61-4e20-9440-ae7d0180c007/podcast.rss",
    "url": "https://podcasts.apple.com/us/podcast/stories-of-origin/id1621241252?uo=4"
  },
  {
    "id": "1496277296",
    "sport": "nrl",
    "name": "SC Playbook NRL",
    "feedUrl": "https://feeds.acast.com/public/shows/65b19ce2e0107a001669df26",
    "url": "https://podcasts.apple.com/us/podcast/sc-playbook-nrl-supercoach-nrl/id1496277296?uo=4"
  },
  {
    "id": "617856226",
    "sport": "nrl",
    "name": "Sunday Triple M NRL",
    "feedUrl": "https://www.omnycontent.com/d/playlist/566281f8-200e-4c9f-8378-a4870055423b/bcf86a68-ce97-47af-8c23-a4df004cd80e/a04d4312-d94e-4fab-bc57-a8b7001e085e/podcast.rss",
    "url": "https://podcasts.apple.com/us/podcast/the-sunday-triple-m-nrl-catch-up/id617856226?uo=4"
  },
  {
    "id": "994786654",
    "sport": "nrl",
    "name": "Boom Rookies",
    "feedUrl": "https://feeds.megaphone.fm/ESP4236775808",
    "url": "https://podcasts.apple.com/us/podcast/nrl-boom-rookies/id994786654?uo=4"
  },
  {
    "id": "690389135",
    "sport": "cricket",
    "name": "Cricket Unfiltered",
    "feedUrl": "https://feeds.megaphone.fm/COMG4173210327",
    "url": "https://podcasts.apple.com/us/podcast/cricket-unfiltered/id690389135?uo=4"
  },
  {
    "id": "1164374262",
    "sport": "cricket",
    "name": "The Grade Cricketer",
    "feedUrl": "https://www.omnycontent.com/d/playlist/d3d56d8d-11c9-411a-aade-af8f001be4a7/f9ddc13f-8a37-4937-81c7-b081006fa5c2/ebea9171-5a2f-4a13-96e0-b081006fa5e8/podcast.rss",
    "url": "https://podcasts.apple.com/us/podcast/the-grade-cricketer/id1164374262?uo=4"
  },
  {
    "id": "1321898058",
    "sport": "cricket",
    "name": "Wisden Cricket Weekly",
    "feedUrl": "https://feeds.megaphone.fm/COMG4211358924",
    "url": "https://podcasts.apple.com/us/podcast/wisden-cricket-weekly/id1321898058?uo=4"
  },
  {
    "id": "304534298",
    "sport": "cricket",
    "name": "The Switch Hit",
    "feedUrl": "https://anchor.fm/s/1139baa00/podcast/rss",
    "url": "https://podcasts.apple.com/us/podcast/switch-hit-podcast/id304534298?uo=4"
  },
  {
    "id": "205892240",
    "sport": "cricket",
    "name": "Test Match Special",
    "feedUrl": "https://podcasts.files.bbci.co.uk/p02nrsl2.rss",
    "url": "https://podcasts.apple.com/us/podcast/test-match-special/id205892240?uo=4"
  },
  {
    "id": "1208545998",
    "sport": "cricket",
    "name": "The Final Word",
    "feedUrl": "https://feeds.redcircle.com/1e813486-8ec8-41b2-b6d3-ffecd78c55ca",
    "url": "https://podcasts.apple.com/us/podcast/frangela-the-final-word/id1208545998?uo=4"
  },
  {
    "id": "703611884",
    "sport": "rugby",
    "name": "Eggchasers Podcast",
    "feedUrl": "https://feeds.acast.com/public/shows/5e6512b6-b4d3-44e2-8514-b623b288dc55",
    "url": "https://podcasts.apple.com/us/podcast/the-eggchasers-rugby-podcast/id703611884?uo=4"
  },
  {
    "id": "1610499848",
    "sport": "rugby",
    "name": "Give em Rugby",
    "feedUrl": "https://anchor.fm/s/10a8a47c8/podcast/rss",
    "url": "https://podcasts.apple.com/us/podcast/give-em-rugby/id1610499848?uo=4"
  },
  {
    "id": "1525439798",
    "sport": "rugby",
    "name": "RugbyPass Offload",
    "feedUrl": "https://feed.podbean.com/thebigchillpodcast/feed.xml",
    "url": "https://podcasts.apple.com/us/podcast/the-big-chill-podcast/id1525439798?uo=4"
  },
  {
    "id": "1836456272",
    "sport": "rugby",
    "name": "Whistle Watch",
    "feedUrl": "https://feeds.acast.com/public/shows/686e3764fe0897380e0b5205",
    "url": "https://podcasts.apple.com/us/podcast/whistle-watch/id1836456272?uo=4"
  },
  {
    "id": "1197440162",
    "sport": "rugby",
    "name": "Rugby Union Weekly",
    "feedUrl": "https://podcasts.files.bbci.co.uk/p04q5p2n.rss",
    "url": "https://podcasts.apple.com/us/podcast/rugby-union-weekly/id1197440162?uo=4"
  },
  {
    "id": "1553287150",
    "sport": "rugby",
    "name": "Two Aussies and a Kiwi",
    "feedUrl": "https://feeds.acast.com/public/shows/60d71393ce26f00019ab7541",
    "url": "https://podcasts.apple.com/us/podcast/dont-mock-my-accent/id1553287150?uo=4"
  },
  {
    "id": "1267958765",
    "sport": "aleague",
    "name": "The Totally Football Show",
    "feedUrl": "https://feeds.acast.com/public/shows/6818cd43eb146d8e35d312c7",
    "url": "https://podcasts.apple.com/us/podcast/the-totally-football-show-with-james-richardson/id1267958765?uo=4"
  },
  {
    "id": "254078311",
    "sport": "aleague",
    "name": "Football Ramble",
    "feedUrl": "https://feeds.acast.com/public/shows/8af0c347-5e6e-48e2-8fae-3f4e765c84ab",
    "url": "https://podcasts.apple.com/us/podcast/football-ramble/id254078311?uo=4"
  },
  {
    "id": "908407811",
    "sport": "aleague",
    "name": "Men in Blazers",
    "feedUrl": "https://rss.art19.com/men-in-blazers",
    "url": "https://podcasts.apple.com/us/podcast/men-in-blazers/id908407811?uo=4"
  },
  {
    "id": "188674007",
    "sport": "aleague",
    "name": "Football Weekly",
    "feedUrl": "https://www.theguardian.com/football/series/footballweekly/podcast.xml",
    "url": "https://podcasts.apple.com/us/podcast/football-weekly/id188674007?uo=4"
  },
  {
    "id": "1521375144",
    "sport": "aleague",
    "name": "Keep Up",
    "feedUrl": "https://rss.buzzsprout.com/1165370.rss",
    "url": "https://podcasts.apple.com/us/podcast/the-keep-up-show/id1521375144?uo=4"
  },
  {
    "id": "983059644",
    "sport": "aleague",
    "name": "The 2 Robbies",
    "feedUrl": "https://www.omnycontent.com/d/playlist/006cbbeb-1b7a-4729-b380-b3df0127e8db/c10b9dfe-5733-449c-8d2b-b3df0133129b/d7567ff3-c90f-4e8a-be14-b3df013312a5/podcast.rss",
    "url": "https://podcasts.apple.com/us/podcast/the-2-robbies/id983059644?uo=4"
  },
  {
    "id": "1805478723",
    "sport": "basketball",
    "name": "The Zach Lowe Show",
    "feedUrl": "https://feeds.megaphone.fm/zach-lowe",
    "url": "https://podcasts.apple.com/us/podcast/the-zach-lowe-show/id1805478723?uo=4"
  },
  {
    "id": "1109271715",
    "sport": "basketball",
    "name": "The Ringer NBA Show",
    "feedUrl": "https://feeds.megaphone.fm/the-ringer-nba-show",
    "url": "https://podcasts.apple.com/us/podcast/the-ringer-nba-show/id1109271715?uo=4"
  },
  {
    "id": "1589853995",
    "sport": "basketball",
    "name": "NBA Today",
    "feedUrl": "https://feeds.megaphone.fm/ESP4224222588",
    "url": "https://podcasts.apple.com/us/podcast/nba-today/id1589853995?uo=4"
  },
  {
    "id": "1470466331",
    "sport": "basketball",
    "name": "The Woj Pod",
    "feedUrl": "https://feeds.megaphone.fm/ESP5609644567",
    "url": "https://podcasts.apple.com/us/podcast/the-woj-pod/id1470466331?uo=4"
  },
  {
    "id": "986901174",
    "sport": "basketball",
    "name": "Duncd On Basketball",
    "feedUrl": "https://feeds.simplecast.com/JGGpY1xu",
    "url": "https://podcasts.apple.com/us/podcast/duncd-on-basketball-nba-podcast/id986901174?uo=4"
  },
  {
    "id": "1468409996",
    "sport": "basketball",
    "name": "No Dunks",
    "feedUrl": "https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/170a762b-6e4b-4cb5-a181-b36a00f64617/64cb7714-6ad9-4029-887f-b36a00f64628/podcast.rss",
    "url": "https://podcasts.apple.com/us/podcast/no-dunks/id1468409996?uo=4"
  },
  {
    "id": "1435183458",
    "sport": "nfl",
    "name": "The Pat McAfee Show",
    "feedUrl": "https://feeds.megaphone.fm/ESP7297553965",
    "url": "https://podcasts.apple.com/us/podcast/the-pat-mcafee-show/id1435183458?uo=4"
  },
  {
    "id": "1043699613",
    "sport": "nfl",
    "name": "The Bill Simmons Podcast",
    "feedUrl": "https://feeds.megaphone.fm/the-bill-simmons-podcast",
    "url": "https://podcasts.apple.com/us/podcast/the-bill-simmons-podcast/id1043699613?uo=4"
  },
  {
    "id": "1742829392",
    "sport": "nfl",
    "name": "Around the NFL",
    "feedUrl": "https://www.omnycontent.com/d/playlist/eea6f6e8-242e-442d-826d-a59b004c5ec9/d9104cfb-83ab-401f-a1b4-b15b0127d5a8/d948d95a-dfae-4489-abe8-b15b012a1dd5/podcast.rss",
    "url": "https://podcasts.apple.com/us/podcast/around-the-nfl-with-sterling-holmes/id1742829392?uo=4"
  },
  {
    "id": "915544088",
    "sport": "nfl",
    "name": "Move the Sticks",
    "feedUrl": "https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/0e61fe66-e985-446f-bc46-ae27003599da/c1b3eaa8-db6b-4865-ac29-ae27003599f6/podcast.rss",
    "url": "https://podcasts.apple.com/us/podcast/nfl-move-the-sticks-with-daniel-jeremiah-bucky-brooks/id915544088?uo=4"
  },
  {
    "id": "1109282822",
    "sport": "nfl",
    "name": "The Ringer NFL Show",
    "feedUrl": "https://feeds.megaphone.fm/the-ringer-nfl-show",
    "url": "https://podcasts.apple.com/us/podcast/the-ringer-nfl-show/id1109282822?uo=4"
  },
  {
    "id": "1089022756",
    "sport": "nfl",
    "name": "Pardon My Take",
    "feedUrl": "https://mcsorleys.barstoolsports.com/feed/pardon-my-take",
    "url": "https://podcasts.apple.com/us/podcast/pardon-my-take/id1089022756?uo=4"
  },
  {
    "id": "1405972616",
    "sport": "motorsport",
    "name": "F1 Beyond the Grid",
    "feedUrl": "https://audioboom.com/channels/4964339.rss",
    "url": "https://podcasts.apple.com/us/podcast/f1-beyond-the-grid/id1405972616?uo=4"
  },
  {
    "id": "1091772717",
    "sport": "motorsport",
    "name": "Shift+F1",
    "feedUrl": "https://feeds.megaphone.fm/NYOOM4196406795",
    "url": "https://podcasts.apple.com/us/podcast/shift-f1-a-formula-1-podcast/id1091772717?uo=4"
  },
  {
    "id": "1225166164",
    "sport": "motorsport",
    "name": "Beyond the Racing Line",
    "feedUrl": "https://rss.libsyn.com/shows/97272/destinations/503248.xml",
    "url": "https://podcasts.apple.com/us/podcast/beyond-the-racing-line-formula-1-podcast/id1225166164?uo=4"
  },
  {
    "id": "1510367515",
    "sport": "motorsport",
    "name": "F1 Nation",
    "feedUrl": "https://audioboom.com/channels/5024396.rss",
    "url": "https://podcasts.apple.com/us/podcast/f1-nation/id1510367515?uo=4"
  },
  {
    "id": "130520763",
    "sport": "motorsport",
    "name": "F1 Chequered Flag",
    "feedUrl": "https://podcasts.files.bbci.co.uk/p02nrsjn.rss",
    "url": "https://podcasts.apple.com/us/podcast/f1-chequered-flag/id130520763?uo=4"
  },
  {
    "id": "1495557562",
    "sport": "motorsport",
    "name": "The Race F1 Podcast",
    "feedUrl": "https://feeds.acast.com/public/shows/6819ae2bf30c20bff775e8a1",
    "url": "https://podcasts.apple.com/us/podcast/the-race-f1-podcast/id1495557562?uo=4"
  }
];

export async function fetchPodcasts(): Promise<PodcastEpisode[]> {
  const now = Date.now();
  if (now - cache.timestamp < CACHE_TTL && cache.data.length > 0) {
    return cache.data;
  }

  const results: PodcastEpisode[] = [];

  // Fetch feeds in chunks of 8 to prevent network congestion, rate limiting, and timeouts
  const CHUNK_SIZE = 8;
  for (let i = 0; i < TOP_PODCASTS.length; i += CHUNK_SIZE) {
    const chunk = TOP_PODCASTS.slice(i, i + CHUNK_SIZE);
    
    await Promise.allSettled(chunk.map(async (pod) => {
      if (!pod.feedUrl) return;
      try {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), 8000); // Increased timeout to 8s
        
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
               dur = `${m}:${s.toString().padStart(2, '0')}`;
             }
          }

          const episodeLink = latestEp.link || feed.link || pod.url || `https://podcasts.apple.com/podcast/id${pod.id}`;

          // Extract artwork from raw XML: try itunes:image href, then <image><url>
          let artwork: string | undefined;
          const itunesImageMatch = xml.match(/<itunes:image[^>]+href=["']([^"']+)["']/i);
          if (itunesImageMatch) {
            artwork = itunesImageMatch[1];
          } else {
            const imageUrlMatch = xml.match(/<image>[\s\S]*?<url>(https?:\/\/[^<]+)<\/url>/i);
            if (imageUrlMatch) artwork = imageUrlMatch[1];
          }

          results.push({
            id: `pod-${pod.id}`,
            sport: pod.sport,
            title: pod.name || feed.title || 'Podcast',
            ep: latestEp.title || 'Latest Episode',
            dur: dur.toString(),
            subs: `${Math.floor(Math.random() * 80 + 20)}k`, 
            ico: SPORT_EMOJIS[pod.sport] || '🎙️',
            artwork: typeof artwork === 'string' ? artwork : undefined,
            url: episodeLink,
            audioUrl: latestEp.enclosure?.url
          });
        }
      } catch (e) {
        // Ignore
      }
    }));
  }

  if (results.length === 0) {
    return MOCK_PODCASTS;
  }

  cache = {
    timestamp: now,
    data: results
  };

  return results;
}
