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
      className="group relative flex flex-col items-start gap-1 rounded-lg bg-gray-800/50 p-3 text-left transition-all duration-200 hover:scale-[1.03] hover:bg-gray-700/60 border border-gray-700/50 hover:border-gray-600 cursor-pointer"
      style={{ borderLeftWidth: 3, borderLeftColor: team.team_color }}
    >
      {team.team_logo && (
        <img
          src={team.team_logo}
          alt={team.team_name}
          className="absolute top-2 right-2 h-6 w-6 opacity-30 group-hover:opacity-60 transition-opacity"
        />
      )}
      <span className="text-sm font-bold text-gray-100">{team.team_abbr}</span>
      <span className="text-xs text-gray-400 leading-tight">
        {team.team_nick}
      </span>
      <span className="text-lg font-semibold text-cyan-400 tabular-nums">
        {formatStatValue(value, statDef?.format ?? 'number')}
      </span>
    </button>
  )
}
