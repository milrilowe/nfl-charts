export type { AggregatedTeam } from '@/lib/nfl-api'

export interface HierarchySearch {
  year: number
  team?: string
  player?: string
  stat: string
  category: 'passing' | 'rushing' | 'receiving'
}

export interface TeamMeta {
  team_color: string
  team_color2: string
  team_logo: string
  team_nick: string
}
