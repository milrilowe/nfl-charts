"""
NFL Data API - Purpose-built endpoints for NFL statistics
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated

from data_service import (
    get_players, get_team_aggregates, get_teams_meta, clear_cache,
    get_leaderboards, get_team_roster, get_player_with_peers,
    get_available_years,
)

app = FastAPI(
    title="NFL Data API",
    description="API for accessing NFL statistics and data",
    version="0.2.0",
)

# CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Health check endpoint"""
    return {"status": "ok", "service": "nfl-data-api"}


@app.get("/years")
def available_years():
    """Return the latest year with available seasonal data."""
    return get_available_years()


@app.get("/players")
def players(
    year: Annotated[int, Query(ge=1999, le=2026)] = 2024,
    sort_by: Annotated[str | None, Query(description="Stat column to sort descending")] = None,
    position: Annotated[str | None, Query(description="Filter by position (e.g. QB, WR)")] = None,
    team: Annotated[str | None, Query(description="Filter by team (e.g. KC, BUF)")] = None,
    conference: Annotated[str | None, Query(description="Filter by conference (AFC, NFC)")] = None,
    player_id: Annotated[str | None, Query(description="Filter to a single player")] = None,
    limit: Annotated[int, Query(ge=1, le=5000)] = 500,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    """
    Get enriched player data (seasonal stats joined with roster and team info).
    Supports filtering by position, team, conference, or player_id.
    Results sorted descending by sort_by stat.
    """
    return get_players(
        year=year,
        sort_by=sort_by,
        position=position,
        team=team,
        conference=conference,
        player_id=player_id,
        limit=limit,
        offset=offset,
    )


@app.get("/leaderboards")
def leaderboards(
    year: Annotated[int, Query(ge=1999, le=2026)] = 2024,
    per_stat: Annotated[int, Query(ge=1, le=25)] = 5,
):
    """Get top N players for each leaderboard stat category in one response."""
    return get_leaderboards(year=year, per_stat=per_stat)


@app.get("/players/{player_id}")
def player_detail(
    player_id: str,
    year: Annotated[int, Query(ge=1999, le=2026)] = 2024,
    stat: Annotated[str, Query(description="Stat for peer ranking")] = "fantasy_points",
    peer_limit: Annotated[int, Query(ge=1, le=25)] = 10,
):
    """Get a single player's full stats plus positional peer comparison."""
    result = get_player_with_peers(
        player_id=player_id, year=year, stat=stat, peer_limit=peer_limit,
    )
    if result is None:
        raise HTTPException(status_code=404, detail="Player not found")
    return result


@app.get("/teams")
def teams(
    year: Annotated[int, Query(ge=1999, le=2026)] = 2024,
    team: Annotated[str | None, Query(description="Filter to a single team")] = None,
):
    """
    Get aggregated team stats (player stats summed per team with team metadata).
    """
    return get_team_aggregates(year=year, team=team)


@app.get("/teams/meta")
def teams_meta():
    """
    Get lightweight team metadata (colors, logos, conference/division) for theming.
    """
    return get_teams_meta()


@app.get("/teams/{team_abbr}/roster")
def team_roster(
    team_abbr: str,
    year: Annotated[int, Query(ge=1999, le=2026)] = 2024,
    sort_by: Annotated[str, Query(description="Stat to sort by")] = "fantasy_points",
):
    """Get a team's roster grouped by position with chart data."""
    return get_team_roster(team_abbr=team_abbr, year=year, sort_by=sort_by)


@app.post("/cache/clear")
def clear_data_cache():
    """Clear the data cache to force fresh data fetches"""
    clear_cache()
    return {"status": "cache cleared"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
