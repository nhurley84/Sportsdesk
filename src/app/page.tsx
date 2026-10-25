"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { TEAMS, Team, SPORT_ACCENTS } from '@/data/teams';

interface Article {
  id: string;
  sport: string;
  publisher: string;
  publisherName: string;
  publisherColor: string;
  headline: string;
  snippet: string;
  timeAgo: string;
  url: string;
  media?: ArticleMedia;
  img?: string;
  isLive?: boolean;
  kw?: string[];
  publishedAt: string;
}

type ArticleMedia =
  | {
      type: 'image';
      url: string;
    }
  | {
      type: 'video';
      thumbnailUrl?: string;
      embedUrl?: string;
      provider?: 'youtube' | 'vimeo' | 'video';
    };

function ArticleMediaThumb({ article, priority = false }: { article: Article; priority?: boolean }) {
  const mediaUrl = article.media?.type === 'image'
    ? article.media.url
    : article.media?.type === 'video'
      ? article.media.thumbnailUrl
      : article.img;

  return (
    <>
      {mediaUrl ? (
        <>
          <img
            src={mediaUrl}
            alt={article.headline}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'low'}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.add('show');
            }}
          />
          <div className="card-thumb-emoji media-fallback">&#128240;</div>
        </>
      ) : (
        <div className="card-thumb-emoji">&#128240;</div>
      )}
      {article.media?.type === 'video' && (
        <>
          <div className="thumb-video">
            <span>&#9654;</span> VIDEO
          </div>
          <div className="video-hover-play">
            <span>&#9654;</span>
          </div>
        </>
      )}
    </>
  );
}

interface PodcastEpisode {
  id: string;
  sport: string;
  title: string;
  ep: string;
  dur: string;
  subs: string;
  trending?: boolean;
  ico: string;
  artwork?: string; // Podcast cover art URL from RSS feed
  url: string;
  audioUrl?: string;
  isoDate?: string;
}

interface Score {
  comp: string;
  sport: string;
  t1: string;
  s1: string;
  t2: string;
  s2: string;
  status: string;
  live?: boolean;
}

interface Video {
  id: string;
  sport: string;
  title: string;
  dur: string;
  views: string;
  time: string;
  yt: string;
}

const SPORTS = [
  { id: 'all', name: 'All Sports', ico: '🏆' },
  { id: 'afl', name: 'AFL', ico: '🏈' },
  { id: 'nrl', name: 'NRL', ico: '🏉' },
  { id: 'cricket', name: 'Cricket', ico: '🏏' },
  { id: 'football', name: 'Soccer', ico: '⚽' },
  { id: 'rugby', name: 'Rugby Union', ico: '🏉' },
  { id: 'basketball', name: 'Basketball', ico: '🏀' },
  { id: 'nfl', name: 'NFL', ico: '🏈' },
  { id: 'motorsport', name: 'Motorsports', ico: '🏎️' }
];

export default function Home() {
  const podcastRequestRef = useRef(0);
  const newsRequestRef = useRef(0);
  const videoRequestRef = useRef(0);

  // Navigation & View states
  const [activeSport, setActiveSport] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('news');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data states
  const [articles, setArticles] = useState<Article[]>([]);
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [scores, setScores] = useState<Score[]>([]);

  // User personalization states
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [followedTeams, setFollowedTeams] = useState<string[]>([]);
  const [showPersonaliseModal, setShowPersonaliseModal] = useState<boolean>(false);

  // Interaction states
  const [activeVideoYt, setActiveVideoYt] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<PodcastEpisode | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({
    news: true,
    podcasts: true,
    videos: true,
    scores: true
  });

  // Pagination states
  const PAGE_SIZE = 50;
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + PAGE_SIZE);
  };

  // Current Date display
  const [formattedDate, setFormattedDate] = useState<string>('');

  useEffect(() => {
    // Set current date on client side
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    setFormattedDate(now.toLocaleDateString('en-US', options).toUpperCase());

    // Load personalization from localStorage
    const savedBookmarks = localStorage.getItem('sd_bookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));

    const savedTeams = localStorage.getItem('sd_followed_teams');
    if (savedTeams) setFollowedTeams(JSON.parse(savedTeams));

    // Fetch initial static/api data
    fetchScores();
  }, []);

  // Re-fetch data when sport changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    fetchNews();
  }, [activeSport]);

  // Heavy secondary feeds load only when their view is requested.
  useEffect(() => {
  if (activeTab === 'podcasts') {
    fetchPodcastsData(activeSport);
  }
}, [activeSport, activeTab]);

useEffect(() => {
  if (activeTab === 'video') {
    fetchVideosData(activeSport);
  }
}, [activeTab]);

  // Reset pagination when switching tabs
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab]);

  const FALLBACK_SCORES = [
    { comp: 'NRL Round 6', sport: 'nrl', t1: 'Broncos', s1: '24', t2: 'Raiders', s2: '18', status: 'Full Time' },
    { comp: 'NRL Round 6', sport: 'nrl', t1: 'Panthers', s1: '32', t2: 'Tigers', s2: '6', status: 'Full Time' },
    { comp: 'Test Cricket — 2nd Test', sport: 'cricket', t1: 'Australia', s1: '312/8d', t2: 'India', s2: '88/3', status: 'LIVE — Day 4 Session 2', live: true },
    { comp: 'AFL Round 6', sport: 'afl', t1: 'Collingwood', s1: '—', t2: 'Richmond', s2: '—', status: 'Tonight 7:30pm AEST' },
    { comp: 'A-League', sport: 'aleague', t1: 'Sydney FC', s1: '3', t2: 'Melbourne Victory', s2: '1', status: 'Full Time' },
    { comp: 'Super Rugby Pacific', sport: 'rugby', t1: 'Reds', s1: '31', t2: 'Crusaders', s2: '27', status: 'Full Time' }
  ];

  const FALLBACK_PODCASTS = [
    { id: 'pod-1', sport: 'afl', title: 'The Sounding Board', ep: 'Ep 12 - Round 6 Review', dur: '45 mins', subs: 'SEN', trending: true, ico: '🎧', url: 'https://www.sen.com.au' },
    { id: 'pod-2', sport: 'nrl', title: 'Fox League Podcast', ep: 'Origin Selection Dilemmas', dur: '52 mins', subs: 'Fox Sports', trending: true, ico: '🎙️', url: 'https://www.foxsports.com.au' },
    { id: 'pod-3', sport: 'cricket', title: 'The Grade Cricketer', ep: 'Ashes Preview Special', dur: '1h 15m', subs: 'Audioboom', trending: true, ico: '🏏', url: 'https://www.gradecricketer.com' }
  ];

  const fetchNews = async () => {
    const requestId = newsRequestRef.current + 1;
    newsRequestRef.current = requestId;
    setLoading(prev => ({ ...prev, news: true }));
    try {
      const res = await fetch(`/api/feeds?sport=${activeSport}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (newsRequestRef.current === requestId && data.success) {
        setArticles(data.articles);
      }
    } catch (e) {
      console.error(e);
    } finally {
      if (newsRequestRef.current === requestId) {
        setLoading(prev => ({ ...prev, news: false }));
      }
    }
  };

  const fetchPodcastsData = async (sport: string) => {
    const requestId = podcastRequestRef.current + 1;
    podcastRequestRef.current = requestId;

    setLoading(prev => ({ ...prev, podcasts: true }));
    setPodcasts([]);

    try {
      const res = await fetch(`/api/podcasts?sport=${encodeURIComponent(sport)}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (podcastRequestRef.current !== requestId) return;

      if (data.success) {
        const podcastList = Array.isArray(data.podcasts) ? data.podcasts as PodcastEpisode[] : [];
        setPodcasts(sport === 'all' ? podcastList : podcastList.filter(podcast => podcast.sport === sport));
      } else {
        setPodcasts([]);
      }
    } catch (e) {
      if (podcastRequestRef.current !== requestId) return;
      console.warn("Podcasts fetch failed.", e);
      setPodcasts([]);
    } finally {
      if (podcastRequestRef.current !== requestId) return;
      setLoading(prev => ({ ...prev, podcasts: false }));
    }
  };

  const fetchVideosData = async (sport: string) => {
  setLoading(prev => ({ ...prev, videos: true }));
  try {
    const res = await fetch(`/api/videos?sport=${encodeURIComponent(sport)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.success) {
      setVideos(data.videos);
    }
  } catch (e) {
    console.error(e);
  } finally {
    setLoading(prev => ({ ...prev, videos: false }));
  }
};

  const fetchScores = async () => {
    setLoading(prev => ({ ...prev, scores: true }));
    try {
      const res = await fetch(`/api/match-updates?sport=${encodeURIComponent(activeSport)}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setScores(data.scores);
      } else {
        setScores(FALLBACK_SCORES);
      }
    } catch {
      setScores(FALLBACK_SCORES);
    } finally {
      setLoading(prev => ({ ...prev, scores: false }));
    }
  };

  // Poll scores every 15 seconds to keep "LIVE" matches moving
  useEffect(() => {
    const interval = setInterval(() => {
      fetchScores();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Save bookmarks
  const toggleBookmark = (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    let updated;
    if (bookmarks.includes(url)) {
      updated = bookmarks.filter(b => b !== url);
    } else {
      updated = [...bookmarks, url];
    }
    setBookmarks(updated);
    localStorage.setItem('sd_bookmarks', JSON.stringify(updated));
  };

  // Follow/unfollow teams
  const toggleTeam = (teamId: string) => {
    let updated;
    if (followedTeams.includes(teamId)) {
      updated = followedTeams.filter(t => t !== teamId);
    } else {
      updated = [...followedTeams, teamId];
    }
    setFollowedTeams(updated);
    localStorage.setItem('sd_followed_teams', JSON.stringify(updated));
  };

  // Search filtering
  const filteredArticles = useMemo(() => {
    if (!searchQuery) return articles;
    const q = searchQuery.toLowerCase();
    return articles.filter(a =>
      a.headline.toLowerCase().includes(q) ||
      a.snippet.toLowerCase().includes(q) ||
      a.publisherName.toLowerCase().includes(q)
    );
  }, [articles, searchQuery]);

  const filteredVideos = useMemo(() => {
    if (!searchQuery) return videos;
    const q = searchQuery.toLowerCase();
    return videos.filter(v => v.title.toLowerCase().includes(q));
  }, [videos, searchQuery]);

  // Personalised board computations
  const personalisedNews = useMemo(() => {
    if (followedTeams.length === 0) return [];
    return articles.filter(a => {
      const text = `${a.headline} ${a.snippet}`.toLowerCase();
      return followedTeams.some(teamId => {
      const team = TEAMS.find(t => t.id === teamId);
      if (!team) return false;
      const terms = (team as any).searchTerms || team.name.split(' ').map((n: string) => n.toLowerCase()).filter((p: string)      => p.length > 3);
  return terms.some((term: string) => text.includes(term.toLowerCase()));
});
    });
  }, [articles, followedTeams]);

  const personalisedScores = useMemo(() => {
    if (followedTeams.length === 0) return [];
    return scores.filter(s => {
      const t1 = s.t1.toLowerCase();
      const t2 = s.t2.toLowerCase();
      return followedTeams.some(teamId => {
        const team = TEAMS.find(t => t.id === teamId);
        if (!team) return false;
        const nameParts = team.name.toLowerCase().split(' ');
        return nameParts.some(part => part.length > 3 && (t1.includes(part) || t2.includes(part)));
      });
    });
  }, [scores, followedTeams]);

  const activeColor = SPORT_ACCENTS[activeSport] || 'var(--red)';
  const visiblePodcasts = useMemo(
    () => activeSport === 'all' ? podcasts : podcasts.filter(podcast => podcast.sport === activeSport),
    [activeSport, podcasts]
  );

  return (
    <>
      {/* ── TICKER ──────────────────────────────────────── */}
      <div className="ticker">
        <div className="ticker-label" style={{ backgroundColor: activeColor }}>
          <div className="ticker-dot"></div>
          <span>Scores</span>
        </div>
        <div className="ticker-scroll">
          <div className="ticker-inner">
            {scores.map((s, idx) => (
              <span key={idx}>
                {s.comp.toUpperCase()} : {s.t1} {s.s1} v {s.t2} {s.s2} ({s.status})
              </span>
            ))}
            {/* Duplicate for infinite loop */}
            {scores.map((s, idx) => (
              <span key={`dup-${idx}`}>
                {s.comp.toUpperCase()} : {s.t1} {s.s1} v {s.t2} {s.s2} ({s.status})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── HEADER ──────────────────────────────────────── */}
      <header>
        <div className="header-top">
          <div className="logo">
            <span className="logo-text">SportsDesk</span>
            <span className="logo-dot" style={{ color: activeColor }}>.</span>
            <span className="logo-tag">PRO</span>
          </div>

          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search news and videos..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="header-right">
            <span className="hdr-date">{formattedDate}</span>
            <button className="btn-outline" onClick={() => setShowPersonaliseModal(true)}>
              ⚙️ Personalise
            </button>
            <button
              className={`icon-btn ${bookmarks.length > 0 ? 'active' : ''}`}
              title="View Bookmarks"
              onClick={() => {
                setActiveTab('news');
                // Optional: we could filter news by bookmarks, let's toggle a custom state or query
                setSearchQuery(searchQuery === 'is:bookmarked' ? '' : 'is:bookmarked');
              }}
            >
              {bookmarks.length > 0 ? '★' : '☆'}
              {bookmarks.length > 0 && <div className="notif-dot" style={{ backgroundColor: activeColor }}></div>}
            </button>
          </div>
        </div>

        {/* ── SPORT NAV ───────────────────────────────────── */}
        <div className="sport-nav">
          {SPORTS.map((s) => (
            <button
              key={s.id}
              className={`nav-btn ${activeSport === s.id ? 'active' : ''}`}
              style={{ '--ink': SPORT_ACCENTS[s.id] || 'var(--ink)' } as React.CSSProperties}
              onClick={() => {
                setActiveSport(s.id);
                // Clear bookmarked filter
                if (searchQuery === 'is:bookmarked') setSearchQuery('');
              }}
            >
              <span className="nav-ico">{s.ico}</span>
              {s.name}
            </button>
          ))}
        </div>
      </header>

      {/* ── VIEW TABS ───────────────────────────────────── */}
      <div className="page" style={{ paddingBottom: activeAudio ? '120px' : '80px' }}>
        <div className="pill-row">
          <button
            className={`pill ${activeTab === 'news' ? 'active' : ''}`}
            onClick={() => setActiveTab('news')}
          >
            📰 News Aggregator
          </button>
          <button
            className={`pill ${activeTab === 'myteams' ? 'active' : ''}`}
            onClick={() => setActiveTab('myteams')}
          >
            ⭐ My Teams ({followedTeams.length})
          </button>
          <button
            className={`pill ${activeTab === 'video' ? 'active' : ''}`}
            onClick={() => setActiveTab('video')}
          >
            📺 Video Highlights
          </button>
          <button
            className={`pill ${activeTab === 'podcasts' ? 'active' : ''}`}
            onClick={() => setActiveTab('podcasts')}
          >
            🎙️ Podcasts
          </button>
          <button
            className={`pill ${activeTab === 'scores' ? 'active' : ''}`}
            onClick={() => setActiveTab('scores')}
          >
            📊 Live Scores
          </button>
        </div>

        <div className="two-col">
          {/* Main Content Area */}
          <div className="main-col">

            {/* ── NEWS TAB ── */}
            {activeTab === 'news' && (
              <div className="panel active">
                <div className="sec-hdr">
                  <h2 className="sec-title">
                    {searchQuery === 'is:bookmarked' ? 'Bookmarked ' : 'Top '}
                    <span className="acc" style={{ color: activeColor }}>Stories</span>
                  </h2>
                  <span className="sec-count">
                    {searchQuery === 'is:bookmarked' ? bookmarks.length : filteredArticles.length} ARTICLES
                  </span>
                </div>

                {loading.news ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontFamily: 'var(--font-oswald)' }}>
                    ⚡ FETCHING LIVE RSS FEEDS...
                  </div>
                ) : (
                  <>
                    {/* Render Articles */}
                    {(() => {
                      const fullList = searchQuery === 'is:bookmarked'
                        ? articles.filter(a => bookmarks.includes(a.url))
                        : filteredArticles;

                      if (fullList.length === 0) {
                        return (
                          <div style={{ textAlign: 'center', padding: '60px 20px', border: '1.5px dashed var(--rule)', borderRadius: 8 }}>
                            <p style={{ fontSize: 16, color: 'var(--muted)', marginBottom: 16 }}>No articles found.</p>
                            {searchQuery === 'is:bookmarked' && (
                              <button className="btn-solid" style={{ backgroundColor: activeColor }} onClick={() => setSearchQuery('')}>Browse News</button>
                            )}
                          </div>
                        );
                      }

                      // The feed API already limits each source to 50 recent stories.
                      // Render the complete selected-sport result so one busy publisher
                      // cannot hide stories returned by the other RSS sources.
                      const visibleList = activeTab === 'news'
                        ? fullList
                        : fullList.slice(0, visibleCount);
                      const heroItem = visibleList[0];
                      const otherItems = visibleList.slice(1);
                      const hasMore = activeTab !== 'news' && visibleCount < fullList.length;

                      return (
                        <>
                          <div className="news-grid">
                            {heroItem && (
                              <a
                                href={heroItem.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="card hero"
                                style={{ '--sport-col': heroItem.publisherColor } as React.CSSProperties}
                              >
                                <div className="card-stripe"></div>
                                <div className="card-thumb">
                                  <ArticleMediaThumb article={heroItem} priority />
                                  {heroItem.isLive && (
                                    <div className="thumb-live">
                                      <div className="live-dot"></div>LIVE
                                    </div>
                                  )}
                                </div>
                                <div className="card-body">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="tag-pub" style={{ color: heroItem.publisherColor }}>
                                      {heroItem.publisherName}
                                    </span>
                                    <button
                                      className={`icon-btn`}
                                      style={{ border: 'none', width: 28, height: 28 }}
                                      onClick={(e) => toggleBookmark(heroItem.url, e)}
                                    >
                                      {bookmarks.includes(heroItem.url) ? '★' : '☆'}
                                    </button>
                                  </div>
                                  <h3 className="card-headline">{heroItem.headline}</h3>
                                  <p className="card-snippet">{heroItem.snippet}</p>
                                  <div className="card-time">{heroItem.timeAgo}</div>
                                </div>
                              </a>
                            )}

                            {otherItems.map((item) => (
                              <a
                                key={item.id}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="card"
                                style={{ '--sport-col': item.publisherColor } as React.CSSProperties}
                              >
                                <div className="card-stripe"></div>
                                <div className="card-thumb">
                                  <ArticleMediaThumb article={item} />
                                  {item.isLive && (
                                    <div className="thumb-live">
                                      <div className="live-dot"></div>LIVE
                                    </div>
                                  )}
                                </div>
                                <div className="card-body">
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="tag-pub" style={{ color: item.publisherColor }}>
                                      {item.publisherName}
                                    </span>
                                    <button
                                      className="icon-btn"
                                      style={{ border: 'none', width: 28, height: 28 }}
                                      onClick={(e) => toggleBookmark(item.url, e)}
                                    >
                                      {bookmarks.includes(item.url) ? '★' : '☆'}
                                    </button>
                                  </div>
                                  <h3 className="card-headline" style={{ fontSize: '15px' }}>{item.headline}</h3>
                                  <div className="card-time">{item.timeAgo}</div>
                                </div>
                              </a>
                            ))}
                          </div>

                          {/* ── LOAD MORE BUTTON ── */}
                          {hasMore && (
                            <div className="load-more">
                              <button
                                className="load-more-btn"
                                onClick={handleLoadMore}
                              >
                                Discover More Stories
                              </button>
                            </div>
                          )}

                          {/* All caught up message */}
                          {!hasMore && fullList.length > PAGE_SIZE && (
                            <div className="load-more">
                              <p className="state-msg">✓ You&apos;re all caught up — {fullList.length} stories loaded</p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            )}

            {/* ── MY TEAMS TAB ── */}
            {activeTab === 'myteams' && (
              <div className="panel active">
                <div className="sec-hdr">
                  <h2 className="sec-title">My Teams <span className="acc" style={{ color: activeColor }}>Board</span></h2>
                  <span className="sec-count">{followedTeams.length} TEAMS FOLLOWED</span>
                </div>

                {followedTeams.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 20px', border: '1.5px dashed var(--rule)', borderRadius: 8 }}>
                    <span style={{ fontSize: 48 }}>⭐</span>
                    <h3 style={{ fontFamily: 'var(--font-oswald)', textTransform: 'uppercase', fontSize: 20, margin: '16px 0 8px' }}>Personalise Your Hub</h3>
                    <p style={{ color: 'var(--muted)', maxWidth: 400, margin: '0 auto 20px', fontSize: 13 }}>
                      Follow your favourite AFL, NRL, Cricket, Soccer, or Motorsport teams to aggregate tailored news and live scores.
                    </p>
                    <button className="btn-solid" style={{ backgroundColor: activeColor }} onClick={() => setShowPersonaliseModal(true)}>
                      Choose Teams
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Followed Teams Pills */}
                    <div className="chip-row">
                      <span className="chip-label">FOLLOWING:</span>
                      {followedTeams.map(teamId => {
                        const team = TEAMS.find(t => t.id === teamId);
                        if (!team) return null;
                        return (
                          <span key={teamId} className="chip active" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            {team.name}
                            <button
                              onClick={() => toggleTeam(teamId)}
                              style={{ background: 'transparent', border: 'none', color: '#fff', padding: 0, fontSize: 10, cursor: 'pointer' }}
                            >
                              ✕
                            </button>
                          </span>
                        );
                      })}
                      <button className="chip" onClick={() => setShowPersonaliseModal(true)}>+ Add More</button>
                    </div>

                    {/* Personalised Scores */}
                    {personalisedScores.length > 0 && (
                      <div style={{ marginBottom: 30 }}>
                        <h4 style={{ fontFamily: 'var(--font-oswald)', textTransform: 'uppercase', fontSize: 14, borderBottom: '1px solid var(--rule)', paddingBottom: 6, marginBottom: 12 }}>Team Scores</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                          {personalisedScores.map((s, idx) => (
                            <div key={idx} className="card" style={{ padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontSize: 10, color: 'var(--muted)' }}>{s.comp}</div>
                                <div style={{ fontWeight: 'bold', fontSize: 14 }}>{s.t1} vs {s.t2}</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'var(--font-dm-mono)', fontWeight: 'bold', fontSize: 14 }}>{s.s1} - {s.s2}</div>
                                <div style={{ fontSize: 10, color: s.live ? 'var(--red)' : 'var(--muted)' }}>{s.status}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Personalised News */}
                    <div style={{ marginBottom: 30 }}>
                      <h4 style={{ fontFamily: 'var(--font-oswald)', textTransform: 'uppercase', fontSize: 14, borderBottom: '1px solid var(--rule)', paddingBottom: 6, marginBottom: 12 }}>Team News</h4>
                      {personalisedNews.length === 0 ? (
                        <p style={{ color: 'var(--muted)', fontSize: 12, padding: 12 }}>No matching news found today for your teams.</p>
                      ) : (
                        <div className="news-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                          {personalisedNews.slice(0, 6).map((item) => (
                            <a
                              key={item.id}
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="card"
                              style={{ '--sport-col': item.publisherColor } as React.CSSProperties}
                            >
                              <div className="card-stripe"></div>
                              <div className="card-thumb">
                                <ArticleMediaThumb article={item} />
                              </div>
                              <div className="card-body">
                                <span className="tag-pub" style={{ color: item.publisherColor }}>{item.publisherName}</span>
                                <h3 className="card-headline" style={{ fontSize: '14px' }}>{item.headline}</h3>
                                <div className="card-time">{item.timeAgo}</div>
                              </div>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* ── VIDEO HIGHLIGHTS TAB ── */}
            {activeTab === 'video' && (
              <div className="panel active">
                <div className="sec-hdr">
                  <h2 className="sec-title">Video <span className="acc" style={{ color: activeColor }}>Highlights</span></h2>
                  <span className="sec-count">{filteredVideos.length} VIDEOS</span>
                </div>

                {loading.videos ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontFamily: 'var(--font-oswald)' }}>
                    ⚡ LOADING HIGHLIGHTS...
                  </div>
                ) : (
                  <>
                    <div className="video-grid">
                      {filteredVideos.slice(0, visibleCount).map((vid) => (
                        <div
                          key={vid.id}
                          className="video-card"
                          onClick={() => setActiveVideoYt(vid.yt)}
                        >
                          <div className="video-thumb">
                            <img
                              src={`https://img.youtube.com/vi/${vid.yt}/mqdefault.jpg`}
                              alt={vid.title}
                              loading="lazy"
                              decoding="async"
                            />
                            <div className="video-duration">{vid.dur}</div>
                            <div className="video-hover-play">
                              <span>▶</span>
                            </div>
                          </div>
                          <div className="video-info">
                            <div className="video-channel">{vid.sport}</div>
                            <h3 className="video-title">{vid.title}</h3>
                            <div className="video-meta">
                              {vid.views} views • {vid.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {visibleCount < filteredVideos.length && (
                      <div className="load-more">
                        <button
                          className="load-more-btn"
                          onClick={handleLoadMore}
                        >
                          Discover More Videos
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── PODCASTS TAB ── */}
            {activeTab === 'podcasts' && (
              <div className="panel active">
                <div className="sec-hdr">
                  <h2 className="sec-title">Sports <span className="acc" style={{ color: activeColor }}>Podcasts</span></h2>
                  <span className="sec-count">{visiblePodcasts.length} EPISODES (LATEST FIRST)</span>
                </div>

                {loading.podcasts ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontFamily: 'var(--font-oswald)' }}>
                    ⚡ SEARCHING LATEST EPISODES...
                  </div>
                ) : (
                  <>
                    <div className="pod-grid">
                      {visiblePodcasts.slice(0, visibleCount).map((pod) => {
                        const dateFormatted = pod.isoDate
                          ? new Date(pod.isoDate).toLocaleDateString('en-AU', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : null;

                        return (
                          <a
                            key={pod.id}
                            className="pod-card"
                            href={pod.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                          >
                            <div className="pod-art">
                              {pod.artwork ? (
                                <img
                                  src={pod.artwork}
                                  alt={pod.title}
                                  loading="lazy"
                                  decoding="async"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      const span = document.createElement('span');
                                      span.textContent = pod.ico;
                                      parent.appendChild(span);
                                    }
                                  }}
                                />
                              ) : pod.ico.startsWith('http') || pod.ico.startsWith('/') ? (
                                <img src={pod.ico} alt={pod.title} loading="lazy" decoding="async" />
                              ) : (
                                pod.ico
                              )}
                              <div className="pod-play-over">
                                <span>▶</span>
                              </div>
                            </div>
<div className="pod-body">
  <div className="pod-sport-tag">{pod.sport}</div>
  <h3 className="pod-title">{pod.title}</h3>
  {pod.ep && <p className="pod-ep-title">{pod.ep}</p>}
  <div className="pod-meta">
    {dateFormatted && <span className="pod-dur">{dateFormatted}</span>}
    <span className="pod-dur">{pod.dur}</span>
  </div>
</div>
                          </a>
                        );
                      })}
                    </div>
                    {visibleCount < visiblePodcasts.length && (
                      <div className="load-more">
                        <button
                          className="load-more-btn"
                          onClick={handleLoadMore}
                        >
                          Discover More Podcasts
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── LATEST SCORES TAB ── */}
            {activeTab === 'scores' && (
              <div className="panel active">
                <div className="sec-hdr">
                  <h2 className="sec-title">Live <span className="acc" style={{ color: activeColor }}>Scores</span></h2>
                  <span className="sec-count">{scores.length} MATCHES</span>
                </div>

                <div className="scores-grid">
                  {scores.map((score, idx) => (
                    <div
                      key={idx}
                      className={`score-card-full ${score.live ? 'live' : ''}`}
                    >
                      <div className="score-comp-full">
                        {score.comp.toUpperCase()}
                        {score.live && <span className="live-tag">LIVE</span>}
                      </div>
                      <div className="score-team-full">
                        <span className="stn">{score.t1}</span>
                        <span className="stv">{score.s1}</span>
                      </div>
                      <div className="score-team-full">
                        <span className="stn">{score.t2}</span>
                        <span className="stv">{score.s2}</span>
                      </div>
                      <div className={`score-status-full ${score.live ? 'live' : ''}`}>
                        {score.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar Area */}
          <div className="side-col">

            {/* User Personalization Quick Stats */}
            <div style={{ background: 'var(--surface)', padding: 16, border: '1px solid var(--rule)', borderRadius: 'var(--radius2)', marginBottom: 24 }}>
              <h4 style={{ fontFamily: 'var(--font-oswald)', textTransform: 'uppercase', fontSize: 13, borderBottom: '1px solid var(--rule)', paddingBottom: 6, marginBottom: 12 }}>My Feed Quick-Stats</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                <span>Teams Following:</span>
                <strong>{followedTeams.length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 12 }}>
                <span>Saved Bookmarks:</span>
                <strong>{bookmarks.length}</strong>
              </div>
              <button
                className="btn-solid"
                style={{ width: '100%', padding: '6px', fontSize: 11, backgroundColor: activeColor }}
                onClick={() => setShowPersonaliseModal(true)}
              >
                Manage Personalisation
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── AUDIO PLAYER BAR ── */}
      {activeAudio && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 70, backgroundColor: 'var(--ink)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', zIndex: 999, borderTop: '3px solid var(--red)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 28 }}>📻</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 'bold', fontFamily: 'var(--font-oswald)', letterSpacing: '0.02em' }}>{activeAudio.title}</div>
              <div style={{ fontSize: 11, color: 'var(--faint)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }}>{activeAudio.ep}</div>
            </div>
          </div>
          <audio autoPlay controls src={activeAudio.audioUrl} style={{ height: 36, filter: 'invert(1) hue-rotate(180deg)' }} />
          <button
            onClick={() => setActiveAudio(null)}
            style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 18, cursor: 'pointer', padding: 8 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── VIDEO HIGHLIGHT MODAL ── */}
      {activeVideoYt && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setActiveVideoYt(null)}
        >
          <div
            style={{ position: 'relative', width: '100%', maxWidth: 800, backgroundColor: '#000', borderRadius: 8, overflow: 'hidden', border: '1px solid #333' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveVideoYt(null)}
              style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
            >
              ✕
            </button>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoYt}?autoplay=1`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* ── PERSONALISATION SETTINGS MODAL ── */}
      {showPersonaliseModal && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
          onClick={() => setShowPersonaliseModal(false)}
        >
          <div
            style={{ width: '100%', maxWidth: 640, backgroundColor: 'var(--surface)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--rule)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-oswald)', textTransform: 'uppercase', fontSize: 18, margin: 0 }}>
                Personalise Your Teams Feed
              </h3>
              <button
                onClick={() => setShowPersonaliseModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: 18, cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20 }}>
                Select the teams you follow to personalise your "My Teams" board:
              </p>

              {SPORTS.filter(s => s.id !== 'all').map((sport) => {
                const sportTeams = TEAMS.filter(t => t.sport === sport.id);
                if (sportTeams.length === 0) return null;

                return (
                  <div key={sport.id} style={{ marginBottom: 20 }}>
                    <h4 style={{ fontFamily: 'var(--font-oswald)', textTransform: 'uppercase', fontSize: 13, borderBottom: '1px solid var(--rule)', paddingBottom: 4, marginBottom: 10, color: SPORT_ACCENTS[sport.id] }}>
                      {sport.ico} {sport.name}
                    </h4>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {sportTeams.map((team) => {
                        const isFollowed = followedTeams.includes(team.id);
                        return (
                          <button
                            key={team.id}
                            onClick={() => toggleTeam(team.id)}
                            style={{
                              fontFamily: 'var(--font-dm-sans), sans-serif',
                              fontSize: 12,
                              padding: '5px 12px',
                              borderRadius: 20,
                              cursor: 'pointer',
                              border: isFollowed ? '1.5px solid var(--ink)' : '1.5px solid var(--rule)',
                              backgroundColor: isFollowed ? 'var(--ink)' : 'transparent',
                              color: isFollowed ? '#fff' : 'var(--muted)',
                              transition: 'all 0.15s'
                            }}
                          >
                            {team.name} {isFollowed ? '★' : '☆'}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '16px 20px', borderTop: '1px solid var(--rule)', display: 'flex', justifyContent: 'flex-end', backgroundColor: 'var(--bg2)' }}>
              <button className="btn-solid" style={{ backgroundColor: activeColor }} onClick={() => setShowPersonaliseModal(false)}>
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
