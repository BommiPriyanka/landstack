import React, { useState, useEffect } from 'react';
import { getParcelHistory, type ParcelHistoryEntry } from '../../services/officerService';
import {
  Clock,
  Search,
  Filter,
  ShieldCheck,
  FileText,
  User,
} from 'lucide-react';

export const ParcelHistoryPage: React.FC = () => {
  const [history, setHistory] = useState<ParcelHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getParcelHistory().then(data => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  const filtered = history.filter(h => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (h.ulpin || '').toLowerCase().includes(q) ||
      (h.survey_no || '').toLowerCase().includes(q) ||
      (h.action || '').toLowerCase().includes(q) ||
      (h.user_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Immutable Cadastral Audit Log</h2>
        <p className="text-xs text-gray-500">
          Timestamped record of all revenue parcel modifications, verifications, status changes, and document uploads
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search audit trail by Survey No, Action, ULPIN, Officer..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-50/80 text-gray-500 font-bold uppercase tracking-wider text-[10px] border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Parcel</th>
                <th className="py-3.5 px-4">Authorized User</th>
                <th className="py-3.5 px-4">Audit Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    Loading audit trail...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                filtered.map((entry, idx) => (
                  <tr key={entry.id || idx} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">
                      {new Date(entry.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100 text-[10px]">
                        {entry.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-gray-900">
                      {entry.survey_no ? `Survey ${entry.survey_no}` : entry.ulpin || 'All Parcels'}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{entry.user_name || 'Dr. M. Sundaram'}</div>
                      <span className="text-[10px] text-gray-400 uppercase font-mono">{entry.user_role}</span>
                    </td>

                    <td className="py-3 px-4 text-gray-600">
                      {entry.remarks || 'Standard revenue record entry.'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
