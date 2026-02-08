import { useMemo } from 'react'
import { LEADERBOARD_STATS } from '../constants'
import { formatStatValue } from '@/features/leaderboards/stat-columns'
import type { EnrichedPlayer } from '@/features/leaderboards/hooks/use-leaderboard'
import type { HierarchySearch } from '../types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LeagueViewProps {
  players: EnrichedPlayer[]
  search: HierarchySearch
  onSearchChange: (updates: Partial<HierarchySearch>) => void
  onSelectPlayer: (playerId: string, team: string) => void
}

export function LeagueView({
  players,
  search,
  onSearchChange,
  onSelectPlayer,
}: LeagueViewProps) {
  const leaderboards = useMemo(() => {
    return LEADERBOARD_STATS.map((stat) => {
      const sorted = [...players]
        .sort((a, b) => (Number(b[stat.key]) || 0) - (Number(a[stat.key]) || 0))
        .slice(0, 5)
      return { stat, players: sorted }
    })
  }, [players])

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
            {Array.from({ length: 27 }, (_, i) => 2000 + i)
              .reverse()
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
        {leaderboards.map(({ stat, players: topPlayers }) => (
          <div
            key={stat.key}
            className="rounded-xl border border-border/50 bg-card/40 p-4"
          >
            <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {stat.label}
            </h3>
            <div className="space-y-2">
              {topPlayers.map((player, idx) => (
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
                    {formatStatValue(player[stat.key], stat.format)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
