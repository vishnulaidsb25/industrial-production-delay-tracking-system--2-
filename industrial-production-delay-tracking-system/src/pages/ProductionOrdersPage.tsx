import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRight,
  TrendingUp,
  X,
  FileCheck,
} from 'lucide-react';
import type { ProductionOrder, ProductionLine, User, OrderPriority, OrderStatus } from '../types/index.ts';

interface ProductionOrdersPageProps {
  orders: ProductionOrder[];
  lines: ProductionLine[];
  currentUser: User;
  users: User[];
  onCreateOrder: (order: Partial<ProductionOrder>) => Promise<void>;
  onUpdateOrder: (id: string, updates: Partial<ProductionOrder>) => Promise<void>;
  onDeleteOrder: (id: string) => Promise<void>;
  onLogOutput: (id: string, unitsAdded: number, scrapAdded: number, notes?: string) => Promise<void>;
  highlightOrderId?: string;
}

export const ProductionOrdersPage: React.FC<ProductionOrdersPageProps> = ({
  orders,
  lines,
  currentUser,
  users,
  onCreateOrder,
  onUpdateOrder,
  onDeleteOrder,
  onLogOutput,
  highlightOrderId,
}) => {
  const [search, setSearch] = useState('');
  const [lineFilter, setLineFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ProductionOrder | null>(null);
  const [loggingOrder, setLoggingOrder] = useState<ProductionOrder | null>(null);
  const [unitsToAdd, setUnitsToAdd] = useState<number>(50);
  const [scrapToAdd, setScrapToAdd] = useState<number>(0);
  const [logNotes, setLogNotes] = useState('');

  // New order form state
  const [newProduct, setNewProduct] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newLineId, setNewLineId] = useState(lines[0]?.id || 'LINE-01');
  const [newSupervisorId, setNewSupervisorId] = useState(currentUser.id);
  const [newTargetQty, setNewTargetQty] = useState<number>(1000);
  const [newPriority, setNewPriority] = useState<OrderPriority>('Medium');
  const [newStartDate, setNewStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [newDeadline, setNewDeadline] = useState(
    new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState('');

  const canManageOrders =
    currentUser.role === 'Administrator' || currentUser.role === 'Production Manager';
  const canLogOutput =
    canManageOrders || currentUser.role === 'Production Supervisor';

  // Filter logic
  const filteredOrders = orders.filter((order) => {
    if (lineFilter !== 'all' && order.productionLineId !== lineFilter) return false;
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && order.priority !== priorityFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        order.orderNumber.toLowerCase().includes(q) ||
        order.productName.toLowerCase().includes(q) ||
        order.productSku.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!newProduct.trim()) {
      setFormError('Product Name is required.');
      return;
    }
    if (newTargetQty <= 0) {
      setFormError('Target Quantity must be greater than zero.');
      return;
    }
    if (new Date(newStartDate) >= new Date(newDeadline)) {
      setFormError('Start date must be before deadline.');
      return;
    }

    try {
      await onCreateOrder({
        productName: newProduct.trim(),
        productSku: newSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
        productionLineId: newLineId,
        assignedSupervisorId: newSupervisorId,
        targetQuantity: newTargetQty,
        priority: newPriority,
        startDate: new Date(newStartDate).toISOString(),
        deadline: new Date(newDeadline).toISOString(),
        notes: newNotes,
      });
      setIsCreateModalOpen(false);
      setNewProduct('');
      setNewSku('');
      setNewNotes('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create order');
    }
  };

  const handleLogOutputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loggingOrder) return;
    if (unitsToAdd < 0 || scrapToAdd < 0) return;

    try {
      await onLogOutput(loggingOrder.id, unitsToAdd, scrapToAdd, logNotes);
      setLoggingOrder(null);
      setUnitsToAdd(50);
      setScrapToAdd(0);
      setLogNotes('');
    } catch (err: any) {
      alert(err.message || 'Error recording output');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Production Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create, track, and monitor production runs across factory lines with automatic schedule risk detection.
          </p>
        </div>

        {canManageOrders && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2878E5] hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Production Order</span>
          </button>
        )}
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, product name, SKU..."
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
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Delayed">Delayed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {(lineFilter !== 'all' || statusFilter !== 'all' || priorityFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setLineFilter('all');
                setStatusFilter('all');
                setPriorityFilter('all');
                setSearch('');
              }}
              className="px-3 py-2 text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Product & SKU</th>
                <th className="py-3.5 px-4">Line</th>
                <th className="py-3.5 px-4">Supervisor</th>
                <th className="py-3.5 px-4 text-right">Target</th>
                <th className="py-3.5 px-4 text-right">Actual</th>
                <th className="py-3.5 px-4 text-right">Remaining</th>
                <th className="py-3.5 px-4 w-44">Progress</th>
                <th className="py-3.5 px-4">Schedule</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-sm text-slate-500">
                    No production orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isHighlighted = highlightOrderId === order.id;

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isHighlighted ? 'bg-blue-50/60 ring-2 ring-blue-400 ring-inset' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        {order.orderNumber}
                        {order.isAtRisk && (
                          <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-red-600">
                            <AlertTriangle className="w-3 h-3" />
                            <span>At Risk</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{order.productName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{order.productSku}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {order.productionLineName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {order.assignedSupervisorName}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                        {order.targetQuantity.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-emerald-600">
                        {order.completedQuantity.toLocaleString()}
                        {order.scrapQuantity > 0 && (
                          <div className="text-[10px] text-red-500">
                            +{order.scrapQuantity} scrap
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                        {order.remainingQuantity.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-800">
                              {order.progressPercentage}%
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                order.priority === 'Urgent'
                                  ? 'bg-red-50 text-red-700'
                                  : order.priority === 'High'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {order.priority}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full ${
                                order.status === 'Delayed'
                                  ? 'bg-red-500'
                                  : order.progressPercentage >= 100
                                  ? 'bg-emerald-500'
                                  : 'bg-[#2878E5]'
                              }`}
                              style={{ width: `${Math.min(100, order.progressPercentage)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                        <div>Due: {order.deadline.slice(0, 10)}</div>
                        <div className="text-[11px] text-slate-400">
                          {order.deadline.slice(11, 16)} hrs
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            order.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : order.status === 'Delayed'
                              ? 'bg-red-50 text-red-700'
                              : order.status === 'In Progress'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              order.status === 'Completed'
                                ? 'bg-emerald-500'
                                : order.status === 'Delayed'
                                ? 'bg-red-500'
                                : order.status === 'In Progress'
                                ? 'bg-blue-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canLogOutput && order.status !== 'Completed' && (
                            <button
                              onClick={() => setLoggingOrder(order)}
                              className="px-2 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                              title="Record completed batch units"
                            >
                              Log Output
                            </button>
                          )}

                          {canManageOrders && (
                            <>
                              <button
                                onClick={() => setEditingOrder(order)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                                title="Edit Order"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Are you sure you want to delete order ${order.orderNumber}?`
                                    )
                                  ) {
                                    onDeleteOrder(order.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                                title="Delete Order"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
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

      {/* CREATE ORDER MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Create Production Order</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
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
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  placeholder="e.g. High-Torque Servo Motor 48V"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product SKU</label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    placeholder="e.g. SRV-48V-HT"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Quantity *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newTargetQty}
                    onChange={(e) => setNewTargetQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
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
                  <label className="block font-semibold text-slate-700 mb-1">Supervisor</label>
                  <select
                    value={newSupervisorId}
                    onChange={(e) => setNewSupervisorId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Deadline</label>
                  <input
                    type="datetime-local"
                    required
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as OrderPriority)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Notes</label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="e.g. Priority delivery for automotive client"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#2878E5] hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG OUTPUT MODAL */}
      {loggingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Record Production Output</h2>
                <p className="text-xs text-slate-500">{loggingOrder.orderNumber} · {loggingOrder.productName}</p>
              </div>
              <button
                onClick={() => setLoggingOrder(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-3 p-3 bg-blue-50/60 rounded-lg text-xs text-slate-700 space-y-1">
              <div className="flex justify-between">
                <span>Target:</span>
                <span className="font-semibold">{loggingOrder.targetQuantity} units</span>
              </div>
              <div className="flex justify-between">
                <span>Already Produced:</span>
                <span className="font-semibold text-emerald-600">
                  {loggingOrder.completedQuantity} ({loggingOrder.progressPercentage}%)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Remaining:</span>
                <span className="font-semibold text-slate-900">{loggingOrder.remainingQuantity} units</span>
              </div>
            </div>

            <form onSubmit={handleLogOutputSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Completed Units (Passed QA) *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={unitsToAdd}
                  onChange={(e) => setUnitsToAdd(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Scrap Units (Failed QA / Defective)
                </label>
                <input
                  type="number"
                  min={0}
                  value={scrapToAdd}
                  onChange={(e) => setScrapToAdd(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Inspection Notes</label>
                <input
                  type="text"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="e.g. End of morning batch shift test run"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLoggingOrder(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Submit Output</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ORDER MODAL */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                Edit Order {editingOrder.orderNumber}
              </h2>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await onUpdateOrder(editingOrder.id, editingOrder);
                setEditingOrder(null);
              }}
              className="mt-4 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingOrder.productName}
                  onChange={(e) =>
                    setEditingOrder({ ...editingOrder, productName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={editingOrder.targetQuantity}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, targetQuantity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={editingOrder.status}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, status: e.target.value as OrderStatus })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
                  >
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Delayed">Delayed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={editingOrder.priority}
                    onChange={(e) =>
                      setEditingOrder({ ...editingOrder, priority: e.target.value as OrderPriority })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    value={editingOrder.deadline.slice(0, 16)}
                    onChange={(e) =>
                      setEditingOrder({
                        ...editingOrder,
                        deadline: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
