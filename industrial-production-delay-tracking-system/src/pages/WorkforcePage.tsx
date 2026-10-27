import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  UserX,
  Phone,
  Briefcase,
  Layers,
  X,
  Send,
} from 'lucide-react';
import type { Employee, ProductionLine, User, ShiftType, AttendanceStatus } from '../types/index.ts';

interface WorkforcePageProps {
  employees: Employee[];
  lines: ProductionLine[];
  currentUser: User;
  onUpdateAttendance: (employeeId: string, attendanceStatus: string) => Promise<void>;
  onReportWorkforceDelay: (lineId: string, absentCount: number, description?: string, severity?: string) => Promise<void>;
  highlightEmployeeId?: string;
}

export const WorkforcePage: React.FC<WorkforcePageProps> = ({
  employees,
  lines,
  currentUser,
  onUpdateAttendance,
  onReportWorkforceDelay,
  highlightEmployeeId,
}) => {
  const [search, setSearch] = useState('');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [lineFilter, setLineFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Shortage delay modal
  const [isShortageModalOpen, setIsShortageModalOpen] = useState(false);
  const [shortageLineId, setShortageLineId] = useState(lines[0]?.id || 'LINE-01');
  const [shortageCount, setShortageCount] = useState(2);
  const [shortageDesc, setShortageDesc] = useState('');
  const [shortageSeverity, setShortageSeverity] = useState('Medium');

  const filteredEmployees = employees.filter((emp) => {
    if (shiftFilter !== 'all' && !emp.shift.includes(shiftFilter)) return false;
    if (lineFilter !== 'all' && emp.assignedLineId !== lineFilter) return false;
    if (statusFilter !== 'all' && emp.attendanceStatus !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        emp.name.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.skillCategory.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const presentCount = employees.filter((e) => e.attendanceStatus === 'Present').length;
  const absentCount = employees.filter((e) => e.attendanceStatus === 'Absent' || e.attendanceStatus === 'On Leave').length;
  const attendanceRate = employees.length > 0 ? Math.round((presentCount / employees.length) * 100) : 100;

  const handleAttendanceChange = async (empId: string, newStatus: string) => {
    await onUpdateAttendance(empId, newStatus);
  };

  const handleShortageDelaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onReportWorkforceDelay(
      shortageLineId,
      shortageCount,
      shortageDesc || `Unscheduled operator absence on line`,
      shortageSeverity
    );
    setIsShortageModalOpen(false);
    setShortageDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Workforce Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor shift rosters, verify certified line technicians, log real-time attendance, and handle staffing bottlenecks.
          </p>
        </div>

        <button
          onClick={() => setIsShortageModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Report Workforce Delay</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Total Headcount</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{employees.length}</div>
            <div className="text-xs text-slate-400 mt-0.5">Assigned plant operators</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Present On Floor</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{presentCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">Active at their work cells</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Absences / Leaves</div>
            <div className="text-2xl font-bold text-red-600 mt-1">{absentCount}</div>
            <div className="text-xs text-slate-400 mt-0.5">Requires cross-training fill</div>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-red-600">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Shift Attendance Rate</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">{attendanceRate}%</div>
            <div className="text-xs text-slate-400 mt-0.5">Target benchmark: &ge; 90%</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600">
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
            placeholder="Search by worker name, ID, skill certification, role..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Shifts</option>
            <option value="Morning">Morning Shift (06:00 - 14:00)</option>
            <option value="Afternoon">Afternoon Shift (14:00 - 22:00)</option>
            <option value="Night">Night Shift (22:00 - 06:00)</option>
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Attendance</option>
            <option value="Present">Present</option>
            <option value="On Break">On Break</option>
            <option value="Absent">Absent</option>
            <option value="On Leave">On Leave</option>
          </select>

          {(shiftFilter !== 'all' || lineFilter !== 'all' || statusFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setShiftFilter('all');
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

      {/* Workforce Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Job Role</th>
                <th className="py-3.5 px-4">Skill Qualification</th>
                <th className="py-3.5 px-4">Assigned Line</th>
                <th className="py-3.5 px-4">Shift Schedule</th>
                <th className="py-3.5 px-4">Assigned Order</th>
                <th className="py-3.5 px-4">Attendance Status</th>
                <th className="py-3.5 px-4 text-right">Quick Attendance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-sm text-slate-500">
                    No workforce records match your filters.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isHighlighted = highlightEmployeeId === emp.id;

                  return (
                    <tr
                      key={emp.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isHighlighted ? 'bg-purple-50/60 ring-2 ring-purple-400 ring-inset' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={emp.avatar}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="font-semibold text-slate-900">{emp.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{emp.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-800">{emp.role}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span>{emp.skillCategory}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {emp.assignedLineName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{emp.shift}</td>
                      <td className="py-3.5 px-4">
                        {emp.assignedOrderId ? (
                          <span className="font-mono text-[11px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            {emp.assignedOrderId}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Standby</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                            emp.attendanceStatus === 'Present'
                              ? 'bg-emerald-50 text-emerald-700'
                              : emp.attendanceStatus === 'On Break'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-red-50 text-red-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              emp.attendanceStatus === 'Present'
                                ? 'bg-emerald-500'
                                : emp.attendanceStatus === 'On Break'
                                ? 'bg-blue-500'
                                : 'bg-red-500'
                            }`}
                          />
                          {emp.attendanceStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={emp.attendanceStatus}
                          onChange={(e) => handleAttendanceChange(emp.id, e.target.value)}
                          className="px-2 py-1 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md font-medium text-slate-700 focus:outline-none cursor-pointer"
                        >
                          <option value="Present">Present</option>
                          <option value="On Break">On Break</option>
                          <option value="Absent">Absent</option>
                          <option value="On Leave">On Leave</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* REPORT WORKFORCE DELAY MODAL */}
      {isShortageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Report Workforce Delay</h2>
                <p className="text-xs text-slate-500">Escalate critical line staffing shortages</p>
              </div>
              <button
                onClick={() => setIsShortageModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShortageDelaySubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Affected Line</label>
                <select
                  value={shortageLineId}
                  onChange={(e) => setShortageLineId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                >
                  {lines.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Missing Workers</label>
                  <input
                    type="number"
                    min={1}
                    value={shortageCount}
                    onChange={(e) => setShortageCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Severity</label>
                  <select
                    value={shortageSeverity}
                    onChange={(e) => setShortageSeverity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none cursor-pointer"
                  >
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Station</label>
                <textarea
                  rows={2}
                  value={shortageDesc}
                  onChange={(e) => setShortageDesc(e.target.value)}
                  placeholder="e.g. SMT Feeder operators absent; Line 2 running at 50% capacity."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsShortageModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Log Workforce Delay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
