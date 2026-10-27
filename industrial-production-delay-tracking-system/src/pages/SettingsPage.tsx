import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Clock,
  RotateCcw,
  Search,
  FileText,
  UserCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import type { User, AuditLog, ProductionLine } from '../types/index.ts';
import { api } from '../services/api.ts';

interface SettingsPageProps {
  currentUser: User;
  lines: ProductionLine[];
  onResetDemoData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentUser,
  lines,
  onResetDemoData,
}) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [searchAudit, setSearchAudit] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const data = await api.getAuditLogs();
        setAuditLogs(data);
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, []);

  const filteredLogs = auditLogs.filter((log) => {
    if (!searchAudit) return true;
    const q = searchAudit.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.userName.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings & Audit Log</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Role-based security configuration, factory shift thresholds, and tamper-evident operational change logs.
        </p>
      </div>

      {/* Role Permission Matrix */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Role-Based Access Control (RBAC) Matrix
          </h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Strict authorization enforced across all backend operations according to the user's role:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Production Orders</th>
                <th className="py-2.5 px-3">Delay Incidents</th>
                <th className="py-2.5 px-3">Machine Maintenance</th>
                <th className="py-2.5 px-3">Raw Materials</th>
                <th className="py-2.5 px-3">Audit Logs & Reset</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-purple-700">Administrator</td>
                <td className="py-2.5 px-3 text-emerald-600 font-medium">Create, Edit, Delete</td>
                <td className="py-2.5 px-3 text-emerald-600 font-medium">Full Access</td>
                <td className="py-2.5 px-3 text-emerald-600 font-medium">Full Access</td>
                <td className="py-2.5 px-3 text-emerald-600 font-medium">Full Access</td>
                <td className="py-2.5 px-3 text-emerald-600 font-medium">Full Access</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-blue-700">Production Manager</td>
                <td className="py-2.5 px-3 text-emerald-600 font-medium">Create, Edit, Delete</td>
                <td className="py-2.5 px-3 text-emerald-600 font-medium">Assign, Resolve</td>
                <td className="py-2.5 px-3 text-slate-600">View & Schedule</td>
                <td className="py-2.5 px-3 text-slate-600">View & Reserve</td>
                <td className="py-2.5 px-3 text-slate-400">View Only</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-cyan-700">Production Supervisor</td>
                <td className="py-2.5 px-3 text-blue-600 font-medium">Log Output, View</td>
                <td className="py-2.5 px-3 text-blue-600 font-medium">Log Delay Incidents</td>
                <td className="py-2.5 px-3 text-amber-600">Report Breakdown</td>
                <td className="py-2.5 px-3 text-slate-600">View Available Stock</td>
                <td className="py-2.5 px-3 text-slate-400">Restricted</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-amber-700">Maintenance Technician</td>
                <td className="py-2.5 px-3 text-slate-400">View Only</td>
                <td className="py-2.5 px-3 text-blue-600 font-medium">Resolve Machine Incidents</td>
                <td className="py-2.5 px-3 text-emerald-600 font-medium">Record Maintenance & Fix</td>
                <td className="py-2.5 px-3 text-slate-400">View Only</td>
                <td className="py-2.5 px-3 text-slate-400">Restricted</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-emerald-700">Inventory Manager</td>
                <td className="py-2.5 px-3 text-slate-400">View Schedule Demand</td>
                <td className="py-2.5 px-3 text-amber-600 font-medium">Log Shortage Delays</td>
                <td className="py-2.5 px-3 text-slate-400">View Only</td>
                <td className="py-2.5 px-3 text-emerald-600 font-medium">Full Stock Control & POs</td>
                <td className="py-2.5 px-3 text-slate-400">Restricted</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Production Lines Configuration Overview */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5">
        <h2 className="text-base font-semibold text-slate-900 mb-2">Production Lines Configuration</h2>
        <p className="text-xs text-slate-500 mb-4">
          Nominal capacities and assigned shift superintendents across manufacturing lines:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {lines.map((l) => (
            <div key={l.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <div className="font-bold text-slate-900">{l.name}</div>
              <div className="text-slate-500">Code: <span className="font-mono text-slate-700">{l.code}</span></div>
              <div className="text-slate-500">Design Capacity: <span className="font-semibold text-slate-800">{l.capacityUnitsPerHour} units/hr</span></div>
              <div className="text-slate-500">Manager: <span className="font-medium text-slate-800">{l.managerName}</span></div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Operational Audit Trail</h2>
            <p className="text-xs text-slate-500">
              Immutable chronological record of operational actions, status changes, and repairs
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchAudit}
              onChange={(e) => setSearchAudit(e.target.value)}
              placeholder="Search audit trail..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold sticky top-0">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">User</th>
                <th className="py-2.5 px-4">Role</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Entity</th>
                <th className="py-2.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-slate-500">
                    No audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {log.timestamp.slice(0, 19).replace('T', ' ')}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{log.userName}</td>
                    <td className="py-2.5 px-4 text-slate-600">{log.userRole}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-blue-600">{log.action}</td>
                    <td className="py-2.5 px-4 text-slate-700 font-medium">{log.entityType} ({log.entityId})</td>
                    <td className="py-2.5 px-4 text-slate-600 max-w-md">{log.details}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Simulation Reset */}
      <div className="bg-red-50/40 border border-red-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-red-900 mb-1">Factory Simulation Maintenance</h3>
        <p className="text-xs text-red-700 leading-relaxed mb-3">
          Reset all production orders, delay incidents, machine downtime records, and material inventory back to the clean demonstration baseline.
        </p>
        <button
          onClick={onResetDemoData}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Factory Simulation Baseline</span>
        </button>
      </div>
    </div>
  );
};
