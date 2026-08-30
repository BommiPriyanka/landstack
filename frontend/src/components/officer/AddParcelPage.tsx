import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { createParcel, type CreateParcelInput } from '../../services/officerService';
import { getVillages } from '../../services/landService';
import { TN_DISTRICTS } from '../../data/tnDistricts';
import {
  Plus,
  Building,
  MapPin,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface AddParcelPageProps {
  onNavigate: (page: any) => void;
}

export const AddParcelPage: React.FC<AddParcelPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  // Form State
  const [district, setDistrict] = useState('Erode');
  const [taluk, setTaluk] = useState('Perundurai');
  const [village, setVillage] = useState('Ayigoundanpalayam');
  const [villagesList, setVillagesList] = useState<string[]>(['Ayigoundanpalayam', 'Perundurai East', 'Perundurai West', 'Kullampalayam']);
  const [surveyNo, setSurveyNo] = useState('');
  const [subDivision, setSubDivision] = useState('');
  const [landUse, setLandUse] = useState('Dry Land (புஞ்சை)');
  const [areaAcres, setAreaAcres] = useState('1.50');
  const [ownerName, setOwnerName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [ownershipType, setOwnershipType] = useState('Single Owner');
  const [classification, setClassification] = useState('Private Land (Ryotwari)');
  const [pattaNo, setPattaNo] = useState('');
  const [marketValue, setMarketValue] = useState('50,00,000');
  const [lat, setLat] = useState('11.2740');
  const [lng, setLng] = useState('77.5870');
  const [status, setStatus] = useState<'VERIFIED' | 'PENDING_VERIFICATION' | 'DRAFT'>('VERIFIED');
  const [remarks, setRemarks] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any | null>(null);

  // Available taluks for selected district
  const selectedDistrictData = TN_DISTRICTS.find(d => d.name === district);
  const availableTaluks = selectedDistrictData ? selectedDistrictData.taluks : [];

  useEffect(() => {
    async function loadVillages() {
      try {
        const res = await getVillages(district, taluk);
        if (res.data && res.data.length > 0) {
          setVillagesList(res.data);
          if (!res.data.includes(village)) {
            setVillage(res.data[0]);
          }
        } else {
          const selectedT = availableTaluks.find(t => t.name === taluk);
          const fallback = selectedT?.villages || ['Ayigoundanpalayam', 'Perundurai East', 'Perundurai West', 'Kullampalayam'];
          setVillagesList(fallback);
          if (!fallback.includes(village)) {
            setVillage(fallback[0] || 'Ayigoundanpalayam');
          }
        }
      } catch {
        const selectedT = availableTaluks.find(t => t.name === taluk);
        const fallback = selectedT?.villages || ['Ayigoundanpalayam', 'Perundurai East', 'Perundurai West', 'Kullampalayam'];
        setVillagesList(fallback);
      }
    }
    loadVillages();
  }, [district, taluk]);

  const handleDistrictChange = (dName: string) => {
    setDistrict(dName);
    const d = TN_DISTRICTS.find(item => item.name === dName);
    if (d && d.taluks.length > 0) {
      setTaluk(d.taluks[0].name);
      setVillage(d.taluks[0].villages[0] || 'Ayigoundanpalayam');
      setLat(d.lat.toString());
      setLng(d.lng.toString());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!surveyNo.trim()) {
      setError('Please provide a valid Survey Number (e.g. 128/1).');
      return;
    }
    if (!ownerName.trim()) {
      setError('Please enter the registered Landholder / Owner Name.');
      return;
    }
    const numArea = parseFloat(areaAcres);
    if (isNaN(numArea) || numArea <= 0) {
      setError('Please enter a valid area in Acres.');
      return;
    }
    const numLat = parseFloat(lat);
    const numLng = parseFloat(lng);
    if (isNaN(numLat) || isNaN(numLng)) {
      setError('Please provide valid decimal coordinates.');
      return;
    }

    setLoading(true);

    const input: CreateParcelInput = {
      surveyNo: surveyNo.trim(),
      subDivision: subDivision.trim() || `${surveyNo.trim()}1`,
      village,
      taluk,
      district,
      landUse,
      areaAcres: numArea,
      ownerName: ownerName.trim(),
      fatherName: fatherName.trim(),
      ownershipType,
      classification,
      pattaNo: pattaNo.trim() || undefined,
      marketValue: marketValue ? `₹ ${marketValue}` : undefined,
      lat: numLat,
      lng: numLng,
      status,
      officerId: user?.id || 'OFF-TN-8821',
      officerName: user?.name || 'Dr. M. Sundaram',
      remarks: remarks.trim() || 'Cadastral parcel digitized and authorized by revenue officer.',
    };

    const res = await createParcel(input);
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Failed to create parcel.');
      return;
    }

    setSuccessResult(res.data);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Add New Cadastral Parcel</h2>
          <p className="text-xs text-gray-500">
            Digitize, register, and assign ULPIN to revenue land records with cryptographic audit
          </p>
        </div>
        <button
          onClick={() => onNavigate('All Parcels')}
          className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer"
        >
          Back to Parcels
        </button>
      </div>

      {/* ── Success Banner ──────────────────────────────────────────────── */}
      {successResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-900 space-y-3 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">Parcel Registered Successfully!</h3>
              <p className="text-xs text-emerald-700">
                Assigned ULPIN: <strong className="font-mono text-emerald-950">{successResult.ulpin}</strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('All Parcels')}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer"
            >
              View in Parcel Management
            </button>
            <button
              onClick={() => {
                setSuccessResult(null);
                setSurveyNo('');
                setOwnerName('');
              }}
              className="px-4 py-2 rounded-xl border border-emerald-300 hover:bg-emerald-100 text-emerald-800 text-xs font-bold cursor-pointer"
            >
              Add Another Parcel
            </button>
          </div>
        </div>
      )}

      {/* ── Error Banner ────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-800 flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Form Card ───────────────────────────────────────────────────── */}
      {!successResult && (
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
          {/* Section 1: Administrative Location */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>1. Administrative Hierarchy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1.5">District *</label>
                <select
                  value={district}
                  onChange={e => handleDistrictChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20"
                >
                  {TN_DISTRICTS.map(d => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Taluk *</label>
                <select
                  value={taluk}
                  onChange={e => {
                    setTaluk(e.target.value);
                    const t = availableTaluks.find(item => item.name === e.target.value);
                    if (t && t.villages.length > 0) setVillage(t.villages[0]);
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20"
                >
                  {availableTaluks.map(t => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Revenue Village *</label>
                <select
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20"
                >
                  {villagesList.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Cadastral Land Identifiers */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>2. Cadastral Survey & Land Use</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Survey Number *</label>
                <input
                  type="text"
                  placeholder="e.g. 128/2"
                  value={surveyNo}
                  onChange={e => setSurveyNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Sub-division Number</label>
                <input
                  type="text"
                  placeholder="e.g. 128/2B"
                  value={subDivision}
                  onChange={e => setSubDivision(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Land Classification *</label>
                <select
                  value={landUse}
                  onChange={e => setLandUse(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="Dry Land (புஞ்சை)">Dry Land (புஞ்சை)</option>
                  <option value="Wet Land (நஞ்சை)">Wet Land (நஞ்சை)</option>
                  <option value="Garden Land (தோட்டம்)">Garden Land (தோட்டம்)</option>
                  <option value="Commercial / Residential">Commercial / Residential</option>
                  <option value="Government Poramboke">Government Poramboke</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Total Area (Acres) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1.75"
                  value={areaAcres}
                  onChange={e => setAreaAcres(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Ownership & Title Records */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <span>3. Registered Ownership & Patta Title</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Registered Owner (Pattadhar) *</label>
                <input
                  type="text"
                  placeholder="e.g. Subramaniam K"
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Father / Husband Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kandasamy Gounder"
                  value={fatherName}
                  onChange={e => setFatherName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Patta Number</label>
                <input
                  type="text"
                  placeholder="e.g. PATTA-ERD-5821"
                  value={pattaNo}
                  onChange={e => setPattaNo(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-800 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Geographic Coordinates & Workflow Status */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>4. Spatial Coordinates & Verification State</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Latitude (WGS84) *</label>
                <input
                  type="text"
                  value={lat}
                  onChange={e => setLat(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-800 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Longitude (WGS84) *</label>
                <input
                  type="text"
                  value={lng}
                  onChange={e => setLng(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-800 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Market Value (₹)</label>
                <input
                  type="text"
                  value={marketValue}
                  onChange={e => setMarketValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-gray-800 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">Initial Workflow Status *</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-800 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="VERIFIED">VERIFIED (Endorsed)</option>
                  <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                  <option value="DRAFT">DRAFT</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="font-bold text-gray-700 block mb-1.5 text-xs">Officer Endorsement Remarks</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Field inspection remarks, FMB measurement references, or boundary notes..."
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => onNavigate('All Parcels')}
              className="px-5 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'Registering...' : 'Save & Authorize Parcel'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
