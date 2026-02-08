import { Link } from '@tanstack/react-router'
import { TeamSelector } from './TeamSelector'
import { useTeamContext } from '@/contexts/team-context'

const navLinkClass =
  'px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors text-gray-300'
const navLinkActiveClass =
  'px-3 py-2 rounded-lg text-sm font-medium bg-cyan-600 hover:bg-cyan-700 transition-colors text-white'

export default function Header() {
  const { teamInfo } = useTeamContext()

  const headerStyle = teamInfo
    ? {
        borderBottom: `3px solid ${teamInfo.team_color}`,
        background: `linear-gradient(135deg, ${teamInfo.team_color}15 0%, transparent 30%), #1f2937`,
      }
    : undefined

  return (
    <header
      className="px-6 py-3 flex items-center gap-4 bg-gray-800 text-white shadow-lg"
      style={headerStyle}
    >
      <h1 className="text-xl font-semibold">
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
    </header>
  )
}
