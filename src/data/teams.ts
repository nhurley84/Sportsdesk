export interface Team {
  id: string;
  name: string;
  sport: string;
  searchTerms?: string[];
}

export const TEAMS: Team[] = [
  // AFL
  { id: 'collingwood', name: 'Collingwood Magpies', sport: 'afl' },
  { id: 'richmond', name: 'Richmond Tigers', sport: 'afl', searchTerms: ['Richmond Tigers'] },
  { id: 'essendon', name: 'Essendon Bombers', sport: 'afl' },
  { id: 'carlton', name: 'Carlton Blues', sport: 'afl' },
  { id: 'geelong', name: 'Geelong Cats', sport: 'afl' },
  { id: 'hawthorn', name: 'Hawthorn Hawks', sport: 'afl' },
  { id: 'sydney-swans', name: 'Sydney Swans', sport: 'afl' },
  { id: 'fremantle', name: 'Fremantle Dockers', sport: 'afl' },
  { id: 'Brisbane', name: 'Brisbane Lions', sport: 'afl' },
  { id: 'GWS', name: 'GWS Giants', sport: 'afl', searchTerms: ['GWS', 'Greater Western Sydney Giants', 'Giants AFL'] },
  { id: 'Adelaide', name: 'Adelaide Crows', sport: 'afl', searchTerms: ['Adelaide Crows'] },  { id: 'Port Adelaide', name: 'Port Adelaide Power', sport: 'afl' },
  { id: 'Melbourne', name: 'Melbourne Demons', sport: 'afl' },
  { id: 'Western Bulldogs', name: 'Western Bulldogs', sport: 'afl' },
  { id: 'St Kilda', name: 'St Kilda Saints', sport: 'afl' },
  { id: 'Gold Coast', name: 'Gold Coast Suns', sport: 'afl' },
  { id: 'West Coast', name: 'West Coast Eagles', sport: 'afl' },
  { id: 'North Melbourne', name: 'North Melbourne Kangaroos', sport: 'afl' },

  
  // NRL
  { id: 'broncos', name: 'Brisbane Broncos', sport: 'nrl' },
  { id: 'raiders', name: 'Canberra Raiders', sport: 'nrl' },
  { id: 'panthers', name: 'Penrith Panthers', sport: 'nrl' },
  { id: 'tigers', name: 'Wests Tigers', sport: 'nrl' },
  { id: 'bulldogs', name: 'Canterbury Bulldogs', sport: 'nrl' },
  { id: 'rabbitohs', name: 'South Sydney Rabbitohs', sport: 'nrl' },
  { id: 'storm', name: 'Melbourne Storm', sport: 'nrl' },
  
  // Cricket
  { id: 'aus-cricket', name: 'Australia Men', sport: 'cricket' },
  { id: 'ind-cricket', name: 'India Men', sport: 'cricket' },
  { id: 'eng-cricket', name: 'England Men', sport: 'cricket' },
  { id: 'aus-women', name: 'Australia Women', sport: 'cricket' },
  
  // Rugby Union
  { id: 'reds', name: 'Queensland Reds', sport: 'rugby' },
  { id: 'waratahs', name: 'NSW Waratahs', sport: 'rugby' },
  { id: 'brumbies', name: 'ACT Brumbies', sport: 'rugby' },
  { id: 'all-blacks', name: 'New Zealand All Blacks', sport: 'rugby' },
  { id: 'wallabies', name: 'Australia Wallabies', sport: 'rugby' },
  
  // A-League (Soccer)
  { id: 'sydfc', name: 'Sydney FC', sport: 'aleague' },
  { id: 'melvictory', name: 'Melbourne Victory', sport: 'aleague' },
  { id: 'melcity', name: 'Melbourne City', sport: 'aleague' },
  { id: 'wsw', name: 'Western Sydney Wanderers', sport: 'aleague' },
  { id: 'macarthur', name: 'Macarthur FC', sport: 'aleague' },
  
  // Basketball
  { id: 'kings', name: 'Sydney Kings', sport: 'basketball' },
  { id: 'wildcats', name: 'Perth Wildcats', sport: 'basketball' },
  { id: 'lakers', name: 'Los Angeles Lakers', sport: 'basketball' },
  { id: 'warriors', name: 'Golden State Warriors', sport: 'basketball' },
  { id: 'celtics', name: 'Boston Celtics', sport: 'basketball' },
  
  // NFL
  { id: 'chiefs', name: 'Kansas City Chiefs', sport: 'nfl' },
  { id: '49ers', name: 'San Francisco 49ers', sport: 'nfl' },
  { id: 'eagles', name: 'Philadelphia Eagles', sport: 'nfl' },
  { id: 'bills', name: 'Buffalo Bills', sport: 'nfl' },
  
  // Motorsport
  { id: 'redbull-f1', name: 'Red Bull Racing', sport: 'motorsport' },
  { id: 'ferrari-f1', name: 'Scuderia Ferrari', sport: 'motorsport' },
  { id: 'mercedes-f1', name: 'Mercedes-AMG F1', sport: 'motorsport' },
  { id: 'triple-eight', name: 'Triple Eight (Supercars)', sport: 'motorsport' }
];

export const SPORT_ACCENTS: Record<string, string> = {
  all: 'var(--red)',
  afl: 'var(--afl)',
  nrl: 'var(--nrl)',
  cricket: 'var(--cricket)',
  aleague: 'var(--aleague)',
  rugby: 'var(--rugby)',
  basketball: 'var(--tennis)', // In original prototype basketball used gold/yellow
  nfl: 'var(--aleague)',
  motorsport: 'var(--red)'
};
