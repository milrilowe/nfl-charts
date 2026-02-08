import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { EnrichedPlayer } from '../hooks/use-leaderboard'
import { STAT_CATEGORIES, formatStatValue } from '../stat-columns'
import { useTeamContext } from '@/contexts/team-context'

interface LeaderboardChartProps {
  data: EnrichedPlayer[]
  statKey: string
  category: string
}

export function LeaderboardChart({
  data,
  statKey,
  category,
}: LeaderboardChartProps) {
  const statDef = STAT_CATEGORIES[category]?.stats.find(
    (s) => s.key === statKey
  )
  const statLabel = statDef?.label ?? statKey
  const { allTeams } = useTeamContext()

  const teamColorMap = new Map(allTeams.map((t) => [t.team_abbr, t.team_color]))

  const chartData = data.map((player) => ({
    name: player.player_name,
    team: player.team,
    value: Number(player[statKey]) || 0,
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(400, data.length * 32)}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
          width={160}
          tick={{ fill: '#d1d5db', fontSize: 12 }}
          axisLine={{ stroke: '#374151' }}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#111827',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#f3f4f6',
          }}
          formatter={(value) => [
            formatStatValue(value, statDef?.format ?? 'number'),
            statLabel,
          ]}
          labelFormatter={(label, payload) => {
            const team = payload?.[0]?.payload?.team
            return team ? `${label} (${team})` : String(label)
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={index}
              fill={teamColorMap.get(entry.team) || '#06b6d4'}
              fillOpacity={1 - index * (0.3 / Math.max(chartData.length, 1))}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
