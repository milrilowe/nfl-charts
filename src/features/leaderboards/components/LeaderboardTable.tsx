import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { EnrichedPlayer } from '../hooks/use-leaderboard'
import {
  STAT_CATEGORIES,
  COLUMN_LABELS,
  formatStatValue,
} from '../stat-columns'
import { useTeamContext } from '@/contexts/team-context'

interface LeaderboardTableProps {
  data: EnrichedPlayer[]
  category: string
  statKey: string
  topN: number
}

export function LeaderboardTable({
  data,
  category,
  statKey,
  topN,
}: LeaderboardTableProps) {
  const categoryConfig = STAT_CATEGORIES[category]
  const columns = categoryConfig.tableColumns
  const statDef = categoryConfig.stats.find((s) => s.key === statKey)
  const { allTeams } = useTeamContext()

  const teamColorMap = new Map(allTeams.map((t) => [t.team_abbr, t.team_color]))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-transparent">
          <TableHead className="w-12 text-muted-foreground">#</TableHead>
          {columns.map((col) => (
            <TableHead
              key={col}
              className={`text-muted-foreground ${col === statKey ? 'text-team-primary font-semibold' : ''}`}
            >
              {COLUMN_LABELS[col] ?? col}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((player, index) => {
          const playerTeamColor = teamColorMap.get(player.team)

          return (
            <TableRow
              key={player.player_id || index}
              className={`border-border/50 ${
                index < topN
                  ? 'bg-team-primary/10 hover:bg-team-primary/15'
                  : 'hover:bg-accent/50'
              }`}
            >
              <TableCell className="font-display font-bold text-muted-foreground">
                {index + 1}
              </TableCell>
              {columns.map((col) => {
                const value = player[col]
                const isStatColumn = categoryConfig.stats.some(
                  (s) => s.key === col
                )
                const colStatDef = categoryConfig.stats.find(
                  (s) => s.key === col
                )

                let displayValue: string
                if (isStatColumn && colStatDef) {
                  displayValue = formatStatValue(value, colStatDef.format)
                } else if (col === statKey && statDef) {
                  displayValue = formatStatValue(value, statDef.format)
                } else {
                  displayValue = String(value ?? '-')
                }

                return (
                  <TableCell
                    key={col}
                    className={`${
                      col === 'player_name'
                        ? 'font-display font-semibold text-foreground'
                        : col === statKey
                          ? 'text-team-primary font-semibold font-display tabular-nums'
                          : col === 'team'
                            ? ''
                            : 'text-muted-foreground'
                    }`}
                  >
                    {col === 'player_name' ? (
                      <div className="flex items-center gap-2">
                        {player.headshot_url && (
                          <img
                            src={player.headshot_url}
                            alt=""
                            className="h-8 w-8 rounded-full object-cover bg-muted"
                            loading="lazy"
                          />
                        )}
                        <span>{displayValue}</span>
                      </div>
                    ) : col === 'team' ? (
                      <span
                        className="font-display font-semibold text-xs uppercase"
                        style={{ color: playerTeamColor }}
                      >
                        {displayValue}
                      </span>
                    ) : (
                      displayValue
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
