import { useEffect } from 'react'
import { useTeamContext } from '@/contexts/team-context'

/**
 * Bidirectional sync between TeamContext and a route's `team` search param.
 *
 * - Route → context: when route param changes (page interaction, direct URL, back/forward)
 * - Context → route: when header dropdown changes team
 *
 * Equality guards prevent infinite loops.
 */
export function useTeamSync(
  routeTeam: string | undefined,
  setRouteTeam: (team: string | undefined) => void,
) {
  const { selectedTeam, setTeam } = useTeamContext()

  // Route param → context
  useEffect(() => {
    const rt = routeTeam ?? null
    if (rt !== selectedTeam) {
      setTeam(rt)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeTeam])

  // Context → route param
  useEffect(() => {
    const ct = selectedTeam ?? undefined
    if (ct !== routeTeam) {
      setRouteTeam(ct)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeam])
}
