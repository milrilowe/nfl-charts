"""
NFL Data API - FastAPI service for accessing NFL data
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Annotated

from data_service import (
    get_datasets,
    get_dataset_schema,
    get_dataset_data,
    clear_cache,
    DATASETS,
)

app = FastAPI(
    title="NFL Data API",
    description="API for accessing NFL statistics and data",
    version="0.1.0",
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


@app.get("/datasets")
def list_datasets():
    """List all available datasets"""
    return {"datasets": get_datasets()}


@app.get("/datasets/{dataset_id}/schema")
def dataset_schema(dataset_id: str):
    """Get the schema (columns and types) for a dataset"""
    if dataset_id not in DATASETS:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found")

    try:
        return get_dataset_schema(dataset_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/datasets/{dataset_id}/data")
def dataset_data(
    dataset_id: str,
    years: Annotated[str | None, Query(description="Comma-separated years (e.g., 2023,2024)")] = None,
    columns: Annotated[str | None, Query(description="Comma-separated column names")] = None,
    limit: Annotated[int, Query(ge=1, le=10000)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    """
    Fetch data from a dataset with optional filtering.

    - **years**: Comma-separated list of years (e.g., "2023,2024")
    - **columns**: Comma-separated list of columns to include
    - **limit**: Maximum number of rows to return (default: 100, max: 10000)
    - **offset**: Number of rows to skip for pagination
    """
    if dataset_id not in DATASETS:
        raise HTTPException(status_code=404, detail=f"Dataset '{dataset_id}' not found")

    # Parse years
    years_list = None
    if years:
        try:
            years_list = [int(y.strip()) for y in years.split(",")]
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid years format. Use comma-separated integers.")

    # Parse columns
    columns_list = None
    if columns:
        columns_list = [c.strip() for c in columns.split(",")]

    try:
        return get_dataset_data(
            dataset_id=dataset_id,
            years=years_list,
            columns=columns_list,
            limit=limit,
            offset=offset,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/cache/clear")
def clear_data_cache():
    """Clear the data cache to force fresh data fetches"""
    clear_cache()
    return {"status": "cache cleared"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
