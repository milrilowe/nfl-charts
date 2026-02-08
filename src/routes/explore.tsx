import React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/explore')({
  component: ExplorePage,
})

interface Dataset {
  id: string
  name: string
  description: string
  supports_years: boolean
  min_year: number | null
}

interface Column {
  name: string
  type: string
}

function ExplorePage() {
  const [datasets, setDatasets] = React.useState<Dataset[]>([])
  const [selectedDataset, setSelectedDataset] = React.useState<string | null>(null)
  const [schema, setSchema] = React.useState<Column[]>([])
  const [data, setData] = React.useState<Record<string, unknown>[]>([])
  const [columns, setColumns] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(false)
  const [offset, setOffset] = React.useState(0)
  const [totalRows, setTotalRows] = React.useState(0)
  const limit = 100

  // Load datasets on mount
  React.useEffect(() => {
    fetch('/api/nfl/datasets')
      .then(r => r.json())
      .then(d => setDatasets(d.datasets))
  }, [])

  // Load schema when dataset changes
  React.useEffect(() => {
    if (!selectedDataset) {
      setSchema([])
      setColumns([])
      return
    }
    fetch(`/api/nfl/datasets/${selectedDataset}/schema`)
      .then(r => r.json())
      .then(d => {
        setSchema(d.columns)
        setColumns(d.columns.slice(0, 10).map((c: Column) => c.name))
      })
  }, [selectedDataset])

  // Load data when dataset, columns, or offset changes
  React.useEffect(() => {
    if (!selectedDataset || columns.length === 0) {
      setData([])
      return
    }
    setLoading(true)
    const params = new URLSearchParams({
      columns: columns.join(','),
      years: '2023,2024',
      limit: String(limit),
      offset: String(offset),
    })
    fetch(`/api/nfl/datasets/${selectedDataset}/data?${params}`)
      .then(r => r.json())
      .then(d => {
        setData(d.data)
        setTotalRows(d.total_rows)
      })
      .finally(() => setLoading(false))
  }, [selectedDataset, columns.join(','), offset])

  const canGoPrev = offset > 0
  const canGoNext = offset + limit < totalRows

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">NFL Data Explorer</h1>

      {/* Dataset selector */}
      <div className="mb-4">
        <select
          value={selectedDataset ?? ''}
          onChange={e => {
            setSelectedDataset(e.target.value || null)
            setOffset(0)
          }}
          className="px-3 py-2 bg-gray-700 rounded border border-gray-600"
        >
          <option value="">Select dataset...</option>
          {datasets.map(ds => (
            <option key={ds.id} value={ds.id}>{ds.name}</option>
          ))}
        </select>
      </div>

      {/* Column picker */}
      {schema.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {schema.map(col => (
            <button
              key={col.name}
              onClick={() => {
                setColumns(prev =>
                  prev.includes(col.name)
                    ? prev.filter(c => c !== col.name)
                    : [...prev, col.name]
                )
                setOffset(0)
              }}
              className={`px-2 py-1 text-xs rounded ${
                columns.includes(col.name)
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {col.name}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && <p className="text-blue-400 mb-4">Loading...</p>}

      {/* Table */}
      {data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                {columns.map(col => (
                  <th key={col} className="px-3 py-2 text-left">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="border-t border-gray-700">
                  {columns.map(col => (
                    <td key={col} className="px-3 py-2">
                      {String(row[col] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalRows > limit && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            disabled={!canGoPrev}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">
            {offset + 1}-{Math.min(offset + limit, totalRows)} of {totalRows}
          </span>
          <button
            onClick={() => setOffset(offset + limit)}
            disabled={!canGoNext}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
