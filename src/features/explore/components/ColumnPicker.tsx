interface Column {
  name: string
  type: string
}

interface ColumnPickerProps {
  schema: Column[]
  selectedColumns: string[]
  onColumnToggle: (columnName: string) => void
}

export function ColumnPicker({
  schema,
  selectedColumns,
  onColumnToggle,
}: ColumnPickerProps) {
  if (schema.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1">
      {schema.map((col) => (
        <button
          key={col.name}
          onClick={() => onColumnToggle(col.name)}
          className={`px-2 py-1 text-xs rounded ${
            selectedColumns.includes(col.name)
              ? 'bg-blue-600'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {col.name}
        </button>
      ))}
    </div>
  )
}
