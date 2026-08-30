"""
Land Stack — GIS Endpoints
SIH26014 | Integrated GIS-based Digital Public Infrastructure for Land Governance

Provides BBOX-filtered spatial APIs for:
1. /api/v1/gis/boundaries (State, District, Taluk, Village boundaries)
2. /api/v1/gis/parcels    (Cadastral parcels with PostGIS ST_Intersects)
3. /api/v1/gis/villages   (Village centroids & locations with spatial filtering)
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
import json

from app.core.database import get_db

router = APIRouter(prefix="/gis", tags=["GIS Engine"])


# ── HELPER: BBOX VALIDATOR ───────────────────────────────────────────────────

def validate_bbox(
    min_lng: Optional[float],
    min_lat: Optional[float],
    max_lng: Optional[float],
    max_lat: Optional[float],
) -> Optional[Dict[str, float]]:
    """Validates BBOX coordinates and ensures valid latitude/longitude bounding box."""
    if min_lng is None and min_lat is None and max_lng is None and max_lat is None:
        return None

    if min_lng is None or min_lat is None or max_lng is None or max_lat is None:
        raise HTTPException(
            status_code=400,
            detail="Incomplete BBOX: min_lng, min_lat, max_lng, and max_lat must all be provided together.",
        )

    if not (-180 <= min_lng <= 180 and -180 <= max_lng <= 180):
        raise HTTPException(status_code=400, detail="Longitude values must be between -180 and 180.")

    if not (-90 <= min_lat <= 90 and -90 <= max_lat <= 90):
        raise HTTPException(status_code=400, detail="Latitude values must be between -90 and 90.")

    if min_lng > max_lng:
        raise HTTPException(status_code=400, detail="min_lng cannot be greater than max_lng.")

    if min_lat > max_lat:
        raise HTTPException(status_code=400, detail="min_lat cannot be greater than max_lat.")

    return {
        "min_lng": min_lng,
        "min_lat": min_lat,
        "max_lng": max_lng,
        "max_lat": max_lat,
    }


# ── 1. GET /api/v1/gis/boundaries ────────────────────────────────────────────

@router.get("/boundaries", summary="Get administrative boundaries within viewport")
async def get_boundaries(
    level: str = Query("district", description="Boundary level: state, district, taluk, or village"),
    min_lng: Optional[float] = Query(None, description="Minimum longitude of bounding box"),
    min_lat: Optional[float] = Query(None, description="Minimum latitude of bounding box"),
    max_lng: Optional[float] = Query(None, description="Maximum longitude of bounding box"),
    max_lat: Optional[float] = Query(None, description="Maximum latitude of bounding box"),
    zoom: Optional[int] = Query(None, ge=1, le=22, description="Current map zoom level"),
    limit: int = Query(200, ge=1, le=1000, description="Max feature count"),
    db: Session = Depends(get_db),
):
    """
    Returns administrative boundaries formatted as GeoJSON FeatureCollection.
    If spatial boundary tables exist in PostGIS, performs ST_Intersects BBOX query.
    Gracefully handles empty query results and boundary levels.
    """
    valid_levels = ["state", "district", "taluk", "village"]
    clean_level = level.strip().lower()
    if clean_level not in valid_levels:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid boundary level '{level}'. Must be one of: {', '.join(valid_levels)}",
        )

    bbox = validate_bbox(min_lng, min_lat, max_lng, max_lat)

    features: List[Dict[str, Any]] = []

    try:
        # Check if administrative_boundaries or districts table with geometry exists
        table_check = db.execute(
            text(
                "SELECT EXISTS ("
                "  SELECT 1 FROM information_schema.tables "
                "  WHERE table_schema = 'public' AND table_name = 'admin_boundaries'"
                ");"
            )
        ).scalar()

        if table_check:
            sql = """
                SELECT 
                    id, name, code, level,
                    ST_AsGeoJSON(geometry) as geojson
                FROM admin_boundaries
                WHERE level = :level
            """
            params: Dict[str, Any] = {"level": clean_level, "limit": limit}

            if bbox:
                sql += """
                    AND geometry && ST_MakeEnvelope(:min_lng, :min_lat, :max_lng, :max_lat, 4326)
                    AND ST_Intersects(geometry, ST_MakeEnvelope(:min_lng, :min_lat, :max_lng, :max_lat, 4326))
                """
                params.update(bbox)

            sql += " LIMIT :limit;"

            rows = db.execute(text(sql), params).fetchall()
            for r in rows:
                geom = json.loads(r.geojson) if r.geojson else None
                if geom:
                    features.append({
                        "type": "Feature",
                        "properties": {
                            "id": r.id,
                            "name": r.name,
                            "code": r.code,
                            "level": r.level,
                        },
                        "geometry": geom,
                    })

    except Exception:
        # If specific table doesn't exist yet, return clean empty FeatureCollection
        pass

    return {
        "type": "FeatureCollection",
        "level": clean_level,
        "zoom": zoom,
        "features": features,
    }


# ── 2. GET /api/v1/gis/parcels ───────────────────────────────────────────────

@router.get("/parcels", summary="Get visible cadastral parcels within map viewport BBOX")
async def get_parcels(
    min_lng: Optional[float] = Query(None, description="Minimum longitude of bounding box"),
    min_lat: Optional[float] = Query(None, description="Minimum latitude of bounding box"),
    max_lng: Optional[float] = Query(None, description="Maximum longitude of bounding box"),
    max_lat: Optional[float] = Query(None, description="Maximum latitude of bounding box"),
    zoom: Optional[int] = Query(None, ge=1, le=22, description="Current map zoom level"),
    limit: int = Query(500, ge=1, le=2000, description="Max feature count to protect performance"),
    db: Session = Depends(get_db),
):
    """
    Returns only cadastral parcels visible within the current map viewport BBOX using PostGIS spatial operators.
    Properties do NOT expose sensitive citizen personal data (e.g. Aadhaar/owner credentials).
    """
    bbox = validate_bbox(min_lng, min_lat, max_lng, max_lat)

    features: List[Dict[str, Any]] = []

    try:
        sql = """
            SELECT 
                id,
                ulpin,
                survey_number,
                subdivision_number,
                village_name,
                village_code,
                taluk,
                district,
                state,
                area,
                land_use,
                verification_status,
                ST_AsGeoJSON(geometry) as geojson
            FROM parcels
            WHERE geometry IS NOT NULL
        """
        params: Dict[str, Any] = {"limit": limit}

        if bbox:
            sql += """
                AND geometry && ST_MakeEnvelope(:min_lng, :min_lat, :max_lng, :max_lat, 4326)
                AND ST_Intersects(geometry, ST_MakeEnvelope(:min_lng, :min_lat, :max_lng, :max_lat, 4326))
            """
            params.update(bbox)

        sql += " LIMIT :limit;"

        rows = db.execute(text(sql), params).fetchall()

        for r in rows:
            geom = json.loads(r.geojson) if r.geojson else None
            if geom:
                features.append({
                    "type": "Feature",
                    "properties": {
                        "parcel_id": r.id,
                        "ulpin": r.ulpin,
                        "survey_number": r.survey_number,
                        "subdivision_number": r.subdivision_number,
                        "village": r.village_name,
                        "village_code": r.village_code,
                        "taluk": r.taluk,
                        "district": r.district,
                        "state": r.state,
                        "area": f"{r.area} Acre",
                        "area_acres": r.area,
                        "land_use": r.land_use,
                        "verification_status": str(r.verification_status),
                    },
                    "geometry": geom,
                })

    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail=f"Spatial parcel query failed: {str(err)}",
        )

    return {
        "type": "FeatureCollection",
        "zoom": zoom,
        "count": len(features),
        "features": features,
    }


# ── 3. GET /api/v1/gis/villages ──────────────────────────────────────────────

@router.get("/villages", summary="Get villages within viewport BBOX")
async def get_villages(
    min_lng: Optional[float] = Query(None, description="Minimum longitude of bounding box"),
    min_lat: Optional[float] = Query(None, description="Minimum latitude of bounding box"),
    max_lng: Optional[float] = Query(None, description="Maximum longitude of bounding box"),
    max_lat: Optional[float] = Query(None, description="Maximum latitude of bounding box"),
    zoom: Optional[int] = Query(None, ge=1, le=22, description="Current map zoom level"),
    limit: int = Query(300, ge=1, le=1000, description="Max feature count"),
    db: Session = Depends(get_db),
):
    """
    Returns villages within the viewport as a GeoJSON FeatureCollection with centroid Point geometry.
    Computes village spatial centroids dynamically using PostGIS ST_Centroid(ST_Collect(geometry))
    or distinct village parcel locations.
    """
    bbox = validate_bbox(min_lng, min_lat, max_lng, max_lat)

    features: List[Dict[str, Any]] = []

    try:
        sql = """
            SELECT 
                village_code,
                village_name,
                taluk,
                district,
                state,
                COUNT(id) as parcel_count,
                ST_AsGeoJSON(ST_Centroid(ST_Collect(geometry))) as centroid_geojson
            FROM parcels
            WHERE geometry IS NOT NULL
        """
        params: Dict[str, Any] = {"limit": limit}

        if bbox:
            sql += """
                AND geometry && ST_MakeEnvelope(:min_lng, :min_lat, :max_lng, :max_lat, 4326)
                AND ST_Intersects(geometry, ST_MakeEnvelope(:min_lng, :min_lat, :max_lng, :max_lat, 4326))
            """
            params.update(bbox)

        sql += """
            GROUP BY village_code, village_name, taluk, district, state
            LIMIT :limit;
        """

        rows = db.execute(text(sql), params).fetchall()

        for idx, r in enumerate(rows):
            geom = json.loads(r.centroid_geojson) if r.centroid_geojson else None
            if geom:
                features.append({
                    "type": "Feature",
                    "properties": {
                        "village_id": r.village_code or f"vil-{idx+1}",
                        "village_name": r.village_name,
                        "taluk": r.taluk,
                        "district": r.district,
                        "state": r.state,
                        "parcel_count": r.parcel_count,
                    },
                    "geometry": geom,
                })

    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail=f"Spatial village query failed: {str(err)}",
        )

    return {
        "type": "FeatureCollection",
        "zoom": zoom,
        "count": len(features),
        "features": features,
    }
