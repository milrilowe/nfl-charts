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
import type { HierarchySearch, TeamMeta } from '../types'
import { STAT_CATEGORIES, formatStatValue } from '@/features/leaderboards/stat-columns'

interface PlayerViewProps {
  player: EnrichedPlayer
  peers: EnrichedPlayer[] // same position, for comparison
  teamMeta: Map<string, TeamMeta>
  search: HierarchySearch
}

const BAR_COLOR = '#06b6d4'
const HIGHLIGHT_COLOR = '#22d3ee'

export function PlayerView({ player, peers, teamMeta, search }: PlayerViewProps) {
  const meta = teamMeta.get(player.team)
  const categoryConfig = STAT_CATEGORIES[search.category]
  const statDef = categoryConfig?.stats.find((s) => s.key === search.stat)

  // All stats for this player across all categories
  const allStats = Object.values(STAT_CATEGORIES).flatMap((cat) => cat.stats)

  // Comparison chart: this player vs top 10 at same position
  const top10 = peers
    .sort((a, b) => (Number(b[search.stat]) || 0) - (Number(a[search.stat]) || 0))
    .slice(0, 10)

  const chartData = top10.map((p) => ({
    name: p.player_name,
    value: Number(p[search.stat]) || 0,
    isTarget: p.player_id === player.player_id,
  }))

  // Make sure our player is in the chart even if not top 10
  const inChart = chartData.some((d) => d.isTarget)
  if (!inChart) {
    chartData.push({
      name: player.player_name,
      value: Number(player[search.stat]) || 0,
      isTarget: true,
    })
  }

  return (
    <div className="space-y-6">
      {/* Player Header */}
      <div className="flex items-center gap-4">
        {meta?.team_logo && (
          <img src={meta.team_logo} alt={player.team} className="h-14 w-14" />
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-100">
            {player.player_name}
          </h2>
          <p className="text-sm text-gray-400">
            {player.position} &middot; {player.team_name} &middot;{' '}
            {search.year}
          </p>
        </div>
        <div
          className="ml-auto h-12 w-2 rounded-full"
          style={{ backgroundColor: meta?.team_color ?? '#6b7280' }}
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
              className={`rounded-lg px-3 py-2 ${
                s.key === search.stat
                  ? 'bg-cyan-950/40 border border-cyan-800/50'
                  : 'bg-gray-800/50 border border-gray-700/50'
              }`}
            >
              <div className="text-xs text-gray-400">{s.label}</div>
              <div
                className={`text-lg font-semibold tabular-nums ${
                  s.key === search.stat ? 'text-cyan-400' : 'text-gray-200'
                }`}
              >
                {formatStatValue(value, s.format)}
              </div>
            </div>
          )
        })}
      </div>

      {/* Positional Comparison Chart */}
      {chartData.length > 1 && (
        <div className="rounded-xl bg-gray-800/30 border border-gray-700/50 p-4">
          <h3 className="text-sm font-medium text-gray-400 mb-3">
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
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={{ stroke: '#374151' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fill: '#d1d5db', fontSize: 12 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#f3f4f6',
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
                    fill={entry.isTarget ? HIGHLIGHT_COLOR : BAR_COLOR}
                    fillOpacity={
                      entry.isTarget
                        ? 1
                        : 1 - i * (0.5 / Math.max(chartData.length, 1))
                    }
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
