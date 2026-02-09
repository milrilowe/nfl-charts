import { useLeaderboards } from '../hooks/use-leaderboards'
import { formatStatValue } from '@/features/leaderboards/stat-columns'
import type { HierarchySearch } from '../types'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LeagueViewProps {
  year: number
  maxYear: number
  search: HierarchySearch
  onSearchChange: (updates: Partial<HierarchySearch>) => void
  onSelectPlayer: (playerId: string, team: string) => void
}

export function LeagueView({
  year,
  maxYear,
  search,
  onSearchChange,
  onSelectPlayer,
}: LeagueViewProps) {
  const { leaderboards } = useLeaderboards(year)

  return (
    <div className="space-y-6">
      {/* Year selector */}
      <div className="flex items-center gap-4">
        <Select
          value={String(search.year)}
          onValueChange={(v) => onSearchChange({ year: Number(v) })}
        >
          <SelectTrigger className="w-28 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {Array.from({ length: maxYear - 1999 }, (_, i) => maxYear - i)
              .map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        <h1 className="font-display text-lg font-semibold text-foreground uppercase tracking-wider border-l-4 border-nfl-red pl-3">
          League Leaders
        </h1>
      </div>

      {/* Leaderboard grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {leaderboards.map(({ stat, players: topPlayers, isLoading }) => (
          <div
            key={stat.key}
            className="rounded-xl border border-border/50 bg-card/40 p-4"
          >
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {stat.label}
            </h3>
            <div className="space-y-2">
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))
              ) : (
                topPlayers.map((player, idx) => (
                  <button
                    key={player.player_id}
                    onClick={() => onSelectPlayer(player.player_id, player.team)}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent/50 cursor-pointer"
                  >
                    <span className="font-display text-sm font-bold text-muted-foreground w-5 text-right shrink-0">
                      {idx + 1}
                    </span>
                    {player.headshot_url && (
                      <img
                        src={player.headshot_url}
                        alt=""
                        className="h-7 w-7 rounded-full object-cover bg-muted shrink-0"
                        loading="lazy"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">
                        {player.player_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {player.team}
                      </div>
                    </div>
                    <span className="font-display text-sm font-bold tabular-nums text-foreground shrink-0">
                      {formatStatValue(player.value, stat.format)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
