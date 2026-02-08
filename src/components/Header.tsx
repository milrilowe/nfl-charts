import { Link } from '@tanstack/react-router'
import { TeamSelector } from './TeamSelector'
import { useTeamContext } from '@/contexts/team-context'

const navLinkClass =
  'px-3 py-2 rounded-lg text-sm font-display font-semibold uppercase tracking-wider hover:bg-white/10 transition-colors text-gray-300'
const navLinkActiveClass =
  'px-3 py-2 rounded-lg text-sm font-display font-semibold uppercase tracking-wider bg-team-primary hover:brightness-110 transition-all text-white'

export default function Header() {
  const { teamInfo } = useTeamContext()

  return (
    <header className="relative overflow-hidden z-20">
      {/* Background gradient layer */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: teamInfo
            ? `linear-gradient(135deg, ${teamInfo.team_color}90 0%, ${teamInfo.team_color2}60 40%, #111827 70%)`
            : 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        }}
      />

      {/* Watermark logo */}
      {teamInfo?.team_logo_espn && (
        <img
          src={teamInfo.team_logo_espn}
          alt=""
          className="absolute right-8 top-1/2 -translate-y-1/2 h-24 w-24 opacity-10 pointer-events-none select-none"
        />
      )}

      {/* Content */}
      <div className="relative px-6 py-4 flex items-center gap-4">
        {/* Team logo */}
        {teamInfo?.team_logo_espn && (
          <img
            src={teamInfo.team_logo_espn}
            alt={teamInfo.team_nick}
            className="h-10 w-10 drop-shadow-lg"
          />
        )}

        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          <Link to="/">NFL Charts</Link>
        </h1>

        <TeamSelector />

        <div className="flex-1" />

        <nav className="flex items-center gap-1">
          <Link
            to="/nfl"
            className={navLinkClass}
            activeProps={{ className: navLinkActiveClass }}
          >
            League
          </Link>
          <Link
            to="/leaderboards"
            className={navLinkClass}
            activeProps={{ className: navLinkActiveClass }}
          >
            Leaderboards
          </Link>
          <Link
            to="/explore"
            className={navLinkClass}
            activeProps={{ className: navLinkActiveClass }}
          >
            Explore
          </Link>
        </nav>
      </div>

      {/* Accent stripe */}
      <div
        className="h-1 transition-all duration-500"
        style={{
          background: teamInfo
            ? `linear-gradient(90deg, ${teamInfo.team_color}, ${teamInfo.team_color2})`
            : 'linear-gradient(90deg, #374151, #1f2937)',
        }}
      />
    </header>
  )
}
