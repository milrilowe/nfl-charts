import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { LeaderboardsPage } from '@/features/leaderboards'

const leaderboardSearch = z.object({
  year: z.number().int().min(1999).max(2026).default(2024).catch(2024),
  category: z
    .enum(['passing', 'rushing', 'receiving'])
    .default('passing')
    .catch('passing'),
  stat: z.string().default('passing_yards').catch('passing_yards'),
  topN: z.number().int().min(5).max(50).default(15).catch(15),
  position: z.string().optional().catch(undefined),
  team: z.string().optional().catch(undefined),
  conference: z
    .enum(['AFC', 'NFC'])
    .optional()
    .catch(undefined),
})

export const Route = createFileRoute('/leaderboards')({
  validateSearch: leaderboardSearch,
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })

  return (
    <LeaderboardsPage
      search={search}
      onSearchChange={(updates) =>
        navigate({ search: (prev) => ({ ...prev, ...updates }) })
      }
    />
  )
}
