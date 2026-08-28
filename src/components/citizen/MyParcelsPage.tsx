import { useState, useEffect, useRef } from 'react';
import {
  Plus, Filter, Download, ChevronDown, Copy, ShieldCheck,
  ExternalLink, FileText, CreditCard, Building, BookOpen,
  Info, Layers,
} from 'lucide-react';
import RealMap, { type MapHandle } from '../common/RealMap';
import {
  getUserParcels, type ParcelRecord, type UserParcelSummary,
} from '../../services/landService';

// ── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status?: string }) {
  const isActive = (status || '').toLowerCase() === 'active';
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
      isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
      {status || 'Active'}
    </span>
  );
}

// ── Land Use Label ───────────────────────────────────────────────────────────
function LandUseTag({ use }: { use: string }) {
  const map: Record<string, string> = {
    'Wet Land': 'bg-blue-50 text-blue-700',
    'Dry Land': 'bg-amber-50 text-amber-700',
    'Garden Land': 'bg-emerald-50 text-emerald-700',
    'Government Land': 'bg-purple-50 text-purple-700',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[use] || 'bg-gray-100 text-gray-600'}`}>
      {use}
    </span>
  );
}

// ── Summary Card ─────────────────────────────────────────────────────────────
function SummaryCard({
  icon, iconBg, label, value, sub,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="flex-1 min-w-[140px] bg-white rounded-2xl border border-gray-200 shadow-xs px-5 py-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</div>
        <div className="text-2xl font-extrabold text-gray-900 leading-tight">{value}</div>
        {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ── Parcel Detail Tab ─────────────────────────────────────────────────────────
type DetailTab = 'Overview' | 'Ownership' | 'Land Records' | 'Linked Services';

function ParcelDetailPanel({
  parcel,
  onOpenInMapExplorer,
}: {
  parcel: ParcelRecord;
  onOpenInMapExplorer?: () => void;
}) {
  const miniMapRef = useRef<MapHandle>(null);
  const [tab, setTab] = useState<DetailTab>('Overview');
  const [copied, setCopied] = useState(false);

  // fly mini map to parcel
  useEffect(() => {
    if (miniMapRef.current && parcel.lat && parcel.lng) {
      setTimeout(() => {
        miniMapRef.current?.flyTo(parcel.lat, parcel.lng, 16);
      }, 300);
    }
  }, [parcel]);

  const handleCopy = () => {
    navigator.clipboard.writeText(parcel.ulpin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tabs: DetailTab[] = ['Overview', 'Ownership', 'Land Records', 'Linked Services'];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-800">Parcel Details</span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
          <ShieldCheck className="w-3 h-3" /> Verified
        </span>
      </div>

      {/* ULPIN */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-extrabold text-[#125B50] tracking-tight">{parcel.ulpin}</span>
        <button onClick={handleCopy} className="text-gray-400 hover:text-[#125B50] transition-colors" title="Copy ULPIN">
          <Copy className={`w-3.5 h-3.5 ${copied ? 'text-emerald-500' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-100">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-[10px] font-semibold px-2.5 py-1.5 transition-all border-b-2 -mb-[1px] whitespace-nowrap ${
              tab === t
                ? 'border-[#125B50] text-[#125B50]'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Overview' && (
        <div className="flex flex-col gap-1.5 text-[11px]">
          {[
            { label: 'Survey No.', value: parcel.surveyNo },
            { label: 'Sub Division', value: parcel.subDivision },
            { label: 'Village', value: parcel.village },
            { label: 'Taluk', value: parcel.taluk || 'Perundurai' },
            { label: 'District', value: parcel.district || 'Erode' },
            { label: 'Area', value: `${parcel.area} (${(parseFloat(parcel.area.replace(/[^\d.]/g, '')) * 4046.86).toFixed(2)} Sq.m)` },
            { label: 'Land Use', value: parcel.landUse },
            { label: 'Classification', value: parcel.classification || 'Private Land' },
            { label: 'ULPIN Status', value: parcel.status || 'Active', isStatus: true },
            { label: 'Linked On', value: parcel.linkedOn || '18 May 2025' },
          ].map(({ label, value, isStatus }) => (
            <div key={label} className="flex justify-between gap-2 py-0.5">
              <span className="text-gray-400 font-medium shrink-0">{label}</span>
              {isStatus
                ? <StatusBadge status={value} />
                : <span className="text-gray-800 font-semibold text-right leading-tight">{value}</span>
              }
            </div>
          ))}
        </div>
      )}

      {tab === 'Ownership' && (
        <div className="flex flex-col gap-2 text-[11px]">
          {[
            { label: 'Owner Name', value: parcel.ownerName },
            { label: 'Ownership Type', value: parcel.ownershipType || 'Single Owner' },
            { label: 'Patta No.', value: parcel.pattaNo || 'PATTA-ERD-4521' },
            { label: 'Market Value', value: parcel.marketValue || '₹ 45,50,000' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-2 py-0.5">
              <span className="text-gray-400 font-medium shrink-0">{label}</span>
              <span className="text-gray-800 font-semibold text-right">{value}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'Land Records' && (
        <div className="flex flex-col gap-2 text-[11px]">
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl px-3 py-2.5">
            <div className="font-bold text-emerald-700">Patta Available</div>
            <div className="text-gray-500 mt-0.5">Last updated: 15 Jan 2025</div>
          </div>
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl px-3 py-2.5">
            <div className="font-bold text-blue-700">Chitta Available</div>
            <div className="text-gray-500 mt-0.5">Last updated: 15 Jan 2025</div>
          </div>
          <div className="bg-amber-50/60 border border-amber-100 rounded-xl px-3 py-2.5">
            <div className="font-bold text-amber-700">Adangal Available</div>
            <div className="text-gray-500 mt-0.5">Last updated: 10 Dec 2024</div>
          </div>
        </div>
      )}

      {tab === 'Linked Services' && (
        <div className="flex flex-col gap-2 text-[11px]">
          {[
            { label: 'Land Records', status: 'Available', color: 'emerald' },
            { label: 'Property Tax', status: 'Paid 2024-25', color: 'emerald' },
            { label: 'Building Permission', status: 'N/A', color: 'gray' },
            { label: 'Registration', status: 'Completed', color: 'emerald' },
          ].map(({ label, status, color }) => (
            <div key={label} className={`flex items-center justify-between px-3 py-2 rounded-xl bg-${color}-50/60 border border-${color}-100`}>
              <span className={`font-semibold text-${color}-700`}>{label}</span>
              <span className="text-gray-500">{status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Parcel Location Mini Map */}
      <div>
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Parcel Location</div>
        <div className="w-full h-36 rounded-xl overflow-hidden border border-gray-200">
          <RealMap
            ref={miniMapRef}
            className="w-full h-36"
            baseLayer="satellite"
            showCadastral={true}
            selectedSurveyNo={parcel.surveyNo}
            showTools={false}
            showKeyMap={false}
            showScale={false}
          />
        </div>
        <button
          onClick={onOpenInMapExplorer}
          className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-[#125B50] hover:text-[#125B50] transition-all"
        >
          Open in Map Explorer
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ===========================================================================
export function MyParcelsPage({ onOpenInMapExplorer }: { onOpenInMapExplorer?: (ulpin: string) => void }) {
  const [summary, setSummary] = useState<UserParcelSummary | null>(null);
  const [selectedParcel, setSelectedParcel] = useState<ParcelRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    getUserParcels().then(({ summary }) => {
      setSummary(summary);
      setSelectedParcel(summary.parcels[0] || null);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col gap-4 animate-fadeIn">

      {/* ─── Page Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] text-gray-400 font-medium mb-1 flex items-center gap-1">
            <span className="hover:text-[#125B50] cursor-pointer transition-colors">Home</span>
            <ChevronDown className="w-3 h-3 -rotate-90 text-gray-300" />
            <span className="text-gray-600">My Parcels</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">My Parcels</h1>
          <p className="text-xs text-gray-500 mt-0.5">View and manage all parcels linked to you</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#125B50] hover:bg-[#0D4A41] shadow-sm shadow-[#125B50]/25 transition-all">
          <Plus className="w-4 h-4" />
          Add Parcel
        </button>
      </div>

      {/* ─── Summary Cards ────────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap">
        {loading ? (
          <div className="flex-1 h-24 bg-gray-100 animate-pulse rounded-2xl"></div>
        ) : summary && (
          <>
            <SummaryCard
              icon={<FileText className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-50"
              label="Total Parcels"
              value={String(summary.totalParcels).padStart(2, '0')}
              sub="Active parcels"
            />
            <SummaryCard
              icon={<div className="w-5 h-5 text-blue-600 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>}
              iconBg="bg-blue-50"
              label="Agricultural Land"
              value={String(summary.agriculturalCount).padStart(2, '0')}
              sub="Parcels"
            />
            <SummaryCard
              icon={<div className="w-5 h-5 text-orange-600 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>}
              iconBg="bg-orange-50"
              label="Non-Agricultural Land"
              value={String(summary.nonAgriculturalCount).padStart(2, '0')}
              sub="Parcel"
            />
            <SummaryCard
              icon={<div className="w-5 h-5 text-violet-600 flex items-center justify-center"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>}
              iconBg="bg-violet-50"
              label="Total Area"
              value={`${summary.totalAreaAcres} Acre`}
              sub={`${summary.totalAreaSqMeters.toLocaleString()} Sq.m`}
            />
          </>
        )}
      </div>

      {/* ─── Main Content: Table + Right Sidebar ──────────────────── */}
      <div className="flex gap-4 items-start">

        {/* Left – Parcel Table */}
        <div className="flex-1 flex flex-col gap-3 min-w-0">

          {/* Parcel List Header */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900">List of My Parcels</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <Filter className="w-3.5 h-3.5 text-gray-500" />
                    Filter
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {filterOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl border border-gray-100 shadow-xl z-20 p-2">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2 py-1">Filter by</div>
                      {['All', 'Wet Land', 'Dry Land', 'Garden Land'].map(f => (
                        <button key={f} className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setExportOpen(!exportOpen)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
                  >
                    <Download className="w-3.5 h-3.5 text-gray-500" />
                    Export
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </button>
                  {exportOpen && (
                    <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl border border-gray-100 shadow-xl z-20 p-2">
                      {['Export as PDF', 'Export as Excel', 'Export as CSV'].map(f => (
                        <button key={f} className="w-full text-left text-xs px-3 py-1.5 rounded-lg hover:bg-gray-100 text-gray-700 font-medium">
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['ULPIN', 'Survey No.', 'Sub Division', 'Village', 'Area', 'Land Use', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-left py-2 px-2 font-bold text-gray-400 uppercase tracking-wider text-[9px] whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [1, 2, 3, 4].map(i => (
                      <tr key={i}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(j => (
                          <td key={j} className="py-3 px-2">
                            <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    summary?.parcels.map(p => (
                      <tr
                        key={p.ulpin}
                        className={`border-b border-gray-50 transition-colors ${
                          selectedParcel?.ulpin === p.ulpin ? 'bg-emerald-50/40' : 'hover:bg-gray-50/60'
                        }`}
                      >
                        <td className="py-3 px-2">
                          <button
                            onClick={() => setSelectedParcel(p)}
                            className="font-mono font-bold text-[#125B50] hover:underline text-left"
                          >
                            {p.ulpin}
                          </button>
                        </td>
                        <td className="py-3 px-2 font-semibold text-gray-700">{p.surveyNo}</td>
                        <td className="py-3 px-2 text-gray-600">{p.subDivision}</td>
                        <td className="py-3 px-2 text-gray-600">{p.village}</td>
                        <td className="py-3 px-2 text-gray-700 font-medium whitespace-nowrap">{p.area}</td>
                        <td className="py-3 px-2"><LandUseTag use={p.landUse} /></td>
                        <td className="py-3 px-2"><StatusBadge status={p.status} /></td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => setSelectedParcel(p)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] font-bold text-gray-700 hover:bg-[#125B50] hover:text-white hover:border-[#125B50] transition-all whitespace-nowrap"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {!loading && summary && (
              <div className="text-[10px] text-gray-400 mt-3 font-medium">
                Showing 1 to {summary.parcels.length} of {summary.parcels.length} results
              </div>
            )}
          </div>

          {/* Services Linked Section */}
          {selectedParcel && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4">Services Linked to This Parcel</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    icon: <BookOpen className="w-5 h-5 text-[#125B50]" />,
                    iconBg: 'bg-emerald-50 border-emerald-100',
                    title: 'Land Records',
                    desc: 'View Patta, Chitta, Adangal and other land records.',
                    cta: 'View Records',
                    ctaColor: 'text-emerald-700 border-emerald-200 hover:bg-emerald-50',
                  },
                  {
                    icon: <CreditCard className="w-5 h-5 text-orange-600" />,
                    iconBg: 'bg-orange-50 border-orange-100',
                    title: 'Property Tax',
                    desc: 'View property tax details and payment status.',
                    cta: 'View Details',
                    ctaColor: 'text-orange-700 border-orange-200 hover:bg-orange-50',
                  },
                  {
                    icon: <Building className="w-5 h-5 text-violet-600" />,
                    iconBg: 'bg-violet-50 border-violet-100',
                    title: 'Building Permission',
                    desc: 'Check building permission status and approvals.',
                    cta: 'View Details',
                    ctaColor: 'text-violet-700 border-violet-200 hover:bg-violet-50',
                  },
                  {
                    icon: <FileText className="w-5 h-5 text-blue-600" />,
                    iconBg: 'bg-blue-50 border-blue-100',
                    title: 'Registration',
                    desc: 'View registration documents and encumbrances.',
                    cta: 'View Details',
                    ctaColor: 'text-blue-700 border-blue-200 hover:bg-blue-50',
                  },
                ].map(({ icon, iconBg, title, desc, cta, ctaColor }) => (
                  <div key={title} className="border border-gray-100 rounded-2xl p-4 flex flex-col gap-3 hover:border-gray-200 hover:shadow-xs transition-all">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                      {icon}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900">{title}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">{desc}</div>
                    </div>
                    <button className={`mt-auto flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-all ${ctaColor}`}>
                      <ExternalLink className="w-3 h-3" />
                      {cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help Banner */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Info className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-800">Can't find a parcel?</span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  If your parcel is not listed here, you can add it using the Add Parcel button.
                </p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-[11px] font-bold text-gray-700 hover:bg-gray-50 whitespace-nowrap transition-all">
              <Info className="w-3.5 h-3.5 text-gray-500" />
              Know More
            </button>
          </div>
        </div>

        {/* Right – Parcel Detail Panel */}
        <div style={{ width: 270, flexShrink: 0 }}>
          {selectedParcel ? (
            <ParcelDetailPanel
              parcel={selectedParcel}
              onOpenInMapExplorer={() => onOpenInMapExplorer?.(selectedParcel.ulpin)}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-8 text-center">
              <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Select a parcel to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
