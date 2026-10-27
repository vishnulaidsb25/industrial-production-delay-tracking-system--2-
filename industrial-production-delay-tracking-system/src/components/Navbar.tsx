import React, { useState, useRef, useEffect } from 'react';
import {
  Factory,
  Search,
  Bell,
  CheckCircle,
  AlertOctagon,
  ChevronDown,
  RotateCcw,
  Shield,
  Clock,
  Calendar,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import type { User, NotificationItem, Role } from '../types/index.ts';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  notifications: NotificationItem[];
  onSwitchUser: (userId: string) => void;
  onOpenSearch: () => void;
  onMarkNotificationRead: (id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onNavigate: (module: string, itemId?: string) => void;
  onResetDemoData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  notifications,
  onSwitchUser,
  onOpenSearch,
  onMarkNotificationRead,
  onMarkAllNotificationsRead,
  onNavigate,
  onResetDemoData,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'Administrator':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Production Manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Production Supervisor':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'Maintenance Technician':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Inventory Manager':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#2878E5] text-white flex items-center justify-center shadow-xs">
          <Factory className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight text-base">IndustrialFlow</span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded text-blue-700 bg-blue-50">Enterprise</span>
          </div>
          <div className="text-xs text-slate-500 hidden sm:block">Production Delay Tracking & Monitoring</div>
        </div>
      </div>

      {/* Global Search Bar (Trigger) */}
      <div className="flex-1 max-w-md mx-4 lg:mx-8 hidden md:block">
        <button
          type="button"
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-2 text-sm text-slate-400 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search orders, delays, machines, parts...</span>
          </div>
          <kbd className="hidden lg:inline-block text-[11px] font-mono px-1.5 py-0.5 text-slate-400 bg-white border border-slate-200 rounded">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Actions: Date Selector, Notifications, User */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Mobile Search Icon */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg md:hidden cursor-pointer"
          title="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Plant Date & Shift Badge */}
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium text-slate-800">Oct 27, 2026</span>
          <span className="text-slate-300">|</span>
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Shift 1 (06:00 - 14:00)</span>
        </div>

        {/* Reset Demo Data Button */}
        <button
          type="button"
          onClick={onResetDemoData}
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          title="Reset database to realistic factory baseline"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset Demo</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div className="font-semibold text-sm text-slate-900">
                  Notifications ({unreadCount} unread)
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => onMarkAllNotificationsRead()}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500">No active notifications</div>
                ) : (
                  notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${
                        !notif.read ? 'bg-blue-50/40' : ''
                      }`}
                      onClick={() => {
                        onMarkNotificationRead(notif.id);
                        onNavigate(notif.targetModule, notif.targetId);
                        setShowNotifMenu(false);
                      }}
                    >
                      <div className="mt-0.5 shrink-0">
                        {notif.severity === 'critical' ? (
                          <AlertOctagon className="w-4 h-4 text-red-500" />
                        ) : notif.severity === 'warning' ? (
                          <AlertOctagon className="w-4 h-4 text-amber-500" />
                        ) : (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className={`text-xs font-semibold ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                            {notif.title}
                          </p>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    onNavigate('notifications');
                    setShowNotifMenu(false);
                  }}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 w-full py-1 cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>View all notifications</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher Menu */}
        <div className="relative" ref={userRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 pl-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-200"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-300"
            />
            <div className="text-left hidden lg:block">
              <div className="text-xs font-semibold text-slate-900 leading-tight flex items-center gap-1">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-slate-500 leading-tight">
                {currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in duration-100">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <div className="text-xs text-slate-400 font-medium">Signed in as</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">{currentUser.name}</div>
                <div className="text-xs text-slate-500">{currentUser.email}</div>
                <div className="mt-2">
                  <span
                    className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${getRoleBadgeColor(
                      currentUser.role
                    )}`}
                  >
                    {currentUser.role}
                  </span>
                </div>
              </div>

              {/* Role Switcher Section */}
              <div className="px-3 py-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                  <Shield className="w-3 h-3" /> Switch Role & Perspective
                </div>
                <div className="mt-1 space-y-0.5">
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSwitchUser(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer text-left ${
                        u.id === currentUser.id
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div>
                        <div>{u.name}</div>
                        <div className="text-[11px] text-slate-500">{u.role}</div>
                      </div>
                      {u.id === currentUser.id && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-1 px-1">
                <button
                  onClick={() => {
                    onResetDemoData();
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Reset All Factory Simulation Data</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
