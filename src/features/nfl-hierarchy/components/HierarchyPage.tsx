import { useMemo } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { useHierarchyData } from '../hooks/use-hierarchy-data'
import { Breadcrumbs } from './Breadcrumbs'
import { LeagueView } from './LeagueView'
import { TeamView } from './TeamView'
import { PlayerView } from './PlayerView'
import type { HierarchySearch } from '../types'

interface HierarchyPageProps {
  search: HierarchySearch
  onSearchChange: (updates: Partial<HierarchySearch>) => void
}

export function HierarchyPage({ search, onSearchChange }: HierarchyPageProps) {
  const { players, teamLookup, teamMeta, isLoading, error } =
    useHierarchyData(search.year)

  // Find current team and player for breadcrumbs + views
  const currentTeam = search.team ? teamLookup.get(search.team) : undefined

  const teamPlayers = useMemo(
    () =>
      search.team ? players.filter((p) => p.team === search.team) : [],
    [players, search.team]
  )

  const currentPlayer = useMemo(
    () =>
      search.player
        ? players.find((p) => p.player_id === search.player)
        : undefined,
    [players, search.player]
  )

  const positionalPeers = useMemo(
    () =>
      currentPlayer
        ? players.filter((p) => p.position === currentPlayer.position)
        : [],
    [players, currentPlayer]
  )

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        Failed to load data: {error.message}
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Breadcrumbs */}
        <Breadcrumbs
          search={search}
          teamName={currentTeam?.team_name}
          playerName={currentPlayer?.player_name}
          onNavigate={onSearchChange}
        />

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 gap-8">
              <Skeleton className="h-80" />
              <Skeleton className="h-80" />
            </div>
          </div>
        ) : search.player && currentPlayer ? (
          <PlayerView
            player={currentPlayer}
            peers={positionalPeers}
            teamMeta={teamMeta}
            search={search}
          />
        ) : search.team && currentTeam ? (
          <TeamView
            team={currentTeam}
            players={teamPlayers}
            search={search}
            onSearchChange={onSearchChange}
            onSelectPlayer={(playerId) =>
              onSearchChange({ player: playerId })
            }
          />
        ) : (
          <LeagueView
            players={players}
            search={search}
            onSearchChange={onSearchChange}
            onSelectPlayer={(playerId, team) =>
              onSearchChange({ player: playerId, team })
            }
          />
        )}
      </div>
    </div>
  )
}
