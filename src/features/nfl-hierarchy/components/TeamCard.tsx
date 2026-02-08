import type { AggregatedTeam } from '../types'
import { formatStatValue } from '@/features/leaderboards/stat-columns'
import { TEAM_STATS } from '../constants'
import { useTheme } from '@/contexts/theme-context'

interface TeamCardProps {
  team: AggregatedTeam
  statKey: string
  onClick: () => void
}

export function TeamCard({ team, statKey, onClick }: TeamCardProps) {
  const statDef = TEAM_STATS.find((s) => s.key === statKey)
  const value = Number(team[statKey]) || 0
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col items-start gap-1 rounded-lg p-3 text-left transition-all duration-200 hover:scale-[1.03] border border-border/50 hover:border-border cursor-pointer overflow-hidden"
      style={{
        borderLeftWidth: 4,
        borderLeftColor: team.team_color,
        background: `linear-gradient(135deg, ${team.team_color}08 0%, transparent 60%), ${isDark ? 'rgba(31,41,55,0.5)' : 'rgba(241,245,249,0.6)'}`,
      }}
    >
      {team.team_logo && (
        <img
          src={team.team_logo}
          alt=""
          className="absolute -right-1 -bottom-1 h-12 w-12 opacity-[0.07] group-hover:opacity-15 transition-opacity pointer-events-none"
        />
      )}
      <span className="font-display text-sm font-bold text-foreground uppercase tracking-wide">
        {team.team_abbr}
      </span>
      <span className="text-xs text-muted-foreground leading-tight">
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
