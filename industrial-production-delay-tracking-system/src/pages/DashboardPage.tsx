import React, { useState } from 'react';
import {
  Target,
  CheckCircle2,
  Percent,
  AlertTriangle,
  Cpu,
  Clock,
  Package,
  Users,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { DashboardKPIs, ProductionOrder, DelayIncident, User } from '../types/index.ts';
import type { NavModule } from '../components/Sidebar.tsx';

interface DashboardPageProps {
  kpis: DashboardKPIs | null;
  orders: ProductionOrder[];
  incidents: DelayIncident[];
  performanceData: any[];
  delayCauses: { name: string; minutes: number; count: number; color: string }[];
  timeframe: 'daily' | 'weekly' | 'monthly';
  setTimeframe: (tf: 'daily' | 'weekly' | 'monthly') => void;
  onNavigate: (module: NavModule, itemId?: string) => void;
  currentUser: User;
  onOpenNewOrderModal: () => void;
  onOpenNewIncidentModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  kpis,
  orders,
  incidents,
  performanceData,
  delayCauses,
  timeframe,
  setTimeframe,
  onNavigate,
  currentUser,
  onOpenNewOrderModal,
  onOpenNewIncidentModal,
}) => {
  const [selectedIncidentForPreview, setSelectedIncidentForPreview] = useState<DelayIncident | null>(null);

  const formatNumber = (num?: number) => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Plant Operations Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time shop floor performance, line targets, equipment availability, and delay root causes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewIncidentModal}
            className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Record Delay</span>
          </button>

          {(currentUser.role === 'Administrator' || currentUser.role === 'Production Manager') && (
            <button
              onClick={onOpenNewOrderModal}
              className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-white bg-[#2878E5] hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Order</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid (8 metrics required) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* 1. Today Target */}
        <div
          onClick={() => onNavigate('production')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today's Target</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatNumber(kpis?.todayTarget)} <span className="text-xs font-normal text-slate-400">units</span>
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
            <span>Scheduled across active lines</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </div>

        {/* 2. Total Units Produced */}
        <div
          onClick={() => onNavigate('production')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-emerald-200 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Units Produced</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatNumber(kpis?.todayProduced)} <span className="text-xs font-normal text-slate-400">units</span>
          </div>
          <div className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Passed QA inspection</span>
          </div>
        </div>

        {/* 3. Production Achievement % */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Target Achievement</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {kpis?.targetAchievementPercentage}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {Number(kpis?.targetAchievementPercentage || 0) >= 80 ? (
              <span className="text-emerald-600 font-medium">On track for shift plan</span>
            ) : (
              <span className="text-amber-600 font-medium">Under daily benchmark</span>
            )}
          </div>
        </div>

        {/* 4. Active Delays */}
        <div
          onClick={() => onNavigate('delays')}
          className={`bg-white p-4 rounded-xl border shadow-xs hover:shadow-sm transition-all cursor-pointer group ${
            kpis?.criticalDelaysCount && kpis.criticalDelaysCount > 0
              ? 'border-red-200 bg-red-50/20'
              : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Delays</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 flex items-center gap-2">
            <span>{kpis?.activeDelaysCount}</span>
            {kpis?.criticalDelaysCount && kpis.criticalDelaysCount > 0 ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {kpis.criticalDelaysCount} Critical
              </span>
            ) : null}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {kpis?.activeDelaysCount === 0 ? 'Zero active blockers' : 'Requires engineering action'}
          </div>
        </div>

        {/* 5. Machines Operational */}
        <div
          onClick={() => onNavigate('machines')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Machines Running</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700 group-hover:scale-105 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {kpis?.machinesOperational} <span className="text-sm font-normal text-slate-400">/ {kpis?.totalMachines}</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {kpis?.machineAvailabilityPercentage}% line availability
          </div>
        </div>

        {/* 6. Machine Downtime */}
        <div
          onClick={() => onNavigate('machines')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-amber-200 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Downtime Today</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {kpis?.totalDowntimeMinutesToday} <span className="text-xs font-normal text-slate-400">mins</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Cumulative equipment stoppages
          </div>
        </div>

        {/* 7. Material Shortages */}
        <div
          onClick={() => onNavigate('materials')}
          className={`bg-white p-4 rounded-xl border shadow-xs hover:shadow-sm transition-all cursor-pointer group ${
            kpis?.materialShortagesCount && kpis.materialShortagesCount > 0
              ? 'border-amber-200 bg-amber-50/20'
              : 'border-slate-200/90'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Material Shortages</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {kpis?.materialShortagesCount} <span className="text-xs font-normal text-slate-400">items</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {kpis?.materialShortagesCount && kpis.materialShortagesCount > 0
              ? 'Stock below safety buffers'
              : 'All bills of materials healthy'}
          </div>
        </div>

        {/* 8. Workforce Availability */}
        <div
          onClick={() => onNavigate('workforce')}
          className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Workforce Attendance</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {kpis?.workforceAvailabilityPercentage}%
          </div>
          <div className="mt-1 text-xs text-slate-500">
            Active shift operator coverage
          </div>
        </div>
      </div>

      {/* Visualizations Section (A. Performance Chart, B. Delay Cause Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* A. Production Performance Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Production Performance Overview</h2>
              <p className="text-xs text-slate-500">Planned output vs. actual completed output</p>
            </div>

            {/* Timeframe selector segmented control */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
              {(['daily', 'weekly', 'monthly'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-md transition-colors capitalize cursor-pointer ${
                    timeframe === tf
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={performanceData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="period" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  iconType="circle"
                />
                <Bar dataKey="planned" name="Planned Output" fill="#CBD5E1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual Completed" fill="#2878E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B. Delay Cause Distribution Doughnut Chart */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-slate-900">Delay Cause Breakdown</h2>
              <button
                onClick={() => onNavigate('delays')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                View Details
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-2">Total lost minutes partitioned by root category</p>

            <div className="h-52 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={delayCauses}
                    dataKey="minutes"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {delayCauses.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value} minutes`, name]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-slate-400 font-medium">Total Loss</span>
                <span className="text-base font-bold text-slate-900">
                  {delayCauses.reduce((sum, c) => sum + c.minutes, 0)}m
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 max-h-36 overflow-y-auto">
            {delayCauses.map((cause) => (
              <div key={cause.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cause.color }}
                  />
                  <span className="text-slate-700 truncate">{cause.name}</span>
                </div>
                <div className="font-semibold text-slate-900 shrink-0 ml-2">
                  {cause.minutes}m <span className="text-slate-400 font-normal">({cause.count} inc)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* C. Production Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Active Production Orders</h2>
            <p className="text-xs text-slate-500">Live order progress, remaining quantities, and schedule risk alerts</p>
          </div>
          <button
            onClick={() => onNavigate('production')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            <span>Manage All Orders</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Production Line</th>
                <th className="py-3 px-4 text-right">Target</th>
                <th className="py-3 px-4 text-right">Completed</th>
                <th className="py-3 px-4 text-right">Remaining</th>
                <th className="py-3 px-4 w-40">Progress</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {orders.slice(0, 5).map((order) => (
                <tr
                  key={order.id}
                  onClick={() => onNavigate('production', order.id)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                    {order.orderNumber}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {order.productName}
                    <div className="text-[11px] text-slate-400 font-mono">{order.productSku}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{order.productionLineName}</td>
                  <td className="py-3.5 px-4 text-right font-medium">{order.targetQuantity}</td>
                  <td className="py-3.5 px-4 text-right font-medium text-emerald-600">
                    {order.completedQuantity}
                  </td>
                  <td className="py-3.5 px-4 text-right font-medium text-slate-500">
                    {order.remainingQuantity}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${
                            order.status === 'Delayed'
                              ? 'bg-red-500'
                              : order.progressPercentage >= 100
                              ? 'bg-emerald-500'
                              : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(100, order.progressPercentage)}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-800 text-[11px] w-9 text-right">
                        {order.progressPercentage}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        order.priority === 'Urgent'
                          ? 'bg-red-50 text-red-700'
                          : order.priority === 'High'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {order.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                    {order.deadline.slice(11, 16)} hrs
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* D. Recent Delay Incidents Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Recent Delay Incidents</h2>
            <p className="text-xs text-slate-500">
              Equipment breakdowns, material shortages, and resolution timelines
            </p>
          </div>
          <button
            onClick={() => onNavigate('delays')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
          >
            <span>Incident Register</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Incident ID</th>
                <th className="py-3 px-4">Cause Category</th>
                <th className="py-3 px-4">Area / Line</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Assigned To</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Corrective Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {incidents.slice(0, 5).map((incident) => (
                <tr
                  key={incident.id}
                  onClick={() => onNavigate('delays', incident.id)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                    {incident.id}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {incident.category}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <div>{incident.productionArea}</div>
                    <div className="text-[11px] text-slate-400">{incident.productionLineName}</div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {incident.durationMinutes} mins
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
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {incident.correctiveAction || (
                      <span className="text-slate-400 italic">Pending investigation</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
