import { TeamCard } from './TeamCard'
import {
  NFL_GRID,
  CONFERENCE_ORDER,
  DIVISION_ORDER,
  TEAM_STATS,
} from '../constants'
import type { AggregatedTeam, HierarchySearch } from '../types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LeagueViewProps {
  teams: AggregatedTeam[]
  search: HierarchySearch
  onSearchChange: (updates: Partial<HierarchySearch>) => void
  onSelectTeam: (abbr: string) => void
}

export function LeagueView({
  teams,
  search,
  onSearchChange,
  onSelectTeam,
}: LeagueViewProps) {
  const teamMap = new Map(teams.map((t) => [t.team_abbr, t]))

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <Select
          value={String(search.year)}
          onValueChange={(v) => onSearchChange({ year: Number(v) })}
        >
          <SelectTrigger className="w-28 bg-gray-800 border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {Array.from({ length: 27 }, (_, i) => 2000 + i).reverse().map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={search.stat}
          onValueChange={(v) => onSearchChange({ stat: v })}
        >
          <SelectTrigger className="w-44 bg-gray-800 border-gray-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {TEAM_STATS.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Periodic Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {CONFERENCE_ORDER.map((conf) => (
          <div key={conf}>
            <h2 className="text-lg font-bold text-gray-200 mb-3">{conf}</h2>
            <div className="grid grid-cols-4 gap-1">
              {/* Division headers */}
              {DIVISION_ORDER.map((div) => (
                <div
                  key={div}
                  className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider pb-1"
                >
                  {div}
                </div>
              ))}
              {/* Team rows - transpose so teams stack vertically within divisions */}
              {[0, 1, 2, 3].map((row) =>
                DIVISION_ORDER.map((div) => {
                  const abbr = NFL_GRID[conf][div][row]
                  const team = teamMap.get(abbr)
                  if (!team) {
                    return (
                      <div
                        key={`${conf}-${div}-${row}`}
                        className="rounded-lg bg-gray-800/30 p-3 text-center text-xs text-gray-600"
                      >
                        {abbr}
                      </div>
                    )
                  }
                  return (
                    <TeamCard
                      key={abbr}
                      team={team}
                      statKey={search.stat}
                      onClick={() => onSelectTeam(abbr)}
                    />
                  )
                })
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
