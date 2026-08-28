import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  ArrowRight,
  ChevronDown,
  LogOut,
  UserCheck,
  Bell,
  Sparkles,
} from 'lucide-react';

interface OfficerDashboardProps {
  onOpenAuthModal: () => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({ onOpenAuthModal }) => {
  const { user, logout, switchRole } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800 font-sans flex flex-col antialiased">
      {/* Top Bar */}
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
                  Officer Portal
                </span>
              </div>
              <p className="text-[11px] font-medium text-gray-500">
                Department of Revenue & Land Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                5
              </span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 pl-1.5 pr-2 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
              >
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"}
                  alt={user?.name || "Officer"}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-600/20"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-gray-900 leading-tight">
                    {user?.name || "Dr. M. Sundaram"}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    {user?.designation || "Tahsildar / RDO"}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs animate-fadeIn">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="font-bold text-gray-800">{user?.name}</p>
                    <p className="text-gray-400 text-[11px] truncate">{user?.email}</p>
                  </div>

                  <div className="px-3 py-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    Switch Role Preview
                  </div>

                  <button
                    onClick={() => {
                      switchRole('citizen');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-gray-700 hover:text-[#125B50]"
                  >
                    Citizen Dashboard (K. Aravind)
                  </button>

                  <button
                    onClick={() => {
                      switchRole('admin');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-purple-50 text-gray-700 hover:text-purple-600"
                  >
                    Admin Dashboard (S. Rajendran, IAS)
                  </button>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-gray-500" />
                      <span>Account Settings / Login</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
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

      {/* Main Container */}
      <main className="max-w-[1600px] w-full mx-auto p-6 space-y-6 flex-1">
        {/* Officer Notice Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Officer Verification Workspace
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome, {user?.name || "Dr. M. Sundaram"}
            </h2>
            <p className="text-xs text-gray-600">
              {user?.department || "Revenue & Land Records (Erode)"} • Jurisdiction: {user?.jurisdiction || "Erode West Taluk"}
            </p>
          </div>

          <button
            onClick={() => switchRole('citizen')}
            className="px-4 py-2 rounded-xl bg-[#125B50] hover:bg-[#0E4940] text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <span>View Citizen Dashboard UI</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Verification Queue Preview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="text-xs font-semibold text-gray-500">Pending Petitions</div>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">14</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Awaiting Field Inspection</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="text-xs font-semibold text-gray-500">Patta Transfers Under Review</div>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">08</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Cross-Verification Pending</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="text-xs font-semibold text-gray-500">Endorsed This Month</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">42</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Digital Signatures Affixed</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
            <div className="text-xs font-semibold text-gray-500">Boundary Disputes</div>
            <div className="text-2xl font-extrabold text-red-600 mt-1">03</div>
            <div className="text-[11px] text-gray-400 mt-0.5">Requires Cadastral Resurvey</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Officer Dashboard Ready for Custom Design</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
            Provide the design/screenshot for the Officer Portal and it will be implemented with full backend data bindings!
          </p>
        </div>
      </main>
    </div>
  );
};
