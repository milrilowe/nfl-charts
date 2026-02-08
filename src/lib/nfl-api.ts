/**
 * NFL Data API Client
 */

const API_BASE = '/api/nfl'

export interface Dataset {
  id: string
  name: string
  description: string
  supports_years: boolean
  min_year: number | null
}

export interface Column {
  name: string
  type: 'string' | 'number' | 'integer' | 'boolean' | 'datetime'
  dtype: string
}

export interface DatasetSchema {
  dataset_id: string
  columns: Column[]
  total_columns: number
}

export interface DatasetData {
  dataset_id: string
  columns: string[]
  data: Record<string, unknown>[]
  total_rows: number
  offset: number
  limit: number
}

export interface FetchDataParams {
  datasetId: string
  years?: number[]
  columns?: string[]
  limit?: number
  offset?: number
}

export async function fetchDatasets(): Promise<Dataset[]> {
  const res = await fetch(`${API_BASE}/datasets`)
  if (!res.ok) throw new Error('Failed to fetch datasets')
  const json = await res.json()
  return json.datasets
}

export async function fetchDatasetSchema(datasetId: string): Promise<DatasetSchema> {
  const res = await fetch(`${API_BASE}/datasets/${datasetId}/schema`)
  if (!res.ok) throw new Error(`Failed to fetch schema for ${datasetId}`)
  return res.json()
}

export async function fetchDatasetData(params: FetchDataParams): Promise<DatasetData> {
  const { datasetId, years, columns, limit = 100, offset = 0 } = params

  const searchParams = new URLSearchParams()
  if (years?.length) searchParams.set('years', years.join(','))
  if (columns?.length) searchParams.set('columns', columns.join(','))
  searchParams.set('limit', String(limit))
  searchParams.set('offset', String(offset))

  const res = await fetch(`${API_BASE}/datasets/${datasetId}/data?${searchParams}`)
  if (!res.ok) throw new Error(`Failed to fetch data for ${datasetId}`)
  return res.json()
}
