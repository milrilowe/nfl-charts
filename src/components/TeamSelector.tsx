import { useState } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { useTeamContext } from '@/contexts/team-context'
import {
  NFL_GRID,
  CONFERENCE_ORDER,
  DIVISION_ORDER,
} from '@/features/nfl-hierarchy/constants'
import type { TeamInfo } from '@/contexts/team-context'

export function TeamSelector() {
  const [open, setOpen] = useState(false)
  const { selectedTeam, teamInfo, allTeams, setTeam, isLoading } =
    useTeamContext()

  const teamMap = new Map<string, TeamInfo>(
    allTeams.map((t) => [t.team_abbr, t]),
  )

  if (isLoading) {
    return (
      <div className="h-8 w-32 animate-pulse rounded-md bg-gray-700" />
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm text-gray-200 transition-all hover:bg-gray-700"
          style={teamInfo ? {
            borderColor: `${teamInfo.team_color}50`,
            backgroundColor: `${teamInfo.team_color}10`,
          } : {
            borderColor: 'rgb(75 85 99)',
            backgroundColor: 'rgba(55 65 81 / 0.5)',
          }}
        >
          {teamInfo ? (
            <>
              <img
                src={teamInfo.team_logo_espn}
                className="h-5 w-5 object-contain"
                alt=""
              />
              <span className="font-medium">{teamInfo.team_nick}</span>
            </>
          ) : (
            <span className="text-gray-400">All Teams</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
          {selectedTeam && (
            <span
              role="button"
              className="ml-0.5 rounded-sm p-0.5 hover:bg-gray-600"
              onClick={(e) => {
                e.stopPropagation()
                setTeam(null)
              }}
            >
              <X className="h-3 w-3" />
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search teams..." />
          <CommandList>
            <CommandEmpty>No team found.</CommandEmpty>
            <CommandItem
              onSelect={() => {
                setTeam(null)
                setOpen(false)
              }}
            >
              All Teams
              {!selectedTeam && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </CommandItem>
            <CommandSeparator />
            {CONFERENCE_ORDER.map((conf) =>
              DIVISION_ORDER.map((div) => {
                const teams = NFL_GRID[conf][div]
                return (
                  <CommandGroup
                    key={`${conf}-${div}`}
                    heading={`${conf} ${div}`}
                  >
                    {teams.map((abbr) => {
                      const team = teamMap.get(abbr)
                      if (!team) return null
                      return (
                        <CommandItem
                          key={abbr}
                          value={`${team.team_name} ${team.team_nick} ${abbr}`}
                          onSelect={() => {
                            setTeam(abbr)
                            setOpen(false)
                          }}
                        >
                          <img
                            src={team.team_logo_espn}
                            className="h-4 w-4 object-contain"
                            alt=""
                          />
                          <span>{team.team_name}</span>
                          {abbr === selectedTeam && (
                            <Check className="ml-auto h-4 w-4" />
                          )}
                        </CommandItem>
                      )
                    })}
                  </CommandGroup>
                )
              }),
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
