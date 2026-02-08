import { useState, useEffect } from 'react'
import {
  useDatasets,
  useDatasetSchema,
  useDatasetData,
} from '@/lib/nfl-queries'

const LIMIT = 100
const DEFAULT_YEARS = [2023, 2024]

export function useDataExplorer() {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null)
  const [selectedColumns, setSelectedColumns] = useState<string[]>([])
  const [offset, setOffset] = useState(0)

  const datasetsQuery = useDatasets()
  const schemaQuery = useDatasetSchema(selectedDataset)
  const hasColumns = selectedColumns.length > 0
  const dataQuery = useDatasetData(
    hasColumns ? selectedDataset : null,
    DEFAULT_YEARS,
    hasColumns ? selectedColumns : undefined,
    LIMIT,
    offset
  )

  const schema = schemaQuery.data?.columns ?? []

  // Auto-select first 10 columns when schema loads
  useEffect(() => {
    if (schema.length > 0 && selectedColumns.length === 0) {
      setSelectedColumns(schema.slice(0, 10).map((c) => c.name))
    }
  }, [schema])

  const datasets = datasetsQuery.data ?? []
  const data = dataQuery.data?.data ?? []
  const totalRows = dataQuery.data?.total_rows ?? 0

  function handleDatasetChange(datasetId: string | null) {
    setSelectedDataset(datasetId)
    setSelectedColumns([])
    setOffset(0)
  }

  function handleColumnToggle(columnName: string) {
    setSelectedColumns((prev) =>
      prev.includes(columnName)
        ? prev.filter((c) => c !== columnName)
        : [...prev, columnName]
    )
    setOffset(0)
  }

  function handlePrevPage() {
    setOffset((prev) => Math.max(0, prev - LIMIT))
  }

  function handleNextPage() {
    setOffset((prev) => prev + LIMIT)
  }

  return {
    datasets,
    selectedDataset,
    schema,
    selectedColumns,
    data,
    totalRows,
    offset,
    limit: LIMIT,
    isLoading: dataQuery.isLoading,
    canGoPrev: offset > 0,
    canGoNext: offset + LIMIT < totalRows,
    handleDatasetChange,
    handleColumnToggle,
    handlePrevPage,
    handleNextPage,
  }
}
