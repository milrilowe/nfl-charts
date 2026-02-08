import { useMemo } from 'react'
import { useSeasonalData, useRosterData, useTeamsData } from '@/lib/nfl-queries'

interface RosterInfo {
  player_name: string
  position: string
  team: string
  headshot_url: string
}

interface TeamInfo {
  team_name: string
  team_conf: string
  team_division: string
}

export interface EnrichedPlayer {
  player_id: string
  player_name: string
  position: string
  team: string
  headshot_url: string
  team_name: string
  team_conf: string
  team_division: string
  season: number
  [statKey: string]: string | number
}

export function useLeaderboardData(year: number) {
  const seasonal = useSeasonalData(year)
  const rosters = useRosterData(year)
  const teams = useTeamsData()

  const rosterLookup = useMemo(() => {
    if (!rosters.data?.data) return new Map<string, RosterInfo>()
    const map = new Map<string, RosterInfo>()
    for (const row of rosters.data.data) {
      const id = String(row.player_id ?? '')
      if (id && !map.has(id)) {
        map.set(id, {
          player_name: String(row.player_name ?? ''),
          position: String(row.position ?? ''),
          team: String(row.team ?? ''),
          headshot_url: String(row.headshot_url ?? ''),
        })
      }
    }
    return map
  }, [rosters.data])

  const teamLookup = useMemo(() => {
    if (!teams.data?.data) return new Map<string, TeamInfo>()
    const map = new Map<string, TeamInfo>()
    for (const row of teams.data.data) {
      map.set(String(row.team_abbr), {
        team_name: String(row.team_name ?? ''),
        team_conf: String(row.team_conf ?? ''),
        team_division: String(row.team_division ?? ''),
      })
    }
    return map
  }, [teams.data])

  const enrichedData = useMemo(() => {
    if (!seasonal.data?.data) return []
    return seasonal.data.data
      .map((row): EnrichedPlayer | null => {
        const playerId = String(row.player_id ?? '')
        const rosterInfo = rosterLookup.get(playerId)
        if (!rosterInfo?.player_name) return null

        const teamAbbr = rosterInfo.team
        const teamInfo = teamLookup.get(teamAbbr)

        return {
          ...row,
          player_id: playerId,
          player_name: rosterInfo.player_name,
          position: rosterInfo.position,
          team: teamAbbr,
          headshot_url: rosterInfo.headshot_url,
          team_name: teamInfo?.team_name ?? '',
          team_conf: teamInfo?.team_conf ?? '',
          team_division: teamInfo?.team_division ?? '',
          season: Number(row.season ?? year),
        } as EnrichedPlayer
      })
      .filter((p): p is EnrichedPlayer => p !== null)
  }, [seasonal.data, rosterLookup, teamLookup, year])

  const availablePositions = useMemo(() => {
    const positions = new Set(
      enrichedData.map((p) => p.position).filter(Boolean)
    )
    return Array.from(positions).sort()
  }, [enrichedData])

  const availableTeams = useMemo(() => {
    const teamAbbrs = new Set(
      enrichedData.map((p) => p.team).filter(Boolean)
    )
    return Array.from(teamAbbrs).sort()
  }, [enrichedData])

  return {
    data: enrichedData,
    isLoading: seasonal.isLoading || rosters.isLoading || teams.isLoading,
    error: seasonal.error || rosters.error || teams.error,
    availablePositions,
    availableTeams,
  }
}

export function filterAndSort(
  data: EnrichedPlayer[],
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
