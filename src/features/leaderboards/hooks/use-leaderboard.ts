import { usePlayers } from '@/lib/nfl-queries'

export type { EnrichedPlayer } from '@/lib/nfl-api'

export function useLeaderboardData(year: number) {
  const query = usePlayers({ year, limit: 5000 })

  return {
    data: query.data?.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    availablePositions: query.data?.available_positions ?? [],
    availableTeams: query.data?.available_teams ?? [],
  }
}

export function filterAndSort(
  data: import('@/lib/nfl-api').EnrichedPlayer[],
  options: {
    stat: string
    position?: string
    team?: string
    conference?: string
  }
) {
  let filtered = data

  if (options.position) {
    filtered = filtered.filter((p) => p.position === options.position)
  }
  if (options.team) {
    filtered = filtered.filter((p) => p.team === options.team)
  }
  if (options.conference) {
    filtered = filtered.filter((p) => p.team_conf === options.conference)
  }

  return filtered.sort((a, b) => {
    const aVal = Number(a[options.stat]) || 0
    const bVal = Number(b[options.stat]) || 0
    return bVal - aVal
  })
}
