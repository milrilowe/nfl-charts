"""
NFL Data Service - Purpose-built data access with server-side joins and aggregation
"""
import nflreadpy
import pandas as pd
from typing import Any
from functools import lru_cache

# Counting stats to sum when aggregating weekly → seasonal
SUM_STATS = [
    'completions', 'attempts', 'passing_yards', 'passing_tds',
    'passing_interceptions', 'carries', 'rushing_yards', 'rushing_tds',
    'receptions', 'targets', 'receiving_yards', 'receiving_tds',
    'fantasy_points', 'fantasy_points_ppr',
]

# Rate stats to average over games
MEAN_STATS = ['target_share', 'wopr']

# Player identity columns to keep (first value per group)
PLAYER_ID_COLS = ['player_name', 'position', 'team', 'headshot_url']

# Columns for the enriched output (after renames)
SEASONAL_COLUMNS = [
    'player_id', 'season', 'completions', 'attempts',
    'passing_yards', 'passing_tds', 'interceptions',
    'carries', 'rushing_yards', 'rushing_tds',
    'receptions', 'targets', 'receiving_yards', 'receiving_tds',
    'fantasy_points', 'fantasy_points_ppr', 'tgt_sh', 'wopr_x',
    'target_share', 'games',
]

TEAM_COLUMNS = [
    'team_abbr', 'team_name', 'team_nick', 'team_conf', 'team_division',
    'team_color', 'team_color2', 'team_logo_espn',
]

SUM_KEYS = [
    'completions', 'attempts', 'passing_yards', 'passing_tds', 'interceptions',
    'carries', 'rushing_yards', 'rushing_tds',
    'receptions', 'targets', 'receiving_yards', 'receiving_tds',
    'fantasy_points', 'fantasy_points_ppr',
]

# Stat keys for the league leaderboard endpoint
LEADERBOARD_STAT_KEYS = [
    'passing_yards', 'passing_tds', 'rushing_yards', 'rushing_tds',
    'receiving_yards', 'receiving_tds', 'receptions', 'fantasy_points',
]

LEADER_COLUMNS = ['player_id', 'player_name', 'position', 'team', 'headshot_url']

POSITION_ORDER = ['QB', 'RB', 'WR', 'TE', 'FB', 'K', 'P']

# All stat columns to include in roster player records
ROSTER_STAT_COLUMNS = [
    'player_id', 'player_name', 'headshot_url', 'position',
    'completions', 'attempts', 'passing_yards', 'passing_tds', 'interceptions',
    'carries', 'rushing_yards', 'rushing_tds',
    'receptions', 'targets', 'receiving_yards', 'receiving_tds',
    'fantasy_points', 'fantasy_points_ppr', 'tgt_sh', 'wopr_x',
    'target_share', 'games',
]

# All stat columns for a single player detail view
PLAYER_DETAIL_COLUMNS = [
    'player_id', 'player_name', 'position', 'team', 'headshot_url',
    'team_name', 'team_nick', 'team_conf', 'team_division',
    'season', 'completions', 'attempts',
    'passing_yards', 'passing_tds', 'interceptions',
    'carries', 'rushing_yards', 'rushing_tds',
    'receptions', 'targets', 'receiving_yards', 'receiving_tds',
    'fantasy_points', 'fantasy_points_ppr', 'tgt_sh', 'wopr_x',
    'target_share', 'games',
]


# ---------------------------------------------------------------------------
# Raw data fetching (cached)
# ---------------------------------------------------------------------------

@lru_cache(maxsize=32)
def _fetch_weekly_cached(year: int) -> bytes:
    """Fetch weekly player stats for a year via nflreadpy, cached as pickle."""
    import pickle
    df = nflreadpy.load_player_stats(seasons=[year]).to_pandas()
    return pickle.dumps(df)


@lru_cache(maxsize=4)
def _fetch_teams_cached() -> bytes:
    """Fetch team metadata via nflreadpy, cached as pickle."""
    import pickle
    df = nflreadpy.load_teams().to_pandas()
    return pickle.dumps(df)


def _get_weekly(year: int) -> pd.DataFrame:
    import pickle
    return pickle.loads(_fetch_weekly_cached(year))


def _get_teams_meta_df() -> pd.DataFrame:
    import pickle
    return pickle.loads(_fetch_teams_cached())


def _safe_columns(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    """Select only columns that exist in the DataFrame"""
    return df[[c for c in cols if c in df.columns]]


# ---------------------------------------------------------------------------
# Weekly → seasonal aggregation
# ---------------------------------------------------------------------------

def _aggregate_seasonal(weekly: pd.DataFrame) -> pd.DataFrame:
    """Aggregate weekly player stats into seasonal totals."""
    # Filter to regular season
    if 'season_type' in weekly.columns:
        weekly = weekly[weekly['season_type'] == 'REG']

    # Only keep rows with a player_id
    weekly = weekly[weekly['player_id'].notna() & (weekly['player_id'] != '')]

    # Build aggregation dict
    agg_dict: dict[str, Any] = {}
    for col in SUM_STATS:
        if col in weekly.columns:
            agg_dict[col] = 'sum'
    for col in MEAN_STATS:
        if col in weekly.columns:
            agg_dict[col] = 'mean'
    # Player identity: keep first (most recent team/name)
    for col in PLAYER_ID_COLS:
        if col in weekly.columns:
            agg_dict[col] = 'last'
    # Games played = number of weekly rows
    agg_dict['week'] = 'count'

    grouped = weekly.groupby(['player_id', 'season'], as_index=False).agg(agg_dict)

    # Rename for compatibility with existing frontend
    renames = {
        'week': 'games',
        'passing_interceptions': 'interceptions',
        'wopr': 'wopr_x',
    }
    grouped = grouped.rename(columns={k: v for k, v in renames.items() if k in grouped.columns})

    # Add tgt_sh alias for target_share
    if 'target_share' in grouped.columns:
        grouped['tgt_sh'] = grouped['target_share']

    return grouped


# ---------------------------------------------------------------------------
# Enriched player DataFrame (cached per year)
# ---------------------------------------------------------------------------

@lru_cache(maxsize=16)
def _build_enriched_df(year: int) -> bytes:
    """Build enriched seasonal DataFrame: aggregate weekly stats + team metadata."""
    import pickle

    weekly = _get_weekly(year)
    seasonal = _aggregate_seasonal(weekly)
    teams = _safe_columns(_get_teams_meta_df(), TEAM_COLUMNS)

    # Join with teams on team → team_abbr
    enriched = seasonal.merge(teams, left_on='team', right_on='team_abbr', how='left')

    # Drop players without a name
    enriched = enriched[enriched['player_name'].notna() & (enriched['player_name'] != '')]

    # Fill NaN: numbers with 0, strings with ""
    num_cols = enriched.select_dtypes(include='number').columns
    enriched[num_cols] = enriched[num_cols].fillna(0)
    enriched = enriched.fillna('')

    return pickle.dumps(enriched)


def _get_enriched(year: int) -> pd.DataFrame:
    """Get the enriched DataFrame for a year (unpickled from cache)"""
    import pickle
    return pickle.loads(_build_enriched_df(year))


# ---------------------------------------------------------------------------
# Public API functions
# ---------------------------------------------------------------------------

def get_players(
    year: int = 2024,
    sort_by: str | None = None,
    position: str | None = None,
    team: str | None = None,
    conference: str | None = None,
    player_id: str | None = None,
    limit: int = 500,
    offset: int = 0,
) -> dict[str, Any]:
    """Get enriched players with optional filter/sort/pagination"""
    df = _get_enriched(year)

    # Available filter values (from full dataset, before filtering)
    available_positions = sorted(df['position'].dropna().unique().tolist())
    available_teams = sorted(df['team'].dropna().unique().tolist())

    # Apply filters
    if position:
        df = df[df['position'] == position]
    if team:
        df = df[df['team'] == team]
    if conference:
        df = df[df['team_conf'] == conference]
    if player_id:
        df = df[df['player_id'] == player_id]

    total = len(df)

    # Sort
    if sort_by and sort_by in df.columns:
        df = df.sort_values(sort_by, ascending=False, na_position='last')

    # Paginate
    df = df.iloc[offset:offset + limit]

    return {
        "year": year,
        "data": df.to_dict(orient="records"),
        "total": total,
        "offset": offset,
        "limit": limit,
        "available_positions": available_positions,
        "available_teams": available_teams,
    }


def get_team_aggregates(year: int = 2024, team: str | None = None) -> dict[str, Any]:
    """Get aggregated team stats (player stats summed per team)"""
    enriched = _get_enriched(year)
    teams_meta = _safe_columns(_get_teams_meta_df(), TEAM_COLUMNS)

    # Sum stats by team
    agg = enriched.groupby('team')[SUM_KEYS].sum().reset_index()

    # Derived columns
    agg['total_yards'] = agg['passing_yards'] + agg['rushing_yards'] + agg['receiving_yards']
    agg['total_tds'] = agg['passing_tds'] + agg['rushing_tds'] + agg['receiving_tds']

    # Player count
    counts = enriched.groupby('team').size().reset_index(name='player_count')
    agg = agg.merge(counts, on='team')

    # Join team metadata
    agg = agg.merge(teams_meta, left_on='team', right_on='team_abbr', how='left')

    # Rename for frontend compat
    if 'team_logo_espn' in agg.columns:
        agg = agg.rename(columns={'team_logo_espn': 'team_logo'})

    if team:
        agg = agg[agg['team'] == team]

    # Fill NaN
    num_cols = agg.select_dtypes(include='number').columns
    agg[num_cols] = agg[num_cols].fillna(0)
    agg = agg.fillna('')

    return {
        "year": year,
        "data": agg.to_dict(orient="records"),
    }


def get_teams_meta() -> dict[str, Any]:
    """Get lightweight team metadata for theming/selectors"""
    df = _safe_columns(_get_teams_meta_df(), TEAM_COLUMNS)
    df = df.fillna('')
    return {
        "data": df.to_dict(orient="records"),
    }


def get_leaderboards(year: int = 2024, per_stat: int = 5) -> dict[str, Any]:
    """Get top N players for each leaderboard stat in a single response."""
    df = _get_enriched(year)
    leaders: dict[str, list[dict]] = {}
    for stat_key in LEADERBOARD_STAT_KEYS:
        if stat_key not in df.columns:
            leaders[stat_key] = []
            continue
        top = df.nlargest(per_stat, stat_key)
        available = [c for c in LEADER_COLUMNS if c in top.columns]
        records = top[available + [stat_key]].copy()
        records = records.rename(columns={stat_key: 'value'})
        leaders[stat_key] = records.to_dict(orient='records')
    return {"year": year, "leaders": leaders}


def get_team_roster(
    team_abbr: str,
    year: int = 2024,
    sort_by: str = 'fantasy_points',
) -> dict[str, Any]:
    """Get a team's roster grouped by position with chart data."""
    df = _get_enriched(year)
    team_df = df[df['team'] == team_abbr].copy()

    # Sort by requested stat
    if sort_by in team_df.columns:
        team_df = team_df.sort_values(sort_by, ascending=False, na_position='last')

    # Chart data: top 10
    chart_data = [
        {"name": row["player_name"], "value": float(row.get(sort_by, 0))}
        for _, row in team_df.head(10).iterrows()
    ]

    # Position groups with all stat columns
    available_cols = [c for c in ROSTER_STAT_COLUMNS if c in team_df.columns]
    groups = []
    seen_positions: set[str] = set()

    for pos in POSITION_ORDER:
        pos_df = team_df[team_df['position'] == pos]
        if pos_df.empty:
            continue
        seen_positions.add(pos)
        groups.append({
            "position": pos,
            "players": pos_df[available_cols].to_dict(orient='records'),
        })

    # Catch positions not in POSITION_ORDER
    remaining = team_df[~team_df['position'].isin(seen_positions)]
    for pos, pos_df in remaining.groupby('position'):
        groups.append({
            "position": pos,
            "players": pos_df[available_cols].to_dict(orient='records'),
        })

    return {
        "year": year,
        "team_abbr": team_abbr,
        "chart_data": chart_data,
        "position_groups": groups,
    }


def get_player_with_peers(
    player_id: str,
    year: int = 2024,
    stat: str = 'fantasy_points',
    peer_limit: int = 10,
) -> dict[str, Any] | None:
    """Get a single player's full stats plus positional peer comparison."""
    df = _get_enriched(year)
    player_row = df[df['player_id'] == player_id]
    if player_row.empty:
        return None

    player_record = player_row.iloc[0]
    available_cols = [c for c in PLAYER_DETAIL_COLUMNS if c in df.columns]
    player_dict = player_record[available_cols].to_dict()

    # Peer comparison by position
    position = player_record.get('position', '')
    peers_list: list[dict] = []
    if position and stat in df.columns:
        pos_df = df[df['position'] == position].nlargest(peer_limit, stat)
        player_in_peers = player_id in pos_df['player_id'].values
        peers_list = [
            {
                "player_id": row['player_id'],
                "player_name": row['player_name'],
                "value": float(row.get(stat, 0)),
                "is_target": row['player_id'] == player_id,
            }
            for _, row in pos_df.iterrows()
        ]
        if not player_in_peers:
            peers_list.append({
                "player_id": player_id,
                "player_name": str(player_record.get('player_name', '')),
                "value": float(player_record.get(stat, 0)),
                "is_target": True,
            })

    return {
        "year": year,
        "player": player_dict,
        "peers": peers_list,
    }


@lru_cache(maxsize=1)
def _detect_latest_year() -> int:
    """Probe nflreadpy from current year downward to find latest available seasonal data."""
    from datetime import date
    current = date.today().year
    for year in range(current, 1999, -1):
        try:
            df = nflreadpy.load_player_stats(seasons=[year])
            if len(df) > 0:
                return year
        except Exception:
            continue
    return 2024


def get_available_years() -> dict[str, int]:
    """Return the latest year with available seasonal data and the minimum year."""
    return {"latest": _detect_latest_year(), "min": 1999}


def clear_cache():
    """Clear all caches"""
    _fetch_weekly_cached.cache_clear()
    _fetch_teams_cached.cache_clear()
    _build_enriched_df.cache_clear()
    _detect_latest_year.cache_clear()
