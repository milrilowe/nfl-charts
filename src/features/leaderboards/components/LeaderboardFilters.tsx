import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { STAT_CATEGORIES } from '../stat-columns'

interface LeaderboardFiltersProps {
  year: number
  maxYear: number
  category: string
  stat: string
  topN: number
  position?: string
  team?: string
  conference?: string
  availablePositions: string[]
  availableTeams: string[]
  onYearChange: (year: number) => void
  onStatChange: (stat: string) => void
  onTopNChange: (topN: number) => void
  onPositionChange: (position: string | undefined) => void
  onTeamChange: (team: string | undefined) => void
  onConferenceChange: (conference: string | undefined) => void
}

const TOP_N_OPTIONS = [10, 15, 20, 25, 50]

export function LeaderboardFilters({
  year,
  maxYear,
  category,
  stat,
  topN,
  position,
  team,
  conference,
  availablePositions,
  availableTeams,
  onYearChange,
  onStatChange,
  onTopNChange,
  onPositionChange,
  onTeamChange,
  onConferenceChange,
}: LeaderboardFiltersProps) {
  const categoryConfig = STAT_CATEGORIES[category]

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={String(year)}
        onValueChange={(v) => onYearChange(Number(v))}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: maxYear - 1999 }, (_, i) => maxYear - i).map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={stat} onValueChange={onStatChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {categoryConfig.stats.map((s) => (
            <SelectItem key={s.key} value={s.key}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={String(topN)}
        onValueChange={(v) => onTopNChange(Number(v))}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TOP_N_OPTIONS.map((n) => (
            <SelectItem key={n} value={String(n)}>
              Top {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={position ?? '_all'}
        onValueChange={(v) => onPositionChange(v === '_all' ? undefined : v)}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Position" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All Pos</SelectItem>
          {availablePositions.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={team ?? '_all'}
        onValueChange={(v) => onTeamChange(v === '_all' ? undefined : v)}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Team" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All Teams</SelectItem>
          {availableTeams.map((t) => (
            <SelectItem key={t} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={conference ?? '_all'}
        onValueChange={(v) =>
          onConferenceChange(v === '_all' ? undefined : v)
        }
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Conf" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="_all">All Conf</SelectItem>
          <SelectItem value="AFC">AFC</SelectItem>
          <SelectItem value="NFC">NFC</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
