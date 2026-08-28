import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ShieldCheck,
  QrCode,
  Printer,
  Copy,
  Check,
  Download,
  Building,
  FileText,
  CreditCard,
  Layers,
  MapPin,
  ExternalLink,
  Info,
  CheckCircle2,
  User,
} from 'lucide-react';
import type { CadastralPolygon, ParcelRecord } from '../../services/landService';

interface TamilNilamParcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcel: CadastralPolygon | ParcelRecord | null;
  onOpenMyParcels?: (ulpin: string) => void;
}

type TabType = 'land' | 'ownership' | 'patta' | 'services';

export const TamilNilamParcelModal: React.FC<TamilNilamParcelModalProps> = ({
  isOpen,
  onClose,
  parcel,
  onOpenMyParcels,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('land');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !parcel) return null;

  const ulpin = parcel.ulpin || 'TN-ERD-126-1-0003';
  const surveyNo = parcel.surveyNo || '126/1';
  const subDivision = (parcel as any).subDivision || `${surveyNo}1`;
  const village = (parcel as any).village || 'Ayigoundanpalayam';
  const taluk = (parcel as any).taluk || 'Perundurai';
  const district = (parcel as any).district || 'Erode';
  const area = parcel.area || '1.25 Acre';
  const ownerName = parcel.ownerName || 'Ramasamy G';
  const landUse = parcel.landUse || 'Wet Land (நஞ்சை)';
  const pattaNo = (parcel as any).pattaNo || `PATTA-ERD-${surveyNo.replace(/[^\d]/g, '') || '4521'}`;
  const marketValue = (parcel as any).marketValue || '₹ 45,50,000';
  const classification = (parcel as any).classification || 'Ryotwari Manai / Private Land';
  const fatherName = (parcel as any).fatherName || 'Gopalasamy K';
  const ownershipType = (parcel as any).ownershipType || 'Single Owner';

  // Area conversions
  const areaNumber = parseFloat(area.replace(/[^\d.]/g, '')) || 1.25;
  const areaSqMeters = (areaNumber * 4046.86).toFixed(2);
  const areaHectares = (areaNumber * 0.404686).toFixed(4);

  const handleCopy = () => {
    navigator.clipboard.writeText(ulpin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      style={{ zIndex: 99999 }}
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] relative z-[100000]"
        style={{ zIndex: 100000 }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Demo / Prototype Disclaimer Banner ─────────────────── */}
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-[11px] font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>SIH 2026 PROTOTYPE DPI SYSTEM — Synthetic Demo Land Records for SIH26014</span>
          </div>
          <span className="text-[10px] bg-black/15 px-2 py-0.5 rounded font-mono uppercase tracking-wider">
            Not Official Legal Record
          </span>
        </div>

        {/* ── Modal Header (Tamil Nilam DPI Style) ────────────────── */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#125B50] via-[#0E4940] to-[#0B3B34] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                  Tamil Nilam GIS DPI
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> ULPIN Verified
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Land Parcel Information / நில பார்சல் விவரங்கள்
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── ULPIN Quick Bar ────────────────────────────────────── */}
        <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">ULPIN:</span>
            <span className="font-mono text-sm font-extrabold text-[#125B50] bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
              {ulpin}
            </span>
            <button
              onClick={handleCopy}
              className="p-1 rounded-md text-gray-400 hover:text-[#125B50] hover:bg-gray-100 transition-colors"
              title="Copy ULPIN"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#125B50]" />
              {village}, {taluk}, {district}
            </span>
            <span className="text-gray-300">|</span>
            <span className="font-mono font-bold text-gray-800">Survey: {surveyNo}</span>
          </div>
        </div>

        {/* ── Tab Navigation ─────────────────────────────────────── */}
        <div className="flex border-b border-gray-200 bg-white px-6 text-xs font-bold">
          {[
            { key: 'land', label: 'Land Details / நில விவரங்கள்', icon: MapPin },
            { key: 'ownership', label: 'Ownership Details / உரிமையாளர்', icon: User },
            { key: 'patta', label: 'Patta / Chitta View (பட்டா நகல்)', icon: FileText },
            { key: 'services', label: 'Linked Services & Taxes', icon: CreditCard },
          ].map(t => {
            const Icon = t.icon;
            const isActive = activeTab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key as TabType)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#125B50] text-[#125B50] bg-emerald-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#125B50]' : 'text-gray-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── Modal Body Content ─────────────────────────────────── */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#FBFDFB] space-y-4">
          
          {/* TAB 1: LAND DETAILS */}
          {activeTab === 'land' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Survey & Sub-Division</div>
                  <div className="text-base font-extrabold text-gray-900 mt-1 font-mono">{surveyNo} / {subDivision}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">Cadastral Boundary Linked</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Land Extent</div>
                  <div className="text-base font-extrabold text-gray-900 mt-1">{area}</div>
                  <div className="text-[11px] text-gray-500 font-mono mt-0.5">{areaSqMeters} Sq.m ({areaHectares} Ha)</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Land Classification</div>
                  <div className="text-base font-extrabold text-emerald-800 mt-1">{landUse}</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">{classification}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#125B50]" /> Administrative Location Hierarchy
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-semibold block">State</span>
                    <span className="font-bold text-gray-800">Tamil Nadu (தமிழ்நாடு)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-semibold block">District</span>
                    <span className="font-bold text-gray-800">{district} (ஈரோடு)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-semibold block">Taluk</span>
                    <span className="font-bold text-gray-800">{taluk} (பெருந்துறை)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <span className="text-[10px] text-gray-400 font-semibold block">Village (LGD Code 634988)</span>
                    <span className="font-bold text-[#125B50]">{village}</span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#125B50] shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700 space-y-1">
                  <span className="font-bold text-[#125B50] block">GIS Cadastral Polygon Synchronized</span>
                  <p className="leading-relaxed">
                    This parcel boundary is mapped to EPSG:4326 PostGIS geometry with Unique Land Parcel Identification Number (ULPIN). Centroid at {'center' in parcel && parcel.center ? `${parcel.center[0].toFixed(4)}°N, ${parcel.center[1].toFixed(4)}°E` : '11.2740°N, 77.5870°E'}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OWNERSHIP DETAILS */}
          {activeTab === 'ownership' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#125B50] flex items-center justify-center font-bold text-base">
                      {ownerName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-gray-900">{ownerName}</h4>
                      <p className="text-[11px] text-gray-500 font-medium">Primary Registered Landholder</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-[#125B50] border border-emerald-200">
                    {ownershipType}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Father / Husband Name</span>
                    <span className="font-semibold text-gray-800">{fatherName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Patta Number</span>
                    <span className="font-mono font-bold text-[#125B50]">{pattaNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Guideline Market Value</span>
                    <span className="font-extrabold text-gray-900">{marketValue}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Masked Aadhaar ID</span>
                    <span className="font-mono font-semibold text-gray-700">XXXX-XXXX-8921</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Ownership Share</span>
                    <span className="font-bold text-emerald-700">100% (முழு உரிமை)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Dispute / Encumbrance</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Clear Title (தடையில்லா நிலம்)
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs">
                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-2.5">Mutation & Transfer History</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <div>
                      <span className="font-bold text-gray-800">Patta Transfer by Sale Deed</span>
                      <p className="text-[10px] text-gray-500">Doc No. 142/2024, Sub-Registrar Office Perundurai</p>
                    </div>
                    <span className="text-[11px] font-mono text-gray-600">18 May 2024</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PATTA / CHITTA VIEW */}
          {activeTab === 'patta' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Printable Tamil Nilam Certificate Card */}
              <div className="bg-white rounded-2xl border-2 border-emerald-900/20 p-6 shadow-md relative overflow-hidden font-serif">
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none text-9xl font-black text-emerald-950 select-none">
                  TAMIL NILAM
                </div>

                {/* Certificate Header */}
                <div className="text-center border-b-2 border-emerald-900/30 pb-4 mb-4 relative z-10 font-sans">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[#125B50]">
                    Government of Tamil Nadu — Revenue Department
                  </div>
                  <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
                    தமிழ் நிலம் பட்டா / சிட்டா நகல் (Record of Rights Extract)
                  </h3>
                  <div className="flex items-center justify-center gap-3 text-xs text-gray-600 mt-1">
                    <span><strong>மாவட்டம்:</strong> {district}</span>
                    <span>•</span>
                    <span><strong>வட்டம்:</strong> {taluk}</span>
                    <span>•</span>
                    <span><strong>கிராமம்:</strong> {village}</span>
                  </div>
                </div>

                {/* Patta Number Header */}
                <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 mb-4 flex items-center justify-between font-sans text-xs">
                  <div>
                    <span className="text-gray-500 font-medium">பட்டா எண் (Patta No):</span>
                    <span className="font-mono font-bold text-[#125B50] ml-2 text-sm">{pattaNo}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 font-medium">உரிமையாளர்:</span>
                    <span className="font-bold text-gray-900 ml-2">{ownerName} ({fatherName})</span>
                  </div>
                </div>

                {/* Land Schedule Table */}
                <div className="overflow-x-auto font-sans">
                  <table className="w-full text-left text-xs border border-gray-200">
                    <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                      <tr>
                        <th className="p-2 border-r">புல எண் (Survey No)</th>
                        <th className="p-2 border-r">உட்பிரிவு (Sub-Div)</th>
                        <th className="p-2 border-r">பயன்பாடு (Land Use)</th>
                        <th className="p-2 border-r">விஸ்தீரணம் (Hectare - Are)</th>
                        <th className="p-2">தீர்வை (Tax / Kist)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-800">
                      <tr className="bg-white">
                        <td className="p-2.5 font-mono font-bold border-r text-[#125B50]">{surveyNo}</td>
                        <td className="p-2.5 font-mono border-r">{subDivision}</td>
                        <td className="p-2.5 border-r">{landUse}</td>
                        <td className="p-2.5 font-mono font-semibold border-r">{areaHectares} Ha ({area})</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-800">₹ 24.50</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Digital Verification Seal */}
                <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between text-[11px] font-sans relative z-10">
                  <div className="flex items-center gap-2 text-gray-500">
                    <QrCode className="w-8 h-8 text-[#125B50]" />
                    <div>
                      <div className="font-mono font-bold text-[#125B50]">{ulpin}</div>
                      <div className="text-[9px] text-gray-400">Digitally Verified via DPI Smart Ledger</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-800">வட்டாட்சியர் / Tahsildar</div>
                    <div className="text-[10px] text-emerald-700 font-semibold flex items-center justify-end gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Digitally Signed (மின் கையொப்பம்)
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 font-sans">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-colors shadow-2xs cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-gray-500" /> Print Extract
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#125B50] hover:bg-[#0E4940] text-xs font-bold text-white transition-colors shadow-sm shadow-[#125B50]/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download e-Patta PDF
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: LINKED SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-3 animate-fadeIn">
              {[
                {
                  title: 'Revenue Department (RoR / Patta)',
                  status: 'Active & Verified',
                  statusColor: 'bg-emerald-100 text-emerald-800',
                  desc: 'Patta, Chitta and A-Register verified under ULPIN anchor.',
                  icon: FileText,
                },
                {
                  title: 'Property Tax Assessment',
                  status: 'Paid for FY 2025-26',
                  statusColor: 'bg-blue-100 text-blue-800',
                  desc: 'Assessment No. ERD-PRD-8891. Dues cleared.',
                  icon: CreditCard,
                },
                {
                  title: 'Encumbrance Certificate (Registration Dept)',
                  status: 'Nil Encumbrance (Clear Title)',
                  statusColor: 'bg-emerald-100 text-emerald-800',
                  desc: 'No active mortgage or lien registered from 1990 to present date.',
                  icon: ShieldCheck,
                },
                {
                  title: 'Building Permission & Zoning',
                  status: 'Permitted Agricultural Land',
                  statusColor: 'bg-purple-100 text-purple-800',
                  desc: 'Master plan zone: Primary Agricultural Zone (DTCP approved).',
                  icon: Building,
                },
              ].map((svc, i) => {
                const Icon = svc.icon;
                return (
                  <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#125B50] flex items-center justify-center shrink-0 border border-emerald-100 mt-0.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{svc.title}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{svc.desc}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${svc.statusColor}`}>
                      {svc.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ── Modal Footer ───────────────────────────────────────── */}
        <div className="px-6 py-3.5 bg-white border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Parcel Sync active</span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenMyParcels && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenMyParcels(ulpin);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-[#125B50] hover:underline"
              >
                Open in My Parcels <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
