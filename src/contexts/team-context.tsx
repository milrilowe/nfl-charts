import { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { useTeamsData } from '@/lib/nfl-queries'

export interface TeamInfo {
  team_abbr: string
  team_name: string
  team_nick: string
  team_conf: string
  team_division: string
  team_color: string
  team_color2: string
  team_logo_espn: string
}

export interface TeamContextValue {
  selectedTeam: string | null
  teamInfo: TeamInfo | null
  allTeams: TeamInfo[]
  setTeam: (abbr: string | null) => void
  isLoading: boolean
}

const TeamContext = createContext<TeamContextValue | null>(null)

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const teamsQuery = useTeamsData()

  const allTeams: TeamInfo[] = useMemo(() => {
    if (!teamsQuery.data?.data) return []
    return teamsQuery.data.data.map((row) => ({
      team_abbr: String(row.team_abbr ?? ''),
      team_name: String(row.team_name ?? ''),
      team_nick: String(row.team_nick ?? ''),
      team_conf: String(row.team_conf ?? ''),
      team_division: String(row.team_division ?? ''),
      team_color: String(row.team_color ?? '#6b7280'),
      team_color2: String(row.team_color2 ?? '#374151'),
      team_logo_espn: String(row.team_logo_espn ?? ''),
    }))
  }, [teamsQuery.data])

  const teamInfo = useMemo(() => {
    if (!selectedTeam) return null
    return allTeams.find((t) => t.team_abbr === selectedTeam) ?? null
  }, [selectedTeam, allTeams])

  const setTeam = useCallback((abbr: string | null) => {
    setSelectedTeam(abbr)
  }, [])

  const value: TeamContextValue = useMemo(
    () => ({ selectedTeam, teamInfo, allTeams, setTeam, isLoading: teamsQuery.isLoading }),
    [selectedTeam, teamInfo, allTeams, setTeam, teamsQuery.isLoading],
  )

  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>
}

export function useTeamContext(): TeamContextValue {
  const ctx = useContext(TeamContext)
  if (!ctx) throw new Error('useTeamContext must be used within TeamProvider')
  return ctx
}
