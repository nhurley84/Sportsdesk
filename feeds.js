// src/classifier.js
// ─────────────────────────────────────────────────────────────────────────────
// SPORT KEYWORD CLASSIFIER
// Auto-tags articles by sport code based on headline + snippet text.
// Uses weighted keyword matching with priority ordering to handle ambiguity
// (e.g. "try" could be NRL or rugby — team names disambiguate).
// ─────────────────────────────────────────────────────────────────────────────

const RULES = [

  // ── NRL ──────────────────────────────────────────────────────────────────
  {
    sport: 'nrl',
    weight: 10,
    // Exact NRL team names — high confidence
    keywords: [
      'broncos','raiders','bulldogs','sharks','titans','sea eagles','manly',
      'storm','newcastle knights','warriors','panthers','penrith','rabbitohs',
      'south sydney','roosters','eels','parramatta','tigers','wests tigers',
      'dragons','st george','cowboys','north queensland','knights','dolphins',
    ]
  },
  {
    sport: 'nrl',
    weight: 8,
    keywords: [
      'nrl','rugby league','state of origin','dally m','premiership',
      'try scorer','six again','forty-twenty','forty/twenty',
    ]
  },

  // ── AFL ──────────────────────────────────────────────────────────────────
  {
    sport: 'afl',
    weight: 10,
    keywords: [
      'collingwood','richmond','hawthorn','essendon','geelong','carlton',
      'melbourne demons','north melbourne','western bulldogs','st kilda',
      'gold coast suns','gws giants','greater western sydney','sydney swans',
      'fremantle dockers','west coast eagles','adelaide crows','port adelaide',
      'brisbane lions',
    ]
  },
  {
    sport: 'afl',
    weight: 8,
    keywords: [
      'afl','australian football','brownlow','coleman medal','mark of the year',
      'goal of the year','supercoach','the mcg','etihad stadium','marvel stadium',
      'aflw','scratch match','premiership flag',
    ]
  },

  // ── CRICKET ──────────────────────────────────────────────────────────────
  {
    sport: 'cricket',
    weight: 9,
    keywords: [
      'cricket','test match','one day','odi','t20','big bash','bbl','wbbl',
      'ashes','batting','bowling','wicket','century','half century','innings',
      'lbw','caught behind','stumped','over','maiden','duck','declaration',
      'steve smith','david warner','pat cummins','mitchell starc','nathan lyon',
      'travis head','marnus labuschagne','josh hazlewood',
    ]
  },

  // ── A-LEAGUE ─────────────────────────────────────────────────────────────
  {
    sport: 'aleague',
    weight: 9,
    keywords: [
      'a-league','aleague','sydney fc','melbourne city','melbourne victory',
      'western united','western sydney wanderers','newcastle jets',
      'brisbane roar','central coast mariners','macarthur fc','wellington phoenix',
      'perth glory','adelaide united','socceroos','matildas','sam kerr',
    ]
  },

  // ── RUGBY UNION ──────────────────────────────────────────────────────────
  {
    sport: 'rugby',
    weight: 9,
    keywords: [
      'rugby union','wallabies','super rugby','reds','waratahs','brumbies',
      'western force','force','all blacks','springboks','lions','british irish',
      'six nations','world rugby','scrum','lineout','ruck','maul',
      'michael hooper','james slipper','quade cooper',
    ]
  },

  // ── TENNIS ───────────────────────────────────────────────────────────────
  {
    sport: 'tennis',
    weight: 9,
    keywords: [
      'tennis','australian open','wimbledon','us open','french open','roland garros',
      'atp','wta','grand slam','de minaur','alex de minaur','kyrgios','tomljanovic',
      'daria saville','djokovic','nadal','federer','alcaraz','sinner',
      'davis cup','billie jean king cup',
    ]
  },

  // ── SUPERCARS / MOTORSPORT ───────────────────────────────────────────────
  {
    sport: 'supercars',
    weight: 9,
    keywords: [
      'supercars','bathurst','mount panorama','v8 supercars','van gisbergen',
      'shane van gisbergen','dick johnson racing','triple eight','walkinshaw',
      'ford mustang','chevrolet camaro','repco supercars','taupo','darwin triple crown',
      'pukekohe','formula 1','f1','formula one','grand prix','moto gp',
    ]
  },

  // ── GOLF ─────────────────────────────────────────────────────────────────
  {
    sport: 'golf',
    weight: 9,
    keywords: [
      'golf','pga tour','masters','open championship','ryder cup','presidents cup',
      'jason day','adam scott','marc leishman','birdie','eagle','bogey','par',
      'lpga','liv golf',
    ]
  },

  // ── BOXING / MMA ─────────────────────────────────────────────────────────
  {
    sport: 'boxing',
    weight: 9,
    keywords: [
      'boxing','ufc','mma','knock out','knockout','ko','tko','title fight',
      'heavyweight','welterweight','middleweight','featherweight','lightweight',
      'tim tszyu','jeff horn','george kambosos',
    ]
  },
];

/**
 * Classify a single article into a sport code.
 * @param {string} text - Combined headline + snippet text
 * @param {string|null} feedSport - Pre-tagged sport from the feed config (if any)
 * @returns {string|null} sport code or null if unclassified
 */
function classify(text, feedSport = null) {
  // Trust the feed's own sport tag if present
  if (feedSport) return feedSport;

  const lower = text.toLowerCase();
  const scores = {};

  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      // Word-boundary match to avoid partial hits (e.g. "goal" in "goalkeeper")
      const regex = new RegExp(`\\b${kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lower)) {
        scores[rule.sport] = (scores[rule.sport] || 0) + rule.weight;
      }
    }
  }

  if (Object.keys(scores).length === 0) return null;

  // Return the sport with the highest score
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Batch classify an array of articles in place.
 * @param {Array} articles
 * @returns {Array} articles with .sport field populated
 */
function classifyBatch(articles) {
  return articles.map(article => ({
    ...article,
    sport: classify(
      `${article.headline} ${article.snippet || ''}`,
      article.sport
    )
  }));
}

module.exports = { classify, classifyBatch };
