"""
NFL Data Service - Purpose-built data access with server-side joins and aggregation
"""
import nfl_data_py as nfl
import pandas as pd
from typing import Any
from functools import lru_cache

# Columns to select from each raw dataset for the enriched join
SEASONAL_COLUMNS = [
    'player_id', 'season', 'completions', 'attempts',
    'passing_yards', 'passing_tds', 'interceptions',
    'carries', 'rushing_yards', 'rushing_tds',
    'receptions', 'targets', 'receiving_yards', 'receiving_tds',
    'fantasy_points', 'fantasy_points_ppr', 'tgt_sh', 'wopr_x', 'dom',
    'target_share', 'games',
]

ROSTER_COLUMNS = [
    'player_id', 'player_name', 'position', 'team', 'headshot_url',
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

# Raw dataset definitions for nfl_data_py
_DATASETS = {
    "seasonal": {
        "import_fn": "import_seasonal_data",
        "supports_years": True,
    },
    "rosters": {
        "import_fn": "import_seasonal_rosters",
        "supports_years": True,
    },
    "teams": {
        "import_fn": "import_team_desc",
        "supports_years": False,
    },
}


# ---------------------------------------------------------------------------
# Raw data fetching (cached)
# ---------------------------------------------------------------------------

@lru_cache(maxsize=32)
def _fetch_raw_cached(dataset_id: str, years_tuple: tuple[int, ...] | None) -> bytes:
    """Cached fetch that returns pickled DataFrame"""
    import pickle
    df = _fetch_raw(dataset_id, list(years_tuple) if years_tuple else None)
    return pickle.dumps(df)


def _fetch_dataset(dataset_id: str, years: list[int] | None) -> pd.DataFrame:
    """Fetch a raw dataset, using pickle cache"""
    import pickle
    years_tuple = tuple(years) if years else None
    pickled = _fetch_raw_cached(dataset_id, years_tuple)
    return pickle.loads(pickled)


def _fetch_raw(dataset_id: str, years: list[int] | None) -> pd.DataFrame:
    """Actually fetch from nfl_data_py"""
    info = _DATASETS[dataset_id]
    fn = getattr(nfl, info["import_fn"])
    kwargs = {}
    if info["supports_years"]:
        kwargs["years"] = years or [2023, 2024]
    return fn(**kwargs)


def _safe_columns(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    """Select only columns that exist in the DataFrame"""
    return df[[c for c in cols if c in df.columns]]


# ---------------------------------------------------------------------------
# Enriched player DataFrame (cached per year)
# ---------------------------------------------------------------------------

@lru_cache(maxsize=16)
def _build_enriched_df(year: int) -> bytes:
    """Join seasonal + rosters + teams into one enriched DataFrame. Cached per year."""
    import pickle

    seasonal = _safe_columns(_fetch_dataset("seasonal", [year]), SEASONAL_COLUMNS)
    rosters = _safe_columns(_fetch_dataset("rosters", [year]), ROSTER_COLUMNS)
    teams = _safe_columns(_fetch_dataset("teams", None), TEAM_COLUMNS)

    # Deduplicate rosters (keep first per player_id)
    rosters = rosters.drop_duplicates(subset='player_id', keep='first')

    # Join seasonal + rosters on player_id
    enriched = seasonal.merge(rosters, on='player_id', how='inner')

    # Join with teams on team → team_abbr
    enriched = enriched.merge(teams, left_on='team', right_on='team_abbr', how='left')

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
    teams_meta = _safe_columns(_fetch_dataset("teams", None), TEAM_COLUMNS)

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
    df = _safe_columns(_fetch_dataset("teams", None), TEAM_COLUMNS)
    df = df.fillna('')
    return {
        "data": df.to_dict(orient="records"),
    }


def clear_cache():
    """Clear all caches"""
    _fetch_raw_cached.cache_clear()
    _build_enriched_df.cache_clear()
