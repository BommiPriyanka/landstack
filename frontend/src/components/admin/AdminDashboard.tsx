import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminSidebar, type AdminNavPage } from './AdminSidebar';
import {
  getAdminDashboardStats,
  getAdminUsers,
  getAdminDepartments,
  getAdminServices,
  getAdminGISLayers,
  getAdminAuditLogs,
  getSystemSettings,
  saveSystemSettings,
  updateUserStatus,
  updateUserRole,
  createDepartment,
  updateDepartmentStatus,
  type AdminStats,
  type AdminUser,
  type DepartmentInfo,
  type GISLayerInfo,
  type GovServiceConfig,
  type AdminAuditEntry,
  type SystemSettingsConfig,
} from '../../services/adminService';
import { LOCAL_PARCELS, MOCK_CADASTRAL_POLYGONS } from '../../services/landService';
import { TN_DISTRICTS } from '../../data/tnDistricts';
import RealMap from '../common/RealMap';

import {
  Shield,
  Bell,
  ChevronDown,
  LogOut,
  UserCheck,
  Sparkles,
  Users,
  Building2,
  Layers,
  MapPin,
  FileSpreadsheet,
  FileCheck2,
  GitPullRequest,
  BarChart3,
  History,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Plus,
  Lock,
  Globe,
  Database,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenAuthModal: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenAuthModal }) => {
  const { user, logout, switchRole } = useAuth();
  const [activeNav, setActiveNav] = useState<AdminNavPage>('Dashboard');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Core Data States
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [services, setServices] = useState<GovServiceConfig[]>([]);
  const [gisLayers, setGisLayers] = useState<GISLayerInfo[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditEntry[]>([]);
  const [systemSettings, setSystemSettings] = useState<SystemSettingsConfig>(getSystemSettings());

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'citizen' | 'officer' | 'admin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL'>('all');
  const [selectedJurisdictionDistrict, setSelectedJurisdictionDistrict] = useState('Erode');

  // New Department Modal
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');

  // Refresh trigger
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    getAdminDashboardStats().then(setStats);
    getAdminUsers().then(setUsersList);
    getAdminDepartments().then(setDepartments);
    getAdminAuditLogs().then(setAuditLogs);
    setServices(getAdminServices());
    setGisLayers(getAdminGISLayers());
  }, [refreshTick]);

  const triggerRefresh = () => setRefreshTick(t => t + 1);

  // Security guard for non-admin view
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Admin Access Restricted</h2>
          <p className="text-xs text-gray-500">
            You are logged in as <span className="font-bold text-gray-700">{user?.name}</span> ({user?.role?.toUpperCase()}). Only authenticated State Administrators can access the Admin Console.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={() => switchRole('admin')}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold"
            >
              Switch to Demo Admin
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER SECTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  // 1. DASHBOARD OVERVIEW
  const renderDashboardOverview = () => (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-700/60 border border-purple-400/30 text-purple-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              State DPI Command Center • Tamil Nadu Land Governance
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              Welcome, {user.name}
            </h2>
            <p className="text-xs text-purple-200 font-medium">
              {user.designation || 'State System Administrator'} • Scope: {user.jurisdiction || 'All 38 Districts'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => switchRole('officer')}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>View Officer Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => switchRole('citizen')}
              className="px-3.5 py-2 rounded-xl bg-[#125B50] hover:bg-[#0E4940] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Citizen Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-gray-500 flex items-center justify-between">
            <span>Citizens</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats?.totalCitizens || 3}</div>
          <div className="text-[10px] text-emerald-600 font-semibold">Registered Accounts</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-gray-500 flex items-center justify-between">
            <span>Officers</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats?.totalOfficers || 3}</div>
          <div className="text-[10px] text-blue-600 font-semibold">{stats?.pendingApprovals || 1} pending approval</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-gray-500 flex items-center justify-between">
            <span>Parcels</span>
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700">{stats?.totalParcels || 10}</div>
          <div className="text-[10px] text-purple-600 font-semibold">PostGIS & Synced</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-gray-500 flex items-center justify-between">
            <span>Districts</span>
            <MapPin className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats?.totalDistricts || 38}</div>
          <div className="text-[10px] text-indigo-600 font-semibold">310 Taluks Active</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-gray-500 flex items-center justify-between">
            <span>GIS Layers</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats?.totalGISLayers || 8}</div>
          <div className="text-[10px] text-amber-600 font-semibold">Vector & Hybrid Tiles</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200/90 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-gray-500 flex items-center justify-between">
            <span>Requests</span>
            <FileCheck2 className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-gray-900">{stats?.pendingServiceRequests || 14}</div>
          <div className="text-[10px] text-rose-600 font-semibold">Pending Processing</div>
        </div>
      </div>

      {/* Overview Map & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: GIS Overview Map */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/90 shadow-xs p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Tamil Nadu Multi-Scale Cadastral Coverage</h3>
                <p className="text-[11px] text-gray-500">Live PostGIS Viewport GIS Engine with 10 Cadastral Demo Parcels</p>
              </div>
            </div>
            <button
              onClick={() => setActiveNav('GIS Layers')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Layers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-[380px] rounded-xl overflow-hidden border border-gray-200">
            <RealMap
              baseLayer="satellite"
              showCadastral={true}
              polygons={MOCK_CADASTRAL_POLYGONS}
              showScale={true}
            />
          </div>
        </div>

        {/* Right Col: Recent System Activities */}
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-700" />
                <h3 className="font-bold text-sm text-gray-900">Recent Audit Activities</h3>
              </div>
              <button
                onClick={() => setActiveNav('Audit Logs')}
                className="text-[11px] font-bold text-purple-700 hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="space-y-3">
              {(stats?.recentActivities || []).map((entry) => (
                <div key={entry.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-gray-500">
                    <span className="font-mono">{entry.timestamp.slice(11, 19)}</span>
                    <span className="px-1.5 py-0.2 rounded font-bold bg-purple-100 text-purple-800 text-[9px]">
                      {entry.user_role}
                    </span>
                  </div>
                  <div className="font-semibold text-gray-800 flex items-center gap-1.5">
                    <span>{entry.action}</span>
                    {entry.ulpin && (
                      <span className="text-[10px] font-mono text-purple-700">[{entry.ulpin}]</span>
                    )}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {entry.new_value || entry.previous_value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-[11px] text-purple-900 flex items-center justify-between">
            <span className="font-semibold">Immutable DPI Audit Logging</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // 2. USER MANAGEMENT
  const renderUserManagement = (filterRole?: 'citizen' | 'officer') => {
    const targetRole = filterRole || roleFilter;
    const filteredUsers = usersList.filter(u => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRole = targetRole === 'all' || u.role === targetRole;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });

    return (
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {filterRole === 'citizen' ? 'Citizen Account Management' : filterRole === 'officer' ? 'Government Officer Management' : 'System User & IAM Administration'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage accounts, approval workflows, role bindings, and department jurisdictions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={triggerRefresh}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors cursor-pointer"
              title="Refresh List"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {!filterRole && (
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="text-xs bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="citizen">Citizens</option>
              <option value="officer">Officers</option>
              <option value="admin">Administrators</option>
            </select>
          )}

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-white border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="INACTIVE">Inactive / Deactivated</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 text-gray-600 font-bold border-b border-gray-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department / Designation</th>
                <th className="py-3 px-4">Jurisdiction</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{u.name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{u.email}</div>
                      <div className="text-[10px] text-gray-400 font-mono">ID: {u.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'officer'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-800">{u.department || '—'}</div>
                      <div className="text-[11px] text-gray-500">{u.designation || 'General Citizen'}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {u.jurisdiction || 'State Wide'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : u.status === 'PENDING_APPROVAL'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {u.status === 'ACTIVE' && <CheckCircle2 className="w-3 h-3" />}
                        {u.status === 'PENDING_APPROVAL' && <AlertCircle className="w-3 h-3" />}
                        {u.status === 'INACTIVE' && <XCircle className="w-3 h-3" />}
                        {u.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {u.status === 'PENDING_APPROVAL' && (
                        <button
                          onClick={async () => {
                            await updateUserStatus(u.db_id || u.id, 'ACTIVE', user.name);
                            triggerRefresh();
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Approve
                        </button>
                      )}

                      {u.status === 'ACTIVE' ? (
                        <button
                          onClick={async () => {
                            await updateUserStatus(u.db_id || u.id, 'INACTIVE', user.name);
                            triggerRefresh();
                          }}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold text-[10px] transition-colors cursor-pointer"
                        >
                          Deactivate
                        </button>
                      ) : u.status === 'INACTIVE' ? (
                        <button
                          onClick={async () => {
                            await updateUserStatus(u.db_id || u.id, 'ACTIVE', user.name);
                            triggerRefresh();
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-semibold text-[10px] transition-colors cursor-pointer"
                        >
                          Activate
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 3. ROLES & RBAC MANAGEMENT
  const renderRBAC = () => {
    const permissionsMatrix = [
      { module: 'GIS Base Map & Tile Viewing', citizen: true, officer: true, admin: true },
      { module: 'Cadastral Parcel Search & Details View', citizen: true, officer: true, admin: true },
      { module: 'Submit Citizen Service Applications', citizen: true, officer: false, admin: false },
      { module: 'Cadastral Parcel Creation & Boundary Editing', citizen: false, officer: true, admin: true },
      { module: 'Field Verification & Patta Scrutiny', citizen: false, officer: true, admin: true },
      { module: 'Department Workflow Approval & Digital Sign', citizen: false, officer: true, admin: true },
      { module: 'System User & Officer Account Management', citizen: false, officer: false, admin: true },
      { module: 'Department & Service SLA Configuration', citizen: false, officer: false, admin: true },
      { module: 'GIS Vector Layer Upload & Seed Management', citizen: false, officer: false, admin: true },
      { module: 'State-wide Audit Log Inspection (Read-Only)', citizen: false, officer: false, admin: true },
      { module: 'System Maintenance & Core DPI Settings', citizen: false, officer: false, admin: true },
    ];

    return (
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Role-Based Access Control (RBAC) Matrix</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Strict granular permission bindings across Citizen, Field Officer, and State Administrator profiles.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-gray-700 font-bold border-b border-gray-200 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">DPI Module / Action Capability</th>
                <th className="py-3 px-4 text-center">Citizen</th>
                <th className="py-3 px-4 text-center">Government Officer</th>
                <th className="py-3 px-4 text-center">State Administrator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {permissionsMatrix.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-medium text-gray-900">{item.module}</td>
                  <td className="py-3 px-4 text-center">
                    {item.citizen ? (
                      <span className="text-emerald-600 font-bold">✓ Granted</span>
                    ) : (
                      <span className="text-gray-300 font-medium">✗ Restricted</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.officer ? (
                      <span className="text-emerald-600 font-bold">✓ Granted</span>
                    ) : (
                      <span className="text-gray-300 font-medium">✗ Restricted</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {item.admin ? (
                      <span className="text-purple-700 font-bold">✓ Full Authority</span>
                    ) : (
                      <span className="text-gray-300 font-medium">✗ Restricted</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 4. DEPARTMENT MANAGEMENT
  const renderDepartments = () => (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Government Department Management</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Inter-departmental configuration, active services, officer assignment, and pending workload.
          </p>
        </div>

        <button
          onClick={() => setShowDeptModal(true)}
          className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((dept) => (
          <div key={dept.id} className="p-5 rounded-2xl border border-gray-200 bg-slate-50/50 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 font-mono">
                  {dept.code}
                </span>
                <h3 className="font-bold text-sm text-gray-900 mt-1">{dept.name}</h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  dept.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {dept.status}
              </span>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed min-h-[36px]">{dept.description}</p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200/80 text-center text-xs">
              <div className="p-2 rounded-lg bg-white border border-gray-100">
                <div className="text-[10px] text-gray-400 font-semibold">Officers</div>
                <div className="font-bold text-gray-900">{dept.officer_count}</div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-gray-100">
                <div className="text-[10px] text-gray-400 font-semibold">Services</div>
                <div className="font-bold text-purple-700">{dept.active_services}</div>
              </div>
              <div className="p-2 rounded-lg bg-white border border-gray-100">
                <div className="text-[10px] text-gray-400 font-semibold">Workload</div>
                <div className="font-bold text-amber-700">{dept.workload_pending}</div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  updateDepartmentStatus(
                    dept.id,
                    dept.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                    user.name
                  );
                  triggerRefresh();
                }}
                className="text-[11px] font-bold text-purple-700 hover:text-purple-900 cursor-pointer"
              >
                {dept.status === 'ACTIVE' ? 'Deactivate Department' : 'Activate Department'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Dept Modal */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">Add New Government Department</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">Department Code</label>
                <input
                  type="text"
                  placeholder="e.g. FOREST, AGRI, PWD"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value.toUpperCase())}
                  className="w-full p-2 border border-gray-300 rounded-lg font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Department Name</label>
                <input
                  type="text"
                  placeholder="e.g. Department of Environment & Climate"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Description & Mandate</label>
                <textarea
                  rows={3}
                  placeholder="Scope of services..."
                  value={newDeptDesc}
                  onChange={(e) => setNewDeptDesc(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeptModal(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (newDeptName && newDeptCode) {
                    await createDepartment(
                      {
                        code: newDeptCode,
                        name: newDeptName,
                        description: newDeptDesc,
                        officer_count: 0,
                        active_services: 0,
                        status: 'ACTIVE',
                        workload_pending: 0,
                      },
                      user.name
                    );
                    setShowDeptModal(false);
                    setNewDeptName('');
                    setNewDeptCode('');
                    setNewDeptDesc('');
                    triggerRefresh();
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl cursor-pointer"
              >
                Save Department
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // 5. GIS LAYERS
  const renderGISLayers = () => (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">GIS & Spatial Layer Management</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Configured spatial vector datasets, PostGIS coordinate reference systems (CRS), and tile caches.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-gray-700 font-bold border-b border-gray-200 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Layer Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Geometry Type</th>
              <th className="py-3 px-4">SRID / CRS</th>
              <th className="py-3 px-4">Feature Count</th>
              <th className="py-3 px-4">Data Source</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gisLayers.map((layer) => (
              <tr key={layer.id} className="hover:bg-slate-50/60">
                <td className="py-3 px-4 font-bold text-gray-900">{layer.name}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    {layer.category}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono text-gray-600">{layer.geometry_type}</td>
                <td className="py-3 px-4 font-mono text-gray-600">{layer.srid}</td>
                <td className="py-3 px-4 font-bold text-gray-900">{layer.feature_count.toLocaleString()}</td>
                <td className="py-3 px-4 text-gray-600">{layer.source}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 6. JURISDICTIONS (DISTRICTS / TALUKS / VILLAGES)
  const renderJurisdictions = () => {
    const selectedDistObj = TN_DISTRICTS.find(d => d.name === selectedJurisdictionDistrict) || TN_DISTRICTS[0];

    return (
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Administrative Jurisdiction Hierarchy</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              State → 38 Districts → 310 Taluks → Revenue Villages (TN LGD Registry).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Select District:</span>
            <select
              value={selectedJurisdictionDistrict}
              onChange={(e) => setSelectedJurisdictionDistrict(e.target.value)}
              className="text-xs bg-slate-50 border border-gray-300 rounded-xl px-3 py-1.5 font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              {TN_DISTRICTS.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} ({d.taluks.length} Taluks)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected District Cards */}
        <div className="space-y-4">
          <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-purple-900">{selectedDistObj.name} District</h3>
              <p className="text-xs text-purple-700 font-mono mt-0.5">
                Center Coordinates: {selectedDistObj.lat}°N, {selectedDistObj.lng}°E • Code: {selectedDistObj.code}
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-purple-700 text-white font-bold text-xs">
              {selectedDistObj.taluks.length} Taluks Configured
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedDistObj.taluks.map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-200 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-gray-900">{t.name} Taluk</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-gray-600">
                    {(t.villages || []).length} Villages
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 font-mono">
                  📍 {t.lat.toFixed(4)}°N, {t.lng.toFixed(4)}°E
                </p>
                <div className="text-[11px] text-gray-600 truncate">
                  Villages: {(t.villages || []).slice(0, 3).join(', ')}
                  {(t.villages || []).length > 3 ? '…' : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // 7. PARCEL DATA MANAGEMENT
  const renderParcels = () => (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Cadastral Parcel Registry (Central DPI Engine)</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Read-only administrative inspection of registered parcels and PostGIS geometries.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-gray-700 font-bold border-b border-gray-200 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">ULPIN / Survey No</th>
              <th className="py-3 px-4">Village / Taluk</th>
              <th className="py-3 px-4">Area</th>
              <th className="py-3 px-4">Land Use</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Owner (Masked)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {LOCAL_PARCELS.map((p) => (
              <tr key={p.ulpin} className="hover:bg-slate-50/60">
                <td className="py-3 px-4">
                  <div className="font-bold text-purple-800 font-mono">{p.ulpin}</div>
                  <div className="text-[11px] text-gray-500">Survey No: {p.surveyNo} {p.subDivision ? `(${p.subDivision})` : ''}</div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-semibold text-gray-900">{p.village || 'Ayigoundanpalayam'}</div>
                  <div className="text-[11px] text-gray-500">{p.taluk || 'Perundurai'}, {p.district || 'Erode'}</div>
                </td>
                <td className="py-3 px-4 font-semibold text-gray-800">{p.area}</td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {p.landUse}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[10px]">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-gray-700">
                  {p.ownerName || 'Ramasamy G'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 8. SERVICES & WORKFLOWS
  const renderServices = () => (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-900">Government Land Services & SLA Configuration</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Statutory service rules, SLA timeframes, required citizen documents, and workflow pipelines.
        </p>
      </div>

      <div className="space-y-4">
        {services.map((srv) => (
          <div key={srv.id} className="p-5 rounded-2xl border border-gray-200 bg-slate-50/50 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 font-mono">
                  {srv.code}
                </span>
                <h3 className="font-bold text-base text-gray-900 mt-1">{srv.name}</h3>
                <p className="text-xs text-purple-700 font-semibold">{srv.department}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase">Statutory SLA</div>
                  <div className="text-sm font-extrabold text-gray-900">{srv.sla_days} Days</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-400 font-semibold uppercase">Govt Fee</div>
                  <div className="text-sm font-extrabold text-emerald-700">
                    {srv.fee_inr === 0 ? 'Free' : `₹ ${srv.fee_inr}`}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">{srv.description}</p>

            <div className="pt-2 border-t border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-gray-700">Required Documents: </span>
                <span className="text-gray-600">{srv.required_documents.join(', ')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-gray-700">Workflow: </span>
                <div className="flex items-center gap-1 text-[10px]">
                  {srv.workflow_stages.map((stage, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-700 font-medium">
                        {stage}
                      </span>
                      {sIdx < srv.workflow_stages.length - 1 && <span className="text-gray-400">→</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 9. AUDIT LOGS (IMMUTABLE)
  const renderAuditLogs = () => (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Immutable DPI Audit Trail</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Read-only chronological audit log of all administrative, officer, and citizen mutations.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold">
          <Lock className="w-3.5 h-3.5" /> Read-Only Statutory Record
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-gray-700 font-bold border-b border-gray-200 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">Actor</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Target Entity</th>
              <th className="py-3 px-4">Changes</th>
              <th className="py-3 px-4">IP Ref</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/60 font-mono">
                <td className="py-3 px-4 text-gray-500 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                <td className="py-3 px-4 font-sans">
                  <div className="font-bold text-gray-900">{log.user_name}</div>
                  <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-purple-100 text-purple-800">
                    {log.user_role}
                  </span>
                </td>
                <td className="py-3 px-4 font-sans font-bold text-gray-800">{log.action}</td>
                <td className="py-3 px-4 text-[11px]">
                  <span className="text-gray-700">{log.entity_type}</span>
                  {log.ulpin && <div className="text-purple-700 font-bold font-mono">[{log.ulpin}]</div>}
                </td>
                <td className="py-3 px-4 font-sans text-gray-600 text-[11px]">
                  {log.previous_value && <div className="text-rose-600 line-through">{log.previous_value}</div>}
                  {log.new_value && <div className="text-emerald-700 font-semibold">{log.new_value}</div>}
                </td>
                <td className="py-3 px-4 text-gray-400 text-[10px]">{log.ip_address || 'Internal'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 10. SYSTEM SETTINGS
  const renderSettings = () => (
    <div className="bg-white rounded-2xl border border-gray-200/90 shadow-xs p-6 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-gray-900">System Platform Configuration</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          General DPI runtime parameters, default coordinate centers, and access controls.
        </p>
      </div>

      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Platform Name</label>
            <input
              type="text"
              value={systemSettings.app_name}
              onChange={(e) => setSystemSettings({ ...systemSettings, app_name: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Default State Scope</label>
            <input
              type="text"
              value={systemSettings.default_state}
              onChange={(e) => setSystemSettings({ ...systemSettings, default_state: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Default Latitude</label>
            <input
              type="number"
              step="0.0001"
              value={systemSettings.default_lat}
              onChange={(e) => setSystemSettings({ ...systemSettings, default_lat: parseFloat(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Default Longitude</label>
            <input
              type="number"
              step="0.0001"
              value={systemSettings.default_lng}
              onChange={(e) => setSystemSettings({ ...systemSettings, default_lng: parseFloat(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Default Zoom Level</label>
            <input
              type="number"
              value={systemSettings.default_zoom}
              onChange={(e) => setSystemSettings({ ...systemSettings, default_zoom: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="font-semibold text-gray-700 block mb-1">Max Zoom Level</label>
            <input
              type="number"
              value={systemSettings.max_zoom}
              onChange={(e) => setSystemSettings({ ...systemSettings, max_zoom: parseInt(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-lg font-mono"
            />
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-gray-900">Require Government Officer Verification</div>
              <div className="text-gray-500 text-[11px]">Officers must be verified and approved by State Admin before login.</div>
            </div>
            <input
              type="checkbox"
              checked={systemSettings.require_officer_approval}
              onChange={(e) => setSystemSettings({ ...systemSettings, require_officer_approval: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-gray-900">Immutable Audit Logging</div>
              <div className="text-gray-500 text-[11px]">Enforce tamper-evident logging on every API mutation.</div>
            </div>
            <input
              type="checkbox"
              checked={systemSettings.audit_logging_enabled}
              onChange={(e) => setSystemSettings({ ...systemSettings, audit_logging_enabled: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            onClick={() => {
              saveSystemSettings(systemSettings);
              triggerRefresh();
              alert('System settings updated and persisted successfully.');
            }}
            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl text-xs shadow-md transition-colors cursor-pointer"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-800 font-sans flex flex-col antialiased">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 px-6 py-3 shadow-xs">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-800 to-indigo-950 flex items-center justify-center text-white shadow-md shadow-purple-800/20">
              <Shield className="w-5 h-5 text-purple-200" />
            </div>
            <div>
              <div className="font-extrabold text-lg text-gray-900 tracking-tight flex items-center gap-2">
                LAND STACK
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-200">
                  State Administration Console
                </span>
              </div>
              <p className="text-[11px] font-medium text-gray-500">
                Government of Tamil Nadu • Digital Public Infrastructure for Land Governance (SIH26014)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveNav('Officers')}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
              title="View Pending Approvals & Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {stats?.pendingApprovals || 1}
              </span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1 pl-1.5 pr-2 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all cursor-pointer"
              >
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"}
                  alt={user?.name || "Admin"}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-600/20"
                />
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold text-gray-900 leading-tight">
                    {user?.name || "S. Rajendran, IAS"}
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium">
                    {user?.designation || "State System Administrator"}
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
                    Role Switcher
                  </div>

                  <button
                    onClick={() => {
                      switchRole('citizen');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-gray-700 hover:text-[#125B50] cursor-pointer"
                  >
                    Citizen Dashboard (K. Aravind)
                  </button>

                  <button
                    onClick={() => {
                      switchRole('officer');
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 text-gray-700 hover:text-blue-600 cursor-pointer"
                  >
                    Officer Dashboard (Dr. M. Sundaram)
                  </button>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 cursor-pointer"
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

      {/* Main Layout Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <AdminSidebar
          activeNav={activeNav}
          onSelectNav={setActiveNav}
          pendingApprovalsCount={stats?.pendingApprovals || 1}
        />

        {/* Right Main Content Area */}
        <main className="flex-1 p-6 overflow-y-auto custom-scrollbar max-w-[1500px]">
          {activeNav === 'Dashboard' && renderDashboardOverview()}
          {activeNav === 'All Users' && renderUserManagement()}
          {activeNav === 'Citizens' && renderUserManagement('citizen')}
          {activeNav === 'Officers' && renderUserManagement('officer')}
          {activeNav === 'Roles & RBAC' && renderRBAC()}
          {activeNav === 'Departments' && renderDepartments()}
          {activeNav === 'GIS Layers' && renderGISLayers()}
          {activeNav === 'Jurisdictions' && renderJurisdictions()}
          {activeNav === 'Parcels' && renderParcels()}
          {activeNav === 'Services' && renderServices()}
          {activeNav === 'Workflows' && renderServices()}
          {activeNav === 'Requests & Apps' && renderServices()}
          {activeNav === 'Documents' && renderParcels()}
          {activeNav === 'Analytics' && renderDashboardOverview()}
          {activeNav === 'Audit Logs' && renderAuditLogs()}
          {activeNav === 'System Settings' && renderSettings()}
        </main>
      </div>
    </div>
  );
};
