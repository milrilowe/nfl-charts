"""
NFL Data Service - Wraps nfl_data_py to provide data access
"""
import nfl_data_py as nfl
import pandas as pd
from typing import Any
from functools import lru_cache

# Dataset definitions with metadata
DATASETS = {
    "weekly": {
        "name": "Weekly Player Stats",
        "description": "Weekly statistics for all players",
        "import_fn": "import_weekly_data",
        "supports_years": True,
        "min_year": 1999,
    },
    "seasonal": {
        "name": "Seasonal Player Stats",
        "description": "Season-aggregated statistics with market share metrics",
        "import_fn": "import_seasonal_data",
        "supports_years": True,
        "min_year": 1999,
    },
    "rosters": {
        "name": "Team Rosters",
        "description": "Player roster information by season",
        "import_fn": "import_seasonal_rosters",
        "supports_years": True,
        "min_year": 1999,
    },
    "schedules": {
        "name": "Game Schedules",
        "description": "Game schedules and results",
        "import_fn": "import_schedules",
        "supports_years": True,
        "min_year": 1999,
    },
    "teams": {
        "name": "Team Information",
        "description": "Team names, colors, logos, and metadata",
        "import_fn": "import_team_desc",
        "supports_years": False,
    },
    "draft_picks": {
        "name": "Draft Picks",
        "description": "Historical NFL draft picks",
        "import_fn": "import_draft_picks",
        "supports_years": True,
        "min_year": 1980,
    },
    "combine": {
        "name": "Combine Results",
        "description": "NFL Combine measurements and test results",
        "import_fn": "import_combine_data",
        "supports_years": True,
        "min_year": 2000,
    },
    "injuries": {
        "name": "Injury Reports",
        "description": "Weekly injury reports",
        "import_fn": "import_injuries",
        "supports_years": True,
        "min_year": 2009,
    },
    "ngs_passing": {
        "name": "Next Gen Stats - Passing",
        "description": "Advanced passing metrics from Next Gen Stats",
        "import_fn": "import_ngs_data",
        "import_args": {"stat_type": "passing"},
        "supports_years": True,
        "min_year": 2016,
    },
    "ngs_rushing": {
        "name": "Next Gen Stats - Rushing",
        "description": "Advanced rushing metrics from Next Gen Stats",
        "import_fn": "import_ngs_data",
        "import_args": {"stat_type": "rushing"},
        "supports_years": True,
        "min_year": 2016,
    },
    "ngs_receiving": {
        "name": "Next Gen Stats - Receiving",
        "description": "Advanced receiving metrics from Next Gen Stats",
        "import_fn": "import_ngs_data",
        "import_args": {"stat_type": "receiving"},
        "supports_years": True,
        "min_year": 2016,
    },
    "snap_counts": {
        "name": "Snap Counts",
        "description": "Player snap count data",
        "import_fn": "import_snap_counts",
        "supports_years": True,
        "min_year": 2012,
    },
    "qbr": {
        "name": "QBR Ratings",
        "description": "ESPN QBR quarterback ratings",
        "import_fn": "import_qbr",
        "supports_years": True,
        "min_year": 2006,
    },
}


def get_datasets() -> list[dict[str, Any]]:
    """Return list of available datasets with metadata"""
    return [
        {
            "id": dataset_id,
            "name": info["name"],
            "description": info["description"],
            "supports_years": info["supports_years"],
            "min_year": info.get("min_year"),
        }
        for dataset_id, info in DATASETS.items()
    ]


def get_dataset_schema(dataset_id: str, year: int | None = None) -> dict[str, Any]:
    """Get the schema (columns and types) for a dataset"""
    if dataset_id not in DATASETS:
        raise ValueError(f"Unknown dataset: {dataset_id}")

    # Fetch a small sample to get the schema
    sample_year = year or 2023
    df = _fetch_dataset(dataset_id, [sample_year], limit=1)

    columns = []
    for col in df.columns:
        dtype = str(df[col].dtype)
        col_type = "string"
        if "int" in dtype:
            col_type = "integer"
        elif "float" in dtype:
            col_type = "number"
        elif "bool" in dtype:
            col_type = "boolean"
        elif "datetime" in dtype:
            col_type = "datetime"

        columns.append({
            "name": col,
            "type": col_type,
            "dtype": dtype,
        })

    return {
        "dataset_id": dataset_id,
        "columns": columns,
        "total_columns": len(columns),
    }


def get_dataset_data(
    dataset_id: str,
    years: list[int] | None = None,
    columns: list[str] | None = None,
    limit: int = 100,
    offset: int = 0,
) -> dict[str, Any]:
    """Fetch data from a dataset with optional filtering"""
    if dataset_id not in DATASETS:
        raise ValueError(f"Unknown dataset: {dataset_id}")

    df = _fetch_dataset(dataset_id, years)

    total_rows = len(df)

    # Select specific columns if requested
    if columns:
        available_cols = [c for c in columns if c in df.columns]
        if available_cols:
            df = df[available_cols]

    # Apply pagination
    df = df.iloc[offset:offset + limit]

    # Convert to records, handling NaN values
    df = df.fillna("")
    records = df.to_dict(orient="records")

    return {
        "dataset_id": dataset_id,
        "columns": list(df.columns),
        "data": records,
        "total_rows": total_rows,
        "offset": offset,
        "limit": limit,
    }


@lru_cache(maxsize=32)
def _fetch_dataset_cached(dataset_id: str, years_tuple: tuple[int, ...] | None) -> bytes:
    """Cached version that returns pickled DataFrame"""
    import pickle
    df = _fetch_dataset_uncached(dataset_id, list(years_tuple) if years_tuple else None)
    return pickle.dumps(df)


def _fetch_dataset(dataset_id: str, years: list[int] | None, limit: int | None = None) -> pd.DataFrame:
    """Fetch dataset, using cache when possible"""
    import pickle
    years_tuple = tuple(years) if years else None
    pickled = _fetch_dataset_cached(dataset_id, years_tuple)
    df = pickle.loads(pickled)
    if limit:
        df = df.head(limit)
    return df


def _fetch_dataset_uncached(dataset_id: str, years: list[int] | None) -> pd.DataFrame:
    """Actually fetch the dataset from nfl_data_py"""
    info = DATASETS[dataset_id]
    fn_name = info["import_fn"]
    fn = getattr(nfl, fn_name)

    # Build arguments
    kwargs = info.get("import_args", {}).copy()

    if info["supports_years"]:
        if years:
            kwargs["years"] = years
        else:
            # Default to recent years
            kwargs["years"] = [2023, 2024]

    df = fn(**kwargs)
    return df


def clear_cache():
    """Clear the data cache"""
    _fetch_dataset_cached.cache_clear()
