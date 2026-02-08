import { useDataExplorer } from '../hooks/use-data-explorer'
import { DatasetSelector } from './DatasetSelector'
import { ColumnPicker } from './ColumnPicker'
import { ExploreTable } from './ExploreTable'

export function ExplorePage() {
  const {
    datasets,
    selectedDataset,
    schema,
    selectedColumns,
    data,
    totalRows,
    offset,
    limit,
    isLoading,
    canGoPrev,
    canGoNext,
    handleDatasetChange,
    handleColumnToggle,
    handlePrevPage,
    handleNextPage,
  } = useDataExplorer()

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6 space-y-4">
      <h1 className="text-3xl font-bold">NFL Data Explorer</h1>

      <DatasetSelector
        datasets={datasets}
        selectedDataset={selectedDataset}
        onDatasetChange={handleDatasetChange}
      />

      <ColumnPicker
        schema={schema}
        selectedColumns={selectedColumns}
        onColumnToggle={handleColumnToggle}
      />

      {isLoading && <p className="text-blue-400">Loading...</p>}

      <ExploreTable
        columns={selectedColumns}
        data={data}
        totalRows={totalRows}
        offset={offset}
        limit={limit}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
      />
    </div>
  )
}
