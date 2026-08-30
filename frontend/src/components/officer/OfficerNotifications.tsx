import React, { useState, useEffect } from 'react';
import {
  getOfficerNotifications,
  markNotificationAsRead,
  type OfficerNotification,
} from '../../services/officerService';
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface OfficerNotificationsProps {
  onNavigate?: (page: any, data?: any) => void;
}

export const OfficerNotifications: React.FC<OfficerNotificationsProps> = ({ onNavigate }) => {
  const [notifications, setNotifications] = useState<OfficerNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifs = async () => {
    setLoading(true);
    try {
      const data = await getOfficerNotifications();
      setNotifications(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    for (const n of notifications) {
      if (!n.is_read) await markNotificationAsRead(n.id);
    }
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleNotificationClick = async (n: OfficerNotification) => {
    if (!n.is_read) {
      await handleMarkRead(n.id);
    }
    if (!onNavigate) return;

    if (n.type === 'REQUEST_NEW' || n.reference_id?.startsWith('REQ-')) {
      onNavigate('Citizen Requests');
    } else if (n.type === 'VERIFICATION_PENDING') {
      onNavigate('Verification Queue', { highlightUlpin: n.reference_id });
    } else if (n.type === 'DOC_UPLOADED') {
      onNavigate('Documents', { ulpin: n.reference_id });
    } else {
      onNavigate('All Parcels');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Officer Notifications Center</h2>
          <p className="text-xs text-gray-500">
            Real-time alerts for citizen petitions, boundary inspections, and document uploads
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs divide-y divide-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading alerts...</div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-xs text-gray-400">No notifications available.</div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer hover:bg-blue-50/60 ${
                n.is_read ? 'bg-white' : 'bg-blue-50/40'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
                  n.type === 'REQUEST_NEW'
                    ? 'bg-blue-100 text-blue-700'
                    : n.type === 'VERIFICATION_PENDING'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{n.title}</h4>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                    )}
                  </div>
                  <p className="text-gray-600">{n.message}</p>
                  <span className="text-[10px] text-gray-400 font-mono block">
                    {new Date(n.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(n.id);
                  }}
                  title="Mark as read"
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 shrink-0 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
