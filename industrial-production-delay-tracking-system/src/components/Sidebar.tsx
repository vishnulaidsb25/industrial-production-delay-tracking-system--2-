import React from 'react';
import {
  LayoutDashboard,
  Layers,
  AlertTriangle,
  Cpu,
  Users,
  Package,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Activity,
} from 'lucide-react';
import type { DashboardKPIs } from '../types/index.ts';

export type NavModule =
  | 'dashboard'
  | 'production'
  | 'delays'
  | 'machines'
  | 'workforce'
  | 'materials'
  | 'reports'
  | 'notifications'
  | 'settings';

interface SidebarProps {
  activeModule: NavModule;
  onSelectModule: (module: NavModule) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  kpis?: DashboardKPIs | null;
  unreadNotificationsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isCollapsed,
  onToggleCollapse,
  kpis,
  unreadNotificationsCount,
}) => {
  const navItems: {
    id: NavModule;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeVariant?: 'danger' | 'warning' | 'info';
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'production',
      label: 'Production Management',
      icon: Layers,
    },
    {
      id: 'delays',
      label: 'Delay Tracking',
      icon: AlertTriangle,
      badge: kpis?.activeDelaysCount && kpis.activeDelaysCount > 0 ? kpis.activeDelaysCount : undefined,
      badgeVariant: 'danger',
    },
    {
      id: 'machines',
      label: 'Machine Management',
      icon: Cpu,
    },
    {
      id: 'workforce',
      label: 'Workforce Management',
      icon: Users,
    },
    {
      id: 'materials',
      label: 'Raw Material Management',
      icon: Package,
      badge: kpis?.materialShortagesCount && kpis.materialShortagesCount > 0 ? kpis.materialShortagesCount : undefined,
      badgeVariant: 'warning',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      icon: BarChart3,
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
      badgeVariant: 'danger',
    },
    {
      id: 'settings',
      label: 'Settings & Audit Logs',
      icon: Settings,
    },
  ];

  return (
    <aside
      className={`bg-white border-r border-slate-200 shrink-0 flex flex-col transition-all duration-200 z-20 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation List */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectModule(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer group relative ${
                isActive
                  ? 'bg-blue-50/80 text-[#2878E5]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-[#2878E5]' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />

              {!isCollapsed && (
                <span className="truncate text-left flex-1">{item.label}</span>
              )}

              {item.badge !== undefined && !isCollapsed && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                    item.badgeVariant === 'danger'
                      ? 'bg-red-100 text-red-700'
                      : item.badgeVariant === 'warning'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Dot badge when collapsed */}
              {item.badge !== undefined && isCollapsed && (
                <span
                  className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                    item.badgeVariant === 'danger' ? 'bg-red-500' : 'bg-amber-500'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Plant Operational Summary Widget (Only in expanded state) */}
      {!isCollapsed && kpis && (
        <div className="p-3 mx-2 mb-2 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              Plant Availability
            </span>
            <span className="text-blue-600 font-bold">{kpis.machineAvailabilityPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full"
              style={{ width: `${Math.min(100, kpis.machineAvailabilityPercentage)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>{kpis.machinesOperational}/{kpis.totalMachines} Machines Run</span>
            <span>{kpis.totalDowntimeMinutesToday}m Delay</span>
          </div>
        </div>
      )}

      {/* Collapse Toggle Footer */}
      <div className="p-2 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={onToggleCollapse}
          className="p-2 w-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!isCollapsed && <span className="text-xs ml-2 text-slate-500">Collapse Menu</span>}
        </button>
      </div>
    </aside>
  );
};
