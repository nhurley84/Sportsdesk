import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const MOCK_SCORES = [
  { comp: 'NRL Round 6', sport: 'nrl', t1: 'Broncos', s1: '24', t2: 'Raiders', s2: '18', status: 'Full Time' },
  { comp: 'NRL Round 6', sport: 'nrl', t1: 'Panthers', s1: '32', t2: 'Tigers', s2: '6', status: 'Full Time' },
  { comp: 'Test Cricket — 2nd Test', sport: 'cricket', t1: 'Australia', s1: '312/8d', t2: 'India', s2: '88/3', status: 'LIVE — Day 4 Session 2', live: true },
  { comp: 'AFL Round 6', sport: 'afl', t1: 'Collingwood', s1: '—', t2: 'Richmond', s2: '—', status: 'Tonight 7:30pm AEST' },
  { comp: 'A-League', sport: 'aleague', t1: 'Sydney FC', s1: '3', t2: 'Melbourne Victory', s2: '1', status: 'Full Time' },
  { comp: 'Super Rugby Pacific', sport: 'rugby', t1: 'Reds', s1: '31', t2: 'Crusaders', s2: '27', status: 'Full Time' }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') || 'all';

  // Dynamic simulation: adjust live scores slightly so they look "live" and moving
  const scores = MOCK_SCORES.map(s => {
    if (s.live) {
      // Simulate cricket live score change
      const runs = Math.floor(Math.random() * 5);
      const wickets = Math.random() > 0.95 ? 1 : 0;
      
      const s2Match = s.s2.match(/(\d+)\/(\d+)/);
      if (s2Match) {
        const currentRuns = parseInt(s2Match[1]) + runs;
        const currentWickets = Math.min(10, parseInt(s2Match[2]) + wickets);
        return {
          ...s,
          s2: `${currentRuns}/${currentWickets}`
        };
      }
    }
    return s;
  });

  let filtered = scores;
  if (sport !== 'all') {
    filtered = scores.filter(s => s.sport === sport);
  }

  return NextResponse.json({
    success: true,
    scores: filtered
  });
}
