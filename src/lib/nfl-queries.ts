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
