import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Search,
  RotateCcw,
  Download,
  MapPin,
  Eye,
  ChevronLeft,
  ChevronRight,
  Layers,
  Info,
  Lock,
  CheckCircle2,
  ChevronRight as CRIcon,
  Navigation,
} from 'lucide-react';
import RealMap, { type MapHandle } from '../common/RealMap';
import {
  searchParcels,
  getDistricts,
  getTaluks,
  getVillages,
  type ParcelRecord,
  type DBDistrict,
  type DBTaluk
} from '../../services/landService';
import { TamilNilamParcelModal } from '../common/TamilNilamParcelModal';

// ─── SearchLandPage ──────────────────────────────────────────────────
export const SearchLandPage: React.FC = () => {
  const mapRef = useRef<MapHandle>(null);

  const [activeTab, setActiveTab] = useState<'ulpin' | 'survey' | 'owner' | 'location'>('ulpin');

  // Form state
  const [ulpin, setUlpin]                       = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedTaluk, setSelectedTaluk]       = useState('');
  const [selectedVillage, setSelectedVillage]   = useState('');
  const [includeSubDiv, setIncludeSubDiv]       = useState(true);
  const [surveyNo, setSurveyNo]                 = useState('');
  const [ownerName, setOwnerName]               = useState('');
  const [locationText, setLocationText]         = useState('');

  // Dynamic Geographic Lists from Database
  const [districtsList, setDistrictsList] = useState<DBDistrict[]>([]);
  const [taluksList, setTaluksList]       = useState<DBTaluk[]>([]);
  const [villagesList, setVillagesList]   = useState<string[]>([]);
  const [loadingGeo, setLoadingGeo]       = useState(false);

  // Results
  const [results, setResults]           = useState<ParcelRecord[]>([]);
  const [dataSource, setDataSource]     = useState<'supabase' | 'local'>('local');
  const [searched, setSearched]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [selectedParcel, setSelectedParcel] = useState('');
  const [page, setPage]                 = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [modalParcel, setModalParcel]   = useState<ParcelRecord | null>(null);

  // ── Load Districts from Database on mount ────────────────────────
  useEffect(() => {
    async function loadDistricts() {
      const res = await getDistricts();
      setDistrictsList(res.data);
    }
    loadDistricts();
  }, []);

  // ── Change handlers — query database & fly map on every change ──
  const handleDistrictChange = useCallback(async (val: string) => {
    setSelectedDistrict(val);
    setSelectedTaluk('');
    setSelectedVillage('');
    setTaluksList([]);
    setVillagesList([]);

    if (!val) return;

    // Find district coordinates and fly map
    const d = districtsList.find(item => item.name === val);
    if (d && mapRef.current) {
      mapRef.current.flyTo(d.lat, d.lng, 10, `${d.name} District`);
    }

    // Fetch taluks for this district from database
    setLoadingGeo(true);
    const taluks = await getTaluks(val);
    setTaluksList(taluks);
    setLoadingGeo(false);
  }, [districtsList]);

  const handleTalukChange = useCallback(async (val: string) => {
    setSelectedTaluk(val);
    setSelectedVillage('');
    setVillagesList([]);

    if (!val) return;

    // Find taluk coordinates and fly map
    const t = taluksList.find(item => item.name === val);
    if (t && mapRef.current) {
      mapRef.current.flyTo(t.lat, t.lng, 12, `${val} Taluk`);
    }

    // Fetch villages for this taluk from database
    setLoadingGeo(true);
    const villages = await getVillages(selectedDistrict, val);
    setVillagesList(villages);
    setLoadingGeo(false);
  }, [selectedDistrict, taluksList]);

  const handleVillageChange = useCallback(async (val: string) => {
    setSelectedVillage(val);
    if (!val) return;

    const t = taluksList.find(item => item.name === selectedTaluk);

    // Geocode village with Nominatim for pinpoint GPS
    try {
      const query = encodeURIComponent(`${val}, ${selectedTaluk}, ${selectedDistrict}, Tamil Nadu, India`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=in`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'LandStack-App/1.0' } }
      );
      const data = await res.json();
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        mapRef.current?.flyTo(lat, lon, 14, val);
        return;
      }
    } catch (_) { /* fallback to taluk coords */ }

    if (t && mapRef.current) {
      mapRef.current.flyTo(t.lat, t.lng, 13, val);
    }
  }, [selectedDistrict, selectedTaluk, taluksList]);

  // ── Search ───────────────────────────────────────────────────────
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const filters = {
      ulpin: activeTab === 'ulpin' ? ulpin : undefined,
      surveyNo: activeTab === 'survey' ? surveyNo : undefined,
      ownerName: activeTab === 'owner' ? ownerName : undefined,
      district: selectedDistrict || undefined,
      taluk: selectedTaluk || undefined,
      village: selectedVillage || undefined,
    };

    const res = await searchParcels(filters);
    setResults(res.data);
    setDataSource(res.source);
    setSearched(true);
    setLoading(false);
    setPage(1);

    if (res.data.length > 0) {
      const first = res.data[0];
      mapRef.current?.flyTo(first.lat, first.lng, 15, `${first.village} — ${res.data.length} Parcels Found`);
    }
  };

  const handleReset = () => {
    setUlpin(''); setSelectedDistrict(''); setSelectedTaluk(''); setSelectedVillage('');
    setIncludeSubDiv(true); setSurveyNo(''); setOwnerName(''); setLocationText('');
    setResults([]); setSearched(false); setSelectedParcel('');
    mapRef.current?.resetView();
  };

  const handleParcelClick = (row: ParcelRecord) => {
    setSelectedParcel(row.ulpin);
    setModalParcel(row);
    setIsModalOpen(true);
    mapRef.current?.flyTo(row.lat, row.lng, 16, `${row.ulpin} — Survey ${row.surveyNo}`);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <span className="hover:text-gray-900 cursor-pointer transition-colors">Home</span>
        <CRIcon className="w-3.5 h-3.5 text-gray-400" />
        <span className="text-gray-900 font-semibold">Search Land</span>
      </div>

      {/* ── Search Card ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-0 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Search Land</h2>

          {/* Tabs */}
          <div className="flex gap-6 mt-3 text-sm font-medium -mx-6 px-6 border-b border-gray-100">
            {[
              { key: 'ulpin',    label: 'By ULPIN' },
              { key: 'survey',   label: 'By Survey No' },
              { key: 'owner',    label: 'By Owner Name' },
              { key: 'location', label: 'By Location' },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`pb-2.5 relative transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.key
                    ? 'text-[#125B50] font-bold border-b-2 border-[#125B50] -mb-px'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSearch} className="px-6 py-5">
          <div className="grid grid-cols-12 gap-3 items-end">

            {/* Input col — changes by tab */}
            <div className="col-span-12 sm:col-span-3">
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                {activeTab === 'ulpin'    ? 'Enter ULPIN'       :
                 activeTab === 'survey'   ? 'Survey Number'     :
                 activeTab === 'owner'    ? 'Owner Name'        : 'Location / Place'}
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <input
                type="text"
                value={
                  activeTab === 'ulpin'  ? ulpin :
                  activeTab === 'survey' ? surveyNo :
                  activeTab === 'owner'  ? ownerName : locationText
                }
                onChange={e => {
                  if (activeTab === 'ulpin')    setUlpin(e.target.value);
                  if (activeTab === 'survey')   setSurveyNo(e.target.value);
                  if (activeTab === 'owner')    setOwnerName(e.target.value);
                  if (activeTab === 'location') setLocationText(e.target.value);
                }}
                placeholder={
                  activeTab === 'ulpin'    ? 'e.g. TN-ERD-126-1-0003'  :
                  activeTab === 'survey'   ? 'e.g. 125/4A'              :
                  activeTab === 'owner'    ? 'e.g. Ramasamy G'          : 'e.g. Erode Market Road'
                }
                className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50] font-mono placeholder:font-sans"
              />
            </div>

            {/* District */}
            <div className="col-span-12 sm:col-span-2">
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                District<span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedDistrict}
                  onChange={e => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50] appearance-none pr-8 cursor-pointer"
                >
                  <option value="">Select District</option>
                  {districtsList.map(d => (
                    <option key={d.code || d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
                <ChevronLeft className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 rotate-[-90deg] pointer-events-none" />
              </div>
            </div>

            {/* Taluk — cascades from District */}
            <div className="col-span-12 sm:col-span-2">
              <label className="text-[11px] font-bold text-gray-700 block mb-1 flex items-center justify-between">
                <span>Taluk<span className="text-red-500 ml-0.5">*</span></span>
                {loadingGeo && <span className="text-[9px] text-[#125B50] font-normal animate-pulse">Loading...</span>}
              </label>
              <div className="relative">
                <select
                  value={selectedTaluk}
                  onChange={e => handleTalukChange(e.target.value)}
                  disabled={!selectedDistrict || loadingGeo}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50] appearance-none pr-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedDistrict ? `Select Taluk (${taluksList.length})` : '← District first'}
                  </option>
                  {taluksList.map(t => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
                <ChevronLeft className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 rotate-[-90deg] pointer-events-none" />
              </div>
            </div>

            {/* Village — cascades from Taluk */}
            <div className="col-span-12 sm:col-span-2">
              <label className="text-[11px] font-bold text-gray-700 block mb-1 flex items-center justify-between">
                <span>Village<span className="text-red-500 ml-0.5">*</span></span>
                {loadingGeo && <span className="text-[9px] text-[#125B50] font-normal animate-pulse">Loading...</span>}
              </label>
              <div className="relative">
                <select
                  value={selectedVillage}
                  onChange={e => handleVillageChange(e.target.value)}
                  disabled={!selectedTaluk || loadingGeo}
                  className="w-full px-3 py-2.5 text-xs border border-gray-200 rounded-xl bg-gray-50/80 focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50] appearance-none pr-8 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {selectedTaluk ? `Select Village (${villagesList.length})` : '← Taluk first'}
                  </option>
                  {villagesList.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
                <ChevronLeft className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-3 rotate-[-90deg] pointer-events-none" />
              </div>
            </div>

            {/* Include Sub Division toggle */}
            <div className="col-span-12 sm:col-span-2">
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                Include Sub Division
              </label>
              <button
                type="button"
                onClick={() => setIncludeSubDiv(!includeSubDiv)}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none ${
                  includeSubDiv ? 'bg-[#125B50]' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block w-4 h-4 rounded-full bg-white shadow transition-transform ${
                  includeSubDiv ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
              <span className={`text-[10px] font-semibold ml-1 ${includeSubDiv ? 'text-[#125B50]' : 'text-gray-400'}`}>
                {includeSubDiv ? 'Active' : 'Off'}
              </span>
            </div>
          </div>

          {/* Breadcrumb preview of selection */}
          {(selectedDistrict || selectedTaluk || selectedVillage) && (
            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
              <Navigation className="w-3.5 h-3.5 text-[#125B50] shrink-0" />
              <span className="font-semibold text-[#125B50]">{selectedDistrict}</span>
              {selectedTaluk && <><span className="text-gray-300">›</span><span className="font-semibold text-gray-700">{selectedTaluk} Taluk</span></>}
              {selectedVillage && <><span className="text-gray-300">›</span><span className="font-semibold text-gray-800">{selectedVillage}</span></>}
              <span className="ml-auto text-[10px] text-emerald-600 font-semibold animate-pulse">📍 Map updated</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#125B50] hover:bg-[#0E4940] disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#125B50]/25 cursor-pointer"
            >
              <Search className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Map (always visible — flyTo updates on selection) ──────── */}
      <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all ${searched ? 'h-72' : 'h-96'}`}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
          <h3 className="font-bold text-xs text-gray-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#125B50]" />
            {selectedVillage
              ? `Map — ${selectedVillage}, ${selectedTaluk}`
              : selectedTaluk
              ? `Map — ${selectedTaluk} Taluk, ${selectedDistrict}`
              : selectedDistrict
              ? `Map — ${selectedDistrict} District`
              : 'Tamil Nadu — Select a location to zoom in'}
          </h3>
          <span className="text-[10px] text-gray-400">© OpenStreetMap contributors</span>
        </div>
        <RealMap ref={mapRef} className="h-full" />
      </div>

      {/* ── Results Table ─────────────────────────────────────────── */}
      {searched && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-sm text-gray-900">Search Results</h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#125B50] text-[11px] font-bold border border-emerald-100">
                {results.length} Results Found
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                dataSource === 'supabase'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dataSource === 'supabase' ? 'bg-emerald-500 animate-ping' : 'bg-gray-400'}`} />
                {dataSource === 'supabase' ? 'Supabase Live' : 'Local Registry'}
              </span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  {['ULPIN', 'Survey No.', 'Sub Division', 'Village', 'Area', 'Owner Name', 'Land Use', 'Action'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {results.map(row => (
                  <tr
                    key={row.ulpin}
                    onClick={() => handleParcelClick(row)}
                    className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${selectedParcel === row.ulpin ? 'bg-emerald-50/50 ring-1 ring-inset ring-emerald-200' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-[#125B50]">{row.ulpin}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-700">{row.surveyNo}</td>
                    <td className="px-4 py-3 text-gray-600">{row.subDivision}</td>
                    <td className="px-4 py-3 text-gray-700">{row.village}</td>
                    <td className="px-4 py-3 text-gray-600">{row.area}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.ownerName}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        row.landUse === 'Wet Land'
                          ? 'bg-blue-50 text-blue-700 border border-blue-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {row.landUse}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={e => { e.stopPropagation(); handleParcelClick(row); }}
                        className="px-2.5 py-1.5 rounded-lg border border-[#125B50] text-[#125B50] text-[11px] font-bold hover:bg-[#125B50] hover:text-white transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-500">
              Showing 1–{results.length} of {results.length} results
            </span>
            <div className="flex items-center gap-1.5">
              <button disabled className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 disabled:opacity-40">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#125B50] text-white text-xs font-bold">{page}</button>
              <button disabled className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-400 disabled:opacity-40">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Info Footer ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-gray-900">Don't know ULPIN?</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Search by Survey Number, Owner Name or select location on the map above. The map auto-zooms as you pick District → Taluk → Village.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: CheckCircle2, title: 'Accurate Info', desc: 'Verified land records' },
              { icon: Layers,       title: 'Parcel Centric', desc: 'Linked to ULPIN' },
              { icon: Lock,         title: 'Secure', desc: 'Data protected' },
              { icon: Info,         title: 'Real-time', desc: 'Updated records' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border border-emerald-100 bg-emerald-50 text-[#125B50]">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-900">{item.title}</div>
                    <p className="text-[10px] text-gray-500">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="text-center text-[11px] text-gray-400 pb-2">
        All information is as per available government records. For discrepancies, please contact the respective authority.
      </p>

      {/* Tamil Nilam Modal */}
      <TamilNilamParcelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        parcel={modalParcel}
      />
    </div>
  );
};
