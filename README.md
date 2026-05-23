# The Sportsdesk 🏆
**Australian sports news aggregator — all codes, all publishers, one place.**

---

## Project Structure

```
sportsdesk/
├── config/
│   └── feeds.js          ← RSS feed registry (add/remove publishers here)
├── src/
│   ├── feedFetcher.js    ← Core fetcher: fetch, parse, cache, deduplicate
│   └── classifier.js     ← Keyword sport classifier
├── api/
│   ├── articles.js       ← GET /api/articles — main data endpoint
│   └── refresh.js        ← POST /api/refresh — cache refresh (cron trigger)
├── public/
│   └── index.html        ← Complete frontend (HTML + CSS + JS)
├── scripts/
│   └── fetch-feeds.js    ← CLI tool to test feed connectivity
├── vercel.json           ← Vercel deployment config + cron schedule
├── .env.example          ← Environment variable template
└── package.json
```

---

## Step 1 — Local Setup

### Prerequisites
- Node.js 18+ (download from nodejs.org)
- A free Vercel account (vercel.com)
- A free GitHub account (github.com)

### Install & run locally
```bash
# Clone or unzip the project
cd sportsdesk

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
# Edit .env.local and set REFRESH_SECRET to any random string

# Test all RSS feeds first
npm run fetch-feeds

# Start the dev server
npm run dev
# → Opens at http://localhost:3000
```

---

## Step 2 — Test RSS Feed Connectivity

Before deploying, run the feed test script to check which publisher
RSS feeds are accessible:

```bash
npm run fetch-feeds
```

**Expected output:**
```
📰 Sydney Morning Herald
  Testing https://www.smh.com.au/rss/sport.xml... ✓ 20 items
    → Broncos survive late Raiders scare to stay top [NRL]
    → ...

📰 Fox Sports
  Testing https://www.foxsports.com.au/content-feeds/nrl... ✓ 18 items
  ...

RESULTS SUMMARY
  ✓ 24 feeds OK   ✗ 2 feeds failed
```

If some feeds fail, it usually means:
- The URL has changed — check the publisher's website for their current RSS URL
- The publisher blocks automated access — contact them for official RSS access
- The feed requires authentication — needs a publisher partnership

---

## Step 3 — Deploy to Vercel (Free)

### Option A: GitHub + Vercel (Recommended)
```bash
# 1. Create a GitHub repo
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/sportsdesk.git
git push -u origin main

# 2. Go to vercel.com → "Add New Project" → Import from GitHub
# 3. Select your repo
# 4. Add environment variables (from .env.example):
#    - REFRESH_SECRET = any-random-string
#    - CACHE_TTL_SECONDS = 900
# 5. Click Deploy
```

### Option B: Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

Your site will be live at `https://your-project-name.vercel.app`

### Custom Domain
In Vercel dashboard → Settings → Domains → Add `thesportsdesk.com.au`
Then update your DNS provider with the CNAME record Vercel provides.

---

## Step 4 — Google Ad Manager Integration

### Setup (free)
1. Go to **ads.google.com/intl/en_au/home/tools/google-ad-manager/**
2. Create a new network (choose "Small Business")
3. Get your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)
4. Create ad units for each placement:
   - `sportsdesk-leaderboard` (728×90 or responsive)
   - `sportsdesk-sidebar-1` (300×250)
   - `sportsdesk-sidebar-2` (300×250)
   - `sportsdesk-mid-content` (responsive)

### Add to index.html
Replace the mock ad sections in `public/index.html` with your GAM tags:

```html
<!-- In <head>: -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>

<!-- Leaderboard (replace .ad-leaderboard div): -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="YOUR_SLOT_ID"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>

<!-- Sidebar (replace .ad-sidebar divs): -->
<ins class="adsbygoogle"
     style="display:inline-block;width:300px;height:250px"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="YOUR_SIDEBAR_SLOT_ID"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
```

### Direct Ad Sales (Higher CPM)
For direct-sold campaigns (betting, streaming, sporting goods brands):
- Use **Google Ad Manager** (not AdSense) for direct deal trafficking
- Create placement packages: "NRL section takeover", "AFL Homepage Premium", etc.
- Target CPM rates: $15–$40 for sports/betting endemic advertisers in AU

---

## Step 5 — Adding/Removing Publishers

Edit `config/feeds.js` to manage publishers:

```javascript
// Add a new publisher
{
  publisher: 'espn',
  name: 'ESPN Australia',
  color: '#cc0000',
  logo: 'ESPN',
  baseUrl: 'https://www.espn.com.au',
  feeds: [
    { url: 'https://www.espn.com.au/rss/sport/news', sport: null, label: 'All Sport' },
  ]
},
```

Then run `npm run fetch-feeds` to test the new feed before deploying.

---

## Architecture Overview

```
Publisher RSS Feeds (every 15 min via Vercel Cron)
        ↓
feedFetcher.js — fetches, normalises, deduplicates
        ↓
classifier.js — keyword-based sport tagging
        ↓
NodeCache (in-memory, 15min TTL)
        ↓
GET /api/articles?sport=nrl&publisher=smh
        ↓
public/index.html — renders articles, handles filtering
        ↓
User clicks card → opens publisher's website (new tab)
```

**Cache strategy:**
- Individual feed cache: 15 min TTL
- Aggregate cache: 15 min TTL
- Vercel cron refreshes every 15 min (`*/15 * * * *`)
- Browser/CDN cache: 5 min (`Cache-Control: s-maxage=300`)

---

## Publisher Outreach Template

Use this when approaching publishers for formal RSS partnership:

> **Subject:** Traffic Partnership Opportunity — The Sportsdesk
>
> Hi [Name],
>
> I'm reaching out about a traffic referral opportunity.
> We're building The Sportsdesk (thesportsdesk.com.au) — an Australian
> sports news aggregator that surfaces headlines and snippets from leading
> publishers, with every article linking directly to the original source.
>
> We'd like to formally partner with [Publication] to include your content.
> Our model drives incremental readers to your site at no cost to you.
>
> We display only headlines, brief snippets, and thumbnail images — we do
> not reproduce full articles. Every click goes directly to your website.
>
> Would you be open to a quick call to discuss?

---

## Revenue Projections (Conservative)

| Monthly Uniques | Pageviews | Ad Revenue (est.) | Direct Deals |
|---|---|---|---|
| 10,000 | 35,000 | $350–$700 | — |
| 50,000 | 175,000 | $1,750–$3,500 | $2,000–$5,000 |
| 200,000 | 700,000 | $7,000–$14,000 | $8,000–$20,000 |
| 500,000 | 1,750,000 | $17,500–$35,000 | $20,000–$60,000 |

*Based on AU sports audience CPM of $10–$20 programmatic, $30–$50 direct*

---

## Tech Stack Summary

| Layer | Technology | Cost |
|---|---|---|
| Frontend | HTML/CSS/JS (no framework needed) | Free |
| Backend / API | Next.js API Routes | Free |
| Hosting | Vercel | Free (Hobby), $20/mo (Pro) |
| Database | In-memory NodeCache (upgrade to Redis/Upstash for scale) | Free |
| CDN | Vercel Edge Network | Included |
| Cron | Vercel Cron Jobs | Included |
| Ads | Google Ad Manager | Free |
| Domain | Any registrar (.com.au ~$20/yr) | ~$20/yr |

**Total monthly cost to launch: ~$0–$20**
