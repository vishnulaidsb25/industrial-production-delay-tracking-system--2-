import type {
  User,
  ProductionOrder,
  DelayIncident,
  Machine,
  RawMaterial,
  Employee,
  ProductionLine,
  NotificationItem,
  AuditLog,
  DashboardKPIs,
} from '../types/index.ts';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let errMessage = 'Request failed';
    try {
      const errData = await res.json();
      errMessage = errData.error || errMessage;
    } catch {
      // ignore
    }
    throw new Error(errMessage);
  }

  return res.json();
}

export const api = {
  // Users & Auth
  getUsers: () => fetchJson<{ users: User[]; currentUser: User }>('/users'),
  switchUser: (userId: string) =>
    fetchJson<{ success: boolean; currentUser: User }>('/auth/switch-user', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  // Lines
  getProductionLines: () => fetchJson<ProductionLine[]>('/production-lines'),

  // Dashboard
  getKPIs: () => fetchJson<DashboardKPIs>('/dashboard/kpis'),
  getPerformanceChart: (timeframe: 'daily' | 'weekly' | 'monthly') =>
    fetchJson<any[]>(`/dashboard/performance?timeframe=${timeframe}`),
  getDelayCauses: () =>
    fetchJson<{ name: string; minutes: number; count: number; color: string }[]>('/dashboard/delay-causes'),

  // Orders
  getOrders: (params?: { lineId?: string; status?: string; priority?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<ProductionOrder[]>(`/production/orders?${query}`);
  },
  createOrder: (order: Partial<ProductionOrder>) =>
    fetchJson<ProductionOrder>('/production/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  updateOrder: (id: string, updates: Partial<ProductionOrder>) =>
    fetchJson<ProductionOrder>(`/production/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteOrder: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/production/orders/${id}`, {
      method: 'DELETE',
    }),
  logOutput: (id: string, data: { unitsAdded: number; scrapAdded?: number; notes?: string }) =>
    fetchJson<ProductionOrder>(`/production/orders/${id}/log-output`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Delay Incidents
  getIncidents: (params?: { category?: string; severity?: string; status?: string; lineId?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<DelayIncident[]>(`/delays/incidents?${query}`);
  },
  createIncident: (incident: Partial<DelayIncident>) =>
    fetchJson<DelayIncident>('/delays/incidents', {
      method: 'POST',
      body: JSON.stringify(incident),
    }),
  updateIncident: (id: string, updates: Partial<DelayIncident>) =>
    fetchJson<DelayIncident>(`/delays/incidents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  deleteIncident: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/delays/incidents/${id}`, {
      method: 'DELETE',
    }),

  // Machines
  getMachines: () => fetchJson<Machine[]>('/machines'),
  createMachine: (data: Partial<Machine>) =>
    fetchJson<Machine>('/machines', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMachine: (id: string, updates: Partial<Machine>) =>
    fetchJson<Machine>(`/machines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),
  reportBreakdown: (id: string, data: { description: string; severity?: string; estimatedDowntimeMinutes?: number }) =>
    fetchJson<{ machine: Machine; incident: DelayIncident }>(`/machines/${id}/breakdown`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  recordMaintenance: (id: string, data: { type: string; technician: string; description: string; downtimeMinutes: number; restoreStatus?: boolean }) =>
    fetchJson<Machine>(`/machines/${id}/maintenance`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Raw Materials
  getMaterials: () => fetchJson<RawMaterial[]>('/materials'),
  createMaterial: (data: Partial<RawMaterial>) =>
    fetchJson<RawMaterial>('/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  recordStockTransaction: (id: string, data: { type: 'Received' | 'Consumed' | 'Reserved' | 'Adjustment'; quantity: number; reference?: string }) =>
    fetchJson<RawMaterial>(`/materials/${id}/transaction`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  createDelayFromShortage: (id: string, data: { productionOrderId?: string; estimatedDowntimeMinutes?: number }) =>
    fetchJson<DelayIncident>(`/materials/${id}/create-delay`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Workforce
  getWorkforce: () => fetchJson<Employee[]>('/workforce'),
  updateAttendance: (employeeId: string, attendanceStatus: string) =>
    fetchJson<Employee>('/workforce/shift-attendance', {
      method: 'POST',
      body: JSON.stringify({ employeeId, attendanceStatus }),
    }),
  reportWorkforceDelay: (data: { lineId: string; absentCount: number; description?: string; severity?: string }) =>
    fetchJson<DelayIncident>('/workforce/report-delay', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Reports
  getReports: (params?: { lineId?: string; category?: string; startDate?: string; endDate?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchJson<any>(`/reports?${query}`);
  },
  getExportCsvUrl: (type: 'orders' | 'incidents') => `/api/reports/export-csv?type=${type}`,

  // Notifications
  getNotifications: () => fetchJson<NotificationItem[]>('/notifications'),
  markNotificationRead: (id: string) =>
    fetchJson<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () =>
    fetchJson<{ success: boolean }>('/notifications/read-all', { method: 'PUT' }),

  // Audit Logs
  getAuditLogs: () => fetchJson<AuditLog[]>('/audit-logs'),

  // Reset Data
  resetDemoData: () => fetchJson<{ success: boolean; message: string }>('/reset-demo-data', { method: 'POST' }),
};
