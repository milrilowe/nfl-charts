import type { AggregatedTeam } from '../types'
import { formatStatValue } from '@/features/leaderboards/stat-columns'
import { TEAM_STATS } from '../constants'

interface TeamCardProps {
  team: AggregatedTeam
  statKey: string
  onClick: () => void
}

export function TeamCard({ team, statKey, onClick }: TeamCardProps) {
  const statDef = TEAM_STATS.find((s) => s.key === statKey)
  const value = Number(team[statKey]) || 0

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-start gap-1 rounded-lg p-3 text-left transition-all duration-200 hover:scale-[1.03] border border-gray-700/50 hover:border-gray-600 cursor-pointer overflow-hidden"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: team.team_color,
        background: `linear-gradient(135deg, ${team.team_color}08 0%, transparent 60%), rgba(31,41,55,0.5)`,
      }}
    >
      {team.team_logo && (
        <img
          src={team.team_logo}
          alt=""
          className="absolute -right-1 -bottom-1 h-12 w-12 opacity-[0.07] group-hover:opacity-15 transition-opacity pointer-events-none"
        />
      )}
      <span className="font-display text-sm font-bold text-gray-100 uppercase tracking-wide">
        {team.team_abbr}
      </span>
      <span className="text-xs text-gray-400 leading-tight">
        {team.team_nick}
      </span>
      <span
        className="font-display text-lg font-bold tabular-nums"
        style={{ color: team.team_color }}
      >
        {formatStatValue(value, statDef?.format ?? 'number')}
      </span>
    </button>
  )
}
