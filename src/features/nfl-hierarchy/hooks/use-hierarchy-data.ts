import { useMemo } from 'react'
import {
  useLeaderboardData,
  type EnrichedPlayer,
} from '@/features/leaderboards/hooks/use-leaderboard'
import { useTeamsData } from '@/lib/nfl-queries'
import type { AggregatedTeam, TeamMeta } from '../types'

const SUM_KEYS = [
  'completions',
  'attempts',
  'passing_yards',
  'passing_tds',
  'interceptions',
  'carries',
  'rushing_yards',
  'rushing_tds',
  'receptions',
  'targets',
  'receiving_yards',
  'receiving_tds',
  'fantasy_points',
  'fantasy_points_ppr',
] as const

function aggregateByTeam(
  players: EnrichedPlayer[],
  teamMeta: Map<string, TeamMeta>
): AggregatedTeam[] {
  const teamMap = new Map<string, EnrichedPlayer[]>()
  for (const p of players) {
    if (!p.team) continue
    const existing = teamMap.get(p.team)
    if (existing) {
      existing.push(p)
    } else {
      teamMap.set(p.team, [p])
    }
  }

  return Array.from(teamMap.entries()).map(([abbr, teamPlayers]) => {
    const first = teamPlayers[0]
    const meta = teamMeta.get(abbr)

    const sums: Record<string, number> = {}
    for (const key of SUM_KEYS) {
      sums[key] = teamPlayers.reduce(
        (acc, p) => acc + (Number(p[key]) || 0),
        0
      )
    }

    return {
      team_abbr: abbr,
      team_name: first.team_name,
      team_nick: meta?.team_nick ?? '',
      team_conf: first.team_conf,
      team_division: first.team_division,
      team_color: meta?.team_color ?? '#6b7280',
      team_color2: meta?.team_color2 ?? '#374151',
      team_logo: meta?.team_logo ?? '',
      player_count: teamPlayers.length,
      ...sums,
      total_yards:
        (sums.passing_yards ?? 0) +
        (sums.rushing_yards ?? 0) +
        (sums.receiving_yards ?? 0),
      total_tds:
        (sums.passing_tds ?? 0) +
        (sums.rushing_tds ?? 0) +
        (sums.receiving_tds ?? 0),
    } as AggregatedTeam
  })
}

export function useHierarchyData(year: number) {
  const {
    data: players,
    isLoading: playersLoading,
    error: playersError,
  } = useLeaderboardData(year)

  const teamsQuery = useTeamsData()

  const teamMeta = useMemo(() => {
    const map = new Map<string, TeamMeta>()
    if (!teamsQuery.data?.data) return map
    for (const row of teamsQuery.data.data) {
      map.set(String(row.team_abbr), {
        team_color: String(row.team_color ?? '#6b7280'),
        team_color2: String(row.team_color2 ?? '#374151'),
        team_logo: String(row.team_logo_espn ?? ''),
        team_nick: String(row.team_nick ?? ''),
      })
    }
    return map
  }, [teamsQuery.data])

  const teams = useMemo(
    () => aggregateByTeam(players, teamMeta),
    [players, teamMeta]
  )

  const teamLookup = useMemo(() => {
    const map = new Map<string, AggregatedTeam>()
    for (const t of teams) {
      map.set(t.team_abbr, t)
    }
    return map
  }, [teams])

  return {
    players,
    teams,
    teamLookup,
    teamMeta,
    isLoading: playersLoading || teamsQuery.isLoading,
    error: playersError || teamsQuery.error,
  }
}
