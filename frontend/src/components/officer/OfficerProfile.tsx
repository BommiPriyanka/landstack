import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Shield,
  Building,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Lock,
  Save,
} from 'lucide-react';

export const OfficerProfile: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || 'Dr. M. Sundaram');
  const [phone, setPhone] = useState(user?.phone || '+91 94432 78901');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Revenue Officer Official Profile</h2>
        <p className="text-xs text-gray-500">
          Authorized personnel profile credentials and administrative jurisdiction
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-800 flex items-center gap-3 text-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">Profile details successfully updated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
            alt="Officer"
            className="w-16 h-16 rounded-full object-cover ring-4 ring-blue-600/20"
          />
          <div>
            <h3 className="text-base font-bold text-gray-900">{user?.name || 'Dr. M. Sundaram'}</h3>
            <p className="text-xs text-gray-500">{user?.designation || 'Tahsildar / Revenue Divisional Officer'}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] uppercase font-mono">
              Role: {user?.role || 'OFFICER'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Official Email Address (Locked)</label>
            <div className="relative">
              <input
                type="email"
                disabled
                value={user?.email || 'sundaram.m@tn.gov.in'}
                className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl font-semibold text-gray-500 cursor-not-allowed"
              />
              <Lock className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Contact Mobile Number</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Official Officer ID (Locked)</label>
            <div className="relative">
              <input
                type="text"
                disabled
                value={user?.id || 'OFF-TN-8821'}
                className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl font-mono font-semibold text-gray-500 cursor-not-allowed"
              />
              <Lock className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-3" />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Assigned Department</label>
            <input
              type="text"
              disabled
              value={user?.department || 'Revenue & Land Records (Erode)'}
              className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl font-semibold text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Assigned Jurisdiction / Taluk</label>
            <input
              type="text"
              disabled
              value={user?.jurisdiction || 'Erode West Taluk'}
              className="w-full px-3.5 py-2.5 bg-gray-100 border border-gray-200 rounded-xl font-semibold text-gray-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
