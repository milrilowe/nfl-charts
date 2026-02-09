import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { usePlayerDetail } from '@/lib/nfl-queries'
import type { HierarchySearch, TeamMeta } from '../types'
import { STAT_CATEGORIES, formatStatValue } from '@/features/leaderboards/stat-columns'
import { useTheme } from '@/contexts/theme-context'
import { useChartTheme } from '@/hooks/use-chart-theme'
import { Skeleton } from '@/components/ui/skeleton'

interface PlayerViewProps {
  year: number
  playerId: string
  teamMeta: Map<string, TeamMeta>
  search: HierarchySearch
}

export function PlayerView({ year, playerId, teamMeta, search }: PlayerViewProps) {
  const detailQuery = usePlayerDetail(playerId, year, search.stat)
  const player = detailQuery.data?.player
  const chartData = detailQuery.data?.peers?.map((p) => ({
    name: p.player_name,
    value: p.value,
    isTarget: p.is_target,
  })) ?? []

  const meta = player ? teamMeta.get(player.team) : undefined
  const teamColor = meta?.team_color ?? '#6b7280'
  const teamColor2 = meta?.team_color2 ?? '#374151'
  const categoryConfig = STAT_CATEGORIES[search.category]
  const statDef = categoryConfig?.stats.find((s) => s.key === search.stat)
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const chartTheme = useChartTheme()

  const allStats = Object.values(STAT_CATEGORIES).flatMap((cat) => cat.stats)

  if (detailQuery.isLoading || !player) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Player Header — Madden Banner */}
      <div
        className="relative overflow-hidden rounded-xl p-6"
        style={{
          background: `linear-gradient(135deg, ${teamColor}50 0%, ${teamColor2}30 50%, ${isDark ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.9)'} 80%)`,
        }}
      >
        {/* Watermark */}
        {meta?.team_logo && (
          <img
            src={meta.team_logo}
            alt=""
            className="absolute right-4 top-1/2 -translate-y-1/2 h-28 w-28 opacity-10 pointer-events-none"
          />
        )}

        <div className="relative flex items-center gap-5">
          {/* Player headshot */}
          {player.headshot_url ? (
            <img
              src={player.headshot_url}
              alt={player.player_name}
              className="h-24 w-24 rounded-xl object-cover bg-muted border-2 shadow-lg"
              style={{ borderColor: teamColor }}
            />
          ) : meta?.team_logo ? (
            <img src={meta.team_logo} alt={player.team} className="h-20 w-20 drop-shadow-lg" />
          ) : null}

          <div>
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-wide text-foreground">
              {player.player_name}
            </h2>
            <p className="font-display text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              {meta?.team_logo && (
                <img src={meta.team_logo} alt="" className="h-5 w-5 inline" />
              )}
              {player.position} &middot; {player.team_name} &middot; {search.year}
            </p>
          </div>
        </div>

        {/* Accent stripe */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: `linear-gradient(90deg, ${teamColor}, ${teamColor2})` }}
        />
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {allStats.map((s) => {
          const value = player[s.key]
          if (value === undefined || value === null) return null
          const numVal = Number(value)
          if (isNaN(numVal) || numVal === 0) return null

          return (
            <div
              key={s.key}
              className={`rounded-lg px-3 py-2 transition-colors ${
                s.key === search.stat
                  ? 'border'
                  : 'bg-card/50 border border-border/50'
              }`}
              style={
                s.key === search.stat
                  ? {
                      backgroundColor: `${teamColor}15`,
                      borderColor: `${teamColor}40`,
                    }
                  : undefined
              }
            >
              <div className="font-display text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div
                className={`font-display text-xl font-bold tabular-nums ${
                  s.key === search.stat ? '' : 'text-foreground'
                }`}
                style={s.key === search.stat ? { color: teamColor } : undefined}
              >
                {formatStatValue(value, s.format)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Positional Comparison Chart */}
      {chartData.length > 1 && (
        <div
          className="rounded-xl border p-4"
          style={{
            backgroundColor: isDark ? 'rgba(31,41,55,0.3)' : 'rgba(241,245,249,0.5)',
            borderColor: `${teamColor}20`,
          }}
        >
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            vs. Top {player.position}s — {statDef?.label ?? search.stat}
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
                  border: `1px solid ${teamColor}40`,
                  borderRadius: '8px',
                  color: chartTheme.tooltipText,
                }}
                formatter={(value) => [
                  formatStatValue(value, statDef?.format ?? 'number'),
                  statDef?.label ?? search.stat,
                ]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={teamColor}
                    fillOpacity={entry.isTarget ? 1 : 0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
