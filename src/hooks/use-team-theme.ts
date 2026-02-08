import { useEffect } from 'react'
import { useTeamContext } from '@/contexts/team-context'

const DEFAULT_PRIMARY = '#06b6d4'
const DEFAULT_SECONDARY = '#0891b2'

export function useTeamTheme() {
  const { teamInfo } = useTeamContext()

  useEffect(() => {
    const root = document.documentElement
    const primary = teamInfo?.team_color || DEFAULT_PRIMARY
    const secondary = teamInfo?.team_color2 || DEFAULT_SECONDARY

    root.style.setProperty('--team-primary', primary)
    root.style.setProperty('--team-secondary', secondary)

    return () => {
      root.style.setProperty('--team-primary', DEFAULT_PRIMARY)
      root.style.setProperty('--team-secondary', DEFAULT_SECONDARY)
    }
  }, [teamInfo])

  // Preload team logo
  useEffect(() => {
    if (teamInfo?.team_logo_espn) {
      const img = new Image()
      img.src = teamInfo.team_logo_espn
    }
  }, [teamInfo])
}

export function useTeamColors() {
  const { teamInfo } = useTeamContext()
  return {
    primary: teamInfo?.team_color || DEFAULT_PRIMARY,
    secondary: teamInfo?.team_color2 || DEFAULT_SECONDARY,
  }
}
