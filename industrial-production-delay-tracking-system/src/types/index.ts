export type Role =
  | 'Administrator'
  | 'Production Manager'
  | 'Production Supervisor'
  | 'Maintenance Technician'
  | 'Inventory Manager';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  department: string;
}

export type OrderPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type OrderStatus = 'Planned' | 'In Progress' | 'Delayed' | 'Completed' | 'Cancelled';

export interface ProductionOrder {
  id: string; // e.g. PO-1042
  orderNumber: string;
  productName: string;
  productSku: string;
  productionLineId: string;
  productionLineName: string;
  assignedSupervisorId: string;
  assignedSupervisorName: string;
  targetQuantity: number;
  completedQuantity: number;
  scrapQuantity: number;
  startDate: string;
  deadline: string;
  completedAt?: string;
  priority: OrderPriority;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Computed helpers
  remainingQuantity: number;
  progressPercentage: number;
  isAtRisk: boolean;
}

export type DelayCategory =
  | 'Machine Breakdown'
  | 'Raw Material Shortage'
  | 'Worker Unavailability'
  | 'Quality Control Failure'
  | 'Power Failure'
  | 'Equipment Maintenance'
  | 'Supplier Delay'
  | 'Production Planning Issue'
  | 'Other';

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type IncidentStatus =
  | 'Open'
  | 'Investigating'
  | 'Action Required'
  | 'Monitoring'
  | 'Resolved'
  | 'Closed';

export interface DelayIncident {
  id: string; // e.g. INC-2026-001
  productionOrderId?: string;
  productionOrderNumber?: string;
  productName?: string;
  productionLineId: string;
  productionLineName: string;
  machineId?: string;
  machineName?: string;
  category: DelayCategory;
  productionArea: string;
  startTime: string; // ISO datetime
  endTime?: string; // ISO datetime
  durationMinutes: number; // dynamically computed
  severity: IncidentSeverity;
  description: string;
  rootCause: string;
  assignedPersonId: string;
  assignedPersonName: string;
  correctiveAction?: string;
  preventiveAction?: string;
  resolutionTime?: string;
  attachmentUrl?: string;
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
}

export type MachineStatus =
  | 'Operational'
  | 'Running with Warning'
  | 'Under Maintenance'
  | 'Breakdown'
  | 'Offline';

export interface Machine {
  id: string; // e.g. MCH-CNC-01
  name: string;
  type: string;
  productionLineId: string;
  productionLineName: string;
  location: string;
  status: MachineStatus;
  lastMaintenanceDate: string;
  nextScheduledMaintenance: string;
  totalDowntimeMinutes: number;
  currentProductionOrderId?: string;
  currentProductionOrderNumber?: string;
  scheduledOperatingHoursPerDay: number;
  operationalHoursToday: number;
  healthScore: number; // 0 - 100
  maintenanceHistory: {
    id: string;
    date: string;
    type: 'Preventive' | 'Corrective' | 'Inspection';
    technician: string;
    description: string;
    downtimeMinutes: number;
  }[];
}

export type MaterialCategory =
  | 'Metals & Alloys'
  | 'Electronics & Semiconductors'
  | 'Polymers & Plastics'
  | 'Fasteners & Hardware'
  | 'Packaging & Supplies'
  | 'Fluids & Lubricants';

export type MaterialStatus = 'In Stock' | 'Low Stock' | 'Critical Shortage';

export interface RawMaterial {
  id: string; // e.g. MAT-CU-884
  name: string;
  sku: string;
  category: MaterialCategory;
  availableQuantity: number;
  reservedQuantity: number;
  unitOfMeasurement: string;
  minimumStockLevel: number;
  unitCost: number;
  supplierName: string;
  supplierContact: string;
  lastRestockDate: string;
  expectedDeliveryDate?: string;
  status: MaterialStatus;
  recentTransactions: {
    id: string;
    date: string;
    type: 'Received' | 'Consumed' | 'Reserved' | 'Adjustment';
    quantity: number;
    reference: string;
    performedBy: string;
  }[];
}

export type ShiftType = 'Morning (06:00 - 14:00)' | 'Afternoon (14:00 - 22:00)' | 'Night (22:00 - 06:00)';
export type AttendanceStatus = 'Present' | 'On Break' | 'Absent' | 'On Leave';

export interface Employee {
  id: string; // e.g. EMP-101
  name: string;
  department: string;
  role: string;
  skillCategory: string;
  assignedLineId: string;
  assignedLineName: string;
  shift: ShiftType;
  attendanceStatus: AttendanceStatus;
  isAvailable: boolean;
  assignedOrderId?: string;
  avatar: string;
  phone: string;
}

export interface ProductionLine {
  id: string;
  name: string;
  code: string;
  managerName: string;
  capacityUnitsPerHour: number;
  activeStatus: 'Active' | 'Paused' | 'Maintenance';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'critical_delay' | 'machine_breakdown' | 'low_stock' | 'workforce_shortage' | 'deadline_approaching' | 'action_overdue' | 'maintenance_completed';
  severity: 'info' | 'warning' | 'critical' | 'success';
  read: boolean;
  createdAt: string;
  targetModule: 'dashboard' | 'production' | 'delays' | 'machines' | 'materials' | 'workforce' | 'reports';
  targetId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: 'Order' | 'Incident' | 'Machine' | 'Material' | 'Workforce' | 'Setting';
  entityId: string;
  details: string;
}

export interface DashboardKPIs {
  todayTarget: number;
  todayProduced: number;
  targetAchievementPercentage: number;
  activeDelaysCount: number;
  criticalDelaysCount: number;
  totalMachines: number;
  machinesOperational: number;
  machineAvailabilityPercentage: number;
  totalDowntimeMinutesToday: number;
  materialShortagesCount: number;
  workforceAvailabilityPercentage: number;
  onTimeCompletionRate: number;
}
