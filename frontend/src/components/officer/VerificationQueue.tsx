import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getOfficerParcels,
  verifyParcelAction,
} from '../../services/officerService';
import type { ParcelRecord } from '../../services/landService';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  MapPin,
  FileText,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface VerificationQueueProps {
  onNavigate: (page: any) => void;
  highlightUlpin?: string;
}

export const VerificationQueue: React.FC<VerificationQueueProps> = ({ onNavigate, highlightUlpin }) => {
  const { user } = useAuth();
  const [parcels, setParcels] = useState<ParcelRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Action Modal
  const [activeParcel, setActiveParcel] = useState<ParcelRecord | null>(null);
  const [actionType, setActionType] = useState<'VERIFY' | 'REJECT' | 'CORRECTION_REQUIRED'>('VERIFY');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await getOfficerParcels({ pageSize: 50 });
      // Filter for items that need verification or highlight
      const queue = res.data.filter(
        p => p.status === 'PENDING_VERIFICATION' || p.status === 'DRAFT' || p.status === 'CORRECTION_REQUIRED' || (highlightUlpin && p.ulpin === highlightUlpin)
      );
      setParcels(queue);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [highlightUlpin]);

  const handleActionClick = (p: ParcelRecord, type: 'VERIFY' | 'REJECT' | 'CORRECTION_REQUIRED') => {
    setActiveParcel(p);
    setActionType(type);
    setRemarks(
      type === 'VERIFY'
        ? 'Field measurement book boundaries and revenue ownership verified.'
        : ''
    );
  };

  const handleConfirmAction = async () => {
    if (!activeParcel) return;
    if ((actionType === 'REJECT' || actionType === 'CORRECTION_REQUIRED') && !remarks.trim()) {
      alert('Please specify the reason for rejection or correction.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await verifyParcelAction(activeParcel.ulpin, actionType, {
        id: user?.id || 'OFF-TN-8821',
        name: user?.name || 'Dr. M. Sundaram',
        remarks: remarks.trim(),
      });

      if (res.success) {
        setSuccessMsg(`Parcel ${activeParcel.surveyNo} status updated to ${actionType}.`);
        setActiveParcel(null);
        loadQueue();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Field Inspection & Cadastral Verification Queue</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Parcel Verification Workspace</h2>
          <p className="text-xs text-gray-500">
            Review spatial geometry, verify Title deeds, and digitally sign official revenue land records
          </p>
        </div>

        <button
          onClick={() => onNavigate('All Parcels')}
          className="px-3.5 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer self-start sm:self-auto"
        >
          View All Parcels
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 flex items-center gap-3 text-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {/* ── Queue Cards ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-400 border border-gray-200/80">
            Loading verification queue...
          </div>
        ) : parcels.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-500 border border-gray-200/80 space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-gray-800 text-sm">All Parcels in Assigned Area are Verified!</h3>
            <p className="text-gray-400">There are no pending subdivision or new parcel registrations in your queue.</p>
          </div>
        ) : (
          parcels.map(p => (
            <div
              key={p.ulpin}
              className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs hover:border-blue-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black font-mono text-sm shrink-0">
                    {p.surveyNo.split('/')[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-extrabold text-gray-900 font-mono">Survey No. {p.surveyNo}</h3>
                      <span className="text-[10px] font-mono text-gray-400">({p.ulpin})</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                      {p.village || 'Ayigoundanpalayam'} • {p.taluk || 'Perundurai'}, {p.district || 'Erode'}
                    </p>
                  </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                  (p.status || 'VERIFIED') === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {p.status || 'PENDING_VERIFICATION'}
                </span>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 text-[11px] block">Owner / Pattadhar</span>
                  <strong className="text-gray-900">{p.ownerName}</strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Area Extent</span>
                  <strong className="text-gray-900">{p.area}</strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Classification</span>
                  <strong className="text-gray-900">{p.landUse}</strong>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] block">Patta Number</span>
                  <strong className="font-mono text-emerald-700">{p.pattaNo || 'PATTA-ERD-4521'}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => onNavigate('Map', { ulpin: p.ulpin })}
                    className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Boundary</span>
                  </button>
                  <button
                    onClick={() => onNavigate('Documents', { ulpin: p.ulpin })}
                    className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>View Deeds</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleActionClick(p, 'CORRECTION_REQUIRED')}
                    className="px-3.5 py-1.5 rounded-xl border border-amber-300 hover:bg-amber-50 text-amber-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    Request Correction
                  </button>
                  <button
                    onClick={() => handleActionClick(p, 'REJECT')}
                    className="px-3.5 py-1.5 rounded-xl border border-rose-300 hover:bg-rose-50 text-rose-800 text-xs font-bold transition-all cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleActionClick(p, 'VERIFY')}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify & Endorse</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── Verification Action Modal ────────────────────────────────────── */}
      {activeParcel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-gray-100 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {actionType === 'VERIFY' ? 'Verify Cadastral Record' : actionType === 'REJECT' ? 'Reject Cadastral Record' : 'Request Record Correction'}
                </h3>
                <p className="text-xs text-gray-500 font-mono">Survey {activeParcel.surveyNo} • {activeParcel.ulpin}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-gray-600">
                You are performing an authorized revenue officer action for <strong>{activeParcel.ownerName}</strong> in <strong>{activeParcel.village || 'Ayigoundanpalayam'}</strong>.
              </p>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  {actionType === 'VERIFY' ? 'Verification Inspection Remarks' : 'Reason for Rejection / Correction *'}
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="Enter detailed revenue officer remarks, FMB sketch cross-references, or statutory notes..."
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setActiveParcel(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={submitting}
                onClick={handleConfirmAction}
                className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  actionType === 'VERIFY'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : actionType === 'REJECT'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{submitting ? 'Processing...' : `Confirm ${actionType}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
