import { useMemo } from 'react'
import { usePlayers, useTeams } from '@/lib/nfl-queries'
import type { EnrichedPlayer, AggregatedTeam } from '@/lib/nfl-api'
import type { TeamMeta } from '../types'

export function useHierarchyData(year: number) {
  const playersQuery = usePlayers({ year, limit: 5000 })
  const teamsQuery = useTeams(year)

  const players: EnrichedPlayer[] = playersQuery.data?.data ?? []
  const teamsData: AggregatedTeam[] = teamsQuery.data?.data ?? []

  const teamLookup = useMemo(() => {
    const map = new Map<string, AggregatedTeam>()
    for (const t of teamsData) {
      map.set(t.team_abbr, t)
    }
    return map
  }, [teamsData])

  const teamMeta = useMemo(() => {
    const map = new Map<string, TeamMeta>()
    for (const t of teamsData) {
      map.set(t.team_abbr, {
        team_color: t.team_color || '#6b7280',
        team_color2: t.team_color2 || '#374151',
        team_logo: t.team_logo || '',
        team_nick: t.team_nick || '',
      })
    }
    return map
  }, [teamsData])

  return {
    players,
    teams: teamsData,
    teamLookup,
    teamMeta,
    isLoading: playersQuery.isLoading || teamsQuery.isLoading,
    error: playersQuery.error || teamsQuery.error,
  }
}
