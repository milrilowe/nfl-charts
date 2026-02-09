import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { TeamSelector } from './TeamSelector'
import { ThemeToggle } from './ThemeToggle'
import { useTeamContext } from '@/contexts/team-context'
import {
  NFL_GRID,
  CONFERENCE_ORDER,
  DIVISION_ORDER,
} from '@/features/nfl-hierarchy/constants'
import type { TeamInfo } from '@/contexts/team-context'

const NFL_BLUE = '#013369'

const navLinkClass =
  'px-3 py-2 rounded-lg text-sm font-display font-semibold uppercase tracking-wider hover:bg-accent transition-colors text-muted-foreground'
const navLinkActiveClass =
  'px-3 py-2 rounded-lg text-sm font-display font-semibold uppercase tracking-wider bg-team-primary hover:brightness-110 transition-all text-white border-b-2 border-nfl-red'

export default function Header() {
  const [teamPickerOpen, setTeamPickerOpen] = useState(false)
  const { teamInfo, selectedTeam, allTeams, setTeam } = useTeamContext()

  const teamMap = useMemo(
    () => new Map<string, TeamInfo>(allTeams.map((t) => [t.team_abbr, t])),
    [allTeams],
  )

  const selectTeam = (abbr: string | null) => {
    setTeam(abbr)
    setTeamPickerOpen(false)
  }

  return (
    <header className="relative z-20 bg-background">
      <div className="px-6 py-3 flex items-center gap-4">
        <TeamSelector
          open={teamPickerOpen}
          onToggle={() => setTeamPickerOpen((v) => !v)}
        />

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

      {/* Expanding team picker panel */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: teamPickerOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border px-6 py-4">
            {/* NFL reset */}
            <button
              onClick={() => selectTeam(null)}
              className="mb-3 flex items-center gap-2 rounded-md px-2.5 py-1.5 cursor-pointer transition-colors"
              style={{
                backgroundColor: !selectedTeam ? NFL_BLUE : undefined,
                color: !selectedTeam ? '#ffffff' : undefined,
              }}
              onMouseEnter={(e) => {
                if (selectedTeam)
                  e.currentTarget.style.backgroundColor = 'var(--color-accent)'
              }}
              onMouseLeave={(e) => {
                if (selectedTeam) e.currentTarget.style.backgroundColor = ''
              }}
            >
              <span
                className={`font-display text-sm font-bold uppercase tracking-wider ${selectedTeam ? 'text-muted-foreground' : ''}`}
              >
                NFL
              </span>
              {!selectedTeam && <Check className="h-3.5 w-3.5" />}
            </button>

            {/* Team grid: 4 division columns × 2 conference rows */}
            <div className="grid grid-cols-4 gap-x-6 gap-y-4">
              {CONFERENCE_ORDER.map((conf) =>
                DIVISION_ORDER.map((div) => {
                  const teams = NFL_GRID[conf][div]
                  return (
                    <div key={`${conf}-${div}`}>
                      <div className="pb-1.5 font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                        {conf} {div}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        {teams.map((abbr) => {
                          const team = teamMap.get(abbr)
                          if (!team) return null
                          const isActive = abbr === selectedTeam
                          return (
                            <button
                              key={abbr}
                              onClick={() => selectTeam(abbr)}
                              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 cursor-pointer transition-all duration-150"
                              style={{
                                backgroundColor: isActive
                                  ? team.team_color
                                  : undefined,
                                color: isActive ? '#ffffff' : undefined,
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.backgroundColor =
                                    team.team_color
                                  e.currentTarget.style.color = '#ffffff'
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.backgroundColor = ''
                                  e.currentTarget.style.color = ''
                                }
                              }}
                            >
                              <img
                                src={team.team_logo_espn}
                                className="h-5 w-5 object-contain"
                                alt=""
                              />
                              <span className="font-display text-sm font-bold uppercase tracking-wider">
                                {abbr}
                              </span>
                              {isActive && (
                                <Check className="ml-auto h-3.5 w-3.5" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                }),
              )}
            </div>
          </div>
        </div>
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
