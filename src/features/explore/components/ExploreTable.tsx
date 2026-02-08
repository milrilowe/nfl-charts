import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ExploreTableProps {
  columns: string[]
  data: Record<string, unknown>[]
  totalRows: number
  offset: number
  limit: number
  canGoPrev: boolean
  canGoNext: boolean
  onPrevPage: () => void
  onNextPage: () => void
}

export function ExploreTable({
  columns,
  data,
  totalRows,
  offset,
  limit,
  canGoPrev,
  canGoNext,
  onPrevPage,
  onNextPage,
}: ExploreTableProps) {
  if (data.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-700">
              {columns.map((col) => (
                <TableHead key={col} className="text-gray-400">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i} className="border-gray-700/50">
                {columns.map((col) => (
                  <TableCell key={col} className="text-gray-300">
                    {String(row[col] ?? '-')}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalRows > limit && (
        <div className="flex gap-2 items-center">
          <button
            onClick={onPrevPage}
            disabled={!canGoPrev}
            className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-gray-400">
            {offset + 1}-{Math.min(offset + limit, totalRows)} of {totalRows}
          </span>
          <button
            onClick={onNextPage}
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
