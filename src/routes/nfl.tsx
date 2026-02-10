import { createFileRoute, useNavigate, stripSearchParams } from '@tanstack/react-router'
import { z } from 'zod'
import { HierarchyPage } from '@/features/nfl-hierarchy'
import { useTeamSync } from '@/hooks/use-team-sync'
import { useAvailableYears } from '@/lib/nfl-queries'

const searchDefaults = {
  stat: 'total_yards',
  category: 'passing',
} as const

const hierarchySearch = z.object({
  year: z.number().int().min(1999).max(2030).optional().catch(undefined),
  team: z.string().optional().catch(undefined),
  player: z.string().optional().catch(undefined),
  stat: z.string().default(searchDefaults.stat).catch(searchDefaults.stat),
  category: z
    .enum(['passing', 'rushing', 'receiving'])
    .default(searchDefaults.category)
    .catch(searchDefaults.category),
})

export const Route = createFileRoute('/nfl')({
  validateSearch: hierarchySearch,
  search: {
    middlewares: [stripSearchParams(searchDefaults)],
  },
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const { data: yearsData } = useAvailableYears()
  const year = search.year ?? yearsData?.latest ?? 2024

  const handleSearchChange = (updates: Partial<typeof search>) =>
    navigate({ search: (prev) => ({ ...prev, ...updates }) })

  useTeamSync(search.team, (team) =>
    handleSearchChange({ team, player: undefined }),
  )

  return (
    <HierarchyPage search={{ ...search, year }} onSearchChange={handleSearchChange} />
  )
}
