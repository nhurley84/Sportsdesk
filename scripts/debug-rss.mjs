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

const FEEDS = [
  { name: 'ABC AFL', url: 'https://www.abc.net.au/news/feed/7077144/rss.xml' },
  { name: 'The Guardian Football', url: 'https://www.theguardian.com/football/rss' },
  { name: 'BBC Cricket', url: 'https://feeds.bbci.co.uk/sport/cricket/rss.xml' },
  { name: 'The Roar AFL', url: 'https://www.theroar.com.au/afl/feed/' },
  { name: 'CBS Sports NFL', url: 'https://www.cbssports.com/rss/headlines/nfl/' },
];

for (const feed of FEEDS) {
  console.log('\n' + '='.repeat(60));
  console.log(`FEED: ${feed.name}`);
  console.log('='.repeat(60));
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0.4472.124' }
    });
    const xml = await res.text();
    const data = await parser.parseString(xml);
    const item = data.items?.[0];
    if (!item) { console.log('No items'); continue; }
    console.log('KEYS:', Object.keys(item).join(', '));
    console.log('mediaContent:', JSON.stringify(item.mediaContent, null, 2)?.substring(0, 400));
    console.log('mediaThumbnail:', JSON.stringify(item.mediaThumbnail, null, 2)?.substring(0, 400));
    console.log('mediaGroup:', JSON.stringify(item.mediaGroup, null, 2)?.substring(0, 400));
    console.log('enclosure:', JSON.stringify(item.enclosure, null, 2)?.substring(0, 200));
    console.log('contentEncoded (first 300):', item.contentEncoded?.substring(0, 300));
    console.log('content (first 300):', item.content?.substring(0, 300));
    console.log('description (first 300):', item.description?.substring(0, 300));
  } catch(e) {
    console.log('ERROR:', e.message);
  }
}
