import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useState,
  useCallback,
} from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type CadastralPolygon } from '../../services/landService';

// Fix Leaflet default marker icons for bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Types ──────────────────────────────────────────────────────────────────
export interface MapHandle {
  flyTo: (lat: number, lng: number, zoom?: number, label?: string) => void;
  fitBounds: (coords: [number, number][]) => void;
  resetView: () => void;
  setBaseLayer: (layerType: 'satellite' | 'streets' | 'topographic' | 'terrain') => void;
  selectSurveyNo: (surveyNo: string) => void;
}

interface RealMapProps {
  className?: string;
  baseLayer?: 'satellite' | 'streets' | 'topographic' | 'terrain';
  showCadastral?: boolean;
  selectedSurveyNo?: string;
  polygons?: CadastralPolygon[];
  onSelectParcel?: (polygon: CadastralPolygon) => void;
  showTools?: boolean;
  activeTool?: 'select' | 'pan' | 'zoom-in' | 'zoom-out' | 'full-extent' | 'identify';
  onToolChange?: (tool: 'select' | 'pan' | 'zoom-in' | 'zoom-out' | 'full-extent' | 'identify') => void;
  showKeyMap?: boolean;
  showScale?: boolean;
  activeLayers?: {
    villageBoundary?: boolean;
    surveyBoundaries?: boolean;
    parcels?: boolean;
    subDivision?: boolean;
    landUse?: boolean;
    landCover?: boolean;
    roads?: boolean;
    waterBodies?: boolean;
    governmentLand?: boolean;
    zoneBoundaries?: boolean;
  };
}

const ERODE_CENTER: L.LatLngTuple = [11.2740, 77.5870];

// ── Tile Layer Configurations with Deep Overzoom (maxZoom: 22) ─────────────
const TILE_CONFIGS = {
  satellite: {
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    maxNativeZoom: 19,
    maxZoom: 22,
  },
  streets: {
    // CartoDB Voyager: Google-Maps-style detailed global street & POI cartography
    base: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxNativeZoom: 19,
    maxZoom: 22,
    subdomains: ['a', 'b', 'c', 'd'],
  },
  topographic: {
    base: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap',
    maxNativeZoom: 17,
    maxZoom: 22,
    subdomains: ['a', 'b', 'c'],
  },
  terrain: {
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: USGS, Esri, TANA, DeLorme, and NPS',
    maxNativeZoom: 13,
    maxZoom: 22,
  },
};

// High-contrast labels & road overlays for Satellite / Terrain
const LABELS_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png';
const ROADS_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}';

const RealMap = forwardRef<MapHandle, RealMapProps>(({
  className,
  baseLayer = 'satellite',
  showCadastral = true,
  selectedSurveyNo = '',
  polygons = [],
  onSelectParcel,
  showTools = false,
  activeTool = 'select',
  onToolChange,
  showScale = true,
  activeLayers = {
    villageBoundary: true,
    surveyBoundaries: true,
    parcels: true,
    subDivision: true,
    landUse: true,
    landCover: false,
    roads: true,
    waterBodies: false,
    governmentLand: false,
    zoneBoundaries: false,
  },
}, ref) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const hybridPlacesLayerRef = useRef<L.TileLayer | null>(null);
  const hybridRoadsLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const polygonsGroupRef = useRef<L.FeatureGroup | null>(null);

  const [currentTool, setCurrentTool] = useState(activeTool);
  const [currentZoom, setCurrentZoom] = useState<number>(14);

  // ── Helper to build base tile layer ──────────────────────────────────────
  const createBaseLayer = useCallback((layerType: keyof typeof TILE_CONFIGS) => {
    const config = TILE_CONFIGS[layerType] || TILE_CONFIGS.streets;
    return L.tileLayer(config.base, {
      attribution: config.attribution,
      maxNativeZoom: config.maxNativeZoom,
      maxZoom: 22,
      subdomains: (config as any).subdomains || 'abc',
      crossOrigin: true,
      zIndex: 1,
    });
  }, []);

  // ── Helper to update hybrid reference overlays (places/roads) ────────────
  const syncReferenceOverlays = useCallback((map: L.Map, layerType: string, roadsEnabled = true) => {
    const isHybrid = layerType === 'satellite' || layerType === 'terrain';

    // Places, village names & street labels
    if (isHybrid) {
      if (!hybridPlacesLayerRef.current) {
        hybridPlacesLayerRef.current = L.tileLayer(LABELS_URL, {
          subdomains: ['a', 'b', 'c', 'd'],
          maxNativeZoom: 19,
          maxZoom: 22,
          zIndex: 10,
          opacity: 1.0,
          crossOrigin: true,
        }).addTo(map);
      }
    } else {
      if (hybridPlacesLayerRef.current) {
        map.removeLayer(hybridPlacesLayerRef.current);
        hybridPlacesLayerRef.current = null;
      }
    }

    // Roads & Transportation overlay
    if (isHybrid && roadsEnabled) {
      if (!hybridRoadsLayerRef.current) {
        hybridRoadsLayerRef.current = L.tileLayer(ROADS_URL, {
          maxNativeZoom: 19,
          maxZoom: 22,
          zIndex: 9,
          opacity: 0.85,
          crossOrigin: true,
        }).addTo(map);
      }
    } else {
      if (hybridRoadsLayerRef.current) {
        map.removeLayer(hybridRoadsLayerRef.current);
        hybridRoadsLayerRef.current = null;
      }
    }
  }, []);

  // ── Imperative ref methods ────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    flyTo: (lat: number, lng: number, zoom = 16, label = '') => {
      if (!mapInstanceRef.current) return;
      mapInstanceRef.current.flyTo([lat, lng], zoom, {
        animate: true,
        duration: 1.2,
      });

      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }

      const greenPin = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;">
            <div style="
              width: 28px; height: 28px;
              background: #125B50;
              border: 3px solid #ffffff;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 4px 14px rgba(18,91,80,0.6);
              display: flex; align-items: center; justify-content: center;
            ">
              <div style="
                width: 8px; height: 8px;
                background: #ffffff;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      const marker = L.marker([lat, lng], { icon: greenPin, zIndexOffset: 3000 })
        .addTo(mapInstanceRef.current!);

      if (label) {
        marker.bindPopup(
          `<div style="font-family:'Inter',system-ui,sans-serif;padding:6px 4px;min-width:160px;">
            <div style="font-weight:800;font-size:13px;color:#125B50;margin-bottom:3px;">${label}</div>
            <div style="font-size:11px;color:#6B7280;">📍 ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</div>
          </div>`,
          { offset: [0, -10], maxWidth: 220 }
        ).openPopup();
      }

      markerRef.current = marker;
    },

    fitBounds: (coords: [number, number][]) => {
      if (!mapInstanceRef.current || !coords || coords.length === 0) return;
      try {
        const bounds = L.latLngBounds(coords.map(c => L.latLng(c[0], c[1])));
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], animate: true, duration: 1.2, maxZoom: 17 });
      } catch (_) {}
    },

    resetView: () => {
      if (!mapInstanceRef.current) return;
      mapInstanceRef.current.flyTo(ERODE_CENTER, 14, { animate: true, duration: 1.2 });
    },

    setBaseLayer: (layerType: 'satellite' | 'streets' | 'topographic' | 'terrain') => {
      if (!mapInstanceRef.current) return;
      const map = mapInstanceRef.current;

      if (baseTileLayerRef.current) {
        map.removeLayer(baseTileLayerRef.current);
      }

      const newBase = createBaseLayer(layerType);
      newBase.addTo(map);
      baseTileLayerRef.current = newBase;

      syncReferenceOverlays(map, layerType, activeLayers.roads);

      if (polygonsGroupRef.current) {
        polygonsGroupRef.current.bringToFront();
      }
    },

    selectSurveyNo: (sNo: string) => {
      const activeList = polygons || [];
      const found = activeList.find(p => p.surveyNo === sNo || p.ulpin === sNo);
      if (found && mapInstanceRef.current) {
        mapInstanceRef.current.flyTo(found.center, 17, { animate: true, duration: 1.2 });
        if (onSelectParcel) onSelectParcel(found);
      }
    },
  }));

  // ── Initialize Leaflet Map ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: ERODE_CENTER,
      zoom: 14,
      minZoom: 5,
      maxZoom: 22,
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    });

    // Add Base Layer
    const baseTile = createBaseLayer(baseLayer);
    baseTile.addTo(map);
    baseTileLayerRef.current = baseTile;

    // Add Reference Overlays (Place labels & roads)
    syncReferenceOverlays(map, baseLayer, activeLayers.roads);

    // FeatureGroup for cadastral polygons
    const polyGroup = L.featureGroup().addTo(map);
    polygonsGroupRef.current = polyGroup;

    // Scale control
    if (showScale) {
      L.control.scale({ imperial: false, position: 'bottomleft' }).addTo(map);
    }

    // Zoom listener for vector layer level of detail
    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;
    setCurrentZoom(map.getZoom());

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      baseTileLayerRef.current = null;
      hybridPlacesLayerRef.current = null;
      hybridRoadsLayerRef.current = null;
      polygonsGroupRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // ── Base Layer change effect ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
    }

    const newBase = createBaseLayer(baseLayer);
    newBase.addTo(map);
    baseTileLayerRef.current = newBase;

    syncReferenceOverlays(map, baseLayer, activeLayers.roads);

    if (polygonsGroupRef.current) {
      polygonsGroupRef.current.bringToFront();
    }
  }, [baseLayer, createBaseLayer, syncReferenceOverlays, activeLayers.roads]);

  // ── Render Cadastral Polygons (GIS Overlay) ────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current || !polygonsGroupRef.current) return;

    polygonsGroupRef.current.clearLayers();

    // If cadastral layers disabled or no polygons, leave map clear of polygons (base map stays 100% active)
    if (!showCadastral || !activeLayers.parcels || !polygons || polygons.length === 0) {
      return;
    }

    // Draw polygons and survey labels
    const showLabels = activeLayers.surveyBoundaries !== false;

    polygons.forEach(poly => {
      const isSelected = Boolean(selectedSurveyNo && (poly.surveyNo === selectedSurveyNo || poly.ulpin === selectedSurveyNo));

      // Draw Polygon
      const leafletPoly = L.polygon(poly.coordinates, {
        color: isSelected ? '#10B981' : '#FFFFFF',
        weight: isSelected ? 3.5 : (currentZoom >= 16 ? 1.5 : 1.0),
        dashArray: isSelected ? undefined : '3, 4',
        fillColor: isSelected ? '#10B981' : '#000000',
        fillOpacity: isSelected ? 0.40 : 0.08,
        interactive: true,
      }).addTo(polygonsGroupRef.current!);

      // Survey number center label
      if (showLabels) {
        const labelIcon = L.divIcon({
          className: '',
          html: `
            <div style="
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              font-size: ${currentZoom >= 17 ? '11px' : '10px'};
              font-weight: 800;
              color: #ffffff;
              text-shadow: 0 1px 4px rgba(0,0,0,0.95), 0 0 8px rgba(0,0,0,0.9);
              letter-spacing: 0.02em;
              white-space: nowrap;
              display: flex;
              align-items: center;
              justify-content: center;
              pointer-events: none;
            ">
              ${poly.surveyNo}
            </div>
          `,
          iconSize: [60, 20],
          iconAnchor: [30, 10],
        });

        L.marker(poly.center, { icon: labelIcon, interactive: false, zIndexOffset: 1000 }).addTo(polygonsGroupRef.current!);
      }

      // Add prominent pin on selected parcel
      if (isSelected) {
        const pinIcon = L.divIcon({
          className: '',
          html: `
            <div style="
              width: 24px; height: 24px;
              background: #125B50;
              border: 2.5px solid #ffffff;
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              box-shadow: 0 4px 12px rgba(18,91,80,0.85);
              display: flex; align-items: center; justify-content: center;
            ">
              <div style="
                width: 6px; height: 6px;
                background: #ffffff;
                border-radius: 50%;
                transform: rotate(45deg);
              "></div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 24],
        });
        L.marker([poly.center[0] + 0.0003, poly.center[1] + 0.0004], { icon: pinIcon, zIndexOffset: 2000 }).addTo(polygonsGroupRef.current!);
      }

      // Click to select
      leafletPoly.on('click', () => {
        if (onSelectParcel) {
          onSelectParcel(poly);
        }
      });

      // Hover highlights
      leafletPoly.on('mouseover', () => {
        if (!isSelected) {
          leafletPoly.setStyle({
            weight: 2.5,
            color: '#4ECCA3',
            fillOpacity: 0.28,
            fillColor: '#4ECCA3',
          });
        }
      });

      leafletPoly.on('mouseout', () => {
        if (!isSelected) {
          leafletPoly.setStyle({
            color: '#FFFFFF',
            weight: currentZoom >= 16 ? 1.5 : 1.0,
            dashArray: '3, 4',
            fillColor: '#000000',
            fillOpacity: 0.08,
          });
        }
      });
    });

    polygonsGroupRef.current.bringToFront();
  }, [showCadastral, selectedSurveyNo, activeLayers, polygons, currentZoom, onSelectParcel]);

  // ── Map tool action handler ───────────────────────────────────────────────
  const handleToolClick = (tool: 'select' | 'pan' | 'zoom-in' | 'zoom-out' | 'full-extent' | 'identify') => {
    setCurrentTool(tool);
    if (onToolChange) onToolChange(tool);

    if (!mapInstanceRef.current) return;
    if (tool === 'zoom-in') mapInstanceRef.current.zoomIn();
    if (tool === 'zoom-out') mapInstanceRef.current.zoomOut();
    if (tool === 'full-extent') mapInstanceRef.current.flyTo(ERODE_CENTER, 14);
  };

  return (
    <div className={`relative overflow-hidden ${className || 'w-full h-full min-h-[450px]'}`}>
      {/* Main Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[450px]" />

      {/* Floating Map Tools (Left Side) */}
      {showTools && (
        <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200/80 p-2 flex flex-col gap-1 w-36 text-xs select-none">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Map Tools</div>

          <button
            type="button"
            onClick={() => handleToolClick('select')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              currentTool === 'select'
                ? 'bg-emerald-50 text-[#125B50] font-bold border border-emerald-200'
                : 'text-gray-700 hover:bg-gray-100/80'
            }`}
          >
            <svg className="w-4 h-4 text-[#125B50]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 3 7 18 3-7 7-3L3 3z" />
            </svg>
            <span>Select</span>
          </button>

          <button
            type="button"
            onClick={() => handleToolClick('pan')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              currentTool === 'pan'
                ? 'bg-emerald-50 text-[#125B50] font-bold border border-emerald-200'
                : 'text-gray-700 hover:bg-gray-100/80'
            }`}
          >
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8M6 14v-2a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6a7 7 0 0 0 7 7h3a7 7 0 0 0 7-7v-3" />
            </svg>
            <span>Pan</span>
          </button>

          <button
            type="button"
            onClick={() => handleToolClick('zoom-in')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-100/80 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span>Zoom In</span>
          </button>

          <button
            type="button"
            onClick={() => handleToolClick('zoom-out')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-100/80 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" />
            </svg>
            <span>Zoom Out</span>
          </button>

          <button
            type="button"
            onClick={() => handleToolClick('full-extent')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-100/80 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
            </svg>
            <span>Full Extent</span>
          </button>

          <button
            type="button"
            onClick={() => handleToolClick('identify')}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
              currentTool === 'identify'
                ? 'bg-emerald-50 text-[#125B50] font-bold border border-emerald-200'
                : 'text-gray-700 hover:bg-gray-100/80'
            }`}
          >
            <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
            <span>Identify</span>
          </button>
        </div>
      )}

      {/* Floating Zoom & Map Controls (Top-Right) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/80 overflow-hidden flex flex-col">
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="p-2 hover:bg-gray-100 text-gray-700 font-bold text-base flex items-center justify-center w-9 h-9 border-b border-gray-100 transition-colors cursor-pointer"
            title="Zoom In"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="p-2 hover:bg-gray-100 text-gray-700 font-bold text-base flex items-center justify-center w-9 h-9 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            &minus;
          </button>
        </div>

        <button
          type="button"
          onClick={() => mapInstanceRef.current?.flyTo(ERODE_CENTER, 14)}
          className="bg-white/95 backdrop-blur-md p-2 rounded-xl shadow-lg border border-gray-200/80 text-gray-700 hover:bg-gray-100 flex items-center justify-center w-9 h-9 transition-colors cursor-pointer"
          title="Center on Selection"
        >
          <svg className="w-4 h-4 text-[#125B50]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>

      {/* Mini Key Map (Bottom-Right) */}
      {showScale && (
        <div className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-mono text-gray-600 shadow-sm flex items-center gap-2">
          <span>Zoom: {currentZoom}x</span>
          <span className="text-gray-300">|</span>
          <span>EPSG:4326</span>
        </div>
      )}
    </div>
  );
});

RealMap.displayName = 'RealMap';

export default RealMap;