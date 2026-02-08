import { useState, useCallback, useMemo } from 'react'
import { Check, ChevronLeft, ChevronRight, ChevronDown, X } from 'lucide-react'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { useTeamContext } from '@/contexts/team-context'
import {
  NFL_GRID,
  CONFERENCE_ORDER,
  DIVISION_ORDER,
} from '@/features/nfl-hierarchy/constants'
import type { TeamInfo } from '@/contexts/team-context'

function buildTeamOrder(): string[] {
  return CONFERENCE_ORDER.flatMap((conf) =>
    DIVISION_ORDER.flatMap((div) => NFL_GRID[conf][div]),
  )
}

export function TeamSelector() {
  const [open, setOpen] = useState(false)
  const { selectedTeam, teamInfo, allTeams, setTeam, isLoading } =
    useTeamContext()

  const teamMap = useMemo(
    () => new Map<string, TeamInfo>(allTeams.map((t) => [t.team_abbr, t])),
    [allTeams],
  )

  const teamOrder = useMemo(buildTeamOrder, [])

  const cycle = useCallback(
    (dir: -1 | 1) => {
      if (!teamOrder.length) return
      if (!selectedTeam) {
        setTeam(dir === 1 ? teamOrder[0] : teamOrder[teamOrder.length - 1])
        return
      }
      const idx = teamOrder.indexOf(selectedTeam)
      const next = (idx + dir + teamOrder.length) % teamOrder.length
      setTeam(teamOrder[next])
    },
    [selectedTeam, teamOrder, setTeam],
  )

  if (isLoading) {
    return <div className="h-9 w-40 animate-pulse rounded-md bg-muted" />
  }

  const borderColor = teamInfo ? `${teamInfo.team_color}40` : 'var(--color-border)'

  return (
    <div className="flex items-center">
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        {/* The entire bumper assembly is the trigger — panel matches its width */}
        <PopoverPrimitive.Trigger asChild>
          <div className="flex items-center cursor-pointer">
            {/* Left bumper */}
            <button
              onClick={(e) => { e.stopPropagation(); cycle(-1) }}
              className="flex h-9 w-7 items-center justify-center rounded-l-md border border-r-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
              style={{
                borderColor,
                borderBottomLeftRadius: open ? 0 : undefined,
                borderBottomColor: open ? 'transparent' : borderColor,
              }}
              aria-label="Previous team"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Center display */}
            <div
              className="flex h-9 min-w-[140px] items-center justify-center gap-2 border px-3 text-sm font-medium text-foreground transition-all"
              style={{
                borderColor,
                background: teamInfo
                  ? `linear-gradient(135deg, ${teamInfo.team_color}12 0%, ${teamInfo.team_color2}08 100%)`
                  : undefined,
                borderBottomColor: open ? 'transparent' : borderColor,
              }}
            >
              {teamInfo ? (
                <>
                  <img
                    src={teamInfo.team_logo_espn}
                    className="h-6 w-6 object-contain drop-shadow-sm"
                    alt=""
                  />
                  <span className="font-display font-semibold uppercase tracking-wide">
                    {teamInfo.team_nick}
                  </span>
                </>
              ) : (
                <span className="font-display font-semibold uppercase tracking-wide text-muted-foreground">
                  NFL
                </span>
              )}
              <ChevronDown
                className="ml-1 h-3 w-3 opacity-40 transition-transform duration-150"
                style={{ transform: open ? 'rotate(180deg)' : undefined }}
              />
            </div>

            {/* Right bumper */}
            <button
              onClick={(e) => { e.stopPropagation(); cycle(1) }}
              className="flex h-9 w-7 items-center justify-center rounded-r-md border border-l-0 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
              style={{
                borderColor,
                borderBottomRightRadius: open ? 0 : undefined,
                borderBottomColor: open ? 'transparent' : borderColor,
              }}
              aria-label="Next team"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="center"
            sideOffset={-1}
            className="z-50 outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.98] data-[state=open]:zoom-in-[0.98] data-[side=bottom]:slide-in-from-top-1 duration-100"
            style={{
              width: 'var(--radix-popover-trigger-width)',
              borderColor,
              borderWidth: 1,
              borderStyle: 'solid',
              borderTop: 'none',
              borderRadius: '0 0 6px 6px',
              backgroundColor: 'var(--color-popover)',
            }}
          >
            <div
              className="max-h-[320px] overflow-y-auto py-1"
              style={{ scrollbarWidth: 'none' }}
            >
              {/* NFL reset */}
              <button
                onClick={() => { setTeam(null); setOpen(false) }}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 font-display text-xs font-semibold uppercase tracking-wider transition-colors hover:bg-accent cursor-pointer"
                style={
                  !selectedTeam ? { backgroundColor: 'var(--color-accent)' } : undefined
                }
              >
                <span className={!selectedTeam ? 'text-foreground' : 'text-muted-foreground'}>NFL</span>
                {!selectedTeam && <Check className="ml-auto h-3.5 w-3.5 text-foreground" />}
              </button>

              <div className="mx-2 my-1 h-px bg-border" />

              {CONFERENCE_ORDER.map((conf) =>
                DIVISION_ORDER.map((div) => {
                  const teams = NFL_GRID[conf][div]
                  return (
                    <div key={`${conf}-${div}`}>
                      <div className="px-3 pt-2 pb-0.5 font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
                        {conf} {div}
                      </div>

                      {teams.map((abbr) => {
                        const team = teamMap.get(abbr)
                        if (!team) return null
                        const isActive = abbr === selectedTeam
                        return (
                          <button
                            key={abbr}
                            onClick={() => { setTeam(abbr); setOpen(false) }}
                            className="flex w-full items-center gap-2.5 px-3 py-1.5 text-foreground transition-colors hover:bg-accent cursor-pointer"
                            style={{
                              backgroundColor: isActive ? `${team.team_color}15` : undefined,
                              borderLeft: `3px solid ${isActive ? team.team_color : 'transparent'}`,
                            }}
                          >
                            <img
                              src={team.team_logo_espn}
                              className="h-5 w-5 object-contain"
                              alt=""
                            />
                            <span className="font-display text-xs font-semibold uppercase tracking-wide">
                              {team.team_nick}
                            </span>
                            <span className="text-[10px] text-muted-foreground/40">
                              {abbr}
                            </span>
                            {isActive && (
                              <Check
                                className="ml-auto h-3.5 w-3.5"
                                style={{ color: team.team_color }}
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )
                }),
              )}
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {/* Clear button — outside the popover */}
      {selectedTeam && (
        <button
          onClick={() => setTeam(null)}
          className="ml-1.5 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          aria-label="Clear team selection"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
