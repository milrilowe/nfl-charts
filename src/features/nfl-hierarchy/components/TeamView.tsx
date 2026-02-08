import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { EnrichedPlayer } from '@/features/leaderboards/hooks/use-leaderboard'
import type { AggregatedTeam, HierarchySearch } from '../types'
import { STAT_CATEGORIES, formatStatValue, COLUMN_LABELS } from '@/features/leaderboards/stat-columns'
import { TEAM_STATS } from '../constants'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTheme } from '@/contexts/theme-context'
import { useChartTheme } from '@/hooks/use-chart-theme'

interface TeamViewProps {
  team: AggregatedTeam
  players: EnrichedPlayer[]
  search: HierarchySearch
  onSearchChange: (updates: Partial<HierarchySearch>) => void
  onSelectPlayer: (playerId: string) => void
}

const POSITION_ORDER = ['QB', 'RB', 'WR', 'TE', 'FB', 'K', 'P']

export function TeamView({
  team,
  players,
  search,
  onSearchChange,
  onSelectPlayer,
}: TeamViewProps) {
  const categoryConfig = STAT_CATEGORIES[search.category]
  const statDef = categoryConfig?.stats.find((s) => s.key === search.stat)
  const columns = categoryConfig?.tableColumns ?? []
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const chartTheme = useChartTheme()

  // Sort players by current stat
  const sorted = [...players].sort(
    (a, b) => (Number(b[search.stat]) || 0) - (Number(a[search.stat]) || 0)
  )

  // Top 10 for chart
  const chartData = sorted.slice(0, 10).map((p) => ({
    name: p.player_name,
    value: Number(p[search.stat]) || 0,
  }))

  // Group by position for roster view
  const byPosition = new Map<string, EnrichedPlayer[]>()
  for (const p of sorted) {
    const pos = p.position || 'Other'
    const existing = byPosition.get(pos)
    if (existing) {
      existing.push(p)
    } else {
      byPosition.set(pos, [p])
    }
  }

  // Sort position groups
  const positionGroups = Array.from(byPosition.entries()).sort(([a], [b]) => {
    const ai = POSITION_ORDER.indexOf(a)
    const bi = POSITION_ORDER.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  return (
    <div className="space-y-6">
      {/* Team Header — Madden Banner */}
      <div
        className="relative overflow-hidden rounded-xl p-6"
        style={{
          background: `linear-gradient(135deg, ${team.team_color}50 0%, ${team.team_color2}30 50%, ${isDark ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)'} 80%)`,
        }}
      >
        {/* Watermark */}
        {team.team_logo && (
          <img
            src={team.team_logo}
            alt=""
            className="absolute right-4 top-1/2 -translate-y-1/2 h-28 w-28 opacity-10 pointer-events-none"
          />
        )}

        <div className="relative flex items-center gap-5">
          {team.team_logo && (
            <img
              src={team.team_logo}
              alt={team.team_name}
              className="h-20 w-20 drop-shadow-lg"
            />
          )}
          <div>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide text-foreground">
              {team.team_name}
            </h2>
            <p className="font-display text-sm uppercase tracking-wider text-muted-foreground">
              {team.team_conf} {team.team_division.replace(team.team_conf + ' ', '')} &middot; {team.player_count} players
            </p>
          </div>
        </div>

        {/* Accent stripe */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${team.team_color}, ${team.team_color2})` }}
        />
      </div>

      {/* Team Aggregate Stats */}
      <div className="flex flex-wrap gap-3">
        {TEAM_STATS.slice(0, 6).map((s) => (
          <div
            key={s.key}
            className={`rounded-lg px-3 py-2 text-center transition-colors ${
              s.key === search.stat
                ? 'border'
                : 'bg-card/50 border border-border/50'
            }`}
            style={
              s.key === search.stat
                ? {
                    backgroundColor: `${team.team_color}15`,
                    borderColor: `${team.team_color}40`,
                  }
                : undefined
            }
          >
            <div className="font-display text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
            <div
              className={`font-display text-xl font-bold tabular-nums ${
                s.key === search.stat ? '' : 'text-foreground'
              }`}
              style={s.key === search.stat ? { color: team.team_color } : undefined}
            >
              {formatStatValue(team[s.key], s.format)}
            </div>
          </div>
        ))}
      </div>

      {/* Category + Stat selectors */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg bg-card/50 p-1">
          {Object.entries(STAT_CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() =>
                onSearchChange({
                  category: key as HierarchySearch['category'],
                  stat: STAT_CATEGORIES[key].defaultStat,
                })
              }
              className={`rounded-md px-3 py-1.5 text-sm font-display font-semibold uppercase tracking-wider transition-colors ${
                search.category === key
                  ? 'text-white'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              style={
                search.category === key
                  ? { backgroundColor: team.team_color }
                  : undefined
              }
            >
              {cat.label}
            </button>
          ))}
        </div>
        <Select
          value={search.stat}
          onValueChange={(v) => onSearchChange({ stat: v })}
        >
          <SelectTrigger className="w-44 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            {categoryConfig?.stats.map((s) => (
              <SelectItem key={s.key} value={s.key}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Top Players Chart */}
      {chartData.length > 0 && (
        <div
          className="rounded-xl border p-4"
          style={{
            backgroundColor: isDark ? 'rgba(31,41,55,0.3)' : 'rgba(241,245,249,0.5)',
            borderColor: `${team.team_color}20`,
          }}
        >
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Top Players — {statDef?.label ?? search.stat}
          </h3>
          <ResponsiveContainer
            width="100%"
            height={Math.max(250, chartData.length * 32)}
          >
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
            >
              <XAxis
                type="number"
                tick={{ fill: chartTheme.tickFill, fontSize: 12 }}
                axisLine={{ stroke: chartTheme.axisStroke }}
                tickLine={{ stroke: chartTheme.axisStroke }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fill: chartTheme.tickSecondaryFill, fontSize: 12 }}
                axisLine={{ stroke: chartTheme.axisStroke }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: chartTheme.tooltipBg,
                  border: `1px solid ${team.team_color}40`,
                  borderRadius: '8px',
                  color: chartTheme.tooltipText,
                }}
                formatter={(value) => [
                  formatStatValue(value, statDef?.format ?? 'number'),
                  statDef?.label ?? search.stat,
                ]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={team.team_color}
                    fillOpacity={1 - i * (0.5 / Math.max(chartData.length, 1))}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Roster by Position */}
      <div className="space-y-4">
        {positionGroups.map(([position, posPlayers]) => (
          <div key={position}>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              {position}
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-12 text-muted-foreground">#</TableHead>
                  {columns
                    .filter((c) => c !== 'team' && c !== 'position')
                    .map((col) => (
                      <TableHead
                        key={col}
                        className={`text-muted-foreground ${
                          col === search.stat
                            ? 'font-semibold'
                            : ''
                        }`}
                        style={col === search.stat ? { color: team.team_color } : undefined}
                      >
                        {COLUMN_LABELS[col] ?? col}
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {posPlayers.map((player, idx) => (
                  <TableRow
                    key={player.player_id}
                    className="border-border/50 hover:bg-accent/50 cursor-pointer"
                    onClick={() => onSelectPlayer(player.player_id)}
                  >
                    <TableCell className="font-display font-bold text-muted-foreground">
                      {idx + 1}
                    </TableCell>
                    {columns
                      .filter((c) => c !== 'team' && c !== 'position')
                      .map((col) => {
                        const value = player[col]
                        const colStatDef = categoryConfig?.stats.find(
                          (s) => s.key === col
                        )
                        const displayValue = colStatDef
                          ? formatStatValue(value, colStatDef.format)
                          : String(value ?? '-')

                        return (
                          <TableCell
                            key={col}
                            className={
                              col === 'player_name'
                                ? 'font-display font-semibold text-foreground'
                                : col === search.stat
                                  ? 'font-semibold font-display tabular-nums'
                                  : 'text-muted-foreground'
                            }
                            style={col === search.stat ? { color: team.team_color } : undefined}
                          >
                            {col === 'player_name' ? (
                              <div className="flex items-center gap-2">
                                {player.headshot_url && (
                                  <img
                                    src={player.headshot_url}
                                    alt=""
                                    className="h-7 w-7 rounded-full object-cover bg-muted"
                                    loading="lazy"
                                  />
                                )}
                                <span>{displayValue}</span>
                              </div>
                            ) : (
                              displayValue
                            )}
                          </TableCell>
                        )
                      })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </div>
  )
}
