/**
 * TanStack Query hooks for NFL Data API
 */
import { useQuery } from '@tanstack/react-query'
import {
  fetchPlayers,
  fetchTeams,
  fetchTeamsMeta,
  type FetchPlayersParams,
} from './nfl-api'

export function usePlayers(params: FetchPlayersParams) {
  return useQuery({
    queryKey: ['players', params],
    queryFn: () => fetchPlayers({ data: params }),
    staleTime: 1000 * 60 * 10, // 10 min (server caches the join)
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
