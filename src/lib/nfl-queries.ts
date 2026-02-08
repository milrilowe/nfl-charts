/**
 * TanStack Query hooks for NFL Data API
 */
import { useQuery } from '@tanstack/react-query'
import {
  fetchDatasets,
  fetchDatasetSchema,
  fetchDatasetData,
} from './nfl-api'

export function useDatasets() {
  return useQuery({
    queryKey: ['datasets'],
    queryFn: fetchDatasets,
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useDatasetSchema(datasetId: string | null) {
  return useQuery({
    queryKey: ['dataset-schema', datasetId],
    queryFn: () => fetchDatasetSchema(datasetId!),
    enabled: !!datasetId,
    staleTime: 1000 * 60 * 60,
  })
}

export function useDatasetData(
  datasetId: string | null,
  years: number[],
  columns: string[] | undefined,
  limit: number,
  offset: number
) {
  return useQuery({
    queryKey: ['dataset-data', datasetId, years, columns, limit, offset],
    queryFn: () => fetchDatasetData({
      datasetId: datasetId!,
      years,
      columns,
      limit,
      offset,
    }),
    enabled: !!datasetId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

const SEASONAL_COLUMNS = [
  'player_id', 'season', 'completions', 'attempts',
  'passing_yards', 'passing_tds', 'interceptions',
  'carries', 'rushing_yards', 'rushing_tds',
  'receptions', 'targets', 'receiving_yards', 'receiving_tds',
  'fantasy_points', 'fantasy_points_ppr', 'tgt_sh', 'wopr_x', 'dom',
  'target_share', 'games',
]

const ROSTER_COLUMNS = [
  'player_id', 'player_name', 'position', 'team',
]

const TEAM_COLUMNS = [
  'team_abbr', 'team_name', 'team_nick', 'team_conf', 'team_division',
  'team_color', 'team_color2', 'team_logo_espn',
]

export function useSeasonalData(year: number) {
  return useQuery({
    queryKey: ['seasonal-data', year],
    queryFn: () => fetchDatasetData({
      datasetId: 'seasonal',
      years: [year],
      columns: SEASONAL_COLUMNS,
      limit: 10000,
      offset: 0,
    }),
    staleTime: 1000 * 60 * 30,
  })
}

export function useRosterData(year: number) {
  return useQuery({
    queryKey: ['roster-data', year],
    queryFn: () => fetchDatasetData({
      datasetId: 'rosters',
      years: [year],
      columns: ROSTER_COLUMNS,
      limit: 10000,
      offset: 0,
    }),
    staleTime: 1000 * 60 * 60,
  })
}

export function useTeamsData() {
  return useQuery({
    queryKey: ['teams-data'],
    queryFn: () => fetchDatasetData({
      datasetId: 'teams',
      columns: TEAM_COLUMNS,
      limit: 10000,
      offset: 0,
    }),
    staleTime: 1000 * 60 * 60,
  })
}
