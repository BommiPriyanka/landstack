import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Ruler, Printer, Share2, ChevronDown, ArrowRight, Copy,
  ShieldCheck, Layers, Map as MapIcon,
} from 'lucide-react';
import RealMap, { type MapHandle } from '../common/RealMap';
import {
  getDistricts, getTaluks, getVillages, getNearbyParcels,
  getVillageCadastralParcels,
  type DBDistrict, type DBTaluk, type CadastralPolygon, type NearbyParcel,
  MOCK_CADASTRAL_POLYGONS,
} from '../../services/landService';
import { TamilNilamParcelModal } from '../common/TamilNilamParcelModal';

// ------ Types ---------------------------------------------------------------
interface ActiveLayers {
  villageBoundary: boolean;
  surveyBoundaries: boolean;
  parcels: boolean;
  subDivision: boolean;
  landUse: boolean;
  landCover: boolean;
  roads: boolean;
  waterBodies: boolean;
  governmentLand: boolean;
  zoneBoundaries: boolean;
}

// ===========================================================================
export function MapExplorerPage({ onOpenInMyParcels }: { onOpenInMyParcels?: (ulpin: string) => void }) {
  const mapRef = useRef<MapHandle>(null);

  // Filter dropdowns
  const [districts, setDistricts] = useState<DBDistrict[]>([]);
  const [taluks, setTaluks] = useState<DBTaluk[]>([]);
  const [villages, setVillages] = useState<string[]>([]);

  const [selectedDistrict, setSelectedDistrict] = useState('Erode');
  const [selectedTaluk, setSelectedTaluk] = useState('Perundurai');
  const [selectedVillage, setSelectedVillage] = useState('Ayigoundanpalayam');
  const [surveyInput, setSurveyInput] = useState('');
  const [baseMap, setBaseMap] = useState<'satellite' | 'streets' | 'topographic' | 'terrain'>('satellite');

  // Cadastral parcels for the current village
  const [villageParcels, setVillageParcels] = useState<CadastralPolygon[]>([]);

  // Map state
  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'zoom-in' | 'zoom-out' | 'full-extent' | 'identify'>('select');
  // selectedParcel is only set when user explicitly clicks a parcel
  const [selectedParcel, setSelectedParcel] = useState<CadastralPolygon | null>(null);
  const [nearbyParcels, setNearbyParcels] = useState<NearbyParcel[]>([]);
  const [copied, setCopied] = useState(false);

  // Tamil Nilam Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalParcel, setModalParcel] = useState<CadastralPolygon | null>(null);

  // Layer toggles
  const [layers, setLayers] = useState<ActiveLayers>({
    villageBoundary: true,
    surveyBoundaries: true,
    parcels: true,
    subDivision: true,
    landUse: true,
    landCover: false,
    roads: false,
    waterBodies: false,
    governmentLand: false,
    zoneBoundaries: false,
  });

  // ── Load Districts ──────────────────────────────────────────────────
  useEffect(() => {
    getDistricts().then(({ data }) => setDistricts(data));
  }, []);

  // ── Load Taluks when District changes ──────────────────────────────
  useEffect(() => {
    if (!selectedDistrict) return;
    getTaluks(selectedDistrict).then(data => {
      setTaluks(data);
      if (data.length > 0) {
        // If Erode, select Perundurai default, else first taluk
        const match = selectedDistrict.toLowerCase() === 'erode'
          ? data.find(t => t.name.toLowerCase() === 'perundurai') || data[0]
          : data[0];
        setSelectedTaluk(match.name);
      }
    });

    const d = districts.find(item => item.name === selectedDistrict);
    if (d && mapRef.current) {
      mapRef.current.flyTo(d.lat, d.lng, 11);
    }
  }, [selectedDistrict]);

  // ── Load Villages when Taluk changes ───────────────────────────────
  useEffect(() => {
    if (!selectedTaluk) return;
    getVillages(selectedDistrict, selectedTaluk).then(data => {
      setVillages(data);
      if (data.length > 0) {
        // If Perundurai, select Ayigoundanpalayam default, else first village
        const match = selectedTaluk.toLowerCase() === 'perundurai'
          ? data.find(v => v.toLowerCase().includes('goundanpalayam')) || data[0]
          : data[0];
        setSelectedVillage(match);
      }
    });

    const talukObj = taluks.find(t => t.name === selectedTaluk);
    if (talukObj && mapRef.current) {
      mapRef.current.flyTo(talukObj.lat, talukObj.lng, 14);
    }
  }, [selectedTaluk, selectedDistrict]);

  // ── Load Parcels & Fly to Village when Village changes ──────────────
  useEffect(() => {
    if (!selectedVillage) return;

    // Immediately clear previous village parcels and selection
    setVillageParcels([]);
    setSelectedParcel(null);
    setModalParcel(null);

    const talukObj = taluks.find(t => t.name === selectedTaluk);
    const centerCoords: [number, number] = talukObj ? [talukObj.lat, talukObj.lng] : [11.2740, 77.5870];

    // Query cadastral parcels for this village, then fitBounds to all parcel coords
    getVillageCadastralParcels(selectedDistrict, selectedTaluk, selectedVillage, centerCoords).then(parcels => {
      setVillageParcels(parcels);

      // Fit the map to all parcel extents so the user sees the whole village
      if (parcels && parcels.length > 0) {
        const allCoords: [number, number][] = parcels.flatMap(p => p.coordinates);
        if (allCoords.length > 0) {
          mapRef.current?.fitBounds(allCoords);
        } else {
          mapRef.current?.flyTo(centerCoords[0], centerCoords[1], 16);
        }
      } else {
        mapRef.current?.flyTo(centerCoords[0], centerCoords[1], 15);
      }
    });
  }, [selectedVillage, selectedTaluk, selectedDistrict]);

  // ── Load Nearby Parcels ─────────────────────────────────────────────
  const loadNearby = useCallback(async (poly?: CadastralPolygon) => {
    const nearby = await getNearbyParcels(selectedVillage, poly?.ulpin);
    setNearbyParcels(nearby);
  }, [selectedVillage]);

  useEffect(() => {
    loadNearby(selectedParcel || undefined);
  }, [selectedVillage, selectedParcel, loadNearby]);

  // ── Go to Survey/ULPIN ─────────────────────────────────────────────
  const handleGoTo = () => {
    const query = surveyInput.trim().toLowerCase();
    if (!query) return;

    const found = villageParcels.find(
      p => p.surveyNo.toLowerCase() === query || p.ulpin.toLowerCase().includes(query)
    );
    if (found) {
      setSelectedParcel(found);
      setModalParcel(found);
      setIsModalOpen(true);
      mapRef.current?.flyTo(found.center[0], found.center[1], 17, found.surveyNo);
    }
  };

  // ── Base Map Change ─────────────────────────────────────────────────
  const handleBaseMapChange = (type: 'satellite' | 'streets' | 'topographic' | 'terrain') => {
    setBaseMap(type);
    mapRef.current?.setBaseLayer(type);
  };

  // ── Copy ULPIN ──────────────────────────────────────────────────────
  const handleCopyUlpin = () => {
    if (!selectedParcel) return;
    navigator.clipboard.writeText(selectedParcel.ulpin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Toggle Layer ───────────────────────────────────────────────────
  const toggleLayer = (key: keyof ActiveLayers) => {
    setLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ── Handle Parcel Click (Highlight + Open Tamil Nilam Modal) ────────
  // NOTE: Do NOT call flyTo here — it would move the map under the modal.
  // The polygon click already centers/highlights the parcel on the Leaflet map internally.
  const handleSelectParcel = (poly: CadastralPolygon) => {
    if (poly && poly.ulpin) {
      setSelectedParcel(poly);
      setModalParcel(poly);
      setIsModalOpen(true);
      // Only softly center (no animation flyTo that would disorient) - just highlight
      // mapRef.current?.flyTo(poly.center[0], poly.center[1], 17); // Removed: disorients user
    }
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 animate-fadeIn">

      {/* ─── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
            <span className="hover:text-[#125B50] cursor-pointer transition-colors">Home</span>
            <ChevronDown className="w-3 h-3 rotate-[-90deg] text-gray-300" />
            <span className="text-gray-600">Map Explorer</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">Map Explorer</h1>
          <p className="text-xs text-gray-500 mt-0.5">Explore land parcels and related spatial information on interactive map</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-xs transition-all">
            <Ruler className="w-3.5 h-3.5 text-[#125B50]" />
            Measure
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-xs transition-all">
            <Printer className="w-3.5 h-3.5 text-gray-500" />
            Print / Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#125B50] hover:bg-[#0D4A41] shadow-sm shadow-[#125B50]/25 transition-all">
            <Share2 className="w-3.5 h-3.5" />
            Share Map
          </button>
        </div>
      </div>

      {/* ─── Filter Bar ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs px-5 py-4 flex flex-wrap items-end gap-3">
        {/* District */}
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">District</label>
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50] cursor-pointer appearance-none pr-8 transition-all"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
          >
            {districts.map(d => <option key={d.name} value={d.name}>{d.name}</option>)}
          </select>
        </div>

        {/* Taluk */}
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Taluk</label>
          <select
            value={selectedTaluk}
            onChange={e => setSelectedTaluk(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50] cursor-pointer appearance-none pr-8 transition-all"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
          >
            {taluks.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
          </select>
        </div>

        {/* Village */}
        <div className="flex flex-col gap-1.5 min-w-[200px]">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Village</label>
          <select
            value={selectedVillage}
            onChange={e => setSelectedVillage(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50] cursor-pointer appearance-none pr-8 transition-all"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
          >
            {villages.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        {/* Survey / ULPIN Go */}
        <div className="flex flex-col gap-1.5 flex-1 min-w-[220px]">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Go to Survey No / ULPIN</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={surveyInput}
              onChange={e => setSurveyInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGoTo()}
              placeholder="Enter Survey No / ULPIN"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50] transition-all"
            />
            <button
              onClick={handleGoTo}
              className="px-4 py-2 bg-[#125B50] text-white rounded-xl text-xs font-bold hover:bg-[#0D4A41] transition-all shadow-sm"
            >
              Go
            </button>
          </div>
        </div>

        {/* Base Map */}
        <div className="flex flex-col gap-1.5 min-w-[140px]">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Base Map</label>
          <select
            value={baseMap}
            onChange={e => handleBaseMapChange(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50] cursor-pointer appearance-none pr-8 transition-all"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center', backgroundSize: '14px' }}
          >
            <option value="satellite">Satellite</option>
            <option value="streets">Streets</option>
            <option value="topographic">Topographic</option>
            <option value="terrain">Terrain</option>
          </select>
        </div>
      </div>

      {/* ─── Main Map + Right Sidebar ──────────────────────────── */}
      <div className="flex gap-4" style={{ minHeight: 500 }}>

        {/* Interactive Map */}
        <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative" style={{ minHeight: 480 }}>
          <RealMap
            ref={mapRef}
            className="w-full h-full"
            baseLayer={baseMap}
            showCadastral={layers.parcels}
            selectedSurveyNo={selectedParcel?.surveyNo ?? ''}
            polygons={villageParcels}
            onSelectParcel={handleSelectParcel}
            showTools={true}
            activeTool={activeTool}
            onToolChange={setActiveTool}
            showKeyMap={true}
            showScale={true}
            activeLayers={layers}
          />
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col gap-3" style={{ width: 260, flexShrink: 0 }}>

          {/* Parcel Information Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">Parcel Information</span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> {selectedParcel ? 'Verified' : 'None Selected'}
              </span>
            </div>

            {selectedParcel ? (
              <>
                {/* ULPIN */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-[#125B50] tracking-tight">
                    {selectedParcel.ulpin}
                  </span>
                  <button
                    onClick={handleCopyUlpin}
                    className="text-gray-400 hover:text-[#125B50] transition-colors"
                    title="Copy ULPIN"
                  >
                    <Copy className={`w-3.5 h-3.5 ${copied ? 'text-emerald-500' : ''}`} />
                  </button>
                </div>

                {/* Info Grid */}
                <div className="flex flex-col gap-1.5 text-[11px]">
                  {[
                    { label: 'Survey No.', value: selectedParcel.surveyNo },
                    { label: 'Sub', value: selectedParcel.subDivision || selectedParcel.surveyNo },
                    { label: 'Village', value: selectedVillage },
                    { label: 'Area', value: selectedParcel.area },
                    { label: 'Land Use', value: selectedParcel.landUse },
                    { label: 'Ownership', value: selectedParcel.ownerName },
                    { label: 'Classification', value: selectedParcel.classification || 'Private Land' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span className="text-gray-400 font-medium shrink-0">{label}</span>
                      <span className="text-gray-800 font-semibold text-right leading-tight">{value}</span>
                    </div>
                  ))}

                  {/* ULPIN Status */}
                  <div className="flex justify-between items-center gap-2 mt-1">
                    <span className="text-gray-400 font-medium shrink-0">ULPIN Status</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Active</span>
                  </div>
                </div>

                {/* View Full Details — larger button */}
                <button
                  onClick={() => {
                    setModalParcel(selectedParcel);
                    setIsModalOpen(true);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-[#125B50] text-white text-xs font-bold hover:bg-[#0D4A41] transition-colors mt-1 cursor-pointer shadow-sm"
                >
                  View Full Details <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <p className="text-[11px] text-gray-400 py-2">
                Click a parcel on the map to view its details.
              </p>
            )}
          </div>

          {/* Nearby Parcels Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">Nearby Parcels</span>
              <button className="text-[10px] font-bold text-[#125B50] hover:underline">View All</button>
            </div>

            <div className="flex flex-col gap-1.5">
              {nearbyParcels.map(p => (
                <button
                  key={p.surveyNo}
                  onClick={() => {
                    const found = villageParcels.find((c: CadastralPolygon) => c.surveyNo === p.surveyNo);
                    if (found) handleSelectParcel(found);
                  }}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 hover:bg-emerald-50 hover:border-emerald-100 border border-transparent transition-all group"
                >
                  <span className="font-mono text-[11px] font-bold text-gray-700 group-hover:text-[#125B50]">{p.surveyNo}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-gray-500 font-medium">{p.area}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-300 -rotate-90 group-hover:text-[#125B50]" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Map Layers + Legend ──────────────────────────────────── */}
      <div className="flex gap-4">
        {/* Map Layers */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-xs p-5">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#125B50]" />
            <h3 className="text-sm font-bold text-gray-900">Map Layers</h3>
          </div>

          <div className="grid grid-cols-5 gap-4 text-[11px]">
            {/* Administrative */}
            <div>
              <div className="font-bold text-gray-600 mb-2 text-[10px] uppercase tracking-wider">Administrative Layers</div>
              {([
                { key: 'villageBoundary', label: 'Village Boundary' },
                { key: 'surveyBoundaries', label: 'Survey Boundaries' },
              ] as { key: keyof ActiveLayers; label: string }[]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 py-1 cursor-pointer group">
                  <div
                    onClick={() => toggleLayer(key)}
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all flex-shrink-0 cursor-pointer ${
                      layers[key] ? 'bg-[#125B50] border-[#125B50]' : 'bg-white border-gray-300'
                    }`}
                  >
                    {layers[key] && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 leading-tight">{label}</span>
                </label>
              ))}
            </div>

            {/* Parcel Layers */}
            <div>
              <div className="font-bold text-gray-600 mb-2 text-[10px] uppercase tracking-wider flex items-center gap-1">
                <MapIcon className="w-3 h-3 text-emerald-600" /> Parcel Layers
              </div>
              {([
                { key: 'parcels', label: 'Parcels' },
                { key: 'subDivision', label: 'Sub Division' },
              ] as { key: keyof ActiveLayers; label: string }[]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 py-1 cursor-pointer group">
                  <div
                    onClick={() => toggleLayer(key)}
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all flex-shrink-0 cursor-pointer ${
                      layers[key] ? 'bg-[#125B50] border-[#125B50]' : 'bg-white border-gray-300'
                    }`}
                  >
                    {layers[key] && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 leading-tight">{label}</span>
                </label>
              ))}
            </div>

            {/* Land Use */}
            <div>
              <div className="font-bold text-gray-600 mb-2 text-[10px] uppercase tracking-wider">Land Use / Land Cover</div>
              {([
                { key: 'landUse', label: 'Land Use' },
                { key: 'landCover', label: 'Land Cover' },
              ] as { key: keyof ActiveLayers; label: string }[]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 py-1 cursor-pointer group">
                  <div
                    onClick={() => toggleLayer(key)}
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all flex-shrink-0 cursor-pointer ${
                      layers[key] ? 'bg-[#125B50] border-[#125B50]' : 'bg-white border-gray-300'
                    }`}
                  >
                    {layers[key] && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 leading-tight">{label}</span>
                </label>
              ))}
            </div>

            {/* Infrastructure */}
            <div>
              <div className="font-bold text-gray-600 mb-2 text-[10px] uppercase tracking-wider">Infrastructure</div>
              {([
                { key: 'roads', label: 'Roads' },
                { key: 'waterBodies', label: 'Water Bodies' },
              ] as { key: keyof ActiveLayers; label: string }[]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 py-1 cursor-pointer group">
                  <div
                    onClick={() => toggleLayer(key)}
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all flex-shrink-0 cursor-pointer ${
                      layers[key] ? 'bg-[#125B50] border-[#125B50]' : 'bg-white border-gray-300'
                    }`}
                  >
                    {layers[key] && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 leading-tight">{label}</span>
                </label>
              ))}
            </div>

            {/* Other */}
            <div>
              <div className="font-bold text-gray-600 mb-2 text-[10px] uppercase tracking-wider">Other Layers</div>
              {([
                { key: 'governmentLand', label: 'Government Land' },
                { key: 'zoneBoundaries', label: 'Zone Boundaries' },
              ] as { key: keyof ActiveLayers; label: string }[]).map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 py-1 cursor-pointer group">
                  <div
                    onClick={() => toggleLayer(key)}
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all flex-shrink-0 cursor-pointer ${
                      layers[key] ? 'bg-[#125B50] border-[#125B50]' : 'bg-white border-gray-300'
                    }`}
                  >
                    {layers[key] && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-700 group-hover:text-gray-900 leading-tight">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5" style={{ width: 200, flexShrink: 0 }}>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Legend</h3>
          <div className="flex flex-col gap-2 text-[11px]">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-4 rounded-sm bg-emerald-500/60 border-2 border-emerald-500 flex-shrink-0"></div>
              <span className="text-gray-700 font-medium">Selected Parcel</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-4 rounded-sm bg-black/10 border border-dashed border-white flex-shrink-0"></div>
              <span className="text-gray-700 font-medium">Other Parcels</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-0 border-t-2 border-dashed border-gray-400 mt-2 flex-shrink-0"></div>
              <span className="text-gray-700 font-medium">Village Boundary</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tamil Nilam Land Parcel Modal Dialog ─────────────────── */}
      <TamilNilamParcelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        parcel={modalParcel || selectedParcel}
        onOpenMyParcels={onOpenInMyParcels}
      />
    </div>
  );
}
