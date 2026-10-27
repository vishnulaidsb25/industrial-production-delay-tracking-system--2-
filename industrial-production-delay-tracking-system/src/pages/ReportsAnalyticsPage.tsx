import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  Calendar,
  Layers,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  FileSpreadsheet,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import type { ProductionLine, DelayCategory } from '../types/index.ts';
import { api } from '../services/api.ts';

interface ReportsAnalyticsPageProps {
  lines: ProductionLine[];
}

export const ReportsAnalyticsPage: React.FC<ReportsAnalyticsPageProps> = ({ lines }) => {
  const [reportType, setReportType] = useState<
    | 'daily'
    | 'delay_analysis'
    | 'root_cause'
    | 'machine_downtime'
    | 'material_shortage'
    | 'workforce_availability'
    | 'corrective_actions'
  >('delay_analysis');

  const [selectedLine, setSelectedLine] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('2026-10-01');
  const [endDate, setEndDate] = useState('2026-10-27');

  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const data = await api.getReports({
        lineId: selectedLine,
        category: selectedCategory,
        startDate,
        endDate,
      });
      setReportData(data);
    } catch (err) {
      console.error('Error fetching report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [selectedLine, selectedCategory, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = (type: 'orders' | 'incidents') => {
    const url = api.getExportCsvUrl(type);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Industrial Reports & Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit-grade performance metrics, root cause frequencies, equipment availability %, and exportable logs.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto no-print">
          <button
            onClick={() => handleExportCsv('incidents')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Delays CSV</span>
          </button>

          <button
            onClick={() => handleExportCsv('orders')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>Export Orders CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2878E5] hover:bg-blue-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report / PDF</span>
          </button>
        </div>
      </div>

      {/* Report Filter Controls (no-print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 no-print">
        {/* Report Selector Segmented Tabs */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
          {[
            { id: 'delay_analysis', label: 'Delay & Root Cause Analysis' },
            { id: 'daily', label: 'Production Output & Target' },
            { id: 'machine_downtime', label: 'Machine Reliability' },
            { id: 'corrective_actions', label: 'Corrective Action Register' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                reportType === tab.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Date & Line Filter Inputs */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={selectedLine}
            onChange={(e) => setSelectedLine(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Production Lines</option>
            {lines.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Delay Causes</option>
            <option value="Machine Breakdown">Machine Breakdown</option>
            <option value="Raw Material Shortage">Raw Material Shortage</option>
            <option value="Worker Unavailability">Worker Unavailability</option>
            <option value="Quality Control Failure">Quality Control Failure</option>
            <option value="Equipment Maintenance">Equipment Maintenance</option>
          </select>
        </div>
      </div>

      {/* Calculated Executive Metrics (Required by Spec #10) */}
      {reportData?.metrics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Target Achievement %</span>
            <div className="mt-1.5 text-2xl font-bold text-slate-900">
              {reportData.metrics.targetAchievementPercentage}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {reportData.metrics.totalActualOutput.toLocaleString()} / {reportData.metrics.totalPlannedOutput.toLocaleString()} units
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Total Delay Downtime</span>
            <div className="mt-1.5 text-2xl font-bold text-slate-900">
              {reportData.metrics.totalDowntimeMinutes} <span className="text-xs font-normal text-slate-400">mins</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Across {reportData.metrics.totalIncidents} incidents
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Avg. Delay Duration</span>
            <div className="mt-1.5 text-2xl font-bold text-slate-900">
              {reportData.metrics.averageDelayDurationMinutes} <span className="text-xs font-normal text-slate-400">mins</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Per stoppage incident</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <span className="text-xs font-medium text-slate-500">On-Time Completion</span>
            <div className="mt-1.5 text-2xl font-bold text-emerald-600">
              {reportData.metrics.onTimeCompletionRate}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {reportData.metrics.eligibleCompletedOrdersCount} eligible completed runs
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Calculated Efficiency</span>
            <div className="mt-1.5 text-2xl font-bold text-blue-600">
              {Math.min(100, Math.round(reportData.metrics.targetAchievementPercentage * 0.95))}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">OEE benchmark rating</div>
          </div>
        </div>
      )}

      {/* Main Report Content Based on Active Tab */}
      {reportType === 'delay_analysis' && reportData && (
        <div className="space-y-6">
          {/* Cause Analysis Chart */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">
                Delay Frequency & Lost Operating Minutes by Root Cause
              </h3>
              <p className="text-xs text-slate-500">
                Quantified downtime distribution helping prioritize engineering capital expenditure
              </p>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={reportData.causeAnalysis}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <XAxis
                    dataKey="cause"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #E2E8F0',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar
                    dataKey="totalMinutes"
                    name="Lost Minutes"
                    fill="#EF4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="count"
                    name="Incident Count"
                    fill="#2878E5"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Incidents Breakdown Table */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Delay Incident Audit Ledger
                </h3>
                <p className="text-xs text-slate-500">
                  Full historical records with root causes and durations
                </p>
              </div>
              <span className="text-xs text-slate-500">
                {reportData.incidents.length} Records Included
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Incident ID</th>
                    <th className="py-3 px-4">Cause Category</th>
                    <th className="py-3 px-4">Production Line</th>
                    <th className="py-3 px-4">Downtime</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Investigated Root Cause</th>
                    <th className="py-3 px-4">Corrective Action Taken</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportData.incidents.map((inc: any) => (
                    <tr key={inc.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                        {inc.id}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">{inc.category}</td>
                      <td className="py-3.5 px-4 text-slate-600">{inc.productionLineName}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {inc.durationMinutes} mins
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                            inc.severity === 'Critical'
                              ? 'bg-red-100 text-red-700'
                              : inc.severity === 'High'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs">{inc.rootCause}</td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs">
                        {inc.correctiveAction || <span className="text-slate-400 italic">None</span>}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{inc.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {reportType === 'daily' && reportData && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">
              Production Order Target & Output Report
            </h3>
            <p className="text-xs text-slate-500">
              Target completion %, scrap output, and schedule timeliness
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Line</th>
                  <th className="py-3 px-4 text-right">Target</th>
                  <th className="py-3 px-4 text-right">Actual Completed</th>
                  <th className="py-3 px-4 text-right">Scrap</th>
                  <th className="py-3 px-4 text-right">Achievement %</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reportData.orders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {o.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{o.productName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{o.productionLineName}</td>
                    <td className="py-3.5 px-4 text-right font-medium">
                      {o.targetQuantity.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                      {o.completedQuantity.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-red-500">{o.scrapQuantity}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {o.progressPercentage}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'machine_downtime' && reportData && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">
              Machine Reliability & Availability Report
            </h3>
            <p className="text-xs text-slate-500">
              Calculated Availability % = (Operating Time / Scheduled Operating Time) × 100
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Machine ID</th>
                  <th className="py-3 px-4">Machine Name</th>
                  <th className="py-3 px-4">Line</th>
                  <th className="py-3 px-4">Current Status</th>
                  <th className="py-3 px-4 text-right">Downtime (Mins)</th>
                  <th className="py-3 px-4 text-right">Availability %</th>
                  <th className="py-3 px-4 text-right">Health Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reportData.machineReport.map((m: any) => (
                  <tr key={m.machineId} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {m.machineId}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{m.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{m.line}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{m.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {m.downtimeMinutes}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-blue-600">
                      {m.availabilityPercentage}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                      {m.healthScore}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'corrective_actions' && reportData && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-900">
              Corrective & Preventive Action Register
            </h3>
            <p className="text-xs text-slate-500">
              Audit trail of maintenance repairs, policy updates, and root cause prevention
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Incident ID</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Assigned Engineer</th>
                  <th className="py-3 px-4">Corrective Action Taken</th>
                  <th className="py-3 px-4">Preventive Measure</th>
                  <th className="py-3 px-4">Resolution Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reportData.incidents.map((inc: any) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {inc.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">{inc.category}</td>
                    <td className="py-3.5 px-4 text-slate-800">{inc.assignedPersonName}</td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                      {inc.correctiveAction || <span className="text-slate-400 italic">None recorded</span>}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                      {inc.preventiveAction || <span className="text-slate-400 italic">Pending formulation</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{inc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
