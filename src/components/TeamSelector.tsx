import { ChevronDown } from 'lucide-react'
import { useTeamContext } from '@/contexts/team-context'

interface TeamSelectorProps {
  open: boolean
  onToggle: () => void
}

export function TeamSelector({ open, onToggle }: TeamSelectorProps) {
  const { teamInfo, isLoading } = useTeamContext()

  if (isLoading) {
    return <div className="h-8 w-60 animate-pulse rounded bg-muted" />
  }

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2.5 min-w-60 cursor-pointer transition-opacity duration-150 hover:opacity-70"
    >
      {teamInfo ? (
        <>
          <img
            src={teamInfo.team_logo_espn}
            className="h-8 w-8 object-contain drop-shadow-md"
            alt=""
          />
          <span className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
            {teamInfo.team_name}
          </span>
        </>
      ) : (
        <span className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
          NFL
        </span>
      )}
      <ChevronDown
        className="h-4 w-4 text-muted-foreground transition-transform duration-200"
        style={{ transform: open ? 'rotate(180deg)' : undefined }}
      />
    </button>
  )
}
