import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Dataset {
  id: string
  name: string
  description: string
  supports_years: boolean
  min_year: number | null
}

interface DatasetSelectorProps {
  datasets: Dataset[]
  selectedDataset: string | null
  onDatasetChange: (datasetId: string | null) => void
}

export function DatasetSelector({
  datasets,
  selectedDataset,
  onDatasetChange,
}: DatasetSelectorProps) {
  return (
    <Select
      value={selectedDataset ?? '_none'}
      onValueChange={(v) => onDatasetChange(v === '_none' ? null : v)}
    >
      <SelectTrigger className="w-[250px]">
        <SelectValue placeholder="Select dataset..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_none">Select dataset...</SelectItem>
        {datasets.map((ds) => (
          <SelectItem key={ds.id} value={ds.id}>
            {ds.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
