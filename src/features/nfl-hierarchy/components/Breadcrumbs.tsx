import type { HierarchySearch } from '../types'

interface BreadcrumbsProps {
  search: HierarchySearch
  teamName?: string
  playerName?: string
  onNavigate: (updates: Partial<HierarchySearch>) => void
}

export function Breadcrumbs({
  search,
  teamName,
  playerName,
  onNavigate,
}: BreadcrumbsProps) {
  const crumbs: { label: string; onClick?: () => void }[] = []

  // League is always first
  if (search.team || search.player) {
    crumbs.push({
      label: 'League',
      onClick: () => onNavigate({ team: undefined, player: undefined }),
    })
  } else {
    crumbs.push({ label: 'League' })
  }

  // Team
  if (search.team) {
    if (search.player) {
      crumbs.push({
        label: teamName ?? search.team,
        onClick: () => onNavigate({ player: undefined }),
      })
    } else {
      crumbs.push({ label: teamName ?? search.team })
    }
  }

  // Player
  if (search.player) {
    crumbs.push({ label: playerName ?? 'Player' })
  }

  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-gray-600">/</span>}
          {crumb.onClick ? (
            <button
              onClick={crumb.onClick}
              className="text-gray-400 hover:text-cyan-400 transition-colors"
            >
              {crumb.label}
            </button>
          ) : (
            <span className="text-gray-200 font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
