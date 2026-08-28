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
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  Fingerprint,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { login, signup, switchRole, error, loading, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    clearError();
  };

  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'login') {
      await login(selectedRole, email, password);
    } else {
      await signup(
        {
          name: fullName || DEMO_USERS[selectedRole].name,
          email: email || DEMO_USERS[selectedRole].email,
          phone: phone || DEMO_USERS[selectedRole].phone,
          role: selectedRole,
          department: department || DEMO_USERS[selectedRole].department,
          designation: officerId ? `Officer (${officerId})` : DEMO_USERS[selectedRole].designation,
          jurisdiction: DEMO_USERS[selectedRole].jurisdiction,
        },
        password
      );
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    switchRole(role);
  };

  return (
    <div className="min-h-screen bg-[#F0FDF4] bg-gradient-to-br from-[#F8FAFC] via-[#F0FDF4] to-[#E8F5E9] text-gray-800 flex flex-col justify-between font-sans selection:bg-[#125B50]/30 selection:text-[#125B50] antialiased">
      {/* Top Header Bar */}
      <header className="px-6 py-4 border-b border-gray-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#125B50] to-[#0B3B34] flex items-center justify-center text-white shadow-md shadow-[#125B50]/20">
              <Layers className="w-5 h-5 text-[#4ECCA3]" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-gray-900 tracking-tight flex items-center gap-2 leading-tight">
                LAND STACK
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#125B50]/10 text-[#125B50] font-bold border border-[#125B50]/20">
                  TN-DPI
                </span>
              </div>
              <p className="text-[11px] font-medium text-gray-500 leading-none">
                Government of Tamil Nadu • Land Governance Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#125B50]" />
              Smart India Hackathon 2026 • SIH26014
            </span>
          </div>
        </div>
      </header>

      {/* Main Content: Split Hero & Login Form */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* ── LEFT SHOWCASE PANEL (5 cols) ────────────────────────── */}
          <div className="lg:col-span-5 space-y-6 hidden lg:block pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#125B50]/10 border border-[#125B50]/20 text-[#125B50] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Unified Digital Public Infrastructure
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              One Secure Portal for{' '}
              <span className="text-[#125B50]">
                All Land Information
              </span>
            </h1>

            <p className="text-sm text-gray-600 leading-relaxed">
              Eliminating departmental silos across Tamil Nadu. Linking <strong>Cadastral GIS, Revenue RoR (Patta/Chitta), Registration Deeds, Property Tax, Building Permissions & Encumbrances</strong> under a unified <strong>ULPIN</strong>.
            </p>

            {/* Feature Bullet Cards */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#125B50] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100 font-bold">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Role-Based Access Control</h4>
                  <p className="text-[11px] text-gray-500">
                    Tailored workflows for Citizens, Tahsildars, Sub-Registrars, and State Administrators.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-100 font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Geospatial Cadastral Registry</h4>
                  <p className="text-[11px] text-gray-500">
                    Explore survey parcel boundaries, subdivisions, and live dispute flags on an interactive map.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 border border-purple-100 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Zero-Trust Reconciliation</h4>
                  <p className="text-[11px] text-gray-500">
                    Automated consistency engine flags name mismatches and tax dues before transaction execution.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT LOGIN / SIGNUP CARD (7 cols) ──────────────────── */}
          <div className="lg:col-span-7 max-w-xl mx-auto w-full">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200/80 overflow-hidden">
              
              {/* Card Header Banner */}
              <div className="bg-gradient-to-r from-[#125B50] via-[#0E4940] to-[#0A3831] p-6 text-white relative overflow-hidden">
                <div className="relative z-10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/15 text-[#4ECCA3] border border-white/20 font-bold">
                      {selectedRole.toUpperCase()} PORTAL
                    </span>
                    <span className="text-xs text-gray-300">
                      Govt. of Tamil Nadu
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    {activeTab === 'login' ? 'Sign In to Your Account' : 'Create a Verified Account'}
                  </h2>
                  <p className="text-xs text-gray-200">
                    {selectedRole === 'citizen'
                      ? 'Access your land records, patta, tax dues & petition status'
                      : selectedRole === 'officer'
                      ? 'Access departmental verification queue & digital endorsement tools'
                      : 'Access statewide land stack telemetry & configuration'}
                  </p>
                </div>

                {/* Decorative background circle */}
                <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
              </div>

              {/* Step 1: Select Role Tabs */}
              <div className="p-6 pb-2 border-b border-gray-100">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2.5">
                  1. Select Account Type
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('citizen')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                      selectedRole === 'citizen'
                        ? 'border-[#125B50] bg-[#E8F5E9] text-[#125B50] shadow-sm font-bold ring-2 ring-[#125B50]/20'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${
                      selectedRole === 'citizen' ? 'bg-[#125B50] text-white' : 'bg-white text-gray-600 shadow-2xs'
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Citizen</span>
                    <span className="text-[10px] opacity-75 font-normal">Land Owner</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('officer')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                      selectedRole === 'officer'
                        ? 'border-[#125B50] bg-[#E8F5E9] text-[#125B50] shadow-sm font-bold ring-2 ring-[#125B50]/20'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${
                      selectedRole === 'officer' ? 'bg-[#125B50] text-white' : 'bg-white text-gray-600 shadow-2xs'
                    }`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Officer</span>
                    <span className="text-[10px] opacity-75 font-normal">Revenue / SRO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'border-[#125B50] bg-[#E8F5E9] text-[#125B50] shadow-sm font-bold ring-2 ring-[#125B50]/20'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-1.5 ${
                      selectedRole === 'admin' ? 'bg-[#125B50] text-white' : 'bg-white text-gray-600 shadow-2xs'
                    }`}>
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold">Admin</span>
                    <span className="text-[10px] opacity-75 font-normal">State Authority</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Sign In vs Sign Up Toggle */}
              <div className="px-6 pt-4 flex gap-6 text-sm font-medium border-b border-gray-100">
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className={`pb-3 relative transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'text-[#125B50] font-bold border-b-2 border-[#125B50]'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('signup')}
                  className={`pb-3 relative transition-all cursor-pointer ${
                    activeTab === 'signup'
                      ? 'text-[#125B50] font-bold border-b-2 border-[#125B50]'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  Create New Account
                </button>
              </div>

              {/* Step 3: Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Error message banner */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center justify-between">
                    <span>{error}</span>
                    <button type="button" onClick={clearError} className="text-red-500 hover:text-red-700 font-bold ml-2">×</button>
                  </div>
                )}
                {activeTab === 'signup' && (
                  <>
                    <div>
                      <label className="text-xs font-semibold text-gray-700 block mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
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
                          className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          Mobile Number <span className="text-[#125B50] font-normal">(can use to sign in)</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="e.g. 9876543210"
                            className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-gray-700 block mb-1">
                          {selectedRole === 'citizen' ? 'Aadhaar (Last 4 Digits)' : 'Official ID / Badge'}
                        </label>
                        <div className="relative">
                          <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={aadhaarLast4}
                            onChange={(e) => setAadhaarLast4(e.target.value)}
                            placeholder={selectedRole === 'citizen' ? 'XXXX 1234' : 'OFF-TN-8821'}
                            className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50]"
                          />
                        </div>
                      </div>
                    </div>

                    {selectedRole === 'officer' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-700 block mb-1">
                            Department
                          </label>
                          <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="Revenue / Registration / ULB"
                            className="w-full px-3 py-2.5 text-xs bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50]"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-700 block mb-1">
                            Jurisdiction / Taluk
                          </label>
                          <input
                            type="text"
                            value={officerId}
                            onChange={(e) => setOfficerId(e.target.value)}
                            placeholder="e.g. Erode West / Mylapore"
                            className="w-full px-3 py-2.5 text-xs bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50]"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    {selectedRole === 'citizen' ? 'Email Address or Mobile Number' : 'Official Govt Email (@tn.gov.in)'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={selectedRole === 'citizen' ? 'e.g. name@gmail.com or 9876543210' : DEMO_USERS[selectedRole].email}
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-700">
                      Password
                    </label>
                    {activeTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => alert('Password reset instructions sent to registered contact.')}
                        className="text-[11px] font-semibold text-[#125B50] hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me checkbox */}
                {activeTab === 'login' && (
                  <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded text-[#125B50] focus:ring-[#125B50]"
                      />
                      <span>Keep me signed in on this device</span>
                    </label>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#125B50] hover:bg-[#0E4940] disabled:bg-gray-400 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-[#125B50]/25 flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span>Authenticating with Supabase...</span>
                  ) : (
                    <>
                      <span>
                        {activeTab === 'login'
                          ? `Sign In as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
                          : `Complete ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Registration`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Instant Demo Login Section */}
              <div className="px-6 pb-6 pt-3 bg-gray-50/80 border-t border-gray-100">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#125B50]" />
                    <span>Instant 1-Click Demo Accounts</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-normal">Click to enter directly</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('citizen')}
                    className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-[#125B50] hover:bg-emerald-50/50 transition-all text-left group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-xs font-bold text-gray-900 group-hover:text-[#125B50]">
                        Citizen
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-600 font-semibold truncate">K. Aravind</div>
                    <div className="text-[10px] text-gray-400 truncate">Land Owner</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('officer')}
                    className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                      <span className="text-xs font-bold text-gray-900 group-hover:text-blue-600">
                        Officer
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-600 font-semibold truncate">Dr. M. Sundaram</div>
                    <div className="text-[10px] text-gray-400 truncate">Tahsildar / RDO</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('admin')}
                    className="p-2.5 rounded-xl bg-white border border-gray-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-left group cursor-pointer shadow-2xs"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                      <span className="text-xs font-bold text-gray-900 group-hover:text-purple-600">
                        Admin
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-600 font-semibold truncate">S. Rajendran, IAS</div>
                    <div className="text-[10px] text-gray-400 truncate">State Admin</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 border-t border-gray-200/80 bg-white/70 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Land Stack Tamil Nadu • Unified Land Governance Digital Public Infrastructure</span>
          </div>
          <div>
            <span>FastAPI Gateway • PostGIS Spatial Database • React Vite Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
