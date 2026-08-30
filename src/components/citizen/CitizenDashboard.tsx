import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SearchLandPage } from './SearchLandPage';
import { MapExplorerPage } from './MapExplorerPage';
import { MyParcelsPage } from './MyParcelsPage';
import { MyRecordsPage } from './MyRecordsPage';
import { ServicesPage } from './ServicesPage';
import {
  Search,
  Home,
  MapPin,
  FolderOpen,
  FileText,
  Grid,
  CreditCard,
  Bell,
  HelpCircle,
  Plus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Layers,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Compass,
  FileCheck,
  LogOut,
  UserCheck,
  User,
  Settings,
} from 'lucide-react';

type NavPage = 'Home' | 'Search Land' | 'Map Explorer' | 'My Parcels' | 'My Requests' | 'My Records' | 'Services' | 'Payments' | 'Notifications' | 'Help & Support';

export const CitizenDashboard: React.FC<{ onOpenAuthModal?: () => void }> = () => {
  const { user, logout } = useAuth();
  const [activeNav, setActiveNav] = useState<NavPage>('Home');
  const [activeSearchTab, setActiveSearchTab] = useState<'ulpin' | 'survey' | 'location'>('ulpin');
  const [ulpinInput, setUlpinInput] = useState('TN-ERD-126-1-0003');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const openMapExplorer = (_ulpin?: string) => {
    setActiveNav('Map Explorer');
  };

  const openMyParcels = (_ulpin?: string) => {
    setActiveNav('My Parcels');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800 font-sans flex flex-col antialiased">
      {/* ── TOPBAR ────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-3 shadow-xs">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#125B50] to-[#0B3B34] flex items-center justify-center text-white shadow-md shadow-[#125B50]/20">
              <Layers className="w-5 h-5 text-[#4ECCA3]" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-gray-900 tracking-tight leading-tight">LAND STACK</div>
              <p className="text-[11px] font-medium text-gray-500 leading-none">Tamil Nadu Land Governance</p>
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by ULPIN / Survey No / Owner Name / Location..."
                className="w-full pl-4 pr-10 py-2.5 bg-gray-50/90 hover:bg-gray-50 focus:bg-white border border-gray-200 rounded-full text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#125B50]/20 focus:border-[#125B50] transition-all"
              />
              <Search className="w-4 h-4 text-gray-400 absolute right-4 top-3" />
            </div>
          </div>

          {/* Right: Bell + Profile */}
          <div className="flex items-center gap-4 shrink-0">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#125B50] text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
            </button>

            <button className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2.5 py-1.5 rounded-lg transition-colors">
              <HelpCircle className="w-4 h-4 text-gray-500" />
              <span>Help</span>
            </button>

            {/* Profile Dropdown - NO Switch Role Preview */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 pl-1.5 pr-2 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
              >
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-[#125B50]/20"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-gray-900 leading-tight">{user?.name || 'K. Aravind'}</div>
                  <div className="text-[10px] text-gray-500 font-medium capitalize">{user?.role || 'Citizen'}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 text-xs">
                  {/* User Info */}
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-[#125B50]/10"
                      />
                      <div>
                        <p className="font-bold text-gray-800">{user?.name}</p>
                        <p className="text-[11px] text-gray-400 truncate max-w-[120px]">{user?.email}</p>
                        <span className="text-[10px] font-bold text-[#125B50] capitalize">{user?.role}</span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>My Profile</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-gray-400" />
                    <span>Account Settings</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-gray-400" />
                    <span>Notification Preferences</span>
                  </button>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 font-semibold"
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

      {/* ── MAIN BODY ───────────────────────────────────────────────── */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT SIDEBAR ───────────────────────────────────────────── */}
        <aside className="lg:col-span-2 flex flex-col gap-6">
          <nav className="bg-white rounded-2xl p-3 border border-gray-200/80 shadow-xs space-y-1">
            {([
              { name: 'Home', icon: Home },
              { name: 'Search Land', icon: Search },
              { name: 'Map Explorer', icon: MapPin },
              { name: 'My Parcels', icon: FolderOpen },
              { name: 'My Requests', icon: FileText },
              { name: 'My Records', icon: FileCheck },
              { name: 'Services', icon: Grid },
              { name: 'Payments', icon: CreditCard },
              { name: 'Notifications', icon: Bell },
              { name: 'Help & Support', icon: HelpCircle },
            ] as { name: NavPage; icon: React.ElementType }[]).map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveNav(item.name)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E8F5E9] text-[#125B50] font-bold shadow-xs'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#125B50]' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Banner Card */}
          <div className="bg-gradient-to-b from-[#E8F5E9] to-[#C8E6C9]/40 border border-[#A5D6A7]/50 rounded-2xl p-5 text-gray-800 flex flex-col justify-between overflow-hidden relative group">
            <div className="space-y-1 z-10">
              <h4 className="font-bold text-sm text-[#125B50] leading-snug">One Platform.<br />All Land Information.</h4>
              <p className="text-[11px] text-gray-600 font-medium">Transparent. Reliable. Easy.</p>
            </div>
            <div className="mt-8 pt-4 flex items-end justify-center relative">
              <svg className="w-full h-24 text-[#2E7D32]/25" viewBox="0 0 200 80" fill="currentColor">
                <path d="M10,75 Q30,60 50,75 T90,75 T130,75 T170,75 T200,75 L200,80 L0,80 Z" opacity="0.4" />
                <path d="M70,80 L70,45 L75,35 L80,45 L80,80 Z" />
                <path d="M72,35 L75,20 L78,35 Z" />
                <circle cx="75" cy="16" r="3" />
                <circle cx="35" cy="50" r="10" />
                <rect x="33" y="50" width="4" height="30" />
                <circle cx="170" cy="52" r="8" />
                <rect x="168" y="52" width="4" height="28" />
              </svg>
            </div>
          </div>
        </aside>

        {/* ── CENTER + RIGHT CONTENT ─────────────────────────────────── */}
        <div className="lg:col-span-10">

          {/* ─── SEARCH LAND PAGE ───────────────────────────────────── */}
          {activeNav === 'Search Land' && (
            <SearchLandPage />
          )}

          {/* ─── HOME DASHBOARD ─────────────────────────────────────── */}
          {activeNav === 'Home' && (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Main Home Content */}
              <div className="flex-1 flex flex-col gap-6">
                {/* Greeting Banner */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 z-10 max-w-md">
                    <div className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                      <span>Good Morning,</span>
                      <span className="text-base">👋</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">{user?.name || 'K. Aravind'}</h2>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Welcome to Land Stack, Tamil Nadu</p>
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 sm:opacity-80 pointer-events-none flex items-center justify-end pr-4">
                    <svg className="w-64 h-full text-[#125B50]/30" viewBox="0 0 300 120" fill="currentColor">
                      <path d="M180,120 L180,50 L190,30 L200,50 L200,120 Z" />
                      <path d="M185,30 L190,10 L195,30 Z" />
                      <circle cx="190" cy="6" r="4" />
                      <circle cx="120" cy="65" r="14" opacity="0.6" />
                      <rect x="118" y="65" width="4" height="55" opacity="0.6" />
                      <circle cx="250" cy="70" r="12" opacity="0.5" />
                      <rect x="248" y="70" width="4" height="50" opacity="0.5" />
                      <path d="M0,110 Q80,90 160,110 T300,110 L300,120 L0,120 Z" opacity="0.2" />
                    </svg>
                  </div>
                </div>

                {/* 4 Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {[
                    { label: 'My Parcels', count: '04', sub: 'Parcels Registered', icon: FileCheck, color: 'bg-emerald-50 text-[#125B50] border-emerald-100', hover: 'hover:border-emerald-300', nav: 'My Parcels' as NavPage },
                    { label: 'My Requests', count: '02', sub: 'In Progress', icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-100', hover: 'hover:border-amber-300', nav: 'My Requests' as NavPage },
                    { label: 'My Records', count: '24', sub: 'All Records', icon: CheckCircle2, color: 'bg-blue-50 text-blue-600 border-blue-100', hover: 'hover:border-blue-300', nav: 'My Records' as NavPage },
                    { label: 'Notifications', count: '03', sub: 'Unread', icon: Bell, color: 'bg-purple-50 text-purple-600 border-purple-100', hover: 'hover:border-purple-300', nav: 'Notifications' as NavPage },
                  ].map((s, i) => {
                    const Icon = s.icon;
                    return (
                      <button key={i} onClick={() => setActiveNav(s.nav)} className={`bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex items-center gap-3.5 transition-all cursor-pointer text-left ${s.hover}`}>
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${s.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[11px] font-semibold text-gray-500">{s.label}</div>
                          <div className="text-xl font-extrabold text-gray-900 leading-tight">{s.count}</div>
                          <div className="text-[10px] text-gray-400">{s.sub}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Map + Quick Search */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-gray-900">Explore Land on Map</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Mini Map */}
                    <div className="md:col-span-7 bg-[#E2EEF0] rounded-xl border border-gray-200 overflow-hidden relative min-h-[260px] flex flex-col justify-between p-3">
                      <div className="absolute inset-0 opacity-80">
                        <svg className="w-full h-full" viewBox="0 0 350 240">
                          <path d="M60,40 Q180,20 280,35 Q290,120 270,180 Q210,230 150,220 Q80,180 60,110 Z" fill="#CBE8DA" stroke="#A3D9C9" strokeWidth="1.5" />
                          <polygon points="120,90 180,85 200,120 140,130" fill="#B2DFDB" stroke="#80CBC4" strokeWidth="1" />
                          <text x="135" y="105" fill="#004D40" fontSize="8" fontFamily="monospace">125/4A</text>
                          <polygon points="100,130 140,130 150,170 110,165" fill="#C8E6C9" stroke="#A5D6A7" strokeWidth="1" />
                          <text x="115" y="148" fill="#1B5E20" fontSize="8" fontFamily="monospace">125/5</text>
                          <polygon points="150,170 190,165 200,200 160,205" fill="#E8F5E9" stroke="#C8E6C9" strokeWidth="1" />
                          <text x="165" y="188" fill="#2E7D32" fontSize="8" fontFamily="monospace">125/6</text>
                          <polygon points="160,105 210,100 220,135 170,140" fill="#2E7D32" fillOpacity="0.75" stroke="#1B5E20" strokeWidth="1.5" />
                          <text x="178" y="125" fill="#FFF" fontSize="9" fontWeight="bold" fontFamily="monospace">126/1</text>
                          <circle cx="280" cy="50" r="3" fill="#125B50" />
                          <text x="260" y="42" fill="#125B50" fontSize="9" fontWeight="bold">Chennai</text>
                          <circle cx="180" cy="65" r="2.5" fill="#4B5563" />
                          <text x="170" y="58" fill="#4B5563" fontSize="8">Salem</text>
                          <circle cx="100" cy="115" r="2.5" fill="#4B5563" />
                          <text x="72" y="112" fill="#4B5563" fontSize="8">Coimbatore</text>
                          <circle cx="210" cy="125" r="2.5" fill="#4B5563" />
                          <text x="195" y="120" fill="#4B5563" fontSize="8">Tiruchirappalli</text>
                          <g transform="translate(182, 108)">
                            <circle cx="8" cy="8" r="7" fill="#F97316" opacity="0.3" />
                            <circle cx="8" cy="8" r="5" fill="#F97316" />
                            <circle cx="8" cy="8" r="2" fill="#FFF" />
                          </g>
                        </svg>
                      </div>
                      <div className="z-10 flex flex-col gap-1 bg-white/95 rounded-lg shadow-sm border border-gray-200 w-7 overflow-hidden text-gray-700">
                        <button className="h-7 flex items-center justify-center hover:bg-gray-100 font-bold text-sm">+</button>
                        <button className="h-7 flex items-center justify-center hover:bg-gray-100 font-bold text-sm border-t border-gray-100">−</button>
                        <button className="h-7 flex items-center justify-center hover:bg-gray-100 text-xs border-t border-gray-100"><Compass className="w-3.5 h-3.5 text-gray-500" /></button>
                      </div>
                      <div className="z-10">
                        <button className="bg-white/95 hover:bg-white text-gray-800 text-[11px] font-semibold px-3 py-1.5 rounded-lg shadow-sm border border-gray-200/80 flex items-center gap-1.5 transition-colors">
                          <Layers className="w-3.5 h-3.5 text-[#125B50]" />
                          <span>View Map Layers</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Search Panel */}
                    <div className="md:col-span-5 flex flex-col justify-between space-y-3">
                      <div className="space-y-3">
                        <div className="font-bold text-xs text-gray-800">Quick Search</div>
                        <div className="flex border-b border-gray-200 text-xs font-semibold">
                          {(['ulpin', 'survey', 'location'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setActiveSearchTab(t)}
                              className={`pb-1.5 px-2 transition-colors relative capitalize ${activeSearchTab === t ? 'text-[#125B50] font-bold border-b-2 border-[#125B50]' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                              {t === 'ulpin' ? 'ULPIN' : t === 'survey' ? 'Survey No' : 'Location'}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={ulpinInput}
                            onChange={(e) => setUlpinInput(e.target.value)}
                            placeholder="Enter ULPIN"
                            className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#125B50] font-mono text-gray-800"
                          />
                          <button
                            onClick={() => setActiveNav('Search Land')}
                            className="bg-[#125B50] hover:bg-[#0E4940] text-white px-3 py-2 rounded-lg flex items-center justify-center transition-colors shadow-xs"
                          >
                            <Search className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono">Example: TN-ERD-126-1-0003</p>
                      </div>

                      <div className="bg-[#E8F5E9]/60 border border-[#C8E6C9] rounded-xl p-3 space-y-1.5">
                        <div className="font-bold text-xs text-[#125B50]">Don't know ULPIN?</div>
                        <p className="text-[11px] text-gray-600 leading-tight">Search by Survey Number or Location on Map Explorer.</p>
                        <button
                          onClick={() => setActiveNav('Search Land')}
                          className="text-[11px] font-bold text-[#125B50] hover:underline flex items-center gap-1 pt-1"
                        >
                          <span>Go to Map Explorer</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Popular Services */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-gray-900">Popular Services</h3>
                    <button onClick={() => setActiveNav('Services')} className="text-xs font-bold text-[#125B50] hover:underline flex items-center gap-1">
                      <span>View All Services</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {[
                      { title: 'RoR Extract', desc: 'Record of Rights Extract', icon: FileText, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
                      { title: 'Land Ownership Verification', desc: 'Verify ownership details', icon: UserCheck, color: 'text-amber-600 bg-amber-50 border-amber-100' },
                      { title: 'Encumbrance Certificate', desc: 'Check mortgage & encumbrances', icon: Search, color: 'text-blue-600 bg-blue-50 border-blue-100' },
                      { title: 'Property Tax Details', desc: 'View tax assessment and dues', icon: CreditCard, color: 'text-orange-600 bg-orange-50 border-orange-100' },
                      { title: 'Building Permission', desc: 'Check building approvals', icon: Building, color: 'text-purple-600 bg-purple-50 border-purple-100' },
                      { title: 'Land Use Information', desc: 'View land use & zoning details', icon: Layers, color: 'text-teal-600 bg-teal-50 border-teal-100' },
                    ].map((svc, i) => {
                      const Icon = svc.icon;
                      return (
                        <div key={i} onClick={() => setActiveNav('Services')} className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-gray-50/50 hover:bg-white flex flex-col justify-between space-y-2 cursor-pointer group">
                          <div className={`w-8 h-8 rounded-lg ${svc.color} flex items-center justify-center border shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-xs text-gray-900 group-hover:text-[#125B50] transition-colors leading-snug">{svc.title}</div>
                            <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">{svc.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Panel (Home Dashboard) */}
              <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-6 shrink-0">
                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-3">
                  <h4 className="font-bold text-xs text-gray-900">Quick Actions</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'Search Land', icon: Search, nav: 'Search Land' as NavPage },
                      { name: 'My Parcels', icon: FolderOpen, nav: 'My Parcels' as NavPage },
                      { name: 'My Records', icon: FileCheck, nav: 'My Records' as NavPage },
                      { name: 'New Request', icon: Plus, nav: 'Services' as NavPage },
                    ].map((action, idx) => {
                      const Icon = action.icon;
                      return (
                        <button key={idx} onClick={() => setActiveNav(action.nav)} className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200/60 hover:border-emerald-200 transition-all group">
                          <div className="w-8 h-8 rounded-lg bg-white group-hover:bg-[#125B50] text-[#125B50] group-hover:text-white flex items-center justify-center border border-gray-200/80 transition-colors shadow-2xs mb-1.5">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-semibold text-gray-700 group-hover:text-[#125B50] text-center leading-tight">{action.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-gray-900">Recent Notifications</h4>
                    <button onClick={() => setActiveNav('Notifications')} className="text-[11px] font-bold text-[#125B50] hover:underline">View All</button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600', title: 'Request Update', time: '10:30 AM', desc: 'Your request REQ-2025-1023 is under verification.' },
                      { icon: Bell, color: 'bg-amber-50 text-amber-600', title: 'Payment Successful', time: 'Yesterday', desc: 'Payment of ₹250 for Property Tax for ULPIN TN-ERD-126-1-0003 successful.' },
                      { icon: HelpCircle, color: 'bg-blue-50 text-blue-600', title: 'New Service Available', time: '18 May 2025', desc: 'Building Permission Verification is now available online.' },
                    ].map((n, i) => {
                      const Icon = n.icon;
                      return (
                        <div key={i} className={`flex items-start gap-2.5 ${i < 2 ? 'pb-2.5 border-b border-gray-100' : ''}`}>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${n.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="font-bold text-xs text-gray-900">{n.title}</div>
                              <span className="text-[10px] text-gray-400">{n.time}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{n.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => setActiveNav('Notifications')} className="w-full text-center pt-2 text-[11px] font-bold text-[#125B50] hover:underline flex items-center justify-center gap-1">
                    <span>View All Notifications</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* About ULPIN */}
                <div className="bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]/50 border border-[#A5D6A7]/60 rounded-2xl p-4 text-gray-800 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#125B50]" />
                    <h5 className="font-bold text-xs text-[#125B50]">About ULPIN</h5>
                  </div>
                  <p className="text-[11px] text-gray-600 leading-snug z-10 relative">
                    ULPIN (Unique Land Parcel Identification Number) is a unique identifier for every land parcel.
                  </p>
                  <button className="text-[11px] font-bold text-[#125B50] hover:underline flex items-center gap-1 mt-2 z-10 relative">
                    <span>Know more</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <div className="absolute right-1 bottom-0 opacity-40 pointer-events-none">
                    <svg className="w-20 h-14 text-[#2E7D32]" viewBox="0 0 80 50" fill="currentColor">
                      <circle cx="25" cy="20" r="14" />
                      <rect x="23" y="20" width="4" height="30" />
                      <circle cx="55" cy="24" r="11" opacity="0.8" />
                      <rect x="53" y="24" width="4" height="26" opacity="0.8" />
                    </svg>
                  </div>
                </div>

                {/* My Requests Table */}
                <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-gray-900">My Requests</h4>
                    <button onClick={() => setActiveNav('My Requests')} className="text-[11px] font-bold text-[#125B50] hover:underline">View All</button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-semibold">
                          <th className="pb-1.5">Request ID</th>
                          <th className="pb-1.5">Service Type</th>
                          <th className="pb-1.5">Status</th>
                          <th className="pb-1.5 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        <tr>
                          <td className="py-2 font-mono font-bold text-gray-800">REQ-2025-1023</td>
                          <td className="py-2 text-gray-600">Land Ownership Verification</td>
                          <td className="py-2"><span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-semibold text-[10px]">In Progress</span></td>
                          <td className="py-2 text-right text-gray-400">18 May</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-mono font-bold text-gray-800">REQ-2025-0987</td>
                          <td className="py-2 text-gray-600">RoR Extract</td>
                          <td className="py-2"><span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold text-[10px]">Under Review</span></td>
                          <td className="py-2 text-right text-gray-400">15 May</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── MAP EXPLORER PAGE ─────────────────────────────────────── */}
          {activeNav === 'Map Explorer' && (
            <MapExplorerPage
              onOpenInMyParcels={openMyParcels}
            />
          )}

          {/* ─── MY PARCELS PAGE ──────────────────────────────────────────── */}
          {activeNav === 'My Parcels' && (
            <MyParcelsPage
              onOpenInMapExplorer={openMapExplorer}
            />
          )}

          {/* ─── MY RECORDS PAGE ──────────────────────────────────────── */}
          {activeNav === 'My Records' && (
            <MyRecordsPage />
          )}

          {/* ─── SERVICES PAGE ────────────────────────────────────────── */}
          {activeNav === 'Services' && (
            <ServicesPage />
          )}

          {/* ─── PLACEHOLDER FOR OTHER PAGES ─────────────────────────── */}
          {!['Home', 'Search Land', 'Map Explorer', 'My Parcels', 'My Records', 'Services'].includes(activeNav) && (
            <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-xs text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#125B50] flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{activeNav}</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mt-1">
                This section is under development. Full functionality coming soon.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
          <div className="flex flex-wrap items-center gap-6">
            {[
              { label: 'Parcel Centric', desc: 'All information linked to ULPIN' },
              { label: 'Transparent', desc: 'Clear & accessible information' },
              { label: 'Interoperable', desc: 'Works across departments' },
              { label: 'Secure', desc: 'Your data is protected' },
              { label: 'Accessible', desc: 'Anytime, Anywhere' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-[#125B50]">
                  <Layers className="w-3 h-3" />
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-[11px]">{f.label}</div>
                  <div className="text-[10px] text-gray-400">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 font-bold text-[#125B50] text-[11px]">
            <span>Building a Digitally Empowered Tamil Nadu</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
