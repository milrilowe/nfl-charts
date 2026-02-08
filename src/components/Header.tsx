import { Link } from '@tanstack/react-router'
import { TeamSelector } from './TeamSelector'
import { ThemeToggle } from './ThemeToggle'
import { useTeamContext } from '@/contexts/team-context'
import { useTheme } from '@/contexts/theme-context'

const navLinkClass =
  'px-3 py-2 rounded-lg text-sm font-display font-semibold uppercase tracking-wider hover:bg-accent transition-colors text-muted-foreground'
const navLinkActiveClass =
  'px-3 py-2 rounded-lg text-sm font-display font-semibold uppercase tracking-wider bg-team-primary hover:brightness-110 transition-all text-white border-b-2 border-nfl-red'

export default function Header() {
  const { teamInfo } = useTeamContext()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className="relative overflow-hidden z-20">
      {/* Background gradient layer */}
      <div
        className="absolute inset-0 transition-all duration-500"
        style={{
          background: teamInfo
            ? isDark
              ? `linear-gradient(135deg, ${teamInfo.team_color}90 0%, ${teamInfo.team_color2}60 40%, #111827 70%)`
              : `linear-gradient(135deg, ${teamInfo.team_color}30 0%, ${teamInfo.team_color2}18 40%, white 70%)`
            : isDark
              ? 'linear-gradient(135deg, #013369 0%, #111827 70%)'
              : 'linear-gradient(135deg, #013369 0%, white 70%)',
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

        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
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
        </nav>

        <ThemeToggle />
      </div>

      {/* Accent stripe */}
      <div
        className="h-1 transition-all duration-500"
        style={{
          background: teamInfo
            ? `linear-gradient(90deg, ${teamInfo.team_color}, ${teamInfo.team_color2})`
            : 'linear-gradient(90deg, #013369, #D50A0A)',
        }}
      />
    </header>
  )
}
