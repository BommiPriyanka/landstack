import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getOfficerParcels,
  updateParcel,
  type ParcelFilterOptions,
} from '../../services/officerService';
import type { ParcelRecord } from '../../services/landService';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  CheckCircle2,
  FileText,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building,
  MapPin,
  X,
  Save,
} from 'lucide-react';

interface ParcelManagementProps {
  onNavigate: (page: any, data?: any) => void;
}

export const ParcelManagement: React.FC<ParcelManagementProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<ParcelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [landTypeFilter, setLandTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 8;

  // Edit Modal State - Comprehensive Fields
  const [editingParcel, setEditingParcel] = useState<ParcelRecord | null>(null);
  const [editOwner, setEditOwner] = useState('');
  const [editFatherName, setEditFatherName] = useState('');
  const [editOwnershipType, setEditOwnershipType] = useState('Single Owner');
  const [editClassification, setEditClassification] = useState('Private Land (Ryotwari)');
  const [editLandUse, setEditLandUse] = useState('Dry Land (புஞ்சை)');
  const [editAreaAcres, setEditAreaAcres] = useState('');
  const [editPattaNo, setEditPattaNo] = useState('');
  const [editMarketValue, setEditMarketValue] = useState('');
  const [editStatus, setEditStatus] = useState('Active');
  const [editSubDivision, setEditSubDivision] = useState('');
  const [editVillage, setEditVillage] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const filters: ParcelFilterOptions = {
        searchQuery: searchQuery || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        landType: landTypeFilter !== 'ALL' ? landTypeFilter : undefined,
        page,
        pageSize,
      };
      const res = await getOfficerParcels(filters);
      setParcels(res.data);
      setTotalCount(res.total);
    } catch (err) {
      console.error('Error fetching officer parcels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, landTypeFilter, page]);

  const handleOpenEdit = (p: ParcelRecord) => {
    setEditingParcel(p);
    setEditOwner(p.ownerName);
    setEditFatherName(p.fatherName || '');
    setEditOwnershipType(p.ownershipType || 'Single Owner');
    setEditClassification(p.classification || 'Private Land (Ryotwari)');
    setEditLandUse(p.landUse);
    setEditAreaAcres(p.area.replace(/[^\d.]/g, '') || '1.25');
    setEditPattaNo(p.pattaNo || '');
    setEditMarketValue(p.marketValue || '');
    setEditStatus(p.status || 'Active');
    setEditSubDivision(p.subDivision || p.surveyNo);
    setEditVillage(p.village || 'Ayigoundanpalayam');
    setEditRemarks('');
  };

  const handleSaveEdit = async () => {
    if (!editingParcel) return;
    setSavingEdit(true);
    try {
      await updateParcel(
        editingParcel.ulpin,
        {
          ownerName: editOwner,
          fatherName: editFatherName,
          ownershipType: editOwnershipType,
          classification: editClassification,
          landUse: editLandUse,
          area: `${editAreaAcres} Acre`,
          pattaNo: editPattaNo,
          marketValue: editMarketValue,
          status: editStatus,
          subDivision: editSubDivision,
          village: editVillage,
        },
        {
          id: user?.id || 'OFF-TN-8821',
          name: user?.name || 'Dr. M. Sundaram',
          remarks: editRemarks || 'Officer updated cadastral land attributes and revenue records',
        }
      );
      setEditingParcel(null);
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingEdit(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Cadastral Parcel Management</h2>
          <p className="text-xs text-gray-500">
            Search, inspect, update and verify authorized revenue parcels in your jurisdiction
          </p>
        </div>

        <button
          onClick={() => onNavigate('Add Parcel')}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Parcel</span>
        </button>
      </div>

      {/* ── Search & Filter Toolbar ──────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search box */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Survey No, ULPIN, Owner Name, Village..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">Verified</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Land Type Filter */}
          <select
            value={landTypeFilter}
            onChange={e => {
              setLandTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Land Types</option>
            <option value="Dry Land">Dry Land (புஞ்சை)</option>
            <option value="Wet Land">Wet Land (நஞ்சை)</option>
            <option value="Garden Land">Garden (தோட்டம்)</option>
          </select>
        </div>
      </div>

      {/* ── Table Container ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Survey & ULPIN</th>
                <th className="py-3.5 px-4">Location (Village / Taluk)</th>
                <th className="py-3.5 px-4">Owner & Patta</th>
                <th className="py-3.5 px-4">Area & Land Use</th>
                <th className="py-3.5 px-4">Created By</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                      <span>Loading authorized cadastral parcels...</span>
                    </div>
                  </td>
                </tr>
              ) : parcels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No parcels found matching the query.
                  </td>
                </tr>
              ) : (
                parcels.map(p => (
                  <tr key={p.ulpin} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-gray-900 font-mono text-xs">{p.surveyNo}</div>
                      <div className="text-[10px] text-gray-400 font-mono tracking-tight">{p.ulpin}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">{p.village || 'Ayigoundanpalayam'}</div>
                      <div className="text-[11px] text-gray-400">{p.taluk || 'Perundurai'}, {p.district || 'Erode'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{p.ownerName}</div>
                      <div className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
                        {p.pattaNo || 'PATTA-ERD-4521'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">{p.area}</div>
                      <div className="text-[11px] text-gray-500">{p.landUse}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800 text-[11px] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <span>{p.created_by_name || 'Dr. M. Sundaram'}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {p.created_by || 'Officer Workspace'}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        (p.status || 'VERIFIED') === 'VERIFIED' || p.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : (p.status === 'PENDING_VERIFICATION' || p.status === 'DRAFT')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {(p.status || 'VERIFIED') === 'VERIFIED' || p.status === 'Active' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span>{p.status || 'Active'}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Parcel"
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onNavigate('Verification Queue', { highlightUlpin: p.ulpin })}
                          title="Verify Queue"
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-emerald-100 hover:text-emerald-700 text-gray-600 transition-all cursor-pointer"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onNavigate('Documents', { ulpin: p.ulpin })}
                          title="View Documents"
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-purple-100 hover:text-purple-700 text-gray-600 transition-all cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onNavigate('Map', { ulpin: p.ulpin })}
                          title="Locate on GIS Map"
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 transition-all cursor-pointer"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ─────────────────────────────────────────── */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div>
            Showing <strong>{parcels.length}</strong> of <strong>{totalCount}</strong> parcels
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-gray-800">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Edit Parcel Modal ────────────────────────────────────────────── */}
      {editingParcel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-gray-100 space-y-4 my-8 animate-fadeIn max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
              <div>
                <h3 className="text-base font-bold text-gray-900">Edit Cadastral Parcel Records</h3>
                <p className="text-xs text-gray-500 font-mono">Survey No. {editingParcel.surveyNo} • {editingParcel.ulpin}</p>
              </div>
              <button
                onClick={() => setEditingParcel(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs overflow-y-auto pr-1">
              {/* Section 1: Location & Survey */}
              <div>
                <span className="font-bold text-gray-900 uppercase tracking-wider text-[10px] text-blue-700 font-mono block mb-2">
                  1. Cadastral Identification
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Sub-Division No.</label>
                    <input
                      type="text"
                      value={editSubDivision}
                      onChange={e => setEditSubDivision(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Revenue Village</label>
                    <input
                      type="text"
                      value={editVillage}
                      onChange={e => setEditVillage(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Total Area (Acres)</label>
                    <input
                      type="text"
                      value={editAreaAcres}
                      onChange={e => setEditAreaAcres(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Ownership & Title */}
              <div>
                <span className="font-bold text-gray-900 uppercase tracking-wider text-[10px] text-blue-700 font-mono block mb-2">
                  2. Registered Ownership & Patta Title
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Owner Name (Pattadhar) *</label>
                    <input
                      type="text"
                      value={editOwner}
                      onChange={e => setEditOwner(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Father / Husband Name</label>
                    <input
                      type="text"
                      value={editFatherName}
                      onChange={e => setEditFatherName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Ownership Type</label>
                    <select
                      value={editOwnershipType}
                      onChange={e => setEditOwnershipType(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Single Owner">Single Owner</option>
                      <option value="Joint Owner">Joint Owner</option>
                      <option value="Government Undertaking">Government Undertaking</option>
                      <option value="Trust / Institutional">Trust / Institutional</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Patta Number</label>
                    <input
                      type="text"
                      value={editPattaNo}
                      onChange={e => setEditPattaNo(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Land Classification & Valuation */}
              <div>
                <span className="font-bold text-gray-900 uppercase tracking-wider text-[10px] text-blue-700 font-mono block mb-2">
                  3. Classification, Land Use & Valuation
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Classification</label>
                    <select
                      value={editClassification}
                      onChange={e => setEditClassification(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Private Land (Ryotwari)">Private Land (Ryotwari)</option>
                      <option value="Government Poramboke">Government Poramboke</option>
                      <option value="Gram Natham">Gram Natham</option>
                      <option value="Temple / Inam Land">Temple / Inam Land</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Land Use</label>
                    <select
                      value={editLandUse}
                      onChange={e => setEditLandUse(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Dry Land (புஞ்சை)">Dry Land (புஞ்சை)</option>
                      <option value="Wet Land (நஞ்சை)">Wet Land (நஞ்சை)</option>
                      <option value="Garden Land (தோட்டம்)">Garden Land (தோட்டம்)</option>
                      <option value="Commercial / Residential">Commercial / Residential</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Market Guideline Value</label>
                    <input
                      type="text"
                      value={editMarketValue}
                      onChange={e => setEditMarketValue(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Workflow Status & Audit Remarks */}
              <div>
                <span className="font-bold text-gray-900 uppercase tracking-wider text-[10px] text-blue-700 font-mono block mb-2">
                  4. Authorization & Statutory Audit Trail
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="font-semibold text-gray-700 block mb-1">Workflow Status</label>
                    <select
                      value={editStatus}
                      onChange={e => setEditStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Active">Active</option>
                      <option value="VERIFIED">VERIFIED</option>
                      <option value="PENDING_VERIFICATION">PENDING_VERIFICATION</option>
                      <option value="CORRECTION_REQUIRED">CORRECTION_REQUIRED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-gray-700 block mb-1">Officer Statutory Remarks *</label>
                    <input
                      type="text"
                      value={editRemarks}
                      onChange={e => setEditRemarks(e.target.value)}
                      placeholder="State official reason for updating revenue records..."
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setEditingParcel(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingEdit ? 'Saving Updates...' : 'Save & Record Audit'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
