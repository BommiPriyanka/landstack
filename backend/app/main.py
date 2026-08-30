"""
Land Stack — FastAPI Application Entry Point
SIH26014 | Integrated GIS-based Digital Public Infrastructure for Land Governance

NOTE: This is a prototype system. Synthetic/demo data is clearly labelled.
This system does not claim to be the official Government of India Land Stack.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.v1.router import api_router


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "**Land Stack** — Integrated GIS-based Digital Public Infrastructure for Land Governance.\n\n"
            "SIH 2026 Problem Statement SIH26014.\n\n"
            "> ⚠️ **PROTOTYPE / DEMO SYSTEM** — All parcel data is synthetic and clearly labelled. "
            "This system does not constitute legal verification or an official government platform."
        ),
        openapi_url="/api/openapi.json",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
    )

    # ── CORS ──────────────────────────────────────────────────────────────────
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Routers ───────────────────────────────────────────────────────────────
    application.include_router(api_router, prefix="/api/v1")

    # ── Health check ─────────────────────────────────────────────────────────
    @application.get("/health", tags=["system"])
    async def health_check():
        return JSONResponse(
            content={
                "status": "healthy",
                "system": settings.APP_NAME,
                "version": settings.APP_VERSION,
                "environment": settings.ENVIRONMENT,
                "notice": "PROTOTYPE — Synthetic demo data only",
            }
        )

    @application.get("/docs", include_in_schema=False)
    async def docs_redirect():
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url="/api/docs")

    @application.get("/", tags=["system"])
    async def root():
        return {
            "message": f"Welcome to {settings.APP_NAME}",
            "docs": "/api/docs",
            "health": "/health",
        }

    return application


app = create_application()
