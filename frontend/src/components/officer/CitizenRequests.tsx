import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getCitizenRequests,
  updateCitizenRequestStatus,
  type CitizenRequest,
  type RequestStatus,
} from '../../services/officerService';
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Send,
  Eye,
  Filter,
  Search,
  Building,
  User,
  X,
} from 'lucide-react';

interface CitizenRequestsProps {
  onNavigate: (page: any, data?: any) => void;
}

export const CitizenRequests: React.FC<CitizenRequestsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<CitizenRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Request Modal State
  const [selectedReq, setSelectedReq] = useState<CitizenRequest | null>(null);
  const [remarks, setRemarks] = useState('');
  const [actionStatus, setActionStatus] = useState<RequestStatus>('APPROVED');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await getCitizenRequests(filterStatus !== 'ALL' ? filterStatus : undefined);
      setRequests(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filterStatus]);

  const handleOpenReview = (req: CitizenRequest, defaultStatus: RequestStatus) => {
    setSelectedReq(req);
    setActionStatus(defaultStatus);
    setRemarks(
      defaultStatus === 'APPROVED'
        ? 'Application verified against physical patta records and approved.'
        : defaultStatus === 'ADDITIONAL_INFORMATION_REQUIRED'
        ? 'Please provide the updated Encumbrance Certificate (EC).'
        : ''
    );
  };

  const handleSaveStatus = async () => {
    if (!selectedReq) return;
    if ((actionStatus === 'REJECTED' || actionStatus === 'ADDITIONAL_INFORMATION_REQUIRED') && !remarks.trim()) {
      alert('Please provide remarks explaining the action to the citizen.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateCitizenRequestStatus(selectedReq.id, actionStatus, {
        id: user?.id || 'OFF-TN-8821',
        name: user?.name || 'Dr. M. Sundaram',
        remarks: remarks.trim(),
      });

      if (res.success) {
        setSuccessMsg(`Application ${selectedReq.request_number} updated to ${actionStatus}.`);
        setSelectedReq(null);
        loadRequests();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = requests.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.request_number.toLowerCase().includes(q) ||
      r.citizen_name.toLowerCase().includes(q) ||
      r.request_type.toLowerCase().includes(q) ||
      (r.survey_no || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Citizen Applications & Petitions</h2>
          <p className="text-xs text-gray-500">
            Process Patta transfers, boundary resurvey requests, subdivisions, and mutations
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 flex items-center gap-3 text-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search by Request Number, Citizen Name, Survey No..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="ALL">All Application Statuses</option>
            <option value="SUBMITTED">SUBMITTED (New)</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="ADDITIONAL_INFORMATION_REQUIRED">INFO_REQUIRED</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
      </div>

      {/* ── Requests Table ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Request ID</th>
                <th className="py-3.5 px-4">Citizen Details</th>
                <th className="py-3.5 px-4">Type & Parcel</th>
                <th className="py-3.5 px-4">Submitted Date</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    Loading citizen applications...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No citizen requests found for this filter.
                  </td>
                </tr>
              ) : (
                filtered.map(req => (
                  <tr key={req.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {req.request_number}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{req.citizen_name}</div>
                      <div className="text-[10px] text-gray-400">{req.citizen_phone || req.citizen_email || 'Verified Citizen'}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-800">{req.request_type}</div>
                      <div className="text-[11px] text-gray-500 font-mono">Survey {req.survey_no || '126/1'} • {req.village_name || 'Ayigoundanpalayam'}</div>
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {new Date(req.created_at).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.priority === 'HIGH' || req.priority === 'URGENT'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {req.priority}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : req.status === 'ADDITIONAL_INFORMATION_REQUIRED'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenReview(req, 'APPROVED')}
                          title="Approve Application"
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 font-bold transition-all text-xs cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleOpenReview(req, 'ADDITIONAL_INFORMATION_REQUIRED')}
                          title="Request Info"
                          className="px-2.5 py-1 rounded-lg bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-700 font-bold transition-all text-xs cursor-pointer"
                        >
                          Request Info
                        </button>
                        <button
                          onClick={() => handleOpenReview(req, 'REJECTED')}
                          title="Reject"
                          className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 font-bold transition-all text-xs cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Review Application Modal ─────────────────────────────────────── */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">Review Citizen Application</h3>
                <p className="text-xs text-gray-500 font-mono">{selectedReq.request_number} • {selectedReq.request_type}</p>
              </div>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-gray-50 p-3 rounded-xl space-y-1">
                <p className="text-gray-700 font-semibold">Applicant: <strong>{selectedReq.citizen_name}</strong></p>
                <p className="text-gray-600">Location: Survey {selectedReq.survey_no || '126/1'}, {selectedReq.village_name || 'Ayigoundanpalayam'}</p>
                {selectedReq.description && (
                  <p className="text-gray-500 text-[11px] italic mt-1 bg-white p-2 rounded border border-gray-100">
                    "{selectedReq.description}"
                  </p>
                )}
              </div>

              {selectedReq.documents && selectedReq.documents.length > 0 && (
                <div>
                  <span className="font-bold text-gray-700 block mb-1.5">Submitted Supporting Documents</span>
                  <div className="space-y-1">
                    {selectedReq.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg border border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-mono text-[11px] text-gray-800">{doc.name}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono">{doc.size || 'PDF'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-gray-700 block mb-1">Select Decision State</label>
                <select
                  value={actionStatus}
                  onChange={e => setActionStatus(e.target.value as RequestStatus)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="APPROVED">APPROVED (Issue Endorsement)</option>
                  <option value="UNDER_REVIEW">UNDER_REVIEW (Field Inspection)</option>
                  <option value="ADDITIONAL_INFORMATION_REQUIRED">ADDITIONAL_INFORMATION_REQUIRED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Officer Remarks & Citizen Notification *</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="State the official revenue reasons, document verification status, or required corrections..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setSelectedReq(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleSaveStatus}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Updating...' : 'Submit Official Decision'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
