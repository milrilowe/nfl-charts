/**
 * TanStack Query hooks for NFL Data API
 */
import { useQuery } from '@tanstack/react-query'
import {
  fetchPlayers,
  fetchTeams,
  fetchTeamsMeta,
  fetchLeaderboards,
  fetchTeamRoster,
  fetchPlayerDetail,
  fetchAvailableYears,
  type FetchPlayersParams,
} from './nfl-api'

export function usePlayers(
  params: FetchPlayersParams,
  opts?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['players', params],
    queryFn: () => fetchPlayers({ data: params }),
    staleTime: 1000 * 60 * 10, // 10 min (server caches the join)
    enabled: opts?.enabled,
  })
}

export function useTeams(year: number, team?: string) {
  return useQuery({
    queryKey: ['teams', year, team],
    queryFn: () => fetchTeams({ data: { year, team } }),
    staleTime: 1000 * 60 * 10,
  })
}

export function useTeamsMeta() {
  return useQuery({
    queryKey: ['teams-meta'],
    queryFn: () => fetchTeamsMeta(),
    staleTime: 1000 * 60 * 60, // 1 hour (static data)
  })
}

export function useLeaderboards(year: number, perStat?: number) {
  return useQuery({
    queryKey: ['leaderboards', year, perStat],
    queryFn: () => fetchLeaderboards({ data: { year, perStat } }),
    staleTime: 1000 * 60 * 10,
  })
}

export function useTeamRoster(
  teamAbbr: string,
  year: number,
  sortBy?: string,
) {
  return useQuery({
    queryKey: ['team-roster', teamAbbr, year, sortBy],
    queryFn: () => fetchTeamRoster({ data: { teamAbbr, year, sortBy } }),
    staleTime: 1000 * 60 * 10,
  })
}

export function useAvailableYears() {
  return useQuery({
    queryKey: ['available-years'],
    queryFn: () => fetchAvailableYears(),
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function usePlayerDetail(
  playerId: string,
  year: number,
  stat?: string,
  opts?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['player-detail', playerId, year, stat],
    queryFn: () => fetchPlayerDetail({ data: { playerId, year, stat } }),
    staleTime: 1000 * 60 * 10,
    enabled: opts?.enabled ?? !!playerId,
  })
}
