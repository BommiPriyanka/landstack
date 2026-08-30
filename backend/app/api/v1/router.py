from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

from app.api.v1.endpoints.gis import router as gis_router
from app.api.v1.endpoints.admin import router as admin_router

api_router = APIRouter()
api_router.include_router(gis_router)
api_router.include_router(admin_router)


@api_router.get("/ping", tags=["system"])
async def ping():
    """Simple liveness check for the v1 API."""
    return {"ping": "pong", "api": "v1"}


class GISAttributesRequest(BaseModel):
    layer_id: int
    latitude: float
    longitude: float


@api_router.post("/tngis/attributes", tags=["TN GIS"])
async def get_tngis_attributes(request: GISAttributesRequest):

    tngis_url = "https://tngis.tn.gov.in/apps/gi_viewer_api/gi_mvc/api/v1/land-info"

    payload = {
        "case": "gis_attributes",
        "layer_id": request.layer_id,
        "latitude": request.latitude,
        "longitude": request.longitude,
    }

    headers = {
        "Content-Type": "application/json",
        "X-APP-NAME": "generic_viewer",
    }

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(
                tngis_url,
                json=payload,
                headers=headers,
            )

        return {
            "status_code": response.status_code,
            "data": response.json(),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"TN GIS API request failed: {str(e)}",
        )