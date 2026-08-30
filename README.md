# LAND STACK — Integrated GIS-based Digital Public Infrastructure for Land Governance

> **Smart India Hackathon 2026 — Problem Statement SIH26014**  
> *A scalable, parcel-centric DPI integrating fragmented land governance datasets across Tamil Nadu.*

---

## 🏛️ Project Overview

Land governance in India involves multiple institutions maintaining disconnected records (Cadastral GIS, Revenue RoR, Registration, Municipal Property Tax, Master Plan Zoning, Building Permissions, Encumbrances, and Civil Court Disputes). 

**Land Stack** eliminates these silos by anchoring every government record around a common **Unique Land Parcel Identification Number (ULPIN)** and an interactive **GIS Cadastral Map**.

```
                           ULPIN (Common Anchor)
                                     │
    ┌──────────────┬─────────────────┼─────────────────┬──────────────┐
    ▼              ▼                 ▼                 ▼              ▼
Cadastral GIS  Revenue (RoR)    Registration      Municipal Tax    Planning & Legal
(Boundaries)   (Patta/Chitta)   (Deeds & EC)      (Dues & Assess)  (Zoning/Permits/Disputes)
```

---

## 🚀 Quick Start

### Option 1: Full Stack with Docker Compose (Recommended)

```bash
# Start PostGIS, FastAPI backend, and Next.js frontend
docker compose up --build
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **FastAPI OpenAPI Swagger**: [http://localhost:8000/api/docs](http://localhost:8000/api/docs)
- **PostGIS Database**: `localhost:5432` (`landstack_db`)

### Option 2: Running Locally

#### 1. Backend (FastAPI + Python 3.11+)
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend (Next.js 14 + Tailwind + Leaflet)
```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Repository Structure

```
land-stack/
├── frontend/                # Next.js 14 App Router, Tailwind CSS, Leaflet.js
├── backend/                 # FastAPI, SQLAlchemy 2.0, GeoAlchemy2, Pydantic
├── data/                    # Open spatial boundary files & synthetic parcel data
├── docs/                    # Architecture diagrams, ER models, API specs
├── docker/                  # Dockerfiles and PostGIS startup scripts
├── docker-compose.yml       # 1-command orchestration
└── README.md
```

---

## ⚠️ Prototype Disclaimer
*This repository is a prototype demonstration developed for SIH 2026 (SIH26014). All parcel records and ULPIN values are synthetic demo datasets clearly labeled as `[DEMO DATA]`. It does not expose private citizen information or claim to be the official Government of India system.*
