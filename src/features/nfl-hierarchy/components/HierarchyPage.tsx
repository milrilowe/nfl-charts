import { Skeleton } from '@/components/ui/skeleton'
import { useHierarchyData } from '../hooks/use-hierarchy-data'
import { usePlayerDetail, useAvailableYears } from '@/lib/nfl-queries'
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
  const { teamLookup, teamMeta, isLoading, error } =
    useHierarchyData(search.year)
  const { data: yearsData } = useAvailableYears()
  const maxYear = yearsData?.latest ?? 2024

  // Player name for breadcrumbs — deduped with PlayerView's query by TanStack Query
  const playerDetail = usePlayerDetail(search.player ?? '', search.year, search.stat, {
    enabled: !!search.player,
  })

  const currentTeam = search.team ? teamLookup.get(search.team) : undefined

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
          playerName={playerDetail.data?.player?.player_name}
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
        ) : search.player ? (
          <PlayerView
            year={search.year}
            playerId={search.player}
            teamMeta={teamMeta}
            search={search}
          />
        ) : search.team && currentTeam ? (
          <TeamView
            team={currentTeam}
            year={search.year}
            search={search}
            onSearchChange={onSearchChange}
            onSelectPlayer={(playerId) =>
              onSearchChange({ player: playerId })
            }
          />
        ) : (
          <LeagueView
            year={search.year}
            maxYear={maxYear}
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
