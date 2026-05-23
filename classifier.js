#!/usr/bin/env node
// scripts/fetch-feeds.js
// ─────────────────────────────────────────────────────────────────────────────
// Standalone script — run with: npm run fetch-feeds
// Useful for testing feed connectivity and classifier accuracy before deploying.
// ─────────────────────────────────────────────────────────────────────────────

const Parser = require('rss-parser');
const { FEEDS, SPORTS } = require('../config/feeds');
const { classify } = require('../src/classifier');

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'TheSportsdesk/1.0 RSS Test Script' }
});

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m',
};

const c = (color, text) => `${COLORS[color]}${text}${COLORS.reset}`;

async function testFeed(publisher, feedConfig) {
  process.stdout.write(`  Testing ${c('cyan', feedConfig.url.slice(0, 60))}... `);
  try {
    const feed = await parser.parseURL(feedConfig.url);
    const count = feed.items.length;
    console.log(c('green', `✓ ${count} items`));

    // Show first 3 items with classification
    feed.items.slice(0, 3).forEach(item => {
      const text = `${item.title || ''} ${item.contentSnippet || ''}`;
      const sport = classify(text, feedConfig.sport);
      const sportLabel = sport ? (SPORTS[sport]?.label || sport) : 'unclassified';
      const sportColor = sport ? 'yellow' : 'dim';
      console.log(`    ${c('dim', '→')} ${c('bright', (item.title || '').slice(0, 70))}${item.title?.length > 70 ? '…' : ''}`);
      console.log(`       ${c(sportColor, `[${sportLabel}]`)} ${c('dim', publisher.name)}`);
    });
    return { ok: true, count };
  } catch (err) {
    console.log(c('red', `✗ ${err.message}`));
    return { ok: false, error: err.message };
  }
}

async function main() {
  console.log('\n' + c('bright', '═══════════════════════════════════════════════'));
  console.log(c('bright', '  THE SPORTSDESK — Feed Connectivity Test'));
  console.log(c('bright', '═══════════════════════════════════════════════') + '\n');

  let totalOk = 0;
  let totalFail = 0;
  const publisherResults = {};

  for (const publisher of FEEDS) {
    console.log(c('bright', `\n📰 ${publisher.name}`));
    publisherResults[publisher.publisher] = { ok: 0, fail: 0 };

    for (const feedConfig of publisher.feeds) {
      const result = await testFeed(publisher, feedConfig);
      if (result.ok) {
        totalOk++;
        publisherResults[publisher.publisher].ok++;
      } else {
        totalFail++;
        publisherResults[publisher.publisher].fail++;
      }
    }
  }

  console.log('\n' + c('bright', '═══════════════════════════════════════════════'));
  console.log(c('bright', '  RESULTS SUMMARY'));
  console.log(c('bright', '═══════════════════════════════════════════════'));
  console.log(`  ${c('green', `✓ ${totalOk} feeds OK`)}   ${c('red', `✗ ${totalFail} feeds failed`)}`);
  console.log('\n  Per publisher:');
  for (const [pub, result] of Object.entries(publisherResults)) {
    const status = result.fail === 0 ? c('green', '✓') : c('yellow', '⚠');
    console.log(`  ${status} ${pub}: ${result.ok} ok, ${result.fail} failed`);
  }

  if (totalFail > 0) {
    console.log(`\n${c('yellow', '  ⚠ Some feeds failed. Check URLs in config/feeds.js')}`);
    console.log(c('dim', '  Note: Some publishers may block automated access — contact them for official RSS access.\n'));
  } else {
    console.log(`\n${c('green', '  All feeds working! Ready to deploy.')}\n`);
  }
}

main().catch(console.error);
