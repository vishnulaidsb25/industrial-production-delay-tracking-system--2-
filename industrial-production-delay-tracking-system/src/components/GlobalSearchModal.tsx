import React, { useState, useEffect } from 'react';
import { Search, X, AlertTriangle, Layers, Cpu, Package } from 'lucide-react';
import type { ProductionOrder, DelayIncident, Machine, RawMaterial } from '../types/index.ts';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: ProductionOrder[];
  incidents: DelayIncident[];
  machines: Machine[];
  materials: RawMaterial[];
  onNavigate: (module: string, itemId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  orders,
  incidents,
  machines,
  materials,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedOrders = q
    ? orders.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.productName.toLowerCase().includes(q) ||
          o.productSku.toLowerCase().includes(q)
      )
    : [];

  const matchedIncidents = q
    ? incidents.filter(
        (i) =>
          i.id.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.productionOrderNumber && i.productionOrderNumber.toLowerCase().includes(q))
      )
    : [];

  const matchedMachines = q
    ? machines.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.type.toLowerCase().includes(q)
      )
    : [];

  const matchedMaterials = q
    ? materials.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.sku.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    matchedOrders.length + matchedIncidents.length + matchedMachines.length + matchedMaterials.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search orders, delay incidents, machines, materials..."
            className="w-full text-base text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded cursor-pointer mr-2"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="py-8 text-center text-sm text-slate-500">
              Type to search across production orders, delay incidents, machines, or raw materials.
            </div>
          )}

          {query && totalResults === 0 && (
            <div className="py-8 text-center text-sm text-slate-500">
              No results found matching &ldquo;{query}&rdquo;.
            </div>
          )}

          {matchedOrders.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Production Orders ({matchedOrders.length})
              </div>
              <div className="space-y-1">
                {matchedOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      onNavigate('production', o.id);
                      onClose();
                    }}
                    className="p-2.5 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">{o.productName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {o.orderNumber} · {o.productionLineName} · Target: {o.targetQuantity} units
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        o.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : o.status === 'Delayed'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {o.status} ({o.progressPercentage}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedIncidents.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" /> Delay Incidents ({matchedIncidents.length})
              </div>
              <div className="space-y-1">
                {matchedIncidents.map((i) => (
                  <div
                    key={i.id}
                    onClick={() => {
                      onNavigate('delays', i.id);
                      onClose();
                    }}
                    className="p-2.5 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="max-w-[80%]">
                      <div className="text-sm font-medium text-slate-900 flex items-center gap-2">
                        <span>{i.id}</span>
                        <span className="text-xs text-slate-500 font-normal">· {i.category}</span>
                      </div>
                      <div className="text-xs text-slate-600 truncate mt-0.5">{i.description}</div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xs font-semibold ${
                          i.severity === 'Critical'
                            ? 'text-red-600'
                            : i.severity === 'High'
                            ? 'text-amber-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {i.severity}
                      </div>
                      <div className="text-xs text-slate-400">{i.durationMinutes}m</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedMachines.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" /> Machines ({matchedMachines.length})
              </div>
              <div className="space-y-1">
                {matchedMachines.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      onNavigate('machines', m.id);
                      onClose();
                    }}
                    className="p-2.5 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">{m.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {m.id} · {m.productionLineName} · {m.location}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-medium ${
                        m.status === 'Operational'
                          ? 'bg-emerald-50 text-emerald-700'
                          : m.status === 'Breakdown'
                          ? 'bg-red-50 text-red-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {matchedMaterials.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Raw Materials ({matchedMaterials.length})
              </div>
              <div className="space-y-1">
                {matchedMaterials.map((mat) => (
                  <div
                    key={mat.id}
                    onClick={() => {
                      onNavigate('materials', mat.id);
                      onClose();
                    }}
                    className="p-2.5 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-200 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900">{mat.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        SKU: {mat.sku} · Supplier: {mat.supplierName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900">
                        {mat.availableQuantity} {mat.unitOfMeasurement}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          mat.status === 'In Stock'
                            ? 'text-emerald-600'
                            : mat.status === 'Critical Shortage'
                            ? 'text-red-600'
                            : 'text-amber-600'
                        }`}
                      >
                        {mat.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
