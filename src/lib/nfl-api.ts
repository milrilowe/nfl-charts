/**
 * NFL Data API — server functions that call the Python backend
 */
import { createServerFn } from '@tanstack/react-start'

const PYTHON_API = process.env.NFL_API_URL || 'http://localhost:8000'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EnrichedPlayer {
  player_id: string
  player_name: string
  position: string
  team: string
  headshot_url: string
  team_name: string
  team_nick: string
  team_conf: string
  team_division: string
  team_color: string
  team_color2: string
  team_logo_espn: string
  season: number
  completions: number
  attempts: number
  passing_yards: number
  passing_tds: number
  interceptions: number
  carries: number
  rushing_yards: number
  rushing_tds: number
  receptions: number
  targets: number
  receiving_yards: number
  receiving_tds: number
  fantasy_points: number
  fantasy_points_ppr: number
  tgt_sh: number
  wopr_x: number
  dom: number
  target_share: number
  games: number
  [statKey: string]: string | number
}

export interface PlayersResponse {
  year: number
  data: EnrichedPlayer[]
  total: number
  offset: number
  limit: number
  available_positions: string[]
  available_teams: string[]
}

export interface AggregatedTeam {
  team: string
  team_abbr: string
  team_name: string
  team_nick: string
  team_conf: string
  team_division: string
  team_color: string
  team_color2: string
  team_logo: string
  player_count: number
  completions: number
  attempts: number
  passing_yards: number
  passing_tds: number
  interceptions: number
  carries: number
  rushing_yards: number
  rushing_tds: number
  receptions: number
  targets: number
  receiving_yards: number
  receiving_tds: number
  fantasy_points: number
  fantasy_points_ppr: number
  total_yards: number
  total_tds: number
  [key: string]: string | number
}

export interface TeamsResponse {
  year: number
  data: AggregatedTeam[]
}

export interface TeamMeta {
  team_abbr: string
  team_name: string
  team_nick: string
  team_conf: string
  team_division: string
  team_color: string
  team_color2: string
  team_logo_espn: string
}

export interface TeamsMetaResponse {
  data: TeamMeta[]
}

// ---------------------------------------------------------------------------
// Server function params
// ---------------------------------------------------------------------------

export interface FetchPlayersParams {
  year: number
  sortBy?: string
  position?: string
  team?: string
  conference?: string
  playerId?: string
  limit?: number
  offset?: number
}

interface FetchTeamsParams {
  year: number
  team?: string
}

// ---------------------------------------------------------------------------
// Server functions — run on the Nitro server, call Python backend directly
// ---------------------------------------------------------------------------

export const fetchPlayers = createServerFn({ method: 'GET' })
  .inputValidator((params: FetchPlayersParams) => params)
  .handler(async ({ data: params }) => {
    const sp = new URLSearchParams()
    sp.set('year', String(params.year))
    if (params.sortBy) sp.set('sort_by', params.sortBy)
    if (params.position) sp.set('position', params.position)
    if (params.team) sp.set('team', params.team)
    if (params.conference) sp.set('conference', params.conference)
    if (params.playerId) sp.set('player_id', params.playerId)
    if (params.limit) sp.set('limit', String(params.limit))
    if (params.offset) sp.set('offset', String(params.offset))

    const res = await fetch(`${PYTHON_API}/players?${sp}`)
    if (!res.ok) throw new Error('Failed to fetch players')
    return (await res.json()) as PlayersResponse
  })

export const fetchTeams = createServerFn({ method: 'GET' })
  .inputValidator((params: FetchTeamsParams) => params)
  .handler(async ({ data: params }) => {
    const sp = new URLSearchParams({ year: String(params.year) })
    if (params.team) sp.set('team', params.team)

    const res = await fetch(`${PYTHON_API}/teams?${sp}`)
    if (!res.ok) throw new Error('Failed to fetch teams')
    return (await res.json()) as TeamsResponse
  })

export const fetchTeamsMeta = createServerFn({ method: 'GET' })
  .handler(async () => {
    const res = await fetch(`${PYTHON_API}/teams/meta`)
    if (!res.ok) throw new Error('Failed to fetch team metadata')
    return (await res.json()) as TeamsMetaResponse
  })
