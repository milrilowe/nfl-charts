export interface HierarchySearch {
  year: number
  team?: string
  player?: string
  stat: string
  category: 'passing' | 'rushing' | 'receiving'
}

export interface AggregatedTeam {
  team_abbr: string
  team_name: string
  team_nick: string
  team_conf: string
  team_division: string
  team_color: string
  team_color2: string
  team_logo: string
  player_count: number
  // Aggregated stats
  completions: number
  attempts: number
  passing_yards: number
  passing_tds: number
  interceptions: number
  carries: number
  rushing_yards: number
  rushing_tds: number
  receptions: number
  targets: number
  receiving_yards: number
  receiving_tds: number
  fantasy_points: number
  fantasy_points_ppr: number
  total_yards: number
  total_tds: number
  [key: string]: string | number
}

export interface TeamMeta {
  team_color: string
  team_color2: string
  team_logo: string
  team_nick: string
}
