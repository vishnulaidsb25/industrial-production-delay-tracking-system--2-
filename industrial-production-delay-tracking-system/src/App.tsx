import React, { useState, useEffect, useCallback } from 'react';
import { api } from './services/api.ts';
import type {
  User,
  ProductionOrder,
  DelayIncident,
  Machine,
  RawMaterial,
  Employee,
  ProductionLine,
  NotificationItem,
  DashboardKPIs,
} from './types/index.ts';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar, type NavModule } from './components/Sidebar.tsx';
import { GlobalSearchModal } from './components/GlobalSearchModal.tsx';
import { ToastContainer, type ToastMessage } from './components/Toast.tsx';
import { ConfirmDialog } from './components/ConfirmDialog.tsx';

// Pages
import { DashboardPage } from './pages/DashboardPage.tsx';
import { ProductionOrdersPage } from './pages/ProductionOrdersPage.tsx';
import { DelayTrackingPage } from './pages/DelayTrackingPage.tsx';
import { MachineManagementPage } from './pages/MachineManagementPage.tsx';
import { RawMaterialPage } from './pages/RawMaterialPage.tsx';
import { WorkforcePage } from './pages/WorkforcePage.tsx';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage.tsx';
import { NotificationsPage } from './pages/NotificationsPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';

export default function App() {
  const [activeModule, setActiveModule] = useState<NavModule>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightItemId, setHighlightItemId] = useState<string | undefined>(undefined);

  // Quick modals triggers
  const [isQuickOrderModalOpen, setIsQuickOrderModalOpen] = useState(false);
  const [isQuickIncidentModalOpen, setIsQuickIncidentModalOpen] = useState(false);

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action?: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  // Data states
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lines, setLines] = useState<ProductionLine[]>([]);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [incidents, setIncidents] = useState<DelayIncident[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [materials, setMaterials] = useState<RawMaterial[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [delayCauses, setDelayCauses] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type'] = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all core application data
  const loadAllData = useCallback(async () => {
    try {
      const [
        usersRes,
        linesRes,
        kpiRes,
        ordersRes,
        incidentsRes,
        machinesRes,
        materialsRes,
        workforceRes,
        notifRes,
        perfRes,
        causesRes,
      ] = await Promise.all([
        api.getUsers(),
        api.getProductionLines(),
        api.getKPIs(),
        api.getOrders(),
        api.getIncidents(),
        api.getMachines(),
        api.getMaterials(),
        api.getWorkforce(),
        api.getNotifications(),
        api.getPerformanceChart(timeframe),
        api.getDelayCauses(),
      ]);

      setUsers(usersRes.users);
      if (!currentUser) {
        setCurrentUser(usersRes.currentUser);
      }
      setLines(linesRes);
      setKpis(kpiRes);
      setOrders(ordersRes);
      setIncidents(incidentsRes);
      setMachines(machinesRes);
      setMaterials(materialsRes);
      setEmployees(workforceRes);
      setNotifications(notifRes);
      setPerformanceData(perfRes);
      setDelayCauses(causesRes);
    } catch (err) {
      console.error('Error loading initial data', err);
      addToast('Error synchronizing with factory server', 'error');
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Refresh performance chart when timeframe changes
  useEffect(() => {
    api.getPerformanceChart(timeframe).then(setPerformanceData).catch(console.error);
  }, [timeframe]);

  // Keyboard shortcut ⌘K or Ctrl+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleSwitchUser = async (userId: string) => {
    try {
      const res = await api.switchUser(userId);
      setCurrentUser(res.currentUser);
      addToast(`Switched active perspective to ${res.currentUser.name} (${res.currentUser.role})`, 'info');
    } catch (err: any) {
      addToast(err.message || 'Failed to switch user', 'error');
    }
  };

  const handleNavigate = (module: string, itemId?: string) => {
    const validModule = module as NavModule;
    setActiveModule(validModule);
    setHighlightItemId(itemId);
    if (itemId) {
      setTimeout(() => setHighlightItemId(undefined), 3500);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Orders handlers
  const handleCreateOrder = async (orderData: Partial<ProductionOrder>) => {
    try {
      const newOrder = await api.createOrder(orderData);
      setOrders((prev) => [newOrder, ...prev]);
      const updatedKpis = await api.getKPIs();
      setKpis(updatedKpis);
      addToast(`Production order ${newOrder.orderNumber} created successfully`);
    } catch (err: any) {
      addToast(err.message || 'Failed to create order', 'error');
      throw err;
    }
  };

  const handleUpdateOrder = async (id: string, updates: Partial<ProductionOrder>) => {
    try {
      const updated = await api.updateOrder(id, updates);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      const updatedKpis = await api.getKPIs();
      setKpis(updatedKpis);
      addToast(`Order ${updated.orderNumber} updated successfully`);
    } catch (err: any) {
      addToast(err.message || 'Failed to update order', 'error');
      throw err;
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await api.deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      const updatedKpis = await api.getKPIs();
      setKpis(updatedKpis);
      addToast('Order deleted successfully');
    } catch (err: any) {
      addToast(err.message || 'Failed to delete order', 'error');
    }
  };

  const handleLogOutput = async (
    id: string,
    unitsAdded: number,
    scrapAdded: number,
    notes?: string
  ) => {
    try {
      const updated = await api.logOutput(id, { unitsAdded, scrapAdded, notes });
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      const updatedKpis = await api.getKPIs();
      setKpis(updatedKpis);
      const perf = await api.getPerformanceChart(timeframe);
      setPerformanceData(perf);
      addToast(`Recorded +${unitsAdded} completed units for ${updated.orderNumber}`);
    } catch (err: any) {
      addToast(err.message || 'Failed to log output', 'error');
      throw err;
    }
  };

  // Incidents handlers
  const handleCreateIncident = async (incidentData: Partial<DelayIncident>) => {
    try {
      const newInc = await api.createIncident(incidentData);
      setIncidents((prev) => [newInc, ...prev]);
      const [updatedKpis, causes, notifs, updatedOrders, updatedMachines] = await Promise.all([
        api.getKPIs(),
        api.getDelayCauses(),
        api.getNotifications(),
        api.getOrders(),
        api.getMachines(),
      ]);
      setKpis(updatedKpis);
      setDelayCauses(causes);
      setNotifications(notifs);
      setOrders(updatedOrders);
      setMachines(updatedMachines);
      addToast(`Delay incident ${newInc.id} recorded (${newInc.category})`, 'warning');
    } catch (err: any) {
      addToast(err.message || 'Failed to create incident', 'error');
      throw err;
    }
  };

  const handleUpdateIncident = async (id: string, updates: Partial<DelayIncident>) => {
    try {
      const updated = await api.updateIncident(id, updates);
      setIncidents((prev) => prev.map((i) => (i.id === id ? updated : i)));
      const [updatedKpis, causes, updatedMachines] = await Promise.all([
        api.getKPIs(),
        api.getDelayCauses(),
        api.getMachines(),
      ]);
      setKpis(updatedKpis);
      setDelayCauses(causes);
      setMachines(updatedMachines);
      addToast(`Incident ${updated.id} status updated to ${updated.status}`);
    } catch (err: any) {
      addToast(err.message || 'Failed to update incident', 'error');
      throw err;
    }
  };

  const handleDeleteIncident = async (id: string) => {
    try {
      await api.deleteIncident(id);
      setIncidents((prev) => prev.filter((i) => i.id !== id));
      const [updatedKpis, causes] = await Promise.all([api.getKPIs(), api.getDelayCauses()]);
      setKpis(updatedKpis);
      setDelayCauses(causes);
      addToast('Incident deleted successfully');
    } catch (err: any) {
      addToast(err.message || 'Failed to delete incident', 'error');
    }
  };

  // Machine handlers
  const handleCreateMachine = async (data: Partial<Machine>) => {
    try {
      const created = await api.createMachine(data);
      setMachines((prev) => [...prev, created]);
      const updatedKpis = await api.getKPIs();
      setKpis(updatedKpis);
      addToast(`Machine ${created.name} registered successfully`);
    } catch (err: any) {
      addToast(err.message || 'Failed to create machine', 'error');
    }
  };

  const handleReportBreakdown = async (
    id: string,
    description: string,
    severity: string,
    estimatedDowntime: number
  ) => {
    try {
      const res = await api.reportBreakdown(id, {
        description,
        severity,
        estimatedDowntimeMinutes: estimatedDowntime,
      });
      setMachines((prev) => prev.map((m) => (m.id === id ? res.machine : m)));
      setIncidents((prev) => [res.incident, ...prev]);
      const [updatedKpis, causes, notifs] = await Promise.all([
        api.getKPIs(),
        api.getDelayCauses(),
        api.getNotifications(),
      ]);
      setKpis(updatedKpis);
      setDelayCauses(causes);
      setNotifications(notifs);
      addToast(`Breakdown reported for ${res.machine.name}. Incident ${res.incident.id} created.`, 'error');
    } catch (err: any) {
      addToast(err.message || 'Failed to report breakdown', 'error');
    }
  };

  const handleRecordMaintenance = async (
    id: string,
    type: string,
    technician: string,
    description: string,
    downtimeMinutes: number,
    restoreStatus: boolean
  ) => {
    try {
      const updated = await api.recordMaintenance(id, {
        type,
        technician,
        description,
        downtimeMinutes,
        restoreStatus,
      });
      setMachines((prev) => prev.map((m) => (m.id === id ? updated : m)));
      const updatedKpis = await api.getKPIs();
      setKpis(updatedKpis);
      addToast(`Maintenance record saved for ${updated.name}`);
    } catch (err: any) {
      addToast(err.message || 'Failed to save maintenance record', 'error');
    }
  };

  // Raw Materials handlers
  const handleCreateMaterial = async (data: Partial<RawMaterial>) => {
    try {
      const created = await api.createMaterial(data);
      setMaterials((prev) => [created, ...prev]);
      addToast(`Raw material ${created.name} added to catalog`);
    } catch (err: any) {
      addToast(err.message || 'Failed to add material', 'error');
    }
  };

  const handleRecordStockTransaction = async (
    id: string,
    type: 'Received' | 'Consumed' | 'Reserved' | 'Adjustment',
    quantity: number,
    reference?: string
  ) => {
    try {
      const updated = await api.recordStockTransaction(id, { type, quantity, reference });
      setMaterials((prev) => prev.map((m) => (m.id === id ? updated : m)));
      const [updatedKpis, notifs] = await Promise.all([api.getKPIs(), api.getNotifications()]);
      setKpis(updatedKpis);
      setNotifications(notifs);
      addToast(`Stock transaction (${type}: ${quantity} ${updated.unitOfMeasurement}) recorded.`);
    } catch (err: any) {
      addToast(err.message || 'Transaction failed', 'error');
      throw err;
    }
  };

  const handleCreateDelayFromShortage = async (
    id: string,
    productionOrderId?: string,
    estimatedDowntime?: number
  ) => {
    try {
      const newInc = await api.createDelayFromShortage(id, {
        productionOrderId,
        estimatedDowntimeMinutes: estimatedDowntime,
      });
      setIncidents((prev) => [newInc, ...prev]);
      const [updatedKpis, causes, notifs, updatedOrders] = await Promise.all([
        api.getKPIs(),
        api.getDelayCauses(),
        api.getNotifications(),
        api.getOrders(),
      ]);
      setKpis(updatedKpis);
      setDelayCauses(causes);
      setNotifications(notifs);
      setOrders(updatedOrders);
      addToast(`Shortage delay incident ${newInc.id} created!`, 'warning');
    } catch (err: any) {
      addToast(err.message || 'Failed to link shortage delay', 'error');
    }
  };

  // Workforce handlers
  const handleUpdateAttendance = async (employeeId: string, attendanceStatus: string) => {
    try {
      const updated = await api.updateAttendance(employeeId, attendanceStatus);
      setEmployees((prev) => prev.map((e) => (e.id === employeeId ? updated : e)));
      const updatedKpis = await api.getKPIs();
      setKpis(updatedKpis);
      addToast(`Attendance for ${updated.name} updated to ${attendanceStatus}`);
    } catch (err: any) {
      addToast(err.message || 'Failed to update attendance', 'error');
    }
  };

  const handleReportWorkforceDelay = async (
    lineId: string,
    absentCount: number,
    description?: string,
    severity?: string
  ) => {
    try {
      const newInc = await api.reportWorkforceDelay({
        lineId,
        absentCount,
        description,
        severity,
      });
      setIncidents((prev) => [newInc, ...prev]);
      const [updatedKpis, causes] = await Promise.all([api.getKPIs(), api.getDelayCauses()]);
      setKpis(updatedKpis);
      setDelayCauses(causes);
      addToast(`Workforce delay incident ${newInc.id} logged.`, 'warning');
    } catch (err: any) {
      addToast(err.message || 'Failed to report workforce delay', 'error');
    }
  };

  // Notifications handlers
  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      addToast('All notifications marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reset Factory Simulation Baseline',
      message:
        'This will reset all production orders, equipment breakdowns, inventory transactions, and delay incidents back to the factory demonstration baseline. Are you sure?',
      action: async () => {
        try {
          await api.resetDemoData();
          await loadAllData();
          addToast('Factory simulation baseline restored successfully', 'info');
        } catch (err: any) {
          addToast('Failed to reset simulation baseline', 'error');
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (loading || !currentUser) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#F7F9FC]">
        <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-slate-700">Connecting to IndustrialFlow Shop Floor Server...</p>
        <p className="text-xs text-slate-400 mt-1">Initializing database schemas and equipment telemetry</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col antialiased text-[#142B4D]">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        allUsers={users}
        notifications={notifications}
        onSwitchUser={handleSwitchUser}
        onOpenSearch={() => setIsSearchOpen(true)}
        onMarkNotificationRead={handleMarkNotificationRead}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onNavigate={handleNavigate}
        onResetDemoData={handleResetDemoData}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          activeModule={activeModule}
          onSelectModule={(mod) => {
            setActiveModule(mod);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          kpis={kpis}
          unreadNotificationsCount={notifications.filter((n) => !n.read).length}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeModule === 'dashboard' && (
            <DashboardPage
              kpis={kpis}
              orders={orders}
              incidents={incidents}
              performanceData={performanceData}
              delayCauses={delayCauses}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              onNavigate={handleNavigate}
              currentUser={currentUser}
              onOpenNewOrderModal={() => {
                setActiveModule('production');
              }}
              onOpenNewIncidentModal={() => {
                setIsQuickIncidentModalOpen(true);
                setActiveModule('delays');
              }}
            />
          )}

          {activeModule === 'production' && (
            <ProductionOrdersPage
              orders={orders}
              lines={lines}
              currentUser={currentUser}
              users={users}
              onCreateOrder={handleCreateOrder}
              onUpdateOrder={handleUpdateOrder}
              onDeleteOrder={handleDeleteOrder}
              onLogOutput={handleLogOutput}
              highlightOrderId={highlightItemId}
            />
          )}

          {activeModule === 'delays' && (
            <DelayTrackingPage
              incidents={incidents}
              orders={orders}
              machines={machines}
              lines={lines}
              users={users}
              currentUser={currentUser}
              onCreateIncident={handleCreateIncident}
              onUpdateIncident={handleUpdateIncident}
              onDeleteIncident={handleDeleteIncident}
              highlightIncidentId={highlightItemId}
              isCreateModalOpen={isQuickIncidentModalOpen}
              setIsCreateModalOpen={setIsQuickIncidentModalOpen}
            />
          )}

          {activeModule === 'machines' && (
            <MachineManagementPage
              machines={machines}
              lines={lines}
              currentUser={currentUser}
              onCreateMachine={handleCreateMachine}
              onUpdateMachine={async (id, updates) => {
                const updated = await api.updateMachine(id, updates);
                setMachines((prev) => prev.map((m) => (m.id === id ? updated : m)));
                addToast(`Machine ${updated.name} updated.`);
              }}
              onReportBreakdown={handleReportBreakdown}
              onRecordMaintenance={handleRecordMaintenance}
              highlightMachineId={highlightItemId}
            />
          )}

          {activeModule === 'materials' && (
            <RawMaterialPage
              materials={materials}
              orders={orders}
              currentUser={currentUser}
              onCreateMaterial={handleCreateMaterial}
              onRecordStockTransaction={handleRecordStockTransaction}
              onCreateDelayFromShortage={handleCreateDelayFromShortage}
              highlightMaterialId={highlightItemId}
            />
          )}

          {activeModule === 'workforce' && (
            <WorkforcePage
              employees={employees}
              lines={lines}
              currentUser={currentUser}
              onUpdateAttendance={handleUpdateAttendance}
              onReportWorkforceDelay={handleReportWorkforceDelay}
              highlightEmployeeId={highlightItemId}
            />
          )}

          {activeModule === 'reports' && <ReportsAnalyticsPage lines={lines} />}

          {activeModule === 'notifications' && (
            <NotificationsPage
              notifications={notifications}
              onMarkRead={handleMarkNotificationRead}
              onMarkAllRead={handleMarkAllNotificationsRead}
              onNavigate={handleNavigate}
            />
          )}

          {activeModule === 'settings' && (
            <SettingsPage
              currentUser={currentUser}
              lines={lines}
              onResetDemoData={handleResetDemoData}
            />
          )}
        </main>
      </div>

      {/* Global Instant Search Dialog */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        orders={orders}
        incidents={incidents}
        machines={machines}
        materials={materials}
        onNavigate={handleNavigate}
      />

      {/* Confirmation Dialog Modal */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => confirmDialog.action?.()}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Floating Toast Alerts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
