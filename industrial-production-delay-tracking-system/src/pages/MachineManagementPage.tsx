import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Wrench,
  Calendar,
  Activity,
  History,
  X,
  FileCheck,
  Zap,
} from 'lucide-react';
import type { Machine, ProductionLine, User, MachineStatus } from '../types/index.ts';

interface MachineManagementPageProps {
  machines: Machine[];
  lines: ProductionLine[];
  currentUser: User;
  onCreateMachine: (data: Partial<Machine>) => Promise<void>;
  onUpdateMachine: (id: string, updates: Partial<Machine>) => Promise<void>;
  onReportBreakdown: (id: string, description: string, severity: string, estimatedDowntime: number) => Promise<void>;
  onRecordMaintenance: (
    id: string,
    type: string,
    technician: string,
    description: string,
    downtimeMinutes: number,
    restoreStatus: boolean
  ) => Promise<void>;
  highlightMachineId?: string;
}

export const MachineManagementPage: React.FC<MachineManagementPageProps> = ({
  machines,
  lines,
  currentUser,
  onCreateMachine,
  onUpdateMachine,
  onReportBreakdown,
  onRecordMaintenance,
  highlightMachineId,
}) => {
  const [search, setSearch] = useState('');
  const [lineFilter, setLineFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMachineForHistory, setSelectedMachineForHistory] = useState<Machine | null>(null);
  const [breakdownMachine, setBreakdownMachine] = useState<Machine | null>(null);
  const [breakdownDesc, setBreakdownDesc] = useState('');
  const [breakdownSeverity, setBreakdownSeverity] = useState('High');
  const [breakdownDowntime, setBreakdownDowntime] = useState(60);

  const [maintenanceMachine, setMaintenanceMachine] = useState<Machine | null>(null);
  const [maintType, setMaintType] = useState('Preventive');
  const [maintTechnician, setMaintTechnician] = useState(currentUser.name);
  const [maintDesc, setMaintDesc] = useState('');
  const [maintDowntime, setMaintDowntime] = useState(30);
  const [restoreOperational, setRestoreOperational] = useState(true);

  // New Machine state
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');
  const [newLineId, setNewLineId] = useState(lines[0]?.id || 'LINE-01');
  const [newLocation, setNewLocation] = useState('');
  const [newOperatingHours, setNewOperatingHours] = useState(16);

  const canManage =
    currentUser.role === 'Administrator' ||
    currentUser.role === 'Maintenance Technician' ||
    currentUser.role === 'Production Manager';

  const filteredMachines = machines.filter((m) => {
    if (lineFilter !== 'all' && m.productionLineId !== lineFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const operationalCount = machines.filter((m) => m.status === 'Operational').length;
  const breakdownCount = machines.filter((m) => m.status === 'Breakdown').length;
  const maintenanceCount = machines.filter((m) => m.status === 'Under Maintenance').length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newType.trim()) return;

    await onCreateMachine({
      name: newName.trim(),
      type: newType.trim(),
      productionLineId: newLineId,
      location: newLocation.trim() || 'Factory Floor',
      scheduledOperatingHoursPerDay: newOperatingHours,
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewType('');
    setNewLocation('');
  };

  const handleBreakdownSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!breakdownMachine) return;

    await onReportBreakdown(
      breakdownMachine.id,
      breakdownDesc || 'Equipment sudden stoppage',
      breakdownSeverity,
      breakdownDowntime
    );

    setBreakdownMachine(null);
    setBreakdownDesc('');
  };

  const handleMaintenanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceMachine) return;

    await onRecordMaintenance(
      maintenanceMachine.id,
      maintType,
      maintTechnician || currentUser.name,
      maintDesc || 'Routine scheduled maintenance completed',
      maintDowntime,
      restoreOperational
    );

    setMaintenanceMachine(null);
    setMaintDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Machine Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor equipment reliability, calculate availability percentages, track breakdowns, and log maintenance schedules.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2878E5] hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Register Machine</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Operational Machines</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {operationalCount} <span className="text-xs font-normal text-slate-400">/ {machines.length}</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Ready for production runs</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Breakdown State</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{breakdownCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">Active equipment failure</div>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-red-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Under Maintenance</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{maintenanceCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">Scheduled or calibration</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Cumulative Downtime</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {machines.reduce((sum, m) => sum + m.totalDowntimeMinutes, 0)}{' '}
              <span className="text-xs font-normal text-slate-400">mins</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Recorded across all assets</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by machine ID, model, line, bay..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={lineFilter}
            onChange={(e) => setLineFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Lines</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Operational">Operational</option>
            <option value="Running with Warning">Running with Warning</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Breakdown">Breakdown</option>
            <option value="Offline">Offline</option>
          </select>

          {(lineFilter !== 'all' || statusFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setLineFilter('all');
                setStatusFilter('all');
                setSearch('');
              }}
              className="px-3 py-2 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Machines Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMachines.map((machine) => {
          const scheduledMinutes = machine.scheduledOperatingHoursPerDay * 60;
          const availabilityPct =
            scheduledMinutes > 0
              ? Math.max(
                  0,
                  Number(
                    (
                      ((scheduledMinutes - machine.totalDowntimeMinutes) / scheduledMinutes) *
                      100
                    ).toFixed(1)
                  )
                )
              : 100;

          const isHighlighted = highlightMachineId === machine.id;

          return (
            <div
              key={machine.id}
              className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                isHighlighted
                  ? 'border-blue-400 ring-2 ring-blue-300'
                  : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-semibold text-slate-400">
                      {machine.id}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{machine.name}</h3>
                    <p className="text-xs text-slate-500">{machine.type}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                      machine.status === 'Operational'
                        ? 'bg-emerald-50 text-emerald-700'
                        : machine.status === 'Breakdown'
                        ? 'bg-red-50 text-red-700'
                        : machine.status === 'Under Maintenance'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {machine.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Production Line:</span>
                    <span className="font-medium text-slate-800">{machine.productionLineName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shop Location:</span>
                    <span className="font-medium text-slate-800">{machine.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Availability:</span>
                    <span className="font-semibold text-blue-600">{availabilityPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Downtime Today:</span>
                    <span className="font-semibold text-slate-900">{machine.totalDowntimeMinutes} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Next Maintenance:</span>
                    <span className="text-slate-700">{machine.nextScheduledMaintenance}</span>
                  </div>
                </div>

                {/* Machine Availability Bar */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Operating Health</span>
                    <span>{machine.healthScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${
                        machine.healthScore >= 90
                          ? 'bg-emerald-500'
                          : machine.healthScore >= 75
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${machine.healthScore}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedMachineForHistory(machine)}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {machine.status === 'Operational' ? (
                    <button
                      onClick={() => setBreakdownMachine(machine)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Report sudden stoppage and trigger incident"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Breakdown</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setMaintenanceMachine(machine)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                      title="Record repair and restore operational state"
                    >
                      <Wrench className="w-3.5 h-3.5" />
                      <span>Maintain</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* REPORT BREAKDOWN MODAL */}
      {breakdownMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Record Machine Breakdown</h2>
                <p className="text-xs text-slate-500">{breakdownMachine.name} ({breakdownMachine.id})</p>
              </div>
              <button
                onClick={() => setBreakdownMachine(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBreakdownSubmit} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-red-50 rounded-lg text-xs text-red-800">
                Reporting a breakdown will transition machine status to <strong>Breakdown</strong> and automatically create an active delay incident.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Breakdown Symptom / Fault *</label>
                <textarea
                  rows={2}
                  required
                  value={breakdownDesc}
                  onChange={(e) => setBreakdownDesc(e.target.value)}
                  placeholder="e.g. Hydraulic actuator pressure drop, spindle motor overheating, sensor failure..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={breakdownSeverity}
                    onChange={(e) => setBreakdownSeverity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="High">High - Unit stopped</option>
                    <option value="Critical">Critical - Full line stopped</option>
                    <option value="Medium">Medium - Degraded</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Est. Downtime (Mins)</label>
                  <input
                    type="number"
                    min={5}
                    value={breakdownDowntime}
                    onChange={(e) => setBreakdownDowntime(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBreakdownMachine(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Confirm Breakdown
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD MAINTENANCE MODAL */}
      {maintenanceMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Record Machine Maintenance</h2>
                <p className="text-xs text-slate-500">{maintenanceMachine.name}</p>
              </div>
              <button
                onClick={() => setMaintenanceMachine(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMaintenanceSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Maintenance Type</label>
                  <select
                    value={maintType}
                    onChange={(e) => setMaintType(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Preventive">Preventive Overhaul</option>
                    <option value="Corrective">Corrective Repair</option>
                    <option value="Inspection">Calibration / Inspection</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Technician</label>
                  <input
                    type="text"
                    required
                    value={maintTechnician}
                    onChange={(e) => setMaintTechnician(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Work Carried Out / Parts Replaced
                </label>
                <textarea
                  rows={2}
                  required
                  value={maintDesc}
                  onChange={(e) => setMaintDesc(e.target.value)}
                  placeholder="e.g. Replaced worn pneumatic seals and recalibrated optical sensors."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Downtime (Mins)</label>
                  <input
                    type="number"
                    min={0}
                    value={maintDowntime}
                    onChange={(e) => setMaintDowntime(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800">
                    <input
                      type="checkbox"
                      checked={restoreOperational}
                      onChange={(e) => setRestoreOperational(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                    />
                    <span>Restore to Operational</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMaintenanceMachine(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#2878E5] hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MAINTENANCE HISTORY DRAWER */}
      {selectedMachineForHistory && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Maintenance Log</h2>
                  <p className="text-xs text-slate-500">{selectedMachineForHistory.name}</p>
                </div>
                <button
                  onClick={() => setSelectedMachineForHistory(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {selectedMachineForHistory.maintenanceHistory.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No recorded maintenance events for this equipment.
                  </div>
                ) : (
                  selectedMachineForHistory.maintenanceHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{item.type} Service</span>
                        <span className="text-slate-400">{item.date.slice(0, 10)}</span>
                      </div>
                      <p className="text-slate-700">{item.description}</p>
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                        <span>Technician: {item.technician}</span>
                        <span>{item.downtimeMinutes}m downtime</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedMachineForHistory(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER MACHINE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Register Machine</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Machine Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Trumpf 4kW Fiber Laser Cutter"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Equipment Category / Type *</label>
                <input
                  type="text"
                  required
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="e.g. Laser Cutting & Punching"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Production Line</label>
                  <select
                    value={newLineId}
                    onChange={(e) => setNewLineId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                  >
                    {lines.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shop Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Bay 2B"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Scheduled Operating Hours / Day
                </label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={newOperatingHours}
                  onChange={(e) => setNewOperatingHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#2878E5] hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Register Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
