import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ShieldAlert,
  Building2,
  Map,
  Layers,
  FileCheck2,
  GitPullRequest,
  FileSpreadsheet,
  BarChart3,
  History,
  Settings,
  Sparkles,
} from 'lucide-react';

export type AdminNavPage =
  | 'Dashboard'
  | 'All Users'
  | 'Citizens'
  | 'Officers'
  | 'Roles & RBAC'
  | 'Departments'
  | 'GIS Layers'
  | 'Jurisdictions'
  | 'Parcels'
  | 'Services'
  | 'Workflows'
  | 'Requests & Apps'
  | 'Documents'
  | 'Analytics'
  | 'Audit Logs'
  | 'System Settings';

interface AdminSidebarProps {
  activeNav: AdminNavPage;
  onSelectNav: (nav: AdminNavPage) => void;
  pendingApprovalsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeNav,
  onSelectNav,
  pendingApprovalsCount = 1,
}) => {
  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { label: 'Dashboard' as AdminNavPage, icon: LayoutDashboard },
      ],
    },
    {
      title: 'IDENTITY & ACCESS (IAM)',
      items: [
        { label: 'All Users' as AdminNavPage, icon: Users },
        { label: 'Citizens' as AdminNavPage, icon: UserCheck },
        {
          label: 'Officers' as AdminNavPage,
          icon: ShieldAlert,
          badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} new` : undefined,
        },
        { label: 'Roles & RBAC' as AdminNavPage, icon: ShieldAlert },
        { label: 'Departments' as AdminNavPage, icon: Building2 },
      ],
    },
    {
      title: 'GIS & LAND DATA',
      items: [
        { label: 'GIS Layers' as AdminNavPage, icon: Layers },
        { label: 'Jurisdictions' as AdminNavPage, icon: Map },
        { label: 'Parcels' as AdminNavPage, icon: FileSpreadsheet },
      ],
    },
    {
      title: 'SERVICES & WORKFLOWS',
      items: [
        { label: 'Services' as AdminNavPage, icon: FileCheck2 },
        { label: 'Workflows' as AdminNavPage, icon: GitPullRequest },
        { label: 'Requests & Apps' as AdminNavPage, icon: FileCheck2 },
        { label: 'Documents' as AdminNavPage, icon: FileSpreadsheet },
      ],
    },
    {
      title: 'GOVERNANCE & AUDIT',
      items: [
        { label: 'Analytics' as AdminNavPage, icon: BarChart3 },
        { label: 'Audit Logs' as AdminNavPage, icon: History },
        { label: 'System Settings' as AdminNavPage, icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200/80 flex flex-col flex-shrink-0 min-h-[calc(100vh-61px)]">
      <div className="p-4 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            <div className="text-[10px] font-extrabold text-gray-400 tracking-wider uppercase px-3 mb-1.5 font-mono">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => onSelectNav(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-purple-50 text-purple-800 border border-purple-200 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-purple-700' : 'text-gray-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Banner */}
      <div className="p-3 border-t border-gray-100 bg-slate-50/70">
        <div className="p-2.5 rounded-xl bg-purple-900 text-white text-[11px] space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-purple-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>State Admin Mode</span>
          </div>
          <p className="text-[10px] text-purple-300 leading-tight">
            Govt of Tamil Nadu DPI • All admin actions are recorded in immutable audit trails.
          </p>
        </div>
      </div>
    </aside>
  );
};
