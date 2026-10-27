import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User as UserIcon,
  Layers,
  Cpu,
  FileText,
  Paperclip,
  Check,
  ChevronRight,
  X,
  AlertOctagon,
  Wrench,
  ShieldCheck,
  Send,
  Eye,
} from 'lucide-react';
import type {
  DelayIncident,
  ProductionOrder,
  Machine,
  ProductionLine,
  User,
  DelayCategory,
  IncidentSeverity,
  IncidentStatus,
} from '../types/index.ts';

interface DelayTrackingPageProps {
  incidents: DelayIncident[];
  orders: ProductionOrder[];
  machines: Machine[];
  lines: ProductionLine[];
  users: User[];
  currentUser: User;
  onCreateIncident: (incident: Partial<DelayIncident>) => Promise<void>;
  onUpdateIncident: (id: string, updates: Partial<DelayIncident>) => Promise<void>;
  onDeleteIncident: (id: string) => Promise<void>;
  highlightIncidentId?: string;
  isCreateModalOpen?: boolean;
  setIsCreateModalOpen?: (open: boolean) => void;
}

export const DelayTrackingPage: React.FC<DelayTrackingPageProps> = ({
  incidents,
  orders,
  machines,
  lines,
  users,
  currentUser,
  onCreateIncident,
  onUpdateIncident,
  onDeleteIncident,
  highlightIncidentId,
  isCreateModalOpen: propIsCreateModalOpen,
  setIsCreateModalOpen: propSetIsCreateModalOpen,
}) => {
  const [internalCreateModal, setInternalCreateModal] = useState(false);
  const isCreateOpen = propIsCreateModalOpen !== undefined ? propIsCreateModalOpen : internalCreateModal;
  const setIsCreateOpen = propSetIsCreateModalOpen !== undefined ? propSetIsCreateModalOpen : setInternalCreateModal;

  const [activeIncident, setActiveIncident] = useState<DelayIncident | null>(null);
  const [resolvingIncident, setResolvingIncident] = useState<DelayIncident | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [lineFilter, setLineFilter] = useState('all');

  // Form states for New Incident
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [selectedLineId, setSelectedLineId] = useState(lines[0]?.id || 'LINE-01');
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [category, setCategory] = useState<DelayCategory>('Machine Breakdown');
  const [productionArea, setProductionArea] = useState('');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState('');
  const [severity, setSeverity] = useState<IncidentSeverity>('High');
  const [description, setDescription] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [assignedPersonId, setAssignedPersonId] = useState(users[0]?.id || currentUser.id);
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [preventiveAction, setPreventiveAction] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [formError, setFormError] = useState('');

  // Resolution modal state
  const [resolveActionText, setResolveActionText] = useState('');
  const [resolvePreventiveText, setResolvePreventiveText] = useState('');
  const [resolveError, setResolveError] = useState('');

  // When order is selected in creation, auto-fill product & line
  const handleOrderChange = (orderId: string) => {
    setSelectedOrderId(orderId);
    const ord = orders.find((o) => o.id === orderId);
    if (ord) {
      setSelectedLineId(ord.productionLineId);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!description.trim()) {
      setFormError('Please enter a detailed description of the incident.');
      return;
    }
    if (!rootCause.trim()) {
      setFormError('Please provide the initial root cause or diagnosis.');
      return;
    }
    if (!productionArea.trim()) {
      setFormError('Please specify the production area / station.');
      return;
    }

    if (endTime && new Date(endTime) < new Date(startTime)) {
      setFormError('Incident End Time cannot be earlier than Start Time.');
      return;
    }

    try {
      await onCreateIncident({
        productionOrderId: selectedOrderId || undefined,
        productionLineId: selectedLineId,
        machineId: selectedMachineId || undefined,
        category,
        productionArea: productionArea.trim(),
        startTime: new Date(startTime).toISOString(),
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
        severity,
        description: description.trim(),
        rootCause: rootCause.trim(),
        assignedPersonId,
        correctiveAction: correctiveAction.trim() || undefined,
        preventiveAction: preventiveAction.trim() || undefined,
        attachmentUrl: attachmentUrl.trim() || undefined,
      });

      setIsCreateOpen(false);
      // Reset form
      setDescription('');
      setRootCause('');
      setProductionArea('');
      setCorrectiveAction('');
      setPreventiveAction('');
      setAttachmentUrl('');
      setSelectedOrderId('');
      setSelectedMachineId('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to record delay incident');
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResolveError('');

    if (!resolveActionText.trim()) {
      setResolveError('Corrective action taken is strictly required to resolve a delay incident.');
      return;
    }

    if (!resolvingIncident) return;

    try {
      const now = new Date().toISOString();
      await onUpdateIncident(resolvingIncident.id, {
        status: 'Resolved',
        correctiveAction: resolveActionText.trim(),
        preventiveAction: resolvePreventiveText.trim() || resolvingIncident.preventiveAction,
        resolutionTime: now,
        endTime: resolvingIncident.endTime || now,
      });

      setResolvingIncident(null);
      setResolveActionText('');
      setResolvePreventiveText('');
      if (activeIncident && activeIncident.id === resolvingIncident.id) {
        setActiveIncident(null);
      }
    } catch (err: any) {
      setResolveError(err.message || 'Failed to resolve incident');
    }
  };

  // Filter
  const filteredIncidents = incidents.filter((inc) => {
    if (categoryFilter !== 'all' && inc.category !== categoryFilter) return false;
    if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;
    if (statusFilter !== 'all' && inc.status !== statusFilter) return false;
    if (lineFilter !== 'all' && inc.productionLineId !== lineFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        inc.id.toLowerCase().includes(q) ||
        inc.description.toLowerCase().includes(q) ||
        inc.rootCause.toLowerCase().includes(q) ||
        (inc.productionOrderNumber && inc.productionOrderNumber.toLowerCase().includes(q)) ||
        (inc.machineName && inc.machineName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const openCount = incidents.filter((i) => i.status !== 'Resolved' && i.status !== 'Closed').length;
  const criticalCount = incidents.filter(
    (i) => i.severity === 'Critical' && i.status !== 'Resolved' && i.status !== 'Closed'
  ).length;
  const totalDowntimeMinutes = incidents.reduce((sum, i) => sum + i.durationMinutes, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Production Delay Tracking</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Log shop-floor stoppages, conduct 5-Why root cause investigations, track corrective actions, and calculate downtime.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Delay Incident</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Active Open Delays</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{openCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">Currently impacting production</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Critical Blockers</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{criticalCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">Immediate escalation required</div>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-red-600">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Downtime Logged</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {totalDowntimeMinutes} <span className="text-xs font-normal text-slate-400">mins</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Across all recorded incidents</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Wrench className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by incident ID, root cause, order #, machine..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Machine Breakdown">Machine Breakdown</option>
            <option value="Raw Material Shortage">Raw Material Shortage</option>
            <option value="Worker Unavailability">Worker Unavailability</option>
            <option value="Quality Control Failure">Quality Control Failure</option>
            <option value="Power Failure">Power Failure</option>
            <option value="Equipment Maintenance">Equipment Maintenance</option>
            <option value="Supplier Delay">Supplier Delay</option>
            <option value="Production Planning Issue">Production Planning Issue</option>
            <option value="Other">Other</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Investigating">Investigating</option>
            <option value="Action Required">Action Required</option>
            <option value="Monitoring">Monitoring</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

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

          {(categoryFilter !== 'all' ||
            severityFilter !== 'all' ||
            statusFilter !== 'all' ||
            lineFilter !== 'all' ||
            search) && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                setSeverityFilter('all');
                setStatusFilter('all');
                setLineFilter('all');
                setSearch('');
              }}
              className="px-3 py-2 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Incident ID</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Area & Line</th>
                <th className="py-3.5 px-4">Linked Machine / Order</th>
                <th className="py-3.5 px-4">Duration</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Assigned To</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-sm text-slate-500">
                    No delay incidents found matching current filters.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident) => {
                  const isHighlighted = highlightIncidentId === incident.id;

                  return (
                    <tr
                      key={incident.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isHighlighted ? 'bg-red-50/50 ring-2 ring-red-400 ring-inset' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {incident.id}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{incident.category}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs">
                          {incident.description}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{incident.productionArea}</div>
                        <div className="text-[11px] text-slate-400">{incident.productionLineName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {incident.machineName && (
                          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-800">
                            <Cpu className="w-3 h-3 text-slate-400" />
                            <span>{incident.machineName}</span>
                          </div>
                        )}
                        {incident.productionOrderNumber && (
                          <div className="flex items-center gap-1 text-[11px] text-blue-600 font-mono">
                            <Layers className="w-3 h-3" />
                            <span>{incident.productionOrderNumber}</span>
                          </div>
                        )}
                        {!incident.machineName && !incident.productionOrderNumber && (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-900">
                        {incident.durationMinutes} mins
                        {!incident.endTime && incident.status !== 'Resolved' && (
                          <span className="ml-1 text-[10px] text-amber-600 font-normal">(Ongoing)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            incident.severity === 'Critical'
                              ? 'bg-red-100 text-red-700'
                              : incident.severity === 'High'
                              ? 'bg-amber-100 text-amber-700'
                              : incident.severity === 'Medium'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {incident.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 font-medium">
                        {incident.assignedPersonName}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            incident.status === 'Resolved' || incident.status === 'Closed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : incident.status === 'Action Required'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              incident.status === 'Resolved' || incident.status === 'Closed'
                                ? 'bg-emerald-500'
                                : incident.status === 'Action Required'
                                ? 'bg-red-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {incident.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveIncident(incident)}
                            className="px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                            title="View Incident Root Cause & History"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </button>

                          {incident.status !== 'Resolved' && incident.status !== 'Closed' && (
                            <button
                              onClick={() => {
                                setResolvingIncident(incident);
                                setResolveActionText(incident.correctiveAction || '');
                                setResolvePreventiveText(incident.preventiveAction || '');
                              }}
                              className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer flex items-center gap-1"
                              title="Resolve incident"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                              <span>Resolve</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE DELAY MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Record Production Delay Incident</h2>
                <p className="text-xs text-slate-500">
                  Document stoppage events, assign owners, and trigger engineering alerts
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delay Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DelayCategory)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Machine Breakdown">1. Machine Breakdown</option>
                    <option value="Raw Material Shortage">2. Raw Material Shortage</option>
                    <option value="Worker Unavailability">3. Worker Unavailability</option>
                    <option value="Quality Control Failure">4. Quality Control Failure</option>
                    <option value="Power Failure">5. Power Failure</option>
                    <option value="Equipment Maintenance">6. Equipment Maintenance</option>
                    <option value="Supplier Delay">7. Supplier Delay</option>
                    <option value="Production Planning Issue">8. Production Planning Issue</option>
                    <option value="Other">9. Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity Level *</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as IncidentSeverity)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Low">Low - Minor flow bottleneck</option>
                    <option value="Medium">Medium - Line slowed down</option>
                    <option value="High">High - Substation or machine halt</option>
                    <option value="Critical">Critical - Full line stopped</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Production Area / Station *</label>
                  <input
                    type="text"
                    required
                    value={productionArea}
                    onChange={(e) => setProductionArea(e.target.value)}
                    placeholder="e.g. Die Head Station A, Feeder Bay 4"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Production Line</label>
                  <select
                    value={selectedLineId}
                    onChange={(e) => setSelectedLineId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                  >
                    {lines.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Linked Order (Optional)</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => handleOrderChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="">None / General Line Delay</option>
                    {orders
                      .filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled')
                      .map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.orderNumber} - {o.productName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Linked Machine (Optional)</label>
                  <select
                    value={selectedMachineId}
                    onChange={(e) => setSelectedMachineId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="">None</option>
                    {machines.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Incident Start Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Incident End Time (Leave blank if ongoing)
                  </label>
                  <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Incident Description & Symptoms *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe exactly what happened on the line..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Identified / Suspected Root Cause *
                </label>
                <textarea
                  rows={2}
                  required
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                  placeholder="e.g. Hydraulic pressure seal worn out, component feeder jam, missing operator..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Person *</label>
                  <select
                    value={assignedPersonId}
                    onChange={(e) => setAssignedPersonId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Attachment Reference URL</label>
                  <input
                    type="text"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="e.g. https://files.factory.com/schematics/seal-04.png"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Immediate Corrective Action</label>
                  <input
                    type="text"
                    value={correctiveAction}
                    onChange={(e) => setCorrectiveAction(e.target.value)}
                    placeholder="Action taken to restore line"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Long-term Preventive Action</label>
                  <input
                    type="text"
                    value={preventiveAction}
                    onChange={(e) => setPreventiveAction(e.target.value)}
                    placeholder="Maintenance or supplier policy change"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Submit Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE INCIDENT MODAL (Enforces resolution time & action) */}
      {resolvingIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Resolve Delay Incident</h2>
                <p className="text-xs text-slate-500">
                  {resolvingIncident.id} · {resolvingIncident.category}
                </p>
              </div>
              <button
                onClick={() => setResolvingIncident(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resolveError && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium">
                {resolveError}
              </div>
            )}

            <form onSubmit={handleResolveSubmit} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
                <div>
                  <span className="font-semibold text-slate-800">Description: </span>
                  {resolvingIncident.description}
                </div>
                <div>
                  <span className="font-semibold text-slate-800">Root Cause: </span>
                  {resolvingIncident.rootCause}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Corrective Action Taken * (Required to Close)
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolveActionText}
                  onChange={(e) => setResolveActionText(e.target.value)}
                  placeholder="Detail the technical repair, part replacement, or buffer reallocation completed..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Preventive Recommendation
                </label>
                <textarea
                  rows={2}
                  value={resolvePreventiveText}
                  onChange={(e) => setResolvePreventiveText(e.target.value)}
                  placeholder="Future maintenance check, inspection interval, or safety stock rule..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResolvingIncident(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Mark as Resolved</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INCIDENT DETAILS DRAWER */}
      {activeIncident && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-slate-900">
                      {activeIncident.id}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded ${
                        activeIncident.severity === 'Critical'
                          ? 'bg-red-100 text-red-700'
                          : activeIncident.severity === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {activeIncident.severity}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{activeIncident.category}</div>
                </div>
                <button
                  onClick={() => setActiveIncident(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status & Timing */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs">
                <div>
                  <div className="text-slate-400">Current Status</div>
                  <div className="font-semibold text-slate-900 mt-0.5">{activeIncident.status}</div>
                </div>
                <div>
                  <div className="text-slate-400">Total Downtime</div>
                  <div className="font-semibold text-slate-900 mt-0.5">
                    {activeIncident.durationMinutes} minutes
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Start Time</div>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {activeIncident.startTime.slice(0, 16).replace('T', ' ')}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400">Resolved At</div>
                  <div className="font-medium text-slate-800 mt-0.5">
                    {activeIncident.resolutionTime
                      ? activeIncident.resolutionTime.slice(0, 16).replace('T', ' ')
                      : 'Pending'}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Incident Description
                </h3>
                <p className="text-sm text-slate-800 leading-relaxed bg-white border border-slate-200 p-3 rounded-lg">
                  {activeIncident.description}
                </p>
              </div>

              {/* Root Cause Analysis */}
              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Root Cause Investigation
                </h3>
                <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded-lg">
                  {activeIncident.rootCause}
                </p>
              </div>

              {/* Corrective & Preventive Action */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Corrective Action
                  </h3>
                  <div className="text-xs text-slate-700 bg-white border border-slate-200 p-3 rounded-lg">
                    {activeIncident.correctiveAction || (
                      <span className="text-slate-400 italic">No corrective action recorded yet.</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Preventive Action
                  </h3>
                  <div className="text-xs text-slate-700 bg-white border border-slate-200 p-3 rounded-lg">
                    {activeIncident.preventiveAction || (
                      <span className="text-slate-400 italic">No preventive action specified.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Assignment & Location */}
              <div className="border-t border-slate-100 pt-3 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Responsible Person:</span>
                  <span className="font-semibold text-slate-900">{activeIncident.assignedPersonName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Production Line:</span>
                  <span className="font-medium text-slate-800">{activeIncident.productionLineName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location / Station:</span>
                  <span className="font-medium text-slate-800">{activeIncident.productionArea}</span>
                </div>
                {activeIncident.machineName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Affected Machine:</span>
                    <span className="font-semibold text-blue-600">{activeIncident.machineName}</span>
                  </div>
                )}
                {activeIncident.productionOrderNumber && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Affected Order:</span>
                    <span className="font-semibold text-blue-600">
                      {activeIncident.productionOrderNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => setActiveIncident(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
              {activeIncident.status !== 'Resolved' && activeIncident.status !== 'Closed' && (
                <button
                  onClick={() => {
                    setResolvingIncident(activeIncident);
                    setResolveActionText(activeIncident.correctiveAction || '');
                    setResolvePreventiveText(activeIncident.preventiveAction || '');
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Resolve Incident
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
