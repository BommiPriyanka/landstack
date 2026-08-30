import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getOfficerStats,
  getCitizenRequests,
  getParcelHistory,
  type OfficerStats,
  type CitizenRequest,
  type ParcelHistoryEntry,
} from '../../services/officerService';
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  TrendingUp,
  Plus,
  ShieldCheck,
  MapPin,
  Upload,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface OfficerOverviewProps {
  onNavigate: (page: any) => void;
}

export const OfficerOverview: React.FC<OfficerOverviewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<OfficerStats | null>(null);
  const [recentRequests, setRecentRequests] = useState<CitizenRequest[]>([]);
  const [recentHistory, setRecentHistory] = useState<ParcelHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      setLoading(true);
      try {
        const [statsData, reqsData, histData] = await Promise.all([
          getOfficerStats(),
          getCitizenRequests('SUBMITTED'),
          getParcelHistory(),
        ]);
        setStats(statsData);
        setRecentRequests(reqsData.slice(0, 4));
        setRecentHistory(histData.slice(0, 4));
      } catch (err) {
        console.error('Error loading overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, []);

  return (
    <div className="space-y-6">
      {/* ── Top Hero / Jurisdiction Banner ───────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-20 -mb-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>Officer Administration & Cadastral Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome, {user?.name || 'Dr. M. Sundaram'}
            </h1>
            <p className="text-sm text-blue-200 max-w-xl">
              {user?.designation || 'Tahsildar / Revenue Divisional Officer'} • {user?.department || 'Revenue & Land Records'}
            </p>
            <div className="flex items-center gap-4 text-xs text-blue-300/80 pt-1 font-mono">
              <span>Jurisdiction: <strong className="text-white">{user?.jurisdiction || 'Erode West Taluk'}</strong></span>
              <span>•</span>
              <span>Officer ID: <strong className="text-white">{user?.id || 'OFF-TN-8821'}</strong></span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('Add Parcel')}
              className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-xs transition-all shadow-md shadow-blue-500/30 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Parcel</span>
            </button>
            <button
              onClick={() => onNavigate('Verification Queue')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verify Queue ({stats?.pendingVerification || 1})</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards Grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Parcels</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">
            {loading ? '...' : (stats?.totalParcels || 8).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-gray-500 mt-1 font-medium">In Assigned Taluk</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending Verify</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tracking-tight">
            {loading ? '...' : (stats?.pendingVerification || 0)}
          </div>
          <p className="text-[11px] text-amber-600/80 mt-1 font-medium">Awaiting Field Signoff</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Verified</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            {loading ? '...' : (stats?.verifiedParcels || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-600/80 mt-1 font-medium">Digital Patta Active</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Citizen Reqs</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-600 tracking-tight">
            {loading ? '...' : (stats?.pendingCitizenRequests || 0)}
          </div>
          <p className="text-[11px] text-indigo-600/80 mt-1 font-medium">Patta / Subdivision</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Newly Added</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 tracking-tight">
            {loading ? '...' : (stats?.newlyAddedParcels || 1)}
          </div>
          <p className="text-[11px] text-purple-600/80 mt-1 font-medium">Last 30 Days</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/80 shadow-xs hover:border-rose-300 transition-all">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Disputes</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 tracking-tight">
            {loading ? '...' : (stats?.rejectedParcels || 0)}
          </div>
          <p className="text-[11px] text-rose-600/80 mt-1 font-medium">Resurvey Required</p>
        </div>
      </div>

      {/* ── Quick Action Shortcuts ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Officer Operational Fast-Actions</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigate('Add Parcel')}
            className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-800">Add Parcel</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Register boundary</span>
          </button>

          <button
            onClick={() => onNavigate('Verification Queue')}
            className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-800">Verify Parcels</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Field inspection</span>
          </button>

          <button
            onClick={() => onNavigate('Citizen Requests')}
            className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-800">Review Requests</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Citizen petitions</span>
          </button>

          <button
            onClick={() => onNavigate('All Parcels')}
            className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-800">Manage Parcels</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Search & edit</span>
          </button>

          <button
            onClick={() => onNavigate('Map')}
            className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-800">GIS Cadastral Map</span>
            <span className="text-[10px] text-gray-400 mt-0.5">Spatial viewer</span>
          </button>

          <button
            onClick={() => onNavigate('Documents')}
            className="flex flex-col items-center text-center p-4 rounded-xl border border-gray-200 hover:border-teal-500 hover:bg-teal-50/50 transition-all group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-800">Upload Documents</span>
            <span className="text-[10px] text-gray-400 mt-0.5">FMB & Patta docs</span>
          </button>
        </div>
      </div>

      {/* ── Two-Column Operational Panels ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Citizen Requests */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Urgent Citizen Applications</h3>
                <p className="text-xs text-gray-500">Requires revenue verification and digital endorsement</p>
              </div>
              <button
                onClick={() => onNavigate('Citizen Requests')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({stats?.pendingCitizenRequests || 3})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentRequests.map(req => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 bg-gray-50/50 hover:bg-white transition-all flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-900">{req.request_number}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.priority === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {req.priority} PRIORITY
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-800">{req.request_type} • Survey {req.survey_no || '126/1'}</p>
                    <p className="text-[11px] text-gray-500">
                      Applicant: {req.citizen_name} ({req.village_name || 'Ayigoundanpalayam'})
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('Citizen Requests')}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Audit Trail */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Officer Activity Audit Log</h3>
                <p className="text-xs text-gray-500">Immutable operations logged with timestamp</p>
              </div>
              <button
                onClick={() => onNavigate('Parcel History')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Full Audit</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recentHistory.map((h, i) => (
                <div key={h.id || i} className="flex items-start gap-3 text-xs border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-800 font-mono">{h.action}</span>
                      <span className="text-[10px] text-gray-400">{new Date(h.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-gray-600 text-[11px]">{h.remarks || `Survey ${h.survey_no || h.ulpin}`}</p>
                    <p className="text-[10px] text-gray-400">By {h.user_name || 'Dr. M. Sundaram'} ({h.user_role})</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
