/**
 * Land Stack — GIS Frontend Service
 * SIH26014 | Integrated GIS-based Digital Public Infrastructure for Land Governance
 *
 * Provides viewport-aware BBOX-based spatial data fetching from the FastAPI GIS backend:
 * - fetchParcelsInBounds: Cadastral parcel BBOX query
 * - fetchVillagesInBounds: Village centroid points within viewport
 * - fetchBoundaries: Administrative boundary GeoJSON (district/taluk/village)
 */

import type { CadastralPolygon } from './landService';

// ── Config ───────────────────────────────────────────────────────────────────

const GIS_BASE = (import.meta as any).env?.VITE_GIS_API_URL || 'http://localhost:8000/api/v1/gis';

// ── Types ────────────────────────────────────────────────────────────────────

export interface MapBounds {
  minLng: number;
  minLat: number;
  maxLng: number;
  maxLat: number;
}

export interface GISVillageFeature {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: {
    village_id: string;
    village_name: string;
    taluk: string;
    district: string;
    state: string;
    parcel_count: number;
  };
}

export interface GISFeatureCollection {
  type: 'FeatureCollection';
  zoom?: number;
  count?: number;
  level?: string;
  features: any[];
}

// ── Internal: Generic BBOX fetcher ───────────────────────────────────────────

async function fetchGIS(
  endpoint: 'parcels' | 'villages' | 'boundaries',
  bounds: MapBounds,
  zoom: number,
  extra: Record<string, string | number> = {}
): Promise<GISFeatureCollection> {
  const params = new URLSearchParams({
    min_lng: String(bounds.minLng),
    min_lat: String(bounds.minLat),
    max_lng: String(bounds.maxLng),
    max_lat: String(bounds.maxLat),
    zoom: String(zoom),
    ...Object.fromEntries(Object.entries(extra).map(([k, v]) => [k, String(v)])),
  });

  const url = `${GIS_BASE}/${endpoint}?${params.toString()}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      console.warn(`[GIS] ${endpoint} returned HTTP ${res.status}`);
      return { type: 'FeatureCollection', features: [] };
    }

    return (await res.json()) as GISFeatureCollection;
  } catch (err) {
    console.warn(`[GIS] Failed to fetch ${endpoint}:`, err);
    return { type: 'FeatureCollection', features: [] };
  }
}

// ── 1. Parcel BBOX Query → CadastralPolygon[] ────────────────────────────────

export async function fetchParcelsInBounds(
  bounds: MapBounds,
  zoom: number
): Promise<CadastralPolygon[]> {
  if (zoom < 14) return [];

  const fc = await fetchGIS('parcels', bounds, zoom, { limit: 500 });
  const parcels: CadastralPolygon[] = [];

  for (const feature of fc.features) {
    try {
      const geom = feature.geometry;
      const props = feature.properties;
      if (!geom || geom.type !== 'Polygon') continue;

      const coordinates: [number, number][] = geom.coordinates[0].map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
      );
      if (coordinates.length < 3) continue;

      const latSum = coordinates.reduce((s: number, c: [number,number]) => s + c[0], 0);
      const lngSum = coordinates.reduce((s: number, c: [number,number]) => s + c[1], 0);
      const center: [number, number] = [latSum / coordinates.length, lngSum / coordinates.length];

      parcels.push({
        id: String(props.parcel_id || props.ulpin || Math.random()),
        surveyNo: props.survey_number || '',
        subDivision: props.subdivision_number || '',
        ulpin: props.ulpin || '',
        area: props.area || '0 Acre',
        ownerName: props.land_use || 'Agricultural Land',
        fatherName: '',
        ownershipType: 'Single',
        classification: props.land_use || 'Agricultural',
        pattaNo: '',
        marketValue: '',
        landUse: props.land_use || 'Agricultural',
        center,
        coordinates,
        village: props.village || '',
        taluk: props.taluk || '',
        district: props.district || '',
      } as CadastralPolygon);
    } catch (parseErr) {
      console.warn('[GIS] Failed to parse parcel feature:', parseErr);
    }
  }

  return parcels;
}

// ── 2. Village Centroid Query ─────────────────────────────────────────────────

export async function fetchVillagesInBounds(
  bounds: MapBounds,
  zoom: number
): Promise<GISVillageFeature[]> {
  if (zoom < 8 || zoom > 16) return [];
  const fc = await fetchGIS('villages', bounds, zoom, { limit: 300 });
  return fc.features as GISVillageFeature[];
}

// ── 3. Administrative Boundaries Query ───────────────────────────────────────

export async function fetchBoundaries(
  level: 'state' | 'district' | 'taluk' | 'village',
  bounds: MapBounds,
  zoom: number
): Promise<GISFeatureCollection> {
  return fetchGIS('boundaries', bounds, zoom, { level, limit: 200 });
}

// ── 4. Debounce Utility ───────────────────────────────────────────────────────

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delayMs: number
): T & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return debounced as T & { cancel: () => void };
}

// ── 5. Zoom → Boundary Level ─────────────────────────────────────────────────

export function getBoundaryLevelForZoom(
  zoom: number
): 'state' | 'district' | 'taluk' | 'village' | null {
  if (zoom < 7) return 'state';
  if (zoom < 10) return 'district';
  if (zoom < 13) return 'taluk';
  if (zoom < 16) return 'village';
  return null;
}
