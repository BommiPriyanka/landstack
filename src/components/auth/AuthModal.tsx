import { useState } from 'react';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import type { UserRole } from '../../types/auth';
import {
  User,
  Shield,
  Building2,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  Layers,
  X,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'citizen',
}) => {
  const { login, signup, switchRole, error, loading, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [officerId, setOfficerId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success = false;
    if (activeTab === 'login') {
      success = await login(selectedRole, email, password);
    } else {
      success = await signup(
        {
          name: fullName || DEMO_USERS[selectedRole].name,
          email: email || DEMO_USERS[selectedRole].email,
          phone: phone || DEMO_USERS[selectedRole].phone,
          role: selectedRole,
          department: department || DEMO_USERS[selectedRole].department,
          designation: officerId ? `Officer (${officerId})` : DEMO_USERS[selectedRole].designation,
        },
        password
      );
    }
    if (success) {
      onClose();
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    switchRole(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white text-gray-800 w-full max-w-md rounded-2xl shadow-2xl border border-gray-100 overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header Banner */}
        <div className="bg-gradient-to-br from-[#125B50] via-[#0E4940] to-[#08332C] text-white p-6 relative overflow-hidden">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
              <Layers className="w-5 h-5 text-[#4ECCA3]" />
            </div>
            <div>
              <div className="font-bold text-lg tracking-tight flex items-center gap-2">
                LAND STACK
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#4ECCA3]/20 text-[#4ECCA3] border border-[#4ECCA3]/40">
                  Tamil Nadu
                </span>
              </div>
              <p className="text-xs text-gray-300">Unified Land Governance Portal</p>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-200 mt-2">
            {activeTab === 'login' ? 'Sign in to access your dashboard' : 'Create an authoritative account'}
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="p-6 pb-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
            Select User Role
          </label>
          <div className="grid grid-cols-3 gap-2 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSelectedRole('citizen')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                selectedRole === 'citizen'
                  ? 'bg-white text-[#125B50] shadow-sm font-bold border border-gray-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-4 h-4 mb-1" />
              <span>Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('officer')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                selectedRole === 'officer'
                  ? 'bg-white text-[#125B50] shadow-sm font-bold border border-gray-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4 mb-1" />
              <span>Officer</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-medium transition-all ${
                selectedRole === 'admin'
                  ? 'bg-white text-[#125B50] shadow-sm font-bold border border-gray-200/80'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Shield className="w-4 h-4 mb-1" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login / Sign Up Form Tabs */}
        <div className="px-6 border-b border-gray-200 flex gap-4 text-sm font-medium">
          <button
            onClick={() => setActiveTab('login')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'login'
                ? 'text-[#125B50] font-bold border-b-2 border-[#125B50]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab('signup')}
            className={`pb-3 relative transition-colors ${
              activeTab === 'signup'
                ? 'text-[#125B50] font-bold border-b-2 border-[#125B50]'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === 'signup' && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={
                      selectedRole === 'citizen'
                        ? 'e.g. K. Aravind'
                        : selectedRole === 'officer'
                        ? 'e.g. Dr. M. Sundaram'
                        : 'e.g. S. Rajendran, IAS'
                    }
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#125B50]/30 focus:border-[#125B50]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 block mb-1">
                  Phone / Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98401 23456"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#125B50]/30 focus:border-[#125B50]"
                  />
                </div>
              </div>

              {selectedRole === 'officer' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Revenue (RoR)"
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#125B50]/30 focus:border-[#125B50]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">
                      Officer ID
                    </label>
                    <input
                      type="text"
                      value={officerId}
                      onChange={(e) => setOfficerId(e.target.value)}
                      placeholder="e.g. OFF-TN-8821"
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#125B50]/30 focus:border-[#125B50]"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              {selectedRole === 'citizen' ? 'Email Address or Mobile Number' : 'Official Govt Email (gov.in)'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'citizen' ? 'e.g. name@gmail.com or 9876543210' : DEMO_USERS[selectedRole].email}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#125B50]/30 focus:border-[#125B50]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#125B50]/30 focus:border-[#125B50]"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-medium flex items-center justify-between">
              <span>{error}</span>
              <button type="button" onClick={clearError} className="text-red-500 hover:text-red-700 font-bold ml-2">×</button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-[#125B50] hover:bg-[#0E4940] disabled:bg-gray-400 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-[#125B50]/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>
                  {activeTab === 'login'
                    ? `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                    : `Create ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Account`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Quick Demo Login Section */}
        <div className="px-6 pb-6 pt-2 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#125B50]" />
            <span>1-Click Instant Demo Login</span>
          </div>

          <div className="space-y-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('citizen')}
              className="w-full text-left p-2 rounded-lg bg-white border border-gray-200 hover:border-[#125B50] hover:bg-emerald-50/50 transition-all flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-semibold text-gray-800">Citizen: K. Aravind</span>
                <span className="text-gray-400">(Chennai/Mylapore)</span>
              </div>
              <span className="text-[11px] font-bold text-[#125B50]">Login →</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('officer')}
              className="w-full text-left p-2 rounded-lg bg-white border border-gray-200 hover:border-[#125B50] hover:bg-emerald-50/50 transition-all flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="font-semibold text-gray-800">Officer: Dr. M. Sundaram</span>
                <span className="text-gray-400">(Tahsildar/Erode)</span>
              </div>
              <span className="text-[11px] font-bold text-[#125B50]">Login →</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="w-full text-left p-2 rounded-lg bg-white border border-gray-200 hover:border-[#125B50] hover:bg-emerald-50/50 transition-all flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span className="font-semibold text-gray-800">Admin: S. Rajendran, IAS</span>
                <span className="text-gray-400">(State Admin)</span>
              </div>
              <span className="text-[11px] font-bold text-[#125B50]">Login →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
