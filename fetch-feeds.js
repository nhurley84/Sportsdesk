<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="The Sportsdesk — Australia's sport, all in one place. NRL, AFL, Cricket, A-League, Rugby Union, Tennis and more from SMH, The Age, Fox Sports, Daily Telegraph and ABC Sport.">
<meta property="og:title" content="The Sportsdesk — Australia's Sport Hub">
<meta property="og:description" content="All Australian sport news in one place.">
<title>The Sportsdesk — Australia's Sport, All In One Place</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;1,700&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">

<!-- Google Ad Manager — replace ca-pub-XXXXXXXXXXXXXXXX with your publisher ID -->
<!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script> -->

<style>
:root {
  --bg: #0a0a0f;
  --surface: #13131a;
  --surface2: #1c1c26;
  --border: #2a2a38;
  --accent: #e8ff00;
  --accent2: #ff4b1f;
  --text: #f0f0f0;
  --muted: #777;
  --radius: 4px;
  --nrl: #e8ff00;
  --afl: #ff4b1f;
  --cricket: #00c896;
  --aleague: #4b9fff;
  --rugby: #c44bff;
  --tennis: #ffb800;
  --supercars: #ff8800;
  --golf: #88cc44;
  --boxing: #ff4466;
  --code-color: var(--accent);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Barlow', sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
}
a { text-decoration: none; color: inherit; }

/* ── TICKER ─────────────────────────────────────────────── */
.ticker-bar {
  background: var(--accent);
  color: #000;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.05em;
  overflow: hidden;
  white-space: nowrap;
  padding: 5px 0;
}
.ticker-track { display: inline-block; animation: ticker 60s linear infinite; }
.ticker-track:hover { animation-play-state: paused; }
.ticker-track span { margin-right: 60px; }
.ticker-track span::before { content: "▸ "; }
@keyframes ticker { from { transform: translateX(100vw); } to { transform: translateX(-100%); } }

/* ── HEADER ─────────────────────────────────────────────── */
header {
  background: var(--surface);
  border-bottom: 3px solid var(--accent);
  padding: 0 clamp(16px, 4vw, 48px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  position: sticky;
  top: 0;
  z-index: 200;
  gap: 16px;
}
.logo {
  font-family: 'Anton', sans-serif;
  font-size: clamp(20px, 3vw, 28px);
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}
.logo-dot { color: var(--accent); }
.logo-au {
  background: var(--accent);
  color: #000;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 9px;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 2px;
  letter-spacing: 0.1em;
  align-self: flex-start;
  margin-top: 4px;
}
.header-meta {
  display: flex;
  align-items: center;
  gap: 20px;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.header-refresh {
  cursor: pointer;
  background: none;
  border: 1px solid var(--border);
  color: var(--muted);
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 5px 12px;
  border-radius: var(--radius);
  transition: all 0.15s;
}
.header-refresh:hover { border-color: var(--accent); color: var(--accent); }

/* ── SPORT NAV ──────────────────────────────────────────── */
.sport-nav {
  background: var(--surface2);
  border-bottom: 1px solid var(--border);
  padding: 0 clamp(16px, 4vw, 48px);
  display: flex;
  align-items: stretch;
  gap: 0;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.sport-nav::-webkit-scrollbar { display: none; }
.sport-btn {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 14px 18px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--muted);
  position: relative;
  transition: color 0.15s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}
.sport-btn .sport-emoji { font-size: 14px; }
.sport-btn::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--btn-color, var(--accent));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.2s ease;
}
.sport-btn:hover { color: #ccc; }
.sport-btn.active { color: var(--text); }
.sport-btn.active::after { transform: scaleX(1); }

/* ── AD LEADERBOARD ─────────────────────────────────────── */
.ad-leaderboard {
  margin: 20px clamp(16px, 4vw, 48px);
  background: linear-gradient(120deg, #0d1a3e 0%, #1a0a2e 100%);
  border: 1px solid var(--border);
  border-top: 3px solid var(--accent2);
  border-radius: var(--radius);
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.ad-label-chip {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  border: 1px solid var(--border);
  padding: 2px 6px;
  border-radius: 2px;
}
.ad-headline {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: clamp(16px, 2.5vw, 22px);
  font-weight: 700;
  letter-spacing: 0.03em;
}
.ad-headline em { color: var(--accent); font-style: normal; }
.ad-sub { font-size: 12px; color: var(--muted); }
.ad-cta {
  background: var(--accent2);
  color: #fff;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 10px 22px;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
  flex-shrink: 0;
}
.ad-cta:hover { opacity: 0.85; }

/* ── MAIN ───────────────────────────────────────────────── */
main {
  padding: 0 clamp(16px, 4vw, 48px) 80px;
  max-width: 1440px;
  margin: 0 auto;
}
.page-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 36px;
  align-items: start;
}

/* ── SECTION HEADER ─────────────────────────────────────── */
.section-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
  padding-top: 4px;
}
.section-title {
  font-family: 'Anton', sans-serif;
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1;
  color: var(--text);
}
.section-rule {
  flex: 1;
  height: 2px;
  background: var(--border);
  position: relative;
  overflow: hidden;
}
.section-rule::before {
  content: '';
  position: absolute;
  left: -100%;
  top: 0;
  height: 100%;
  width: 60px;
  background: var(--code-color);
  animation: ruleSlide 0.5s ease forwards;
}
@keyframes ruleSlide { to { left: 0; } }
.article-meta {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* ── FILTER BAR ─────────────────────────────────────────── */
.filter-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
}
.filter-label {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  margin-right: 2px;
}
.filter-btn {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 5px 12px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--muted);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.15s;
}
.filter-btn:hover { border-color: var(--code-color); color: var(--text); }
.filter-btn.active { border-color: var(--code-color); color: var(--text); background: rgba(255,255,255,0.04); }

/* ── NEWS GRID ──────────────────────────────────────────── */
.news-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.news-grid .card:first-child {
  grid-column: span 2;
}

/* ── CARD ───────────────────────────────────────────────── */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, border-color 0.2s, box-shadow 0.2s;
  animation: cardIn 0.35s ease both;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
.card:nth-child(1) { animation-delay: 0.00s; }
.card:nth-child(2) { animation-delay: 0.04s; }
.card:nth-child(3) { animation-delay: 0.08s; }
.card:nth-child(4) { animation-delay: 0.12s; }
.card:nth-child(5) { animation-delay: 0.16s; }
.card:nth-child(6) { animation-delay: 0.20s; }
.card:nth-child(7) { animation-delay: 0.24s; }
.card:nth-child(8) { animation-delay: 0.28s; }
.card:nth-child(9) { animation-delay: 0.32s; }

.card:hover {
  transform: translateY(-3px);
  border-color: var(--code-color);
  box-shadow: 0 8px 28px rgba(0,0,0,0.45);
}

/* Card image */
.card-img {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  background: var(--surface2);
  display: block;
  transition: opacity 0.3s;
}
.card-img-fallback {
  width: 100%;
  aspect-ratio: 16/9;
  background: var(--surface2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  opacity: 0.5;
}
.card:first-child .card-img,
.card:first-child .card-img-fallback {
  aspect-ratio: 16/8;
}

/* Card body */
.card-body { padding: 14px; flex: 1; display: flex; flex-direction: column; gap: 8px; }
.card:first-child .card-body { padding: 18px; }

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.pub-tag {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 2px;
  background: rgba(255,255,255,0.07);
}
.sport-tag {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 10px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: var(--muted);
}
.card-time {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 11px;
  color: var(--muted);
  margin-left: auto;
}
.live-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--accent);
  color: #000;
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 2px 6px;
  border-radius: 2px;
}
.live-dot { width: 5px; height: 5px; background: #ff4b1f; border-radius: 50%; animation: blink 1s infinite; }
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.2; } }

.card-headline {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 17px;
  line-height: 1.22;
  color: var(--text);
  flex: 1;
}
.card:first-child .card-headline { font-size: 24px; }

.card-snippet {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
.read-more {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--code-color);
  display: flex;
  align-items: center;
  gap: 5px;
  transition: gap 0.15s;
}
.card:hover .read-more { gap: 8px; }

/* ── LOAD MORE ──────────────────────────────────────────── */
.load-more-wrap {
  text-align: center;
  margin-top: 32px;
}
.load-more-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  padding: 12px 32px;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.15s;
}
.load-more-btn:hover { border-color: var(--code-color); color: var(--code-color); }
.load-more-btn:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── STATES ─────────────────────────────────────────────── */
.state-box {
  grid-column: span 3;
  padding: 70px 0;
  text-align: center;
}
.spinner {
  width: 36px; height: 36px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
  margin: 0 auto 14px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.state-text {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 15px;
  color: var(--muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.state-emoji { font-size: 40px; margin-bottom: 14px; }

/* ── SIDEBAR ─────────────────────────────────────────────── */
.sidebar { display: flex; flex-direction: column; gap: 18px; position: sticky; top: 90px; }
.widget {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}
.widget-head {
  padding: 11px 14px;
  border-bottom: 1px solid var(--border);
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 8px;
}
.widget-head-bar {
  width: 3px;
  height: 12px;
  background: var(--code-color);
  border-radius: 1px;
  flex-shrink: 0;
}

/* Sources widget */
.source-row {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.12s;
}
.source-row:last-child { border-bottom: none; }
.source-row:hover { background: var(--surface2); }
.source-row.active { background: rgba(255,255,255,0.04); }
.source-name {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px;
  font-weight: 600;
}
.source-count {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 11px;
  color: var(--muted);
  background: var(--surface2);
  padding: 2px 8px;
  border-radius: 10px;
}

/* Trending widget */
.trend-row {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.12s;
}
.trend-row:last-child { border-bottom: none; }
.trend-row:hover { background: var(--surface2); }
.trend-num {
  font-family: 'Anton', sans-serif;
  font-size: 18px;
  color: var(--border);
  float: left;
  margin-right: 10px;
  line-height: 1;
}
.trend-headline {
  font-family: 'Barlow Condensed', sans-serif;
  font-size: 13px;
  line-height: 1.3;
  color: var(--text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.trend-pub {
  font-size: 11px;
  color: var(--muted);
  margin-top: 3px;
  font-family: 'Barlow Condensed', sans-serif;
  letter-spacing: 0.04em;
}

/* Sidebar ads */
.ad-sidebar {
  background: linear-gradient(155deg, #0d1a3e 0%, #1a0a2e 100%);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent2);
  border-radius: var(--radius);
  padding: 18px;
  text-align: center;
}
.ad-sidebar-label {
  font-size: 9px;
  color: var(--muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 10px;
}
.ad-sidebar-title {
  font-family: 'Anton', sans-serif;
  font-size: 22px;
  line-height: 1.1;
  margin-bottom: 6px;
}
.ad-sidebar-sub { font-size: 12px; color: var(--muted); margin-bottom: 14px; line-height: 1.4; }
.ad-sidebar-cta {
  display: block;
  width: 100%;
  background: var(--accent);
  color: #000;
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  padding: 10px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: opacity 0.15s;
}
.ad-sidebar-cta:hover { opacity: 0.85; }

/* ── FOOTER ─────────────────────────────────────────────── */
footer {
  background: var(--surface);
  border-top: 1px solid var(--border);
  padding: 40px clamp(16px, 4vw, 48px);
  margin-top: 40px;
}
.footer-inner {
  max-width: 1440px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 32px;
}
.footer-logo {
  font-family: 'Anton', sans-serif;
  font-size: 22px;
  margin-bottom: 10px;
}
.footer-logo span { color: var(--accent); }
.footer-blurb { font-size: 12px; color: var(--muted); line-height: 1.65; max-width: 260px; }
.footer-col h4 {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  margin-bottom: 14px;
}
.footer-col ul { list-style: none; }
.footer-col li {
  font-size: 13px;
  color: #aaa;
  margin-bottom: 8px;
  cursor: pointer;
  transition: color 0.15s;
}
.footer-col li:hover { color: var(--accent); }
.footer-bottom {
  max-width: 1440px;
  margin: 28px auto 0;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: var(--muted);
  line-height: 1.5;
}

/* ── RESPONSIVE ─────────────────────────────────────────── */
@media (max-width: 1100px) {
  .page-layout { grid-template-columns: 1fr; }
  .sidebar { position: static; }
}
@media (max-width: 800px) {
  .news-grid { grid-template-columns: 1fr 1fr; }
  .news-grid .card:first-child { grid-column: span 2; }
  .state-box { grid-column: span 2; }
  .footer-inner { grid-template-columns: 1fr 1fr; }
  .ad-leaderboard { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 500px) {
  .news-grid { grid-template-columns: 1fr; }
  .news-grid .card:first-child { grid-column: span 1; }
  .state-box { grid-column: span 1; }
  .footer-inner { grid-template-columns: 1fr; }
  .header-meta { display: none; }
}
</style>
</head>
<body>

<!-- TICKER -->
<div class="ticker-bar" aria-hidden="true">
  <div class="ticker-track" id="ticker-track">
    <span>Loading latest scores...</span>
  </div>
</div>

<!-- HEADER -->
<header>
  <div class="logo">
    THE SPORTSDESK<span class="logo-dot">.</span>
    <span class="logo-au">AU</span>
  </div>
  <div class="header-meta">
    <span id="header-date"></span>
    <button class="header-refresh" id="refresh-btn" onclick="handleRefresh()">↻ Refresh</button>
  </div>
</header>

<!-- SPORT NAV -->
<nav class="sport-nav" id="sport-nav" role="navigation" aria-label="Sport categories">
  <button class="sport-btn active" data-sport="all"       style="--btn-color:#e8ff00">All Sport</button>
  <button class="sport-btn"        data-sport="nrl"       style="--btn-color:var(--nrl)"><span class="sport-emoji">🏉</span>NRL</button>
  <button class="sport-btn"        data-sport="afl"       style="--btn-color:var(--afl)"><span class="sport-emoji">🏈</span>AFL</button>
  <button class="sport-btn"        data-sport="cricket"   style="--btn-color:var(--cricket)"><span class="sport-emoji">🏏</span>Cricket</button>
  <button class="sport-btn"        data-sport="aleague"   style="--btn-color:var(--aleague)"><span class="sport-emoji">⚽</span>A-League</button>
  <button class="sport-btn"        data-sport="rugby"     style="--btn-color:var(--rugby)"><span class="sport-emoji">🏉</span>Rugby Union</button>
  <button class="sport-btn"        data-sport="tennis"    style="--btn-color:var(--tennis)"><span class="sport-emoji">🎾</span>Tennis</button>
  <button class="sport-btn"        data-sport="supercars" style="--btn-color:var(--supercars)"><span class="sport-emoji">🏎️</span>Supercars</button>
  <button class="sport-btn"        data-sport="golf"      style="--btn-color:var(--golf)"><span class="sport-emoji">⛳</span>Golf</button>
  <button class="sport-btn"        data-sport="boxing"    style="--btn-color:var(--boxing)"><span class="sport-emoji">🥊</span>Boxing/MMA</button>
</nav>

<!-- AD LEADERBOARD -->
<div class="ad-leaderboard" role="complementary" aria-label="Advertisement">
  <div class="ad-label-chip">Advertisement</div>
  <div>
    <div class="ad-headline">Watch every game live with <em>Kayo Sports</em></div>
    <div class="ad-sub">NRL · AFL · Cricket · Tennis — 50+ sports. No lock-in contract.</div>
  </div>
  <button class="ad-cta" onclick="window.open('https://kayosports.com.au','_blank')">30 Days Free →</button>
</div>

<!-- MAIN CONTENT -->
<main>
  <div class="page-layout">

    <!-- ARTICLES COLUMN -->
    <div>
      <div class="section-header">
        <h1 class="section-title" id="section-title">All Sport</h1>
        <div class="section-rule" id="section-rule" style="--code-color:#e8ff00"></div>
        <div class="article-meta" id="article-meta"></div>
      </div>

      <!-- PUBLISHER FILTER -->
      <div class="filter-bar" id="filter-bar" style="--code-color:#e8ff00">
        <span class="filter-label">Source:</span>
        <button class="filter-btn active" data-pub="all">All</button>
        <button class="filter-btn" data-pub="smh">SMH</button>
        <button class="filter-btn" data-pub="theage">The Age</button>
        <button class="filter-btn" data-pub="foxsports">Fox Sports</button>
        <button class="filter-btn" data-pub="dailytelegraph">Daily Telegraph</button>
        <button class="filter-btn" data-pub="abc">ABC Sport</button>
        <button class="filter-btn" data-pub="heraldsun">Herald Sun</button>
      </div>

      <!-- GRID -->
      <div class="news-grid" id="news-grid" style="--code-color:#e8ff00">
        <div class="state-box">
          <div class="spinner"></div>
          <div class="state-text">Loading latest stories…</div>
        </div>
      </div>

      <!-- LOAD MORE -->
      <div class="load-more-wrap" id="load-more-wrap" style="display:none">
        <button class="load-more-btn" id="load-more-btn" onclick="loadMore()">Load More Stories</button>
      </div>
    </div>

    <!-- SIDEBAR -->
    <aside class="sidebar" role="complementary">

      <!-- Sources -->
      <div class="widget">
        <div class="widget-head" id="widget-head" style="--code-color:#e8ff00">
          <div class="widget-head-bar"></div>
          Sources
        </div>
        <div id="sources-widget"></div>
      </div>

      <!-- Sidebar Ad 1 -->
      <div class="ad-sidebar">
        <div class="ad-sidebar-label">Partner</div>
        <div class="ad-sidebar-title">TAB Sports Betting</div>
        <div class="ad-sidebar-sub">NRL Round markets now open. Best odds guaranteed.</div>
        <button class="ad-sidebar-cta">Bet Responsibly →</button>
      </div>

      <!-- Trending -->
      <div class="widget">
        <div class="widget-head" style="--code-color:#e8ff00">
          <div class="widget-head-bar"></div>
          🔥 Trending Now
        </div>
        <div id="trending-widget"></div>
      </div>

      <!-- Sidebar Ad 2 -->
      <div class="ad-sidebar" style="border-left-color:var(--cricket)">
        <div class="ad-sidebar-label">Editorial Partner</div>
        <div class="ad-sidebar-title">Decathlon Australia</div>
        <div class="ad-sidebar-sub">Gear up this season. Sport for all, affordably priced.</div>
        <button class="ad-sidebar-cta" style="background:var(--cricket)">Shop Now →</button>
      </div>

    </aside>
  </div>
</main>

<!-- FOOTER -->
<footer>
  <div class="footer-inner">
    <div>
      <div class="footer-logo">THE SPORTSDESK<span>.</span></div>
      <p class="footer-blurb">Australia's home for sport news — aggregating the best stories from the country's leading publications in one place. All headlines link directly to original publishers.</p>
    </div>
    <div class="footer-col">
      <h4>Sports</h4>
      <ul>
        <li onclick="switchSport('nrl')">NRL</li>
        <li onclick="switchSport('afl')">AFL</li>
        <li onclick="switchSport('cricket')">Cricket</li>
        <li onclick="switchSport('aleague')">A-League</li>
        <li onclick="switchSport('rugby')">Rugby Union</li>
        <li onclick="switchSport('tennis')">Tennis</li>
        <li onclick="switchSport('supercars')">Supercars</li>
        <li onclick="switchSport('golf')">Golf</li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Publishers</h4>
      <ul>
        <li onclick="window.open('https://smh.com.au/sport','_blank')">Sydney Morning Herald</li>
        <li onclick="window.open('https://theage.com.au/sport','_blank')">The Age</li>
        <li onclick="window.open('https://foxsports.com.au','_blank')">Fox Sports</li>
        <li onclick="window.open('https://dailytelegraph.com.au/sport','_blank')">Daily Telegraph</li>
        <li onclick="window.open('https://abc.net.au/sport','_blank')">ABC Sport</li>
        <li onclick="window.open('https://heraldsun.com.au/sport','_blank')">Herald Sun</li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Company</h4>
      <ul>
        <li>About Us</li>
        <li>Advertise</li>
        <li>Publisher Partners</li>
        <li>Editorial</li>
        <li>Contact</li>
        <li>Privacy Policy</li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 The Sportsdesk Pty Ltd. All rights reserved.</span>
    <span>All article headlines and snippets link to and are © their respective publishers. The Sportsdesk does not host original content.</span>
  </div>
</footer>

<script>
// ══════════════════════════════════════════════════════════════════
//  THE SPORTSDESK — Frontend Application
//  In production: API_BASE points to your Vercel deployment.
//  In demo mode: uses realistic sample data with the same interface.
// ══════════════════════════════════════════════════════════════════

const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api'; // Same-origin in production

const SPORTS_META = {
  all:       { label: 'All Sport',    color: '#e8ff00', emoji: '🏆' },
  nrl:       { label: 'NRL',          color: '#e8ff00', emoji: '🏉' },
  afl:       { label: 'AFL',          color: '#ff4b1f', emoji: '🏈' },
  cricket:   { label: 'Cricket',      color: '#00c896', emoji: '🏏' },
  aleague:   { label: 'A-League',     color: '#4b9fff', emoji: '⚽' },
  rugby:     { label: 'Rugby Union',  color: '#c44bff', emoji: '🏉' },
  tennis:    { label: 'Tennis',       color: '#ffb800', emoji: '🎾' },
  supercars: { label: 'Supercars',    color: '#ff8800', emoji: '🏎️' },
  golf:      { label: 'Golf',         color: '#88cc44', emoji: '⛳' },
  boxing:    { label: 'Boxing/MMA',   color: '#ff4466', emoji: '🥊' },
};
const PUBLISHERS = {
  smh:            { name: 'Sydney Morning Herald', short: 'SMH',  color: '#4b9fff' },
  theage:         { name: 'The Age',               short: 'AGE',  color: '#00c896' },
  foxsports:      { name: 'Fox Sports',            short: 'FOX',  color: '#ff4b1f' },
  dailytelegraph: { name: 'Daily Telegraph',       short: 'DT',   color: '#e8ff00' },
  abc:            { name: 'ABC Sport',             short: 'ABC',  color: '#c44bff' },
  heraldsun:      { name: 'Herald Sun',            short: 'HS',   color: '#ff8800' },
};

// ── DEMO DATA (used when API is not available / for standalone demo) ──────────
const DEMO_ARTICLES = [
  { id:'d1',  sport:'nrl',       publisher:'smh',            publisherName:'Sydney Morning Herald', publisherColor:'#4b9fff', headline:'Broncos survive late Raiders scare to stay top of NRL ladder',                        snippet:'Brisbane held off a spirited comeback from Canberra in a hard-fought 24-18 victory at Suncorp, keeping their spot at the summit.',   timeAgo:'2 hours ago', url:'https://smh.com.au/sport/nrl',          isLive:false },
  { id:'d2',  sport:'nrl',       publisher:'foxsports',      publisherName:'Fox Sports',            publisherColor:'#ff4b1f', headline:'Bulldogs re-sign Moses Leota as Ciraldo locks in forward pack',                        snippet:'Canterbury secured the powerful prop ahead of the June 30 deadline in a major boost for their defensive stocks.',                        timeAgo:'3 hours ago', url:'https://foxsports.com.au/nrl',          isLive:false },
  { id:'d3',  sport:'afl',       publisher:'theage',         publisherName:'The Age',               publisherColor:'#00c896', headline:'Collingwood v Richmond Friday Night Football: Team lists, how to watch',               snippet:'The MCG will be packed for the traditional rivalry clash, with both clubs desperate for a bounce-back performance.',                    timeAgo:'1 hour ago',  url:'https://theage.com.au/sport/afl',       isLive:true },
  { id:'d4',  sport:'cricket',   publisher:'smh',            publisherName:'Sydney Morning Herald', publisherColor:'#4b9fff', headline:'Australia declare at 8/312 as India face daunting final-day chase',                    snippet:'Pat Cummins declared with an hour remaining on Day 3, setting India an almost impossible target at the MCG.',                          timeAgo:'45 mins ago', url:'https://smh.com.au/sport/cricket',      isLive:true },
  { id:'d5',  sport:'afl',       publisher:'foxsports',      publisherName:'Fox Sports',            publisherColor:'#ff4b1f', headline:'De Goey handed four-week ban over rough conduct, Pies miss key man',                   snippet:'Collingwood will be without their gun midfielder for a month after the tribunal upheld the Match Review charge.',                       timeAgo:'3 hours ago', url:'https://foxsports.com.au/afl',          isLive:false },
  { id:'d6',  sport:'aleague',   publisher:'smh',            publisherName:'Sydney Morning Herald', publisherColor:'#4b9fff', headline:'Sydney FC climb to A-League summit after clinical 3-1 win over Victory',               snippet:'Goals from le Fondre, Ninković and substitute Galeano sealed a dominant performance cementing the Sky Blues as title favourites.',     timeAgo:'8 hours ago', url:'https://smh.com.au/sport/football',     isLive:false },
  { id:'d7',  sport:'rugby',     publisher:'smh',            publisherName:'Sydney Morning Herald', publisherColor:'#4b9fff', headline:'Wallabies 35-man squad named for July Lions series with two shock inclusions',          snippet:'Joe Schmidt made several bold calls, including two uncapped players as Australia prepare to host rugby\'s greatest touring side.',       timeAgo:'2 hours ago', url:'https://smh.com.au/sport/rugby-union',  isLive:false },
  { id:'d8',  sport:'tennis',    publisher:'smh',            publisherName:'Sydney Morning Herald', publisherColor:'#4b9fff', headline:'De Minaur reaches Miami Open quarter-finals with dominant straight-sets win',            snippet:'The Australian No.1 dispatched his opponent in just 68 minutes, setting up a blockbuster quarter-final clash.',                       timeAgo:'3 hours ago', url:'https://smh.com.au/sport/tennis',       isLive:false },
  { id:'d9',  sport:'supercars', publisher:'foxsports',      publisherName:'Fox Sports',            publisherColor:'#ff4b1f', headline:'Van Gisbergen dominates Race 1 at Taupo to extend championship lead',                  snippet:'The triple champion was untouchable in New Zealand, converting pole to victory in perfect conditions.',                                  timeAgo:'6 hours ago', url:'https://foxsports.com.au/motorsport',   isLive:false },
  { id:'d10', sport:'nrl',       publisher:'dailytelegraph', publisherName:'Daily Telegraph',       publisherColor:'#e8ff00', headline:'Latrell Mitchell injury scare: Souths star limps off after heavy contact',               snippet:'South Sydney are sweating on scans after the fullback failed to return from the sheds following a shoulder knock.',                     timeAgo:'4 hours ago', url:'https://dailytelegraph.com.au/sport/nrl',isLive:false },
  { id:'d11', sport:'afl',       publisher:'abc',            publisherName:'ABC Sport',             publisherColor:'#c44bff', headline:'Dockers\' Fyfe retirement speculation grows after training omission',                    snippet:'Nat Fyfe was conspicuously absent from Fremantle\'s main session, fuelling renewed speculation about the two-time Brownlow medallist.',  timeAgo:'4 hours ago', url:'https://abc.net.au/sport/afl',          isLive:false },
  { id:'d12', sport:'cricket',   publisher:'foxsports',      publisherName:'Fox Sports',            publisherColor:'#ff4b1f', headline:'Steve Smith century stands out as Australia impose massive first-innings lead',          snippet:'Smith\'s masterful 142-ball ton anchored Australia\'s middle order after early wobbles against Bumrah\'s probing new-ball spell.',       timeAgo:'2 hours ago', url:'https://foxsports.com.au/cricket',      isLive:false },
  { id:'d13', sport:'nrl',       publisher:'abc',            publisherName:'ABC Sport',             publisherColor:'#c44bff', headline:'Pressure mounts on Wests Tigers as fourth consecutive loss raises alarm bells',          snippet:'The Tigers\' season continues to spiral after being comprehensively beaten at Leichhardt, with calls growing for structural review.',    timeAgo:'5 hours ago', url:'https://abc.net.au/sport/nrl',          isLive:false },
  { id:'d14', sport:'aleague',   publisher:'theage',         publisherName:'The Age',               publisherColor:'#00c896', headline:'Melbourne Victory sack coach ahead of finals push after dismal run',                    snippet:'The club confirmed the departure following seven losses in nine games, with assistant promoted on interim basis.',                        timeAgo:'10 hours ago',url:'https://theage.com.au/sport/football',  isLive:false },
  { id:'d15', sport:'rugby',     publisher:'foxsports',      publisherName:'Fox Sports',            publisherColor:'#ff4b1f', headline:'Reds stun Crusaders in stunning Super Rugby comeback at Suncorp',                      snippet:'Queensland trailed by 18 at half time before producing one of the great Suncorp fightbacks to claim a famous 31-27 victory.',           timeAgo:'4 hours ago', url:'https://foxsports.com.au/rugby',        isLive:false },
  { id:'d16', sport:'tennis',    publisher:'abc',            publisherName:'ABC Sport',             publisherColor:'#c44bff', headline:'Daria Saville fights through injury to reach Miami Open last-16',                       snippet:'The Australian qualifier showed immense grit advancing despite ankle strapping in gruelling conditions.',                                timeAgo:'5 hours ago', url:'https://abc.net.au/sport/tennis',       isLive:false },
  { id:'d17', sport:'golf',      publisher:'smh',            publisherName:'Sydney Morning Herald', publisherColor:'#4b9fff', headline:'Adam Scott makes Masters cut as Jason Day surges into contention at Augusta',           snippet:'Two Australians are inside the top 20 at Augusta National heading into the weekend rounds.',                                             timeAgo:'7 hours ago', url:'https://smh.com.au/sport/golf',         isLive:false },
  { id:'d18', sport:'cricket',   publisher:'dailytelegraph', publisherName:'Daily Telegraph',       publisherColor:'#e8ff00', headline:'Mitchell Starc finds stinging form: Six wickets in two days stuns pundits',              snippet:'The left-arm quick has silenced his critics with a return to vicious early-morning swing, troubling every Indian batter he faced.',      timeAgo:'6 hours ago', url:'https://dailytelegraph.com.au/sport',   isLive:false },
  { id:'d19', sport:'nrl',       publisher:'smh',            publisherName:'Sydney Morning Herald', publisherColor:'#4b9fff', headline:'Origin selection: Fittler set to name NSW squad with two shock inclusions',              snippet:'Phil Gould has dropped hints on 100% Footy that two surprise names are in contention for the Blues\' State of Origin opener.',          timeAgo:'6 hours ago', url:'https://smh.com.au/sport/nrl',          isLive:false },
  { id:'d20', sport:'supercars', publisher:'dailytelegraph', publisherName:'Daily Telegraph',       publisherColor:'#e8ff00', headline:'Dick Johnson Racing confirm new co-driver lineup for Bathurst 1000 assault',             snippet:'The Ford squad has bolstered their enduro ranks with two high-profile international signings ahead of October\'s mountain race.',        timeAgo:'8 hours ago', url:'https://dailytelegraph.com.au/sport',   isLive:false },
];

// ── STATE ──────────────────────────────────────────────────────────────────────
let state = {
  sport: 'all',
  publisher: 'all',
  articles: [],
  allArticles: [],
  offset: 0,
  pageSize: 9,
  loading: false,
  usingDemo: false,
};

// ── BOOT ───────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('header-date').textContent =
    new Date().toLocaleDateString('en-AU', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  setupNav();
  setupFilters();
  loadArticles();
  buildTicker();
});

// ── NAV ────────────────────────────────────────────────────────────────────────
function setupNav() {
  document.querySelectorAll('.sport-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchSport(btn.dataset.sport);
    });
  });
}

function switchSport(sport) {
  state.sport = sport;
  state.publisher = 'all';
  state.offset = 0;

  document.querySelectorAll('.sport-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.sport === sport);
  });
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.pub === 'all');
  });

  const meta = SPORTS_META[sport] || SPORTS_META.all;
  const colorVars = ['--code-color', '--btn-color'];
  ['section-rule','filter-bar','news-grid','widget-head'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.setProperty('--code-color', meta.color);
  });

  document.getElementById('section-title').textContent = meta.label;
  applyAndRender();
}

// ── FILTERS ────────────────────────────────────────────────────────────────────
function setupFilters() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.publisher = btn.dataset.pub;
      state.offset = 0;
      applyAndRender();
    });
  });
}

// ── DATA ───────────────────────────────────────────────────────────────────────
async function loadArticles() {
  state.loading = true;
  renderGrid([]);

  try {
    const res = await fetch(`${API_BASE}/articles?sport=all&limit=100`, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.allArticles = data.articles || [];
    state.usingDemo = false;
  } catch (err) {
    console.info('[Sportsdesk] API unavailable, using demo data:', err.message);
    state.allArticles = DEMO_ARTICLES;
    state.usingDemo = true;
  }

  state.loading = false;
  applyAndRender();
  renderSidebar();
  buildTicker();
}

function getFiltered() {
  return state.allArticles.filter(a => {
    const sportOk = state.sport === 'all' || a.sport === state.sport;
    const pubOk = state.publisher === 'all' || a.publisher === state.publisher;
    return sportOk && pubOk;
  });
}

function applyAndRender() {
  const filtered = getFiltered();
  const page = filtered.slice(0, state.offset + state.pageSize);
  document.getElementById('article-meta').textContent = `${filtered.length} stories`;
  renderGrid(page);
  renderSources(filtered);

  const loadMoreWrap = document.getElementById('load-more-wrap');
  loadMoreWrap.style.display = filtered.length > state.offset + state.pageSize ? 'block' : 'none';
}

function loadMore() {
  state.offset += state.pageSize;
  applyAndRender();
}

// ── RENDER GRID ────────────────────────────────────────────────────────────────
function renderGrid(articles) {
  const grid = document.getElementById('news-grid');
  const meta = SPORTS_META[state.sport] || SPORTS_META.all;

  if (state.loading) {
    grid.innerHTML = `<div class="state-box"><div class="spinner"></div><div class="state-text">Loading latest stories…</div></div>`;
    return;
  }
  if (articles.length === 0) {
    grid.innerHTML = `<div class="state-box"><div class="state-emoji">🔍</div><div class="state-text">No stories found — try a different filter</div></div>`;
    return;
  }

  grid.innerHTML = articles.map((a, i) => buildCard(a, meta, i)).join('');
}

function buildCard(a, meta, index) {
  const pub = PUBLISHERS[a.publisher] || { name: a.publisherName || a.publisher, color: '#888', short: a.publisher };
  const imgEl = a.image
    ? `<img class="card-img" src="${esc(a.image)}" alt="" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-img-fallback\\'>${SPORTS_META[a.sport]?.emoji || '📰'}</div>'">`
    : `<div class="card-img-fallback">${SPORTS_META[a.sport]?.emoji || '📰'}</div>`;

  const sportLabel = a.sport && a.sport !== state.sport && state.sport === 'all'
    ? `<span class="sport-tag">${SPORTS_META[a.sport]?.label || a.sport}</span>`
    : '';

  return `
<a class="card" href="${esc(a.url)}" target="_blank" rel="noopener noreferrer" style="--code-color:${meta.color}">
  ${imgEl}
  <div class="card-body">
    <div class="card-meta">
      <span class="pub-tag" style="color:${pub.color}">${pub.name}</span>
      ${sportLabel}
      ${a.isLive ? '<span class="live-pill"><span class="live-dot"></span>LIVE</span>' : ''}
      <span class="card-time">${a.timeAgo || 'Recently'}</span>
    </div>
    <div class="card-headline">${esc(a.headline)}</div>
    ${index === 0 || a.snippet ? `<div class="card-snippet">${esc(a.snippet || '')}</div>` : ''}
    <div class="card-footer">
      <span class="read-more">Read full story <span>→</span></span>
    </div>
  </div>
</a>`;
}

// ── SIDEBAR ────────────────────────────────────────────────────────────────────
function renderSidebar() {
  renderSources(getFiltered());
  renderTrending();
}

function renderSources(filtered) {
  const counts = {};
  filtered.forEach(a => { counts[a.publisher] = (counts[a.publisher] || 0) + 1; });

  const rows = Object.entries(PUBLISHERS)
    .map(([key, pub]) => {
      const count = counts[key] || 0;
      if (!count) return '';
      const active = state.publisher === key ? ' active' : '';
      return `<div class="source-row${active}" onclick="filterByPub('${key}')">
        <span class="source-name" style="color:${pub.color}">${pub.name}</span>
        <span class="source-count">${count}</span>
      </div>`;
    }).join('');

  document.getElementById('sources-widget').innerHTML = rows || '<div style="padding:14px;color:var(--muted);font-size:12px;font-family:Barlow Condensed,sans-serif">No sources for this selection</div>';
}

function renderTrending() {
  const pool = [...state.allArticles].filter(a => a.sport).slice(0, 40);
  const trending = pool.sort(() => Math.random() - 0.5).slice(0, 6);
  document.getElementById('trending-widget').innerHTML = trending.map((a, i) => `
    <div class="trend-row" onclick="window.open('${esc(a.url)}','_blank')" role="button" tabindex="0">
      <span class="trend-num">${String(i+1).padStart(2,'0')}</span>
      <div>
        <div class="trend-headline">${esc(a.headline)}</div>
        <div class="trend-pub">${PUBLISHERS[a.publisher]?.name || a.publisherName || a.publisher}</div>
      </div>
    </div>`).join('');
}

function filterByPub(pub) {
  state.publisher = pub;
  state.offset = 0;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.pub === pub));
  applyAndRender();
}

// ── TICKER ─────────────────────────────────────────────────────────────────────
function buildTicker() {
  const recent = state.allArticles.slice(0, 10);
  if (!recent.length) return;
  const track = document.getElementById('ticker-track');
  track.innerHTML = recent.map(a => `<span>${a.headline}</span>`).join('');
}

// ── REFRESH ────────────────────────────────────────────────────────────────────
async function handleRefresh() {
  const btn = document.getElementById('refresh-btn');
  btn.textContent = '↻ Refreshing…';
  btn.disabled = true;
  state.offset = 0;
  await loadArticles();
  btn.textContent = '↻ Refresh';
  btn.disabled = false;
}

// ── UTILS ──────────────────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
</script>
</body>
</html>
