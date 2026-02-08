export interface StatDef {
  key: string
  label: string
  format: 'number' | 'percent' | 'decimal'
}

export interface StatCategory {
  label: string
  defaultStat: string
  stats: StatDef[]
  tableColumns: string[]
}

export const STAT_CATEGORIES: Record<string, StatCategory> = {
  passing: {
    label: 'Passing',
    defaultStat: 'passing_yards',
    stats: [
      { key: 'passing_yards', label: 'Passing Yards', format: 'number' },
      { key: 'passing_tds', label: 'Passing TDs', format: 'number' },
      { key: 'completions', label: 'Completions', format: 'number' },
      { key: 'attempts', label: 'Attempts', format: 'number' },
      { key: 'interceptions', label: 'Interceptions', format: 'number' },
    ],
    tableColumns: [
      'player_name',
      'team',
      'completions',
      'attempts',
      'passing_yards',
      'passing_tds',
      'interceptions',
    ],
  },
  rushing: {
    label: 'Rushing',
    defaultStat: 'rushing_yards',
    stats: [
      { key: 'rushing_yards', label: 'Rushing Yards', format: 'number' },
      { key: 'rushing_tds', label: 'Rushing TDs', format: 'number' },
      { key: 'carries', label: 'Carries', format: 'number' },
    ],
    tableColumns: [
      'player_name',
      'team',
      'position',
      'carries',
      'rushing_yards',
      'rushing_tds',
    ],
  },
  receiving: {
    label: 'Receiving',
    defaultStat: 'receiving_yards',
    stats: [
      { key: 'receiving_yards', label: 'Receiving Yards', format: 'number' },
      { key: 'receiving_tds', label: 'Receiving TDs', format: 'number' },
      { key: 'receptions', label: 'Receptions', format: 'number' },
      { key: 'targets', label: 'Targets', format: 'number' },
      { key: 'tgt_sh', label: 'Target Share', format: 'percent' },
      { key: 'wopr_x', label: 'WOPR', format: 'decimal' },
    ],
    tableColumns: [
      'player_name',
      'team',
      'position',
      'targets',
      'receptions',
      'receiving_yards',
      'receiving_tds',
      'tgt_sh',
    ],
  },
}

export const COLUMN_LABELS: Record<string, string> = {
  player_name: 'Player',
  team: 'Team',
  position: 'Pos',
  completions: 'CMP',
  attempts: 'ATT',
  passing_yards: 'YDS',
  passing_tds: 'TD',
  interceptions: 'INT',
  carries: 'CAR',
  rushing_yards: 'YDS',
  rushing_tds: 'TD',
  receptions: 'REC',
  targets: 'TGT',
  receiving_yards: 'YDS',
  receiving_tds: 'TD',
  tgt_sh: 'TGT%',
  wopr_x: 'WOPR',
}

export function formatStatValue(
  value: unknown,
  format: 'number' | 'percent' | 'decimal'
): string {
  const num = Number(value)
  if (isNaN(num)) return '-'
  switch (format) {
    case 'percent':
      return (num * 100).toFixed(1) + '%'
    case 'decimal':
      return num.toFixed(3)
    case 'number':
    default:
      return num.toLocaleString()
  }
}
