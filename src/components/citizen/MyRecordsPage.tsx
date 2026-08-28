import { useState } from 'react';
import {
  FileText, Eye, MoreVertical, Filter, Download, Copy,
  ChevronLeft, ChevronRight, Search, Shield, Plus,
  RefreshCw, Clock, Archive,
} from 'lucide-react';

type RecordTab = 'All Records' | 'Land Records' | 'Ownership' | 'Tax & Payments' | 'Approvals' | 'Certificates' | 'Encumbrances';

interface LandRecord {
  id: string;
  type: string;
  parcel: string;
  issueDate: string;
  expiryDate: string | null;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

const ALL_RECORDS: LandRecord[] = [
  { id: 'LR-2025-00045', type: 'Patta (Record of Rights)', parcel: 'TN-ERD-126-1-0003', issueDate: '10 Jan 2025', expiryDate: null, status: 'Active' },
  { id: 'CH-2025-00045', type: 'Chitta', parcel: 'TN-ERD-126-1-0003', issueDate: '10 Jan 2025', expiryDate: null, status: 'Active' },
  { id: 'AD-2025-00045', type: 'Adangal', parcel: 'TN-ERD-126-1-0003', issueDate: '10 Jan 2025', expiryDate: null, status: 'Active' },
  { id: 'TAX-2025-00123', type: 'Property Tax Receipt', parcel: 'TN-ERD-126-1-0003', issueDate: '01 Apr 2025', expiryDate: '31 Mar 2026', status: 'Active' },
  { id: 'BP-2025-00078', type: 'Building Permission', parcel: 'TN-ERD-126-1-0003', issueDate: '15 Feb 2025', expiryDate: '14 Feb 2027', status: 'Active' },
  { id: 'EC-2025-00032', type: 'Encumbrance Certificate', parcel: 'TN-ERD-126-1-0003', issueDate: '05 Apr 2025', expiryDate: '04 Oct 2025', status: 'Expiring Soon' },
  { id: 'REG-2024-00876', type: 'Sale Deed', parcel: 'TN-ERD-126-1-0003', issueDate: '20 Dec 2024', expiryDate: null, status: 'Active' },
  { id: 'MLC-2024-00111', type: 'Mutation Entry', parcel: 'TN-ERD-126-1-0003', issueDate: '18 Nov 2024', expiryDate: null, status: 'Active' },
];

const RECORD_TABS: RecordTab[] = ['All Records', 'Land Records', 'Ownership', 'Tax & Payments', 'Approvals', 'Certificates', 'Encumbrances'];

export const MyRecordsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RecordTab>('All Records');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = ALL_RECORDS.filter(r =>
    r.id.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase()) ||
    r.parcel.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = ALL_RECORDS.filter(r => r.status === 'Active').length;
  const expiringCount = ALL_RECORDS.filter(r => r.status === 'Expiring Soon').length;
  const expiredCount = ALL_RECORDS.filter(r => r.status === 'Expired').length;

  const statusBadge = (status: LandRecord['status']) => {
    if (status === 'Active') return (
      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100">Active</span>
    );
    if (status === 'Expiring Soon') return (
      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[11px] font-semibold border border-amber-100">Expiring Soon</span>
    );
    return (
      <span className="px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 text-[11px] font-semibold border border-red-100">Expired</span>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Breadcrumb + Title */}
        <div>
          <p className="text-xs text-gray-400 font-medium mb-1">Home &rsaquo; My Records</p>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Records</h2>
          <p className="text-sm text-gray-500 mt-0.5">View all land related records of your parcels</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: <FileText className="w-6 h-6 text-emerald-600" />, bg: 'bg-emerald-50 border-emerald-100', label: 'Total Records', count: ALL_RECORDS.length, sub: 'All Records' },
            { icon: <FileText className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50 border-blue-100', label: 'Active Records', count: activeCount, sub: 'Up to date' },
            { icon: <Clock className="w-6 h-6 text-amber-500" />, bg: 'bg-amber-50 border-amber-100', label: 'Expiring Soon', count: String(expiringCount).padStart(2, '0'), sub: 'Within 6 months' },
            { icon: <Archive className="w-6 h-6 text-red-500" />, bg: 'bg-red-50 border-red-100', label: 'Expired Records', count: String(expiredCount).padStart(2, '0'), sub: 'Need Update' },
          ].map((s, i) => (
            <div key={i} className={`bg-white rounded-2xl border ${s.bg} shadow-xs p-4 flex items-center gap-4`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${s.bg}`}>
                {s.icon}
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500">{s.label}</p>
                <p className="text-2xl font-extrabold text-gray-900 leading-tight">{s.count}</p>
                <p className="text-[10px] text-gray-400">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="flex overflow-x-auto border-b border-gray-100 px-4">
            {RECORD_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 px-4 py-3.5 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-[#125B50] text-[#125B50]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search + Filter Row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search records..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#125B50] focus:border-[#125B50]"
              />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="w-3.5 h-3.5" />
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/60">
                <tr>
                  {['Record ID', 'Record Type', 'Parcel / ULPIN', 'Issue Date', 'Expiry Date', 'Status', 'Action'].map(col => (
                    <th key={col} className="px-4 py-3 text-[11px] font-semibold text-gray-500">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-mono font-bold text-gray-800">{rec.id}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-700">{rec.type}</td>
                    <td className="px-4 py-3.5 text-xs font-mono text-gray-600">{rec.parcel}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{rec.issueDate}</td>
                    <td className={`px-4 py-3.5 text-xs font-semibold ${rec.status === 'Expiring Soon' ? 'text-amber-500' : 'text-gray-400'}`}>
                      {rec.expiryDate ?? '—'}
                    </td>
                    <td className="px-4 py-3.5">{statusBadge(rec.status)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1">
                        <button className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-[11px] text-gray-500">Showing 1 to {filtered.length} of {ALL_RECORDS.length} records</p>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-4 h-4" />
              </button>
              {[1, 2, 3].map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold transition-colors ${
                    currentPage === p
                      ? 'bg-[#125B50] text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="bg-gradient-to-r from-[#E8F5E9] to-[#F0F9F0] border border-[#C8E6C9] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#125B50]/10 flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5 text-[#125B50]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-800">Your Records. Secure & Verified.</p>
            <p className="text-xs text-gray-500 mt-0.5">All records shown here are fetched from government authorities and are legally valid.</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">

        {/* Selected Parcel Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-700">Selected Parcel</p>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-extrabold text-gray-900 font-mono">TN-ERD-126-1-0003</p>
            <button className="text-gray-400 hover:text-gray-700 transition-colors">
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Survey No.', value: '126/1' },
              { label: 'Sub Division', value: '126/1A' },
              { label: 'Village', value: 'Ayigoundanpalayam' },
              { label: 'Taluk', value: 'Perundurai' },
              { label: 'District', value: 'Erode' },
              { label: 'Area', value: '1.25 Acre (5,059.0 Sq.m)' },
              { label: 'Land Use', value: 'Wet Land' },
              { label: 'Classification', value: 'Private Land' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-start justify-between gap-2 text-xs">
                <span className="text-gray-500 shrink-0">{label}</span>
                <span className="text-gray-900 font-semibold text-right">{value}</span>
              </div>
            ))}
            <div className="flex items-start justify-between gap-2 text-xs">
              <span className="text-gray-500 shrink-0">ULPIN Status</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">Active</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-3">
          <p className="text-xs font-bold text-gray-700">Quick Actions</p>
          <div className="space-y-2">
            {[
              { icon: <Download className="w-3.5 h-3.5" />, label: 'Download All Records' },
              { icon: <Plus className="w-3.5 h-3.5" />, label: 'Request New Document' },
              { icon: <RefreshCw className="w-3.5 h-3.5" />, label: 'Update Expired Records' },
              { icon: <Clock className="w-3.5 h-3.5" />, label: 'View Record History' },
            ].map(({ icon, label }) => (
              <button
                key={label}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-[#125B50]/30 hover:bg-emerald-50/30 text-xs font-semibold text-gray-700 transition-all"
              >
                <span className="text-[#125B50]">{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Need Help */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 space-y-3">
          <p className="text-xs font-bold text-gray-700">Need Help?</p>
          <p className="text-[11px] text-gray-500">If any record is missing or incorrect, raise a request with supporting documents.</p>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-[#125B50]/40 hover:bg-emerald-50/30 text-xs font-bold text-gray-800 transition-all">
            <Shield className="w-3.5 h-3.5 text-[#125B50]" />
            <span>Raise Request</span>
          </button>
        </div>
      </div>
    </div>
  );
};
