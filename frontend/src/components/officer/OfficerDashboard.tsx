import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOfficerNotifications } from '../../services/officerService';
import { OfficerOverview } from './OfficerOverview';
import { ParcelManagement } from './ParcelManagement';
import { AddParcelPage } from './AddParcelPage';
import { VerificationQueue } from './VerificationQueue';
import { CitizenRequests } from './CitizenRequests';
import { DocumentsPage } from './DocumentsPage';
import { OfficerMapPage } from './OfficerMapPage';
import { OfficerNotifications } from './OfficerNotifications';
import { ReportsPage } from './ReportsPage';
import { ParcelHistoryPage } from './ParcelHistoryPage';
import { OfficerProfile } from './OfficerProfile';

import {
  Building2,
  Home,
  Layers,
  Plus,
  ShieldCheck,
  FileText,
  Upload,
  MapPin,
  Bell,
  BarChart3,
  Clock,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export type OfficerNavPage =
  | 'Overview'
  | 'All Parcels'
  | 'Add Parcel'
  | 'Verification Queue'
  | 'Citizen Requests'
  | 'Documents'
  | 'Map'
  | 'Notifications'
  | 'Reports'
  | 'Parcel History'
  | 'Profile';

interface OfficerDashboardProps {
  onOpenAuthModal?: () => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = () => {
  const { user, logout, switchRole } = useAuth();
  const [activeNav, setActiveNav] = useState<OfficerNavPage>('Overview');
  const [navData, setNavData] = useState<any>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  useEffect(() => {
    getOfficerNotifications().then(notifs => {
      const count = notifs.filter(n => !n.is_read).length;
      setUnreadCount(count);
    }).catch(() => {});
  }, [activeNav]);

  const handleNavigate = (page: OfficerNavPage, data?: any) => {
    setActiveNav(page);
    setNavData(data);
  };

  const navItems = [
    { name: 'Overview', icon: Home, group: 'Main' },
    { name: 'All Parcels', icon: Layers, group: 'Parcel Management' },
    { name: 'Add Parcel', icon: Plus, group: 'Parcel Management' },
    { name: 'Verification Queue', icon: ShieldCheck, group: 'Parcel Management' },
    { name: 'Citizen Requests', icon: FileText, group: 'Applications' },
    { name: 'Documents', icon: Upload, group: 'Records' },
    { name: 'Map', icon: MapPin, group: 'GIS Tools' },
    { name: 'Notifications', icon: Bell, group: 'Operations' },
    { name: 'Reports', icon: BarChart3, group: 'Analytics' },
    { name: 'Parcel History', icon: Clock, group: 'Audit' },
    { name: 'Profile', icon: User, group: 'Account' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800 font-sans flex flex-col antialiased">
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-3 shadow-xs">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-blue-700/20">
              <Building2 className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-gray-900 tracking-tight flex items-center gap-2">
                LAND STACK
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                  Officer Workspace
                </span>
              </div>
              <p className="text-[11px] font-medium text-gray-500">
                Department of Revenue & Land Administration • Govt. of Tamil Nadu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleNavigate('Notifications')}
              title="Notifications"
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 pl-1.5 pr-2 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.name || 'Officer'}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-600/20"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-gray-900 leading-tight">
                    {user?.name || 'Dr. M. Sundaram'}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    {user?.designation || 'Tahsildar / RDO'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-bold text-gray-800">{user?.name || 'Dr. M. Sundaram'}</p>
                    <p className="text-gray-400 text-[11px] truncate">{user?.email || 'sundaram.m@tn.gov.in'}</p>
                    <span className="text-[10px] font-bold text-blue-700 capitalize font-mono">Role: {user?.role || 'officer'}</span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveNav('Profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Officer Profile</span>
                  </button>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-bold cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Layout Container ────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Sidebar Navigation ────────────────────────────────────── */}
        <aside className="lg:col-span-3 xl:col-span-2 flex flex-col gap-6">
          <nav className="bg-white rounded-3xl p-3 border border-gray-200/80 shadow-xs space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeNav === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.name as OfficerNavPage)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Info Box */}
          <div className="bg-gradient-to-b from-blue-50 to-indigo-50/40 border border-blue-200/60 rounded-3xl p-5 text-gray-800 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 font-mono">
                Jurisdiction
              </div>
              <h4 className="font-bold text-xs text-gray-900 leading-snug">
                {user?.jurisdiction || 'Erode West Taluk'}
              </h4>
              <p className="text-[11px] text-gray-500">Authorized digital certificate key active</p>
            </div>
          </div>
        </aside>

        {/* ── Main Content Area ──────────────────────────────────────────── */}
        <main className="lg:col-span-9 xl:col-span-10">
          {activeNav === 'Overview' && <OfficerOverview onNavigate={handleNavigate} />}
          {activeNav === 'All Parcels' && <ParcelManagement onNavigate={handleNavigate} />}
          {activeNav === 'Add Parcel' && <AddParcelPage onNavigate={handleNavigate} />}
          {activeNav === 'Verification Queue' && <VerificationQueue onNavigate={handleNavigate} highlightUlpin={navData?.highlightUlpin} />}
          {activeNav === 'Citizen Requests' && <CitizenRequests onNavigate={handleNavigate} />}
          {activeNav === 'Documents' && <DocumentsPage onNavigate={handleNavigate} ulpin={navData?.ulpin} />}
          {activeNav === 'Map' && <OfficerMapPage onNavigate={handleNavigate} ulpin={navData?.ulpin} />}
          {activeNav === 'Notifications' && <OfficerNotifications onNavigate={handleNavigate} />}
          {activeNav === 'Reports' && <ReportsPage />}
          {activeNav === 'Parcel History' && <ParcelHistoryPage />}
          {activeNav === 'Profile' && <OfficerProfile />}
        </main>
      </div>
    </div>
  );
};
