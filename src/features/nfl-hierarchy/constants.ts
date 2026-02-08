export const NFL_GRID: Record<string, Record<string, string[]>> = {
  AFC: {
    East: ['BUF', 'MIA', 'NE', 'NYJ'],
    North: ['BAL', 'CIN', 'CLE', 'PIT'],
    South: ['HOU', 'IND', 'JAX', 'TEN'],
    West: ['DEN', 'KC', 'LV', 'LAC'],
  },
  NFC: {
    East: ['DAL', 'NYG', 'PHI', 'WAS'],
    North: ['CHI', 'DET', 'GB', 'MIN'],
    South: ['ATL', 'CAR', 'NO', 'TB'],
    West: ['ARI', 'LA', 'SF', 'SEA'],
  },
}

export const DIVISION_ORDER = ['East', 'North', 'South', 'West'] as const
export const CONFERENCE_ORDER = ['AFC', 'NFC'] as const

export const TEAM_STATS = [
  { key: 'total_yards', label: 'Total Yards', format: 'number' as const },
  { key: 'total_tds', label: 'Total TDs', format: 'number' as const },
  { key: 'passing_yards', label: 'Pass Yards', format: 'number' as const },
  { key: 'passing_tds', label: 'Pass TDs', format: 'number' as const },
  { key: 'rushing_yards', label: 'Rush Yards', format: 'number' as const },
  { key: 'rushing_tds', label: 'Rush TDs', format: 'number' as const },
  { key: 'receiving_yards', label: 'Rec Yards', format: 'number' as const },
  { key: 'receiving_tds', label: 'Rec TDs', format: 'number' as const },
  { key: 'fantasy_points', label: 'Fantasy Pts', format: 'number' as const },
]
