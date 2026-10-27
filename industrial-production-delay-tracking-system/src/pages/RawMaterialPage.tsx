import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Truck,
  RotateCw,
  AlertOctagon,
  X,
  FileCheck,
  Send,
  History,
} from 'lucide-react';
import type { RawMaterial, ProductionOrder, User, MaterialCategory, MaterialStatus } from '../types/index.ts';

interface RawMaterialPageProps {
  materials: RawMaterial[];
  orders: ProductionOrder[];
  currentUser: User;
  onCreateMaterial: (data: Partial<RawMaterial>) => Promise<void>;
  onRecordStockTransaction: (
    id: string,
    type: 'Received' | 'Consumed' | 'Reserved' | 'Adjustment',
    quantity: number,
    reference?: string
  ) => Promise<void>;
  onCreateDelayFromShortage: (id: string, productionOrderId?: string, estimatedDowntime?: number) => Promise<void>;
  highlightMaterialId?: string;
}

export const RawMaterialPage: React.FC<RawMaterialPageProps> = ({
  materials,
  orders,
  currentUser,
  onCreateMaterial,
  onRecordStockTransaction,
  onCreateDelayFromShortage,
  highlightMaterialId,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [transactionMaterial, setTransactionMaterial] = useState<RawMaterial | null>(null);
  const [txType, setTxType] = useState<'Received' | 'Consumed' | 'Reserved' | 'Adjustment'>('Received');
  const [txQty, setTxQty] = useState<number>(100);
  const [txRef, setTxRef] = useState('');
  const [txError, setTxError] = useState('');

  const [shortageMaterial, setShortageMaterial] = useState<RawMaterial | null>(null);
  const [linkedOrderId, setLinkedOrderId] = useState('');
  const [estimatedDowntime, setEstimatedDowntime] = useState(60);

  const [historyMaterial, setHistoryMaterial] = useState<RawMaterial | null>(null);

  // New Material form state
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [newCategory, setNewCategory] = useState<MaterialCategory>('Metals & Alloys');
  const [newQty, setNewQty] = useState(500);
  const [newUnit, setNewUnit] = useState('pcs');
  const [newMinStock, setNewMinStock] = useState(200);
  const [newCost, setNewCost] = useState(12.5);
  const [newSupplier, setNewSupplier] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');

  const canManage =
    currentUser.role === 'Administrator' || currentUser.role === 'Inventory Manager';

  const filteredMaterials = materials.filter((m) => {
    if (categoryFilter !== 'all' && m.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q) ||
        m.supplierName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const lowStockCount = materials.filter(
    (m) => m.status === 'Low Stock' || m.status === 'Critical Shortage'
  ).length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUnit.trim()) return;

    await onCreateMaterial({
      name: newName.trim(),
      sku: newSku.trim() || `SKU-${Date.now().toString().slice(-4)}`,
      category: newCategory,
      availableQuantity: newQty,
      unitOfMeasurement: newUnit,
      minimumStockLevel: newMinStock,
      unitCost: newCost,
      supplierName: newSupplier.trim() || 'General Supplier',
      supplierContact: newSupplierContact.trim() || 'orders@supply.com',
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewSku('');
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxError('');

    if (!transactionMaterial || txQty <= 0) return;

    try {
      await onRecordStockTransaction(
        transactionMaterial.id,
        txType,
        txQty,
        txRef || `Manual ${txType} adjustment`
      );
      setTransactionMaterial(null);
      setTxQty(100);
      setTxRef('');
    } catch (err: any) {
      setTxError(err.message || 'Transaction failed');
    }
  };

  const handleShortageDelaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortageMaterial) return;

    await onCreateDelayFromShortage(
      shortageMaterial.id,
      linkedOrderId || undefined,
      estimatedDowntime
    );

    setShortageMaterial(null);
    setLinkedOrderId('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Raw Material Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track safety buffer levels, record inventory transactions, prevent stock-outs, and escalate supplier shortages.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2878E5] hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Raw Material</span>
          </button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Tracked SKU Catalog</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{materials.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">Active production components</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Critical / Low Stock Items</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{lowStockCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">Below safety reorder threshold</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Inventory Status</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {Math.round(((materials.length - lowStockCount) / (materials.length || 1)) * 100)}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Stock health coverage rate</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
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
            placeholder="Search by material name, SKU, category, supplier..."
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
            <option value="Metals & Alloys">Metals & Alloys</option>
            <option value="Electronics & Semiconductors">Electronics & Semiconductors</option>
            <option value="Polymers & Plastics">Polymers & Plastics</option>
            <option value="Fasteners & Hardware">Fasteners & Hardware</option>
            <option value="Packaging & Supplies">Packaging & Supplies</option>
            <option value="Fluids & Lubricants">Fluids & Lubricants</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Critical Shortage">Critical Shortage</option>
          </select>

          {(categoryFilter !== 'all' || statusFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setCategoryFilter('all');
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

      {/* Materials Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Material & SKU</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Available Stock</th>
                <th className="py-3.5 px-4 text-right">Reserved</th>
                <th className="py-3.5 px-4 text-right">Safety Minimum</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-slate-500">
                    No materials found matching filter parameters.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map((mat) => {
                  const isHighlighted = highlightMaterialId === mat.id;

                  return (
                    <tr
                      key={mat.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isHighlighted ? 'bg-amber-50/60 ring-2 ring-amber-400 ring-inset' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{mat.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {mat.sku} · {mat.id}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">{mat.category}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-900">
                        {mat.availableQuantity.toLocaleString()} {mat.unitOfMeasurement}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                        {mat.reservedQuantity.toLocaleString()} {mat.unitOfMeasurement}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                        {mat.minimumStockLevel.toLocaleString()} {mat.unitOfMeasurement}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800">{mat.supplierName}</div>
                        <div className="text-[11px] text-slate-400">{mat.supplierContact}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            mat.status === 'In Stock'
                              ? 'bg-emerald-50 text-emerald-700'
                              : mat.status === 'Critical Shortage'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              mat.status === 'In Stock'
                                ? 'bg-emerald-500'
                                : mat.status === 'Critical Shortage'
                                ? 'bg-red-500'
                                : 'bg-amber-500'
                            }`}
                          />
                          {mat.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setTransactionMaterial(mat)}
                            className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
                            title="Record stock receipt, consumption, or adjustment"
                          >
                            Adjust Stock
                          </button>

                          {(mat.status === 'Low Stock' || mat.status === 'Critical Shortage') && (
                            <button
                              onClick={() => {
                                setShortageMaterial(mat);
                                // default to an active order if any
                                if (orders.length > 0) setLinkedOrderId(orders[0].id);
                              }}
                              className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                              title="Create linked delay incident from this stock shortage"
                            >
                              Log Delay
                            </button>
                          )}

                          <button
                            onClick={() => setHistoryMaterial(mat)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded cursor-pointer"
                            title="Transaction History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
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

      {/* ADJUST STOCK TRANSACTION MODAL */}
      {transactionMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Record Stock Transaction</h2>
                <p className="text-xs text-slate-500">{transactionMaterial.name}</p>
              </div>
              <button
                onClick={() => setTransactionMaterial(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {txError && (
              <div className="mt-3 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-medium">
                {txError}
              </div>
            )}

            <div className="my-3 p-3 bg-slate-50 rounded-lg text-xs flex justify-between">
              <span className="text-slate-500">Current Stock:</span>
              <span className="font-bold text-slate-900">
                {transactionMaterial.availableQuantity} {transactionMaterial.unitOfMeasurement}
              </span>
            </div>

            <form onSubmit={handleTransactionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Type</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                >
                  <option value="Received">Stock In / Received Shipment</option>
                  <option value="Consumed">Consumed by Production Run</option>
                  <option value="Reserved">Reserve for Upcoming Order</option>
                  <option value="Adjustment">Audit Stock Adjustment (Reset count)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Quantity ({transactionMaterial.unitOfMeasurement}) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={txQty}
                  onChange={(e) => setTxQty(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reference / PO #</label>
                <input
                  type="text"
                  value={txRef}
                  onChange={(e) => setTxRef(e.target.value)}
                  placeholder="e.g. Supplier delivery slip #8921"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTransactionMaterial(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#2878E5] hover:bg-blue-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE DELAY FROM SHORTAGE MODAL */}
      {shortageMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Link Shortage to Production Delay</h2>
                <p className="text-xs text-slate-500">{shortageMaterial.name}</p>
              </div>
              <button
                onClick={() => setShortageMaterial(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShortageDelaySubmit} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-800">
                Only {shortageMaterial.availableQuantity} {shortageMaterial.unitOfMeasurement} available (Minimum safety threshold is {shortageMaterial.minimumStockLevel}). Creating this incident will notify production supervisors.
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Affected Production Order
                </label>
                <select
                  value={linkedOrderId}
                  onChange={(e) => setLinkedOrderId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                >
                  <option value="">General Factory Inventory Delay</option>
                  {orders
                    .filter((o) => o.status !== 'Completed')
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} - {o.productName} ({o.productionLineName})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Estimated Downtime / Wait Time (Mins)
                </label>
                <input
                  type="number"
                  min={10}
                  value={estimatedDowntime}
                  onChange={(e) => setEstimatedDowntime(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShortageMaterial(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Create Incident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TRANSACTION HISTORY DRAWER */}
      {historyMaterial && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Inventory Ledger History</h2>
                  <p className="text-xs text-slate-500">{historyMaterial.name}</p>
                </div>
                <button
                  onClick={() => setHistoryMaterial(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {historyMaterial.recentTransactions.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No transactions logged yet for this item.
                  </div>
                ) : (
                  historyMaterial.recentTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{tx.type}</span>
                        <span className="text-slate-400">{tx.date.slice(0, 16).replace('T', ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700">
                        <span>Quantity:</span>
                        <span className="font-bold">
                          {tx.quantity} {historyMaterial.unitOfMeasurement}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Ref: {tx.reference} · By: {tx.performedBy}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-right">
              <button
                onClick={() => setHistoryMaterial(null)}
                className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MATERIAL MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Add Raw Material to Inventory</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Aircraft Grade Aluminum Alloy 7075-T6"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={newSku}
                    onChange={(e) => setNewSku(e.target.value)}
                    placeholder="e.g. MTL-AL-7075"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MaterialCategory)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Metals & Alloys">Metals & Alloys</option>
                    <option value="Electronics & Semiconductors">Electronics & Semiconductors</option>
                    <option value="Polymers & Plastics">Polymers & Plastics</option>
                    <option value="Fasteners & Hardware">Fasteners & Hardware</option>
                    <option value="Packaging & Supplies">Packaging & Supplies</option>
                    <option value="Fluids & Lubricants">Fluids & Lubricants</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Measure *</label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="kg, pcs, meters"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min. Safety Stock *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier Name</label>
                  <input
                    type="text"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    placeholder="e.g. Alcoa Global Industries"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Supplier Email / Phone</label>
                  <input
                    type="text"
                    value={newSupplierContact}
                    onChange={(e) => setNewSupplierContact(e.target.value)}
                    placeholder="sales@alcoa.com"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
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
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
