import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
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
  Role,
} from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// ==========================================
// SEED DATA STORE (In-Memory Database)
// ==========================================

const USERS: User[] = [
  {
    id: 'USR-01',
    name: 'Marcus Vance',
    email: 'marcus.vance@industrialflow.com',
    role: 'Administrator',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    department: 'Plant Operations Management',
  },
  {
    id: 'USR-02',
    name: 'Sarah Lin',
    email: 'sarah.lin@industrialflow.com',
    role: 'Production Manager',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    department: 'Production Planning & Control',
  },
  {
    id: 'USR-03',
    name: 'Carlos Mendez',
    email: 'carlos.mendez@industrialflow.com',
    role: 'Production Supervisor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    department: 'Assembly Line 1 & 2',
  },
  {
    id: 'USR-04',
    name: 'David Kowalski',
    email: 'david.kowalski@industrialflow.com',
    role: 'Maintenance Technician',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    department: 'Equipment Reliability & Maintenance',
  },
  {
    id: 'USR-05',
    name: 'Elena Rostova',
    email: 'elena.rostova@industrialflow.com',
    role: 'Inventory Manager',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    department: 'Supply Chain & Raw Materials',
  },
];

let currentUser: User = USERS[0];

const PRODUCTION_LINES: ProductionLine[] = [
  { id: 'LINE-01', name: 'Line 1 - Stamping & Pressing', code: 'L1-STAMP', managerName: 'Carlos Mendez', capacityUnitsPerHour: 180, activeStatus: 'Active' },
  { id: 'LINE-02', name: 'Line 2 - SMT & PCB Assembly', code: 'L2-SMT', managerName: 'Wei Chen', capacityUnitsPerHour: 320, activeStatus: 'Active' },
  { id: 'LINE-03', name: 'Line 3 - Mechanical Subassembly', code: 'L3-MECH', managerName: 'Carlos Mendez', capacityUnitsPerHour: 140, activeStatus: 'Active' },
  { id: 'LINE-04', name: 'Line 4 - Testing & Final Packaging', code: 'L4-TEST', managerName: 'Rachel Adams', capacityUnitsPerHour: 200, activeStatus: 'Active' },
];

function initSeedData() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const productionOrders: ProductionOrder[] = [
    {
      id: 'PO-1041',
      orderNumber: 'ORD-2026-9041',
      productName: 'High-Torque Servo Motor 48V',
      productSku: 'SRV-48V-HT',
      productionLineId: 'LINE-01',
      productionLineName: 'Line 1 - Stamping & Pressing',
      assignedSupervisorId: 'USR-03',
      assignedSupervisorName: 'Carlos Mendez',
      targetQuantity: 1200,
      completedQuantity: 1080,
      scrapQuantity: 14,
      startDate: `${todayStr}T06:00:00.000Z`,
      deadline: `${todayStr}T18:00:00.000Z`,
      priority: 'High',
      status: 'In Progress',
      notes: 'OEM tier 1 automotive client delivery batch.',
      createdAt: `${todayStr}T05:30:00.000Z`,
      updatedAt: `${todayStr}T11:00:00.000Z`,
      remainingQuantity: 120,
      progressPercentage: 90.0,
      isAtRisk: false,
    },
    {
      id: 'PO-1042',
      orderNumber: 'ORD-2026-9042',
      productName: 'Industrial Control Unit Gen-4',
      productSku: 'ICU-G4-STD',
      productionLineId: 'LINE-02',
      productionLineName: 'Line 2 - SMT & PCB Assembly',
      assignedSupervisorId: 'USR-02',
      assignedSupervisorName: 'Sarah Lin',
      targetQuantity: 800,
      completedQuantity: 340,
      scrapQuantity: 8,
      startDate: `${todayStr}T07:00:00.000Z`,
      deadline: `${todayStr}T17:00:00.000Z`,
      priority: 'Urgent',
      status: 'Delayed',
      notes: 'Halted due to MCU chip shortage and feeder calibration.',
      createdAt: `${todayStr}T06:00:00.000Z`,
      updatedAt: `${todayStr}T11:15:00.000Z`,
      remainingQuantity: 460,
      progressPercentage: 42.5,
      isAtRisk: true,
    },
    {
      id: 'PO-1043',
      orderNumber: 'ORD-2026-9043',
      productName: 'Robotic Actuator Arm-X',
      productSku: 'ACT-ARM-X',
      productionLineId: 'LINE-03',
      productionLineName: 'Line 3 - Mechanical Subassembly',
      assignedSupervisorId: 'USR-03',
      assignedSupervisorName: 'Carlos Mendez',
      targetQuantity: 450,
      completedQuantity: 380,
      scrapQuantity: 4,
      startDate: `${todayStr}T08:00:00.000Z`,
      deadline: `${todayStr}T20:00:00.000Z`,
      priority: 'Medium',
      status: 'In Progress',
      notes: 'Assembly progressing smoothly on sub-station 3B.',
      createdAt: `${todayStr}T07:30:00.000Z`,
      updatedAt: `${todayStr}T10:45:00.000Z`,
      remainingQuantity: 70,
      progressPercentage: 84.4,
      isAtRisk: false,
    },
    {
      id: 'PO-1044',
      orderNumber: 'ORD-2026-9044',
      productName: 'EV Inverter Power Module 120kW',
      productSku: 'INV-120K-EV',
      productionLineId: 'LINE-04',
      productionLineName: 'Line 4 - Testing & Final Packaging',
      assignedSupervisorId: 'USR-02',
      assignedSupervisorName: 'Sarah Lin',
      targetQuantity: 600,
      completedQuantity: 600,
      scrapQuantity: 5,
      startDate: `${todayStr}T06:00:00.000Z`,
      deadline: `${todayStr}T14:00:00.000Z`,
      completedAt: `${todayStr}T13:40:00.000Z`,
      priority: 'High',
      status: 'Completed',
      notes: 'All quality checks and burn-in tests passed.',
      createdAt: `${todayStr}T05:00:00.000Z`,
      updatedAt: `${todayStr}T13:40:00.000Z`,
      remainingQuantity: 0,
      progressPercentage: 100.0,
      isAtRisk: false,
    },
    {
      id: 'PO-1045',
      orderNumber: 'ORD-2026-9045',
      productName: 'Multi-Sensor Gateway Hub IoT-60',
      productSku: 'IOT-HUB-60',
      productionLineId: 'LINE-02',
      productionLineName: 'Line 2 - SMT & PCB Assembly',
      assignedSupervisorId: 'USR-02',
      assignedSupervisorName: 'Sarah Lin',
      targetQuantity: 500,
      completedQuantity: 0,
      scrapQuantity: 0,
      startDate: `${todayStr}T15:00:00.000Z`,
      deadline: `${todayStr}T23:00:00.000Z`,
      priority: 'Medium',
      status: 'Planned',
      notes: 'Scheduled for Afternoon Shift start.',
      createdAt: `${todayStr}T08:00:00.000Z`,
      updatedAt: `${todayStr}T08:00:00.000Z`,
      remainingQuantity: 500,
      progressPercentage: 0.0,
      isAtRisk: false,
    },
  ];

  const delayIncidents: DelayIncident[] = [
    {
      id: 'INC-2026-081',
      productionOrderId: 'PO-1042',
      productionOrderNumber: 'ORD-2026-9042',
      productName: 'Industrial Control Unit Gen-4',
      productionLineId: 'LINE-02',
      productionLineName: 'Line 2 - SMT & PCB Assembly',
      machineId: 'MCH-SMT-02',
      machineName: 'Yamaha SMT Pick & Place Line 2',
      category: 'Raw Material Shortage',
      productionArea: 'Feeder Bay 4',
      startTime: `${todayStr}T09:15:00.000Z`,
      endTime: undefined,
      durationMinutes: 75,
      severity: 'Critical',
      description: 'Stock-out of Automotive 32-bit MCU microchips halted Line 2 placement heads.',
      rootCause: 'Supplier shipment delayed by customs clearance; reorder buffer was depleted during night shift rush.',
      assignedPersonId: 'USR-05',
      assignedPersonName: 'Elena Rostova',
      correctiveAction: 'Expedited courier dispatched from regional depot; reallocating batch from Line 4 buffer.',
      preventiveAction: 'Increase minimum safety stock threshold from 500 to 1,500 units.',
      status: 'Action Required',
      createdAt: `${todayStr}T09:20:00.000Z`,
      updatedAt: `${todayStr}T10:00:00.000Z`,
    },
    {
      id: 'INC-2026-082',
      productionOrderId: 'PO-1041',
      productionOrderNumber: 'ORD-2026-9041',
      productName: 'High-Torque Servo Motor 48V',
      productionLineId: 'LINE-01',
      productionLineName: 'Line 1 - Stamping & Pressing',
      machineId: 'MCH-PRS-01',
      machineName: 'Komatsu 500-Ton Hydraulic Stamping Press',
      category: 'Machine Breakdown',
      productionArea: 'Die Head Station A',
      startTime: `${todayStr}T08:00:00.000Z`,
      endTime: `${todayStr}T08:45:00.000Z`,
      durationMinutes: 45,
      severity: 'High',
      description: 'Main hydraulic cylinder seal pressure drop triggered automatic safety shutdown.',
      rootCause: 'Worn elastomer O-ring seal failed under sustained 320 bar peak stamping cycle.',
      assignedPersonId: 'USR-04',
      assignedPersonName: 'David Kowalski',
      correctiveAction: 'Replaced primary polyurethane seal pack and refilled hydraulic fluid reservoir.',
      preventiveAction: 'Schedule weekly ultrasonic acoustic leak test on high-pressure manifolds.',
      resolutionTime: `${todayStr}T08:45:00.000Z`,
      status: 'Resolved',
      createdAt: `${todayStr}T08:05:00.000Z`,
      updatedAt: `${todayStr}T08:50:00.000Z`,
    },
    {
      id: 'INC-2026-083',
      productionOrderId: 'PO-1043',
      productionOrderNumber: 'ORD-2026-9043',
      productName: 'Robotic Actuator Arm-X',
      productionLineId: 'LINE-03',
      productionLineName: 'Line 3 - Mechanical Subassembly',
      category: 'Worker Unavailability',
      productionArea: 'Torque Fastening Cell 2',
      startTime: `${todayStr}T06:30:00.000Z`,
      endTime: `${todayStr}T07:10:00.000Z`,
      durationMinutes: 40,
      severity: 'Medium',
      description: 'Two certified robotic assembly technicians were absent due to scheduled training without replacement.',
      rootCause: 'Scheduling mismatch between HR safety certification calendar and shift roster.',
      assignedPersonId: 'USR-03',
      assignedPersonName: 'Carlos Mendez',
      correctiveAction: 'Reassigned 2 qualified cross-trained technicians from the subassembly standby pool.',
      preventiveAction: 'Implement automated ERP validation blocking training leaves during high-priority production windows.',
      resolutionTime: `${todayStr}T07:10:00.000Z`,
      status: 'Closed',
      createdAt: `${todayStr}T06:35:00.000Z`,
      updatedAt: `${todayStr}T07:15:00.000Z`,
    },
    {
      id: 'INC-2026-084',
      productionOrderId: 'PO-1042',
      productionOrderNumber: 'ORD-2026-9042',
      productName: 'Industrial Control Unit Gen-4',
      productionLineId: 'LINE-02',
      productionLineName: 'Line 2 - SMT & PCB Assembly',
      category: 'Quality Control Failure',
      productionArea: 'Automated Optical Inspection (AOI)',
      startTime: `${todayStr}T10:10:00.000Z`,
      endTime: undefined,
      durationMinutes: 35,
      severity: 'Medium',
      description: 'Solder paste bridging detected on QFN-64 IC pins exceeding 2.5% scrap tolerance.',
      rootCause: 'Stencil printer squeegee blade pressure calibration drifted by 0.8 bar.',
      assignedPersonId: 'USR-04',
      assignedPersonName: 'David Kowalski',
      correctiveAction: 'Cleaning stencil and resetting pneumatic squeegee pressure profile.',
      preventiveAction: 'Enforce automatic blade pressure recalibration every 200 PCB panels.',
      status: 'Investigating',
      createdAt: `${todayStr}T10:15:00.000Z`,
      updatedAt: `${todayStr}T10:30:00.000Z`,
    },
  ];

  const machines: Machine[] = [
    {
      id: 'MCH-PRS-01',
      name: 'Komatsu 500-Ton Hydraulic Stamping Press',
      type: 'Heavy Hydraulic Stamping',
      productionLineId: 'LINE-01',
      productionLineName: 'Line 1 - Stamping & Pressing',
      location: 'Bay 1A - Heavy Metalforming',
      status: 'Operational',
      lastMaintenanceDate: `${todayStr}T08:45:00.000Z`,
      nextScheduledMaintenance: '2026-11-15',
      totalDowntimeMinutes: 45,
      currentProductionOrderId: 'PO-1041',
      currentProductionOrderNumber: 'ORD-2026-9041',
      scheduledOperatingHoursPerDay: 16,
      operationalHoursToday: 6.25,
      healthScore: 92,
      maintenanceHistory: [
        {
          id: 'MNT-01',
          date: `${todayStr}T08:45:00.000Z`,
          type: 'Corrective',
          technician: 'David Kowalski',
          description: 'Replaced main hydraulic cylinder seal pack.',
          downtimeMinutes: 45,
        },
        {
          id: 'MNT-02',
          date: '2026-10-10T14:00:00.000Z',
          type: 'Preventive',
          technician: 'David Kowalski',
          description: 'Quarterly lubrication and pressure transducer calibration.',
          downtimeMinutes: 90,
        },
      ],
    },
    {
      id: 'MCH-SMT-02',
      name: 'Yamaha SMT Pick & Place Line 2',
      type: 'High-Precision Surface Mount',
      productionLineId: 'LINE-02',
      productionLineName: 'Line 2 - SMT & PCB Assembly',
      location: 'Cleanroom Section B',
      status: 'Running with Warning',
      lastMaintenanceDate: '2026-10-20',
      nextScheduledMaintenance: '2026-11-05',
      totalDowntimeMinutes: 110,
      currentProductionOrderId: 'PO-1042',
      currentProductionOrderNumber: 'ORD-2026-9042',
      scheduledOperatingHoursPerDay: 20,
      operationalHoursToday: 4.5,
      healthScore: 78,
      maintenanceHistory: [
        {
          id: 'MNT-03',
          date: '2026-10-20T10:00:00.000Z',
          type: 'Preventive',
          technician: 'Marcus Vance',
          description: 'Optical nozzle laser alignment and vacuum suction test.',
          downtimeMinutes: 60,
        },
      ],
    },
    {
      id: 'MCH-ROB-03',
      name: 'ABB 6-Axis Robotic Welding Station',
      type: 'Articulated Robotic Welder',
      productionLineId: 'LINE-01',
      productionLineName: 'Line 1 - Stamping & Pressing',
      location: 'Bay 1C - Robotic Welding',
      status: 'Operational',
      lastMaintenanceDate: '2026-10-18',
      nextScheduledMaintenance: '2026-11-20',
      totalDowntimeMinutes: 0,
      scheduledOperatingHoursPerDay: 16,
      operationalHoursToday: 7.0,
      healthScore: 98,
      maintenanceHistory: [],
    },
    {
      id: 'MCH-CNC-04',
      name: 'DMG Mori 5-Axis Precision CNC Milling',
      type: '5-Axis Precision Machining',
      productionLineId: 'LINE-03',
      productionLineName: 'Line 3 - Mechanical Subassembly',
      location: 'Bay 3B - Precision Milling',
      status: 'Operational',
      lastMaintenanceDate: '2026-10-22',
      nextScheduledMaintenance: '2026-11-18',
      totalDowntimeMinutes: 15,
      currentProductionOrderId: 'PO-1043',
      currentProductionOrderNumber: 'ORD-2026-9043',
      scheduledOperatingHoursPerDay: 18,
      operationalHoursToday: 6.8,
      healthScore: 95,
      maintenanceHistory: [],
    },
    {
      id: 'MCH-AOI-05',
      name: 'Koh Young 3D Optical Inspection Scanner',
      type: 'Automated 3D Optical Inspection',
      productionLineId: 'LINE-02',
      productionLineName: 'Line 2 - SMT & PCB Assembly',
      location: 'Cleanroom Section B-AOI',
      status: 'Under Maintenance',
      lastMaintenanceDate: `${todayStr}T10:15:00.000Z`,
      nextScheduledMaintenance: `${todayStr}T12:00:00.000Z`,
      totalDowntimeMinutes: 35,
      scheduledOperatingHoursPerDay: 20,
      operationalHoursToday: 3.2,
      healthScore: 81,
      maintenanceHistory: [],
    },
    {
      id: 'MCH-TST-06',
      name: 'AVL Electric Inverter Dynamometer Cell',
      type: 'High-Voltage End-of-Line Tester',
      productionLineId: 'LINE-04',
      productionLineName: 'Line 4 - Testing & Final Packaging',
      location: 'Test Bay 4D',
      status: 'Operational',
      lastMaintenanceDate: '2026-10-14',
      nextScheduledMaintenance: '2026-11-14',
      totalDowntimeMinutes: 0,
      currentProductionOrderId: 'PO-1044',
      currentProductionOrderNumber: 'ORD-2026-9044',
      scheduledOperatingHoursPerDay: 16,
      operationalHoursToday: 7.5,
      healthScore: 99,
      maintenanceHistory: [],
    },
  ];

  const rawMaterials: RawMaterial[] = [
    {
      id: 'MAT-MCU-01',
      name: 'Automotive 32-bit MCU (QFN-64)',
      sku: 'EL-MCU-32B-QFN',
      category: 'Electronics & Semiconductors',
      availableQuantity: 180,
      reservedQuantity: 460,
      unitOfMeasurement: 'pcs',
      minimumStockLevel: 600,
      unitCost: 14.5,
      supplierName: 'SiliconCore Microelectronics Ltd.',
      supplierContact: 'supply@siliconcore.com',
      lastRestockDate: '2026-10-12',
      expectedDeliveryDate: '2026-10-28',
      status: 'Critical Shortage',
      recentTransactions: [
        {
          id: 'TX-101',
          date: `${todayStr}T07:30:00.000Z`,
          type: 'Consumed',
          quantity: 340,
          reference: 'PO-1042 Production Run',
          performedBy: 'Sarah Lin',
        },
      ],
    },
    {
      id: 'MAT-CU-02',
      name: 'High-Purity Copper Magnet Wire (AWG-22)',
      sku: 'MTL-CU-MAG-22',
      category: 'Metals & Alloys',
      availableQuantity: 1450,
      reservedQuantity: 300,
      unitOfMeasurement: 'kg',
      minimumStockLevel: 500,
      unitCost: 9.8,
      supplierName: 'Aurum Global Metals Corp.',
      supplierContact: 'orders@aurummetals.com',
      lastRestockDate: '2026-10-24',
      status: 'In Stock',
      recentTransactions: [
        {
          id: 'TX-102',
          date: '2026-10-24T11:00:00.000Z',
          type: 'Received',
          quantity: 1200,
          reference: 'PO-REC-8843',
          performedBy: 'Elena Rostova',
        },
      ],
    },
    {
      id: 'MAT-AL-03',
      name: 'Extruded Aluminum Ingot 6061-T6',
      sku: 'MTL-AL-6061-ING',
      category: 'Metals & Alloys',
      availableQuantity: 3200,
      reservedQuantity: 800,
      unitOfMeasurement: 'kg',
      minimumStockLevel: 1000,
      unitCost: 4.2,
      supplierName: 'Hydro Alloys International',
      supplierContact: 'sales@hydroalloys.com',
      lastRestockDate: '2026-10-22',
      status: 'In Stock',
      recentTransactions: [],
    },
    {
      id: 'MAT-BRG-04',
      name: 'High-Precision Angular Ball Bearing 608-2RS',
      sku: 'FST-BRG-608-RS',
      category: 'Fasteners & Hardware',
      availableQuantity: 420,
      reservedQuantity: 380,
      unitOfMeasurement: 'pcs',
      minimumStockLevel: 500,
      unitCost: 3.15,
      supplierName: 'SKF Precision Components',
      supplierContact: 'b2b@skfcomponents.com',
      lastRestockDate: '2026-10-15',
      expectedDeliveryDate: '2026-10-29',
      status: 'Low Stock',
      recentTransactions: [],
    },
    {
      id: 'MAT-IGBT-05',
      name: 'Silicon Carbide SiC Power MOSFET 1200V',
      sku: 'EL-SIC-MOS-1200',
      category: 'Electronics & Semiconductors',
      availableQuantity: 950,
      reservedQuantity: 600,
      unitOfMeasurement: 'pcs',
      minimumStockLevel: 400,
      unitCost: 28.0,
      supplierName: 'Wolfspeed Power Tech',
      supplierContact: 'orders@wolfspeed-dist.com',
      lastRestockDate: '2026-10-25',
      status: 'In Stock',
      recentTransactions: [],
    },
  ];

  const employees: Employee[] = [
    {
      id: 'EMP-101',
      name: 'Javier Santos',
      department: 'Line 1 Operations',
      role: 'Heavy Press Lead Operator',
      skillCategory: 'Press Certification Level 3',
      assignedLineId: 'LINE-01',
      assignedLineName: 'Line 1 - Stamping & Pressing',
      shift: 'Morning (06:00 - 14:00)',
      attendanceStatus: 'Present',
      isAvailable: true,
      assignedOrderId: 'PO-1041',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 234-5678',
    },
    {
      id: 'EMP-102',
      name: 'Li Na',
      department: 'Line 2 SMT Operations',
      role: 'SMT Process Specialist',
      skillCategory: 'SMT Feeder & Solder Inspection',
      assignedLineId: 'LINE-02',
      assignedLineName: 'Line 2 - SMT & PCB Assembly',
      shift: 'Morning (06:00 - 14:00)',
      attendanceStatus: 'Present',
      isAvailable: true,
      assignedOrderId: 'PO-1042',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 345-6789',
    },
    {
      id: 'EMP-103',
      name: 'Mateo Rossi',
      department: 'Line 3 Subassembly',
      role: 'Robotic Cell Technician',
      skillCategory: 'Kuka & ABB Programming',
      assignedLineId: 'LINE-03',
      assignedLineName: 'Line 3 - Mechanical Subassembly',
      shift: 'Morning (06:00 - 14:00)',
      attendanceStatus: 'Present',
      isAvailable: true,
      assignedOrderId: 'PO-1043',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 456-7890',
    },
    {
      id: 'EMP-104',
      name: 'Hanna Lindqvist',
      department: 'Line 4 Quality Assurance',
      role: 'End-of-Line QA Lead',
      skillCategory: 'High Voltage Safety & ISO 9001',
      assignedLineId: 'LINE-04',
      assignedLineName: 'Line 4 - Testing & Final Packaging',
      shift: 'Morning (06:00 - 14:00)',
      attendanceStatus: 'Present',
      isAvailable: true,
      assignedOrderId: 'PO-1044',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 567-8901',
    },
    {
      id: 'EMP-105',
      name: 'Tomasz Nowak',
      department: 'Maintenance & Reliability',
      role: 'Hydraulic Systems Specialist',
      skillCategory: 'Hydraulic & Pneumatic Overhaul',
      assignedLineId: 'LINE-01',
      assignedLineName: 'Line 1 - Stamping & Pressing',
      shift: 'Morning (06:00 - 14:00)',
      attendanceStatus: 'Present',
      isAvailable: true,
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 678-9012',
    },
    {
      id: 'EMP-106',
      name: 'Amina Al-Mansoor',
      department: 'Line 2 SMT Operations',
      role: 'SMT Feeder Operator',
      skillCategory: 'Component Reel Setup',
      assignedLineId: 'LINE-02',
      assignedLineName: 'Line 2 - SMT & PCB Assembly',
      shift: 'Morning (06:00 - 14:00)',
      attendanceStatus: 'Absent',
      isAvailable: false,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 789-0123',
    },
    {
      id: 'EMP-107',
      name: 'Lucas Becker',
      department: 'Line 3 Subassembly',
      role: 'Mechanical Assembler',
      skillCategory: 'Precision Torque Fastening',
      assignedLineId: 'LINE-03',
      assignedLineName: 'Line 3 - Mechanical Subassembly',
      shift: 'Afternoon (14:00 - 22:00)',
      attendanceStatus: 'Present',
      isAvailable: true,
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 890-1234',
    },
    {
      id: 'EMP-108',
      name: 'Claire Dupont',
      department: 'Line 4 Quality Assurance',
      role: 'Packaging Specialist',
      skillCategory: 'Automated Carton & Palletizer',
      assignedLineId: 'LINE-04',
      assignedLineName: 'Line 4 - Testing & Final Packaging',
      shift: 'Afternoon (14:00 - 22:00)',
      attendanceStatus: 'Present',
      isAvailable: true,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      phone: '+1 (555) 901-2345',
    },
  ];

  const notifications: NotificationItem[] = [
    {
      id: 'NOTIF-01',
      title: 'Critical Production Delay on Line 2',
      message: 'Automotive 32-bit MCU shortage halted SMT Line 2 (Order PO-1042).',
      type: 'critical_delay',
      severity: 'critical',
      read: false,
      createdAt: `${todayStr}T09:20:00.000Z`,
      targetModule: 'delays',
      targetId: 'INC-2026-081',
    },
    {
      id: 'NOTIF-02',
      title: 'Low Raw Material Stock Warning',
      message: 'Automotive 32-bit MCU stock (180 pcs) fell below minimum threshold (600 pcs).',
      type: 'low_stock',
      severity: 'warning',
      read: false,
      createdAt: `${todayStr}T09:25:00.000Z`,
      targetModule: 'materials',
      targetId: 'MAT-MCU-01',
    },
    {
      id: 'NOTIF-03',
      title: 'Hydraulic Press Seal Pack Replaced',
      message: 'Maintenance completed on Press 01 by David Kowalski. Line 1 resumed normal output.',
      type: 'maintenance_completed',
      severity: 'success',
      read: true,
      createdAt: `${todayStr}T08:50:00.000Z`,
      targetModule: 'machines',
      targetId: 'MCH-PRS-01',
    },
    {
      id: 'NOTIF-04',
      title: 'Workforce Shortage on Morning Shift',
      message: '1 worker absent on Line 2 SMT Feeder Bay.',
      type: 'workforce_shortage',
      severity: 'warning',
      read: false,
      createdAt: `${todayStr}T06:45:00.000Z`,
      targetModule: 'workforce',
      targetId: 'EMP-106',
    },
  ];

  const auditLogs: AuditLog[] = [
    {
      id: 'AUD-01',
      timestamp: `${todayStr}T08:45:00.000Z`,
      userName: 'David Kowalski',
      userRole: 'Maintenance Technician',
      action: 'RESOLVE_INCIDENT',
      entityType: 'Incident',
      entityId: 'INC-2026-082',
      details: 'Marked Komatsu 500-Ton press hydraulic leak as Resolved after seal pack replacement.',
    },
    {
      id: 'AUD-02',
      timestamp: `${todayStr}T09:20:00.000Z`,
      userName: 'Sarah Lin',
      userRole: 'Production Manager',
      action: 'CREATE_INCIDENT',
      entityType: 'Incident',
      entityId: 'INC-2026-081',
      details: 'Logged Critical delay for PO-1042 due to MCU shortage on Line 2.',
    },
    {
      id: 'AUD-03',
      timestamp: `${todayStr}T11:00:00.000Z`,
      userName: 'Carlos Mendez',
      userRole: 'Production Supervisor',
      action: 'UPDATE_OUTPUT',
      entityType: 'Order',
      entityId: 'PO-1041',
      details: 'Recorded +180 completed units. Total now 1080/1200 (90%).',
    },
  ];

  return {
    productionOrders,
    delayIncidents,
    machines,
    rawMaterials,
    employees,
    notifications,
    auditLogs,
  };
}

let store = initSeedData();

// Helper to log audit
function logAudit(
  userName: string,
  userRole: string,
  action: string,
  entityType: AuditLog['entityType'],
  entityId: string,
  details: string
) {
  const newAudit: AuditLog = {
    id: `AUD-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    userName,
    userRole,
    action,
    entityType,
    entityId,
    details,
  };
  store.auditLogs.unshift(newAudit);
}

// Calculate dynamic KPIs
function calculateKPIs(): DashboardKPIs {
  const activeOrders = store.productionOrders.filter((o) => o.status !== 'Cancelled');
  const todayTarget = activeOrders.reduce((sum, o) => sum + o.targetQuantity, 0);
  const todayProduced = activeOrders.reduce((sum, o) => sum + o.completedQuantity, 0);
  const targetAchievementPercentage =
    todayTarget > 0 ? Number(((todayProduced / todayTarget) * 100).toFixed(1)) : 0;

  const activeDelays = store.delayIncidents.filter(
    (inc) => inc.status !== 'Resolved' && inc.status !== 'Closed'
  );
  const criticalDelays = activeDelays.filter((inc) => inc.severity === 'Critical');

  const totalMachines = store.machines.length;
  const machinesOperational = store.machines.filter((m) => m.status === 'Operational').length;

  const totalScheduledHours = store.machines.reduce(
    (sum, m) => sum + m.scheduledOperatingHoursPerDay,
    0
  );
  const totalDowntimeMinutesToday = store.machines.reduce(
    (sum, m) => sum + m.totalDowntimeMinutes,
    0
  );
  const totalScheduledMinutes = totalScheduledHours * 60;
  const machineAvailabilityPercentage =
    totalScheduledMinutes > 0
      ? Number(
          (
            ((totalScheduledMinutes - totalDowntimeMinutesToday) / totalScheduledMinutes) *
            100
          ).toFixed(1)
        )
      : 100;

  const materialShortagesCount = store.rawMaterials.filter(
    (m) => m.status === 'Low Stock' || m.status === 'Critical Shortage'
  ).length;

  const totalEmployees = store.employees.length;
  const presentEmployees = store.employees.filter((e) => e.attendanceStatus === 'Present').length;
  const workforceAvailabilityPercentage =
    totalEmployees > 0 ? Number(((presentEmployees / totalEmployees) * 100).toFixed(1)) : 100;

  const completedOrders = store.productionOrders.filter((o) => o.status === 'Completed');
  const onTimeCompleted = completedOrders.filter((o) => {
    if (!o.completedAt) return true;
    return new Date(o.completedAt) <= new Date(o.deadline);
  }).length;
  const onTimeCompletionRate =
    completedOrders.length > 0
      ? Number(((onTimeCompleted / completedOrders.length) * 100).toFixed(1))
      : 100;

  return {
    todayTarget,
    todayProduced,
    targetAchievementPercentage,
    activeDelaysCount: activeDelays.length,
    criticalDelaysCount: criticalDelays.length,
    totalMachines,
    machinesOperational,
    machineAvailabilityPercentage,
    totalDowntimeMinutesToday,
    materialShortagesCount,
    workforceAvailabilityPercentage,
    onTimeCompletionRate,
  };
}

// ==========================================
// API ROUTES
// ==========================================

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Users & Current Auth
app.get('/api/users', (req, res) => {
  res.json({ users: USERS, currentUser });
});

app.post('/api/auth/switch-user', (req, res) => {
  const { userId } = req.body;
  const target = USERS.find((u) => u.id === userId);
  if (!target) {
    return res.status(404).json({ error: 'User not found' });
  }
  currentUser = target;
  logAudit(currentUser.name, currentUser.role, 'USER_SWITCH', 'Setting', userId, `Switched session to ${target.name} (${target.role})`);
  res.json({ success: true, currentUser });
});

// Production Lines
app.get('/api/production-lines', (req, res) => {
  res.json(PRODUCTION_LINES);
});

// Dashboard KPIs
app.get('/api/dashboard/kpis', (req, res) => {
  res.json(calculateKPIs());
});

// Dashboard Performance Chart Data
app.get('/api/dashboard/performance', (req, res) => {
  const timeframe = (req.query.timeframe as string) || 'daily';
  
  if (timeframe === 'weekly') {
    const data = [
      { period: 'Mon', planned: 2400, actual: 2310, targetRate: 96.2 },
      { period: 'Tue', planned: 2500, actual: 2420, targetRate: 96.8 },
      { period: 'Wed', planned: 2600, actual: 2150, targetRate: 82.6 },
      { period: 'Thu', planned: 2450, actual: 2400, targetRate: 97.9 },
      { period: 'Fri', planned: 2550, actual: 2580, targetRate: 101.1 },
      { period: 'Sat', planned: 1800, actual: 1740, targetRate: 96.6 },
      { period: 'Today', planned: 3050, actual: 2400, targetRate: 78.6 },
    ];
    return res.json(data);
  }

  if (timeframe === 'monthly') {
    const data = [
      { period: 'Week 1', planned: 14500, actual: 14100, targetRate: 97.2 },
      { period: 'Week 2', planned: 15200, actual: 14900, targetRate: 98.0 },
      { period: 'Week 3', planned: 14800, actual: 13950, targetRate: 94.2 },
      { period: 'Week 4', planned: 15000, actual: 14650, targetRate: 97.6 },
    ];
    return res.json(data);
  }

  // Daily by line
  const byLine = PRODUCTION_LINES.map((line) => {
    const orders = store.productionOrders.filter((o) => o.productionLineId === line.id);
    const planned = orders.reduce((sum, o) => sum + o.targetQuantity, 0) || 500;
    const actual = orders.reduce((sum, o) => sum + o.completedQuantity, 0);
    const targetRate = Number(((actual / planned) * 100).toFixed(1));
    return {
      period: line.name.split(' - ')[0],
      fullName: line.name,
      planned,
      actual,
      targetRate,
    };
  });
  res.json(byLine);
});

// Delay Cause Distribution
app.get('/api/dashboard/delay-causes', (req, res) => {
  const causesMap: Record<string, number> = {};
  store.delayIncidents.forEach((inc) => {
    causesMap[inc.category] = (causesMap[inc.category] || 0) + (inc.durationMinutes || 30);
  });

  const categories = [
    'Machine Breakdown',
    'Raw Material Shortage',
    'Worker Unavailability',
    'Quality Control Failure',
    'Power Failure',
    'Equipment Maintenance',
    'Supplier Delay',
    'Production Planning Issue',
    'Other',
  ];

  const colors: Record<string, string> = {
    'Machine Breakdown': '#EF4444',
    'Raw Material Shortage': '#F59E0B',
    'Worker Unavailability': '#8B5CF6',
    'Quality Control Failure': '#EC4899',
    'Power Failure': '#6366F1',
    'Equipment Maintenance': '#10B981',
    'Supplier Delay': '#0EA5E9',
    'Production Planning Issue': '#64748B',
    'Other': '#94A3B8',
  };

  const distribution = categories
    .map((cat) => ({
      name: cat,
      minutes: causesMap[cat] || 0,
      count: store.delayIncidents.filter((i) => i.category === cat).length,
      color: colors[cat] || '#2878E5',
    }))
    .filter((c) => c.minutes > 0 || c.count > 0);

  res.json(distribution);
});

// ==========================================
// PRODUCTION ORDERS ENDPOINTS
// ==========================================
app.get('/api/production/orders', (req, res) => {
  const { lineId, status, priority, search } = req.query;
  let result = [...store.productionOrders];

  if (lineId && lineId !== 'all') {
    result = result.filter((o) => o.productionLineId === lineId);
  }
  if (status && status !== 'all') {
    result = result.filter((o) => o.status === status);
  }
  if (priority && priority !== 'all') {
    result = result.filter((o) => o.priority === priority);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q) ||
        o.productSku.toLowerCase().includes(q)
    );
  }

  // Auto calculate risk
  result = result.map((o) => {
    const remaining = Math.max(0, o.targetQuantity - o.completedQuantity);
    const progress =
      o.targetQuantity > 0 ? Number(((o.completedQuantity / o.targetQuantity) * 100).toFixed(1)) : 0;
    
    // Check if behind schedule
    const now = new Date();
    const start = new Date(o.startDate);
    const end = new Date(o.deadline);
    let isAtRisk = false;
    if (o.status !== 'Completed' && o.status !== 'Cancelled') {
      if (now > end && progress < 100) {
        isAtRisk = true;
      } else if (now > start && end > start) {
        const totalDuration = end.getTime() - start.getTime();
        const elapsed = now.getTime() - start.getTime();
        const expectedProgress = Math.min(100, (elapsed / totalDuration) * 100);
        if (progress < expectedProgress - 15) {
          isAtRisk = true;
        }
      }
    }

    return {
      ...o,
      remainingQuantity: remaining,
      progressPercentage: progress,
      isAtRisk: isAtRisk || o.status === 'Delayed',
    };
  });

  res.json(result);
});

app.post('/api/production/orders', (req, res) => {
  const {
    productName,
    productSku,
    productionLineId,
    assignedSupervisorId,
    targetQuantity,
    startDate,
    deadline,
    priority,
    notes,
  } = req.body;

  if (!productName || !targetQuantity || !startDate || !deadline || !productionLineId) {
    return res.status(400).json({ error: 'Missing required order fields' });
  }

  if (Number(targetQuantity) <= 0) {
    return res.status(400).json({ error: 'Target quantity must be greater than zero' });
  }

  if (new Date(startDate) >= new Date(deadline)) {
    return res.status(400).json({ error: 'Start date must be before deadline' });
  }

  const line = PRODUCTION_LINES.find((l) => l.id === productionLineId);
  const supervisor = USERS.find((u) => u.id === assignedSupervisorId) || currentUser;

  const idNum = 1040 + store.productionOrders.length + 1;
  const newOrder: ProductionOrder = {
    id: `PO-${idNum}`,
    orderNumber: `ORD-2026-${idNum}`,
    productName,
    productSku: productSku || `SKU-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    productionLineId,
    productionLineName: line?.name || 'Line 1',
    assignedSupervisorId: supervisor.id,
    assignedSupervisorName: supervisor.name,
    targetQuantity: Number(targetQuantity),
    completedQuantity: 0,
    scrapQuantity: 0,
    startDate,
    deadline,
    priority: priority || 'Medium',
    status: 'Planned',
    notes: notes || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    remainingQuantity: Number(targetQuantity),
    progressPercentage: 0,
    isAtRisk: false,
  };

  store.productionOrders.unshift(newOrder);
  logAudit(currentUser.name, currentUser.role, 'CREATE_ORDER', 'Order', newOrder.id, `Created order ${newOrder.orderNumber} (${productName}, target ${targetQuantity})`);

  res.status(201).json(newOrder);
});

app.put('/api/production/orders/:id', (req, res) => {
  const { id } = req.params;
  const orderIndex = store.productionOrders.findIndex((o) => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const existing = store.productionOrders[orderIndex];
  const updatedData = req.body;

  if (updatedData.targetQuantity && Number(updatedData.targetQuantity) <= 0) {
    return res.status(400).json({ error: 'Target quantity must be greater than zero' });
  }

  const line = updatedData.productionLineId
    ? PRODUCTION_LINES.find((l) => l.id === updatedData.productionLineId)
    : undefined;

  const targetQty = updatedData.targetQuantity !== undefined ? Number(updatedData.targetQuantity) : existing.targetQuantity;
  const completedQty = updatedData.completedQuantity !== undefined ? Number(updatedData.completedQuantity) : existing.completedQuantity;
  const remainingQty = Math.max(0, targetQty - completedQty);
  const progress = targetQty > 0 ? Number(((completedQty / targetQty) * 100).toFixed(1)) : 0;

  let newStatus = updatedData.status || existing.status;
  let completedAt = existing.completedAt;
  if (completedQty >= targetQty && newStatus !== 'Cancelled') {
    newStatus = 'Completed';
    completedAt = completedAt || new Date().toISOString();
  }

  const updatedOrder: ProductionOrder = {
    ...existing,
    ...updatedData,
    productionLineName: line?.name || existing.productionLineName,
    targetQuantity: targetQty,
    completedQuantity: completedQty,
    remainingQuantity: remainingQty,
    progressPercentage: progress,
    status: newStatus,
    completedAt,
    updatedAt: new Date().toISOString(),
  };

  store.productionOrders[orderIndex] = updatedOrder;
  logAudit(currentUser.name, currentUser.role, 'UPDATE_ORDER', 'Order', id, `Updated order ${updatedOrder.orderNumber} status to ${updatedOrder.status}`);

  res.json(updatedOrder);
});

app.delete('/api/production/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = store.productionOrders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // Administrator or Production Manager permission check
  if (currentUser.role !== 'Administrator' && currentUser.role !== 'Production Manager') {
    return res.status(403).json({ error: 'Insufficient permission to delete production orders' });
  }

  store.productionOrders = store.productionOrders.filter((o) => o.id !== id);
  logAudit(currentUser.name, currentUser.role, 'DELETE_ORDER', 'Order', id, `Deleted production order ${order.orderNumber}`);

  res.json({ success: true, message: 'Order deleted successfully' });
});

// Log Production Output
app.post('/api/production/orders/:id/log-output', (req, res) => {
  const { id } = req.params;
  const { unitsAdded, scrapAdded, notes } = req.body;

  const orderIndex = store.productionOrders.findIndex((o) => o.id === id);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const units = Number(unitsAdded) || 0;
  const scrap = Number(scrapAdded) || 0;

  if (units < 0 || scrap < 0) {
    return res.status(400).json({ error: 'Units added and scrap cannot be negative' });
  }

  const order = store.productionOrders[orderIndex];
  const newCompleted = order.completedQuantity + units;
  const newScrap = order.scrapQuantity + scrap;
  const remaining = Math.max(0, order.targetQuantity - newCompleted);
  const progress = Number(((newCompleted / order.targetQuantity) * 100).toFixed(1));

  let status = order.status;
  let completedAt = order.completedAt;
  if (newCompleted >= order.targetQuantity) {
    status = 'Completed';
    completedAt = new Date().toISOString();
  } else if (order.status === 'Planned') {
    status = 'In Progress';
  }

  store.productionOrders[orderIndex] = {
    ...order,
    completedQuantity: newCompleted,
    scrapQuantity: newScrap,
    remainingQuantity: remaining,
    progressPercentage: progress,
    status,
    completedAt,
    updatedAt: new Date().toISOString(),
  };

  logAudit(
    currentUser.name,
    currentUser.role,
    'LOG_OUTPUT',
    'Order',
    order.id,
    `Logged +${units} units (scrap +${scrap}) for order ${order.orderNumber}. Total: ${newCompleted}/${order.targetQuantity} (${progress}%)`
  );

  res.json(store.productionOrders[orderIndex]);
});

// ==========================================
// DELAY INCIDENTS ENDPOINTS (CORE MODULE)
// ==========================================
app.get('/api/delays/incidents', (req, res) => {
  const { category, severity, status, lineId, search } = req.query;
  let result = [...store.delayIncidents];

  if (category && category !== 'all') {
    result = result.filter((i) => i.category === category);
  }
  if (severity && severity !== 'all') {
    result = result.filter((i) => i.severity === severity);
  }
  if (status && status !== 'all') {
    result = result.filter((i) => i.status === status);
  }
  if (lineId && lineId !== 'all') {
    result = result.filter((i) => i.productionLineId === lineId);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      (i) =>
        i.id.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.rootCause.toLowerCase().includes(q) ||
        (i.productionOrderNumber && i.productionOrderNumber.toLowerCase().includes(q))
    );
  }

  // Dynamic recalculation of duration for open incidents
  result = result.map((inc) => {
    let duration = inc.durationMinutes;
    if (!inc.endTime && inc.status !== 'Resolved' && inc.status !== 'Closed') {
      const startMs = new Date(inc.startTime).getTime();
      const nowMs = Date.now();
      duration = Math.max(1, Math.round((nowMs - startMs) / (1000 * 60)));
    }
    return { ...inc, durationMinutes: duration };
  });

  res.json(result);
});

app.post('/api/delays/incidents', (req, res) => {
  const {
    productionOrderId,
    productionLineId,
    machineId,
    category,
    productionArea,
    startTime,
    endTime,
    severity,
    description,
    rootCause,
    assignedPersonId,
    correctiveAction,
    preventiveAction,
    attachmentUrl,
  } = req.body;

  if (!category || !productionArea || !startTime || !description || !rootCause) {
    return res.status(400).json({ error: 'Please provide all required delay fields' });
  }

  // Validate timestamps
  const startMs = new Date(startTime).getTime();
  let durationMinutes = 30; // default estimated
  if (endTime) {
    const endMs = new Date(endTime).getTime();
    if (endMs < startMs) {
      return res.status(400).json({ error: 'Incident end time cannot be before start time' });
    }
    durationMinutes = Math.round((endMs - startMs) / (1000 * 60));
  } else {
    durationMinutes = Math.max(5, Math.round((Date.now() - startMs) / (1000 * 60)));
  }

  const linkedOrder = productionOrderId
    ? store.productionOrders.find((o) => o.id === productionOrderId)
    : undefined;
  const line = productionLineId
    ? PRODUCTION_LINES.find((l) => l.id === productionLineId)
    : linkedOrder
    ? PRODUCTION_LINES.find((l) => l.id === linkedOrder.productionLineId)
    : PRODUCTION_LINES[0];

  const machine = machineId ? store.machines.find((m) => m.id === machineId) : undefined;
  const assigned = USERS.find((u) => u.id === assignedPersonId) || currentUser;

  const nextId = `INC-2026-0${80 + store.delayIncidents.length + 1}`;
  const newIncident: DelayIncident = {
    id: nextId,
    productionOrderId: linkedOrder?.id,
    productionOrderNumber: linkedOrder?.orderNumber,
    productName: linkedOrder?.productName,
    productionLineId: line?.id || 'LINE-01',
    productionLineName: line?.name || 'Line 1',
    machineId: machine?.id,
    machineName: machine?.name,
    category,
    productionArea,
    startTime,
    endTime,
    durationMinutes,
    severity: severity || 'Medium',
    description,
    rootCause,
    assignedPersonId: assigned.id,
    assignedPersonName: assigned.name,
    correctiveAction,
    preventiveAction,
    attachmentUrl: attachmentUrl || '',
    status: 'Open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.delayIncidents.unshift(newIncident);

  // If critical, generate in-app alert
  if (severity === 'Critical' || severity === 'High') {
    const alert: NotificationItem = {
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      title: `${severity.toUpperCase()} Delay Incident: ${category}`,
      message: `${description} on ${line?.name}. Assigned to ${assigned.name}.`,
      type: 'critical_delay',
      severity: severity === 'Critical' ? 'critical' : 'warning',
      read: false,
      createdAt: new Date().toISOString(),
      targetModule: 'delays',
      targetId: newIncident.id,
    };
    store.notifications.unshift(alert);
  }

  // Update order status if linked and high/critical
  if (linkedOrder && (severity === 'High' || severity === 'Critical')) {
    const oIdx = store.productionOrders.findIndex((o) => o.id === linkedOrder.id);
    if (oIdx !== -1 && store.productionOrders[oIdx].status !== 'Completed') {
      store.productionOrders[oIdx].status = 'Delayed';
      store.productionOrders[oIdx].isAtRisk = true;
    }
  }

  // Update machine status if machine breakdown
  if (machine && category === 'Machine Breakdown') {
    const mIdx = store.machines.findIndex((m) => m.id === machine.id);
    if (mIdx !== -1) {
      store.machines[mIdx].status = 'Breakdown';
      store.machines[mIdx].totalDowntimeMinutes += durationMinutes;
    }
  }

  logAudit(currentUser.name, currentUser.role, 'CREATE_DELAY', 'Incident', newIncident.id, `Logged ${severity} delay: ${category} (${description.slice(0, 40)}...)`);

  res.status(201).json(newIncident);
});

app.put('/api/delays/incidents/:id', (req, res) => {
  const { id } = req.params;
  const index = store.delayIncidents.findIndex((i) => i.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  const existing = store.delayIncidents[index];
  const updateData = req.body;

  // Validation: Cannot mark as Resolved or Closed without resolutionTime and correctiveAction
  if (updateData.status === 'Resolved' || updateData.status === 'Closed') {
    const corrective = updateData.correctiveAction || existing.correctiveAction;
    if (!corrective || corrective.trim().length === 0) {
      return res.status(400).json({
        error: 'Cannot mark incident as Resolved without recording corrective action taken.',
      });
    }
  }

  // Calculate duration if ending
  let endTime = updateData.endTime !== undefined ? updateData.endTime : existing.endTime;
  let resolutionTime = updateData.resolutionTime !== undefined ? updateData.resolutionTime : existing.resolutionTime;
  if ((updateData.status === 'Resolved' || updateData.status === 'Closed') && !resolutionTime) {
    resolutionTime = new Date().toISOString();
    endTime = endTime || resolutionTime;
  }

  let duration = existing.durationMinutes;
  if (endTime) {
    const startMs = new Date(existing.startTime).getTime();
    const endMs = new Date(endTime).getTime();
    if (endMs < startMs) {
      return res.status(400).json({ error: 'End time cannot be earlier than start time' });
    }
    duration = Math.round((endMs - startMs) / (1000 * 60));
  }

  const assigned = updateData.assignedPersonId
    ? USERS.find((u) => u.id === updateData.assignedPersonId)
    : undefined;

  const updatedIncident: DelayIncident = {
    ...existing,
    ...updateData,
    assignedPersonName: assigned?.name || existing.assignedPersonName,
    endTime,
    resolutionTime,
    durationMinutes: duration,
    updatedAt: new Date().toISOString(),
  };

  store.delayIncidents[index] = updatedIncident;

  // If resolved, restore machine to operational if it was in breakdown
  if (updatedIncident.status === 'Resolved' && updatedIncident.machineId) {
    const mIdx = store.machines.findIndex((m) => m.id === updatedIncident.machineId);
    if (mIdx !== -1 && store.machines[mIdx].status === 'Breakdown') {
      store.machines[mIdx].status = 'Operational';
      store.machines[mIdx].lastMaintenanceDate = new Date().toISOString();
    }
  }

  logAudit(
    currentUser.name,
    currentUser.role,
    'UPDATE_DELAY',
    'Incident',
    id,
    `Updated incident ${id} status to ${updatedIncident.status}`
  );

  res.json(updatedIncident);
});

app.delete('/api/delays/incidents/:id', (req, res) => {
  const { id } = req.params;
  const inc = store.delayIncidents.find((i) => i.id === id);
  if (!inc) {
    return res.status(404).json({ error: 'Incident not found' });
  }

  if (currentUser.role !== 'Administrator' && currentUser.role !== 'Production Manager') {
    return res.status(403).json({ error: 'Insufficient permission to delete delay incidents' });
  }

  store.delayIncidents = store.delayIncidents.filter((i) => i.id !== id);
  logAudit(currentUser.name, currentUser.role, 'DELETE_DELAY', 'Incident', id, `Deleted delay incident ${id}`);

  res.json({ success: true, message: 'Incident deleted successfully' });
});

// ==========================================
// MACHINES & MAINTENANCE ENDPOINTS
// ==========================================
app.get('/api/machines', (req, res) => {
  res.json(store.machines);
});

app.post('/api/machines', (req, res) => {
  const { name, type, productionLineId, location, scheduledOperatingHoursPerDay } = req.body;
  if (!name || !type || !productionLineId) {
    return res.status(400).json({ error: 'Machine name, type, and line are required' });
  }

  const line = PRODUCTION_LINES.find((l) => l.id === productionLineId);
  const idNum = `MCH-0${store.machines.length + 1}`;

  const newMachine: Machine = {
    id: idNum,
    name,
    type,
    productionLineId,
    productionLineName: line?.name || 'Line 1',
    location: location || 'Main Floor',
    status: 'Operational',
    lastMaintenanceDate: new Date().toISOString(),
    nextScheduledMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalDowntimeMinutes: 0,
    scheduledOperatingHoursPerDay: Number(scheduledOperatingHoursPerDay) || 16,
    operationalHoursToday: 0,
    healthScore: 100,
    maintenanceHistory: [],
  };

  store.machines.push(newMachine);
  logAudit(currentUser.name, currentUser.role, 'ADD_MACHINE', 'Machine', newMachine.id, `Added new machine ${name}`);

  res.status(201).json(newMachine);
});

app.put('/api/machines/:id', (req, res) => {
  const { id } = req.params;
  const index = store.machines.findIndex((m) => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Machine not found' });
  }

  const existing = store.machines[index];
  const updateData = req.body;

  store.machines[index] = {
    ...existing,
    ...updateData,
  };

  logAudit(currentUser.name, currentUser.role, 'UPDATE_MACHINE', 'Machine', id, `Updated machine status: ${store.machines[index].name} (${store.machines[index].status})`);

  res.json(store.machines[index]);
});

// Record Machine Breakdown -> creates linked delay incident
app.post('/api/machines/:id/breakdown', (req, res) => {
  const { id } = req.params;
  const { description, severity, estimatedDowntimeMinutes } = req.body;

  const machineIndex = store.machines.findIndex((m) => m.id === id);
  if (machineIndex === -1) {
    return res.status(404).json({ error: 'Machine not found' });
  }

  const machine = store.machines[machineIndex];
  const downtime = Number(estimatedDowntimeMinutes) || 60;

  // Set machine status to breakdown
  store.machines[machineIndex].status = 'Breakdown';
  store.machines[machineIndex].totalDowntimeMinutes += downtime;

  // Create linked delay incident
  const nextIncId = `INC-2026-0${80 + store.delayIncidents.length + 1}`;
  const now = new Date().toISOString();
  const newIncident: DelayIncident = {
    id: nextIncId,
    productionOrderId: machine.currentProductionOrderId,
    productionOrderNumber: machine.currentProductionOrderNumber,
    productionLineId: machine.productionLineId,
    productionLineName: machine.productionLineName,
    machineId: machine.id,
    machineName: machine.name,
    category: 'Machine Breakdown',
    productionArea: machine.location,
    startTime: now,
    durationMinutes: downtime,
    severity: severity || 'High',
    description: description || `Machine breakdown recorded on ${machine.name}`,
    rootCause: 'Under active diagnostics by maintenance engineering.',
    assignedPersonId: currentUser.id,
    assignedPersonName: currentUser.name,
    status: 'Open',
    createdAt: now,
    updatedAt: now,
  };

  store.delayIncidents.unshift(newIncident);

  // Send Notification
  store.notifications.unshift({
    id: `NOTIF-${Date.now().toString().slice(-6)}`,
    title: `Machine Breakdown: ${machine.name}`,
    message: `${description || 'Sudden stoppage'} on ${machine.productionLineName}.`,
    type: 'machine_breakdown',
    severity: 'critical',
    read: false,
    createdAt: now,
    targetModule: 'machines',
    targetId: machine.id,
  });

  logAudit(
    currentUser.name,
    currentUser.role,
    'LOG_BREAKDOWN',
    'Machine',
    machine.id,
    `Reported breakdown for ${machine.name}. Auto-created incident ${newIncident.id}.`
  );

  res.json({ machine: store.machines[machineIndex], incident: newIncident });
});

// Record Machine Maintenance
app.post('/api/machines/:id/maintenance', (req, res) => {
  const { id } = req.params;
  const { type, technician, description, downtimeMinutes, restoreStatus } = req.body;

  const machineIndex = store.machines.findIndex((m) => m.id === id);
  if (machineIndex === -1) {
    return res.status(404).json({ error: 'Machine not found' });
  }

  const machine = store.machines[machineIndex];
  const downtime = Number(downtimeMinutes) || 0;
  const now = new Date().toISOString();

  const maintenanceRecord = {
    id: `MNT-${Date.now().toString().slice(-5)}`,
    date: now,
    type: type || 'Preventive',
    technician: technician || currentUser.name,
    description: description || 'Routine maintenance completed.',
    downtimeMinutes: downtime,
  };

  machine.maintenanceHistory.unshift(maintenanceRecord);
  machine.lastMaintenanceDate = now;
  machine.totalDowntimeMinutes += downtime;
  if (restoreStatus) {
    machine.status = 'Operational';
  }

  // Recalculate health
  machine.healthScore = Math.min(100, Math.max(50, 100 - Math.round(machine.totalDowntimeMinutes / 30)));

  store.machines[machineIndex] = machine;

  logAudit(
    currentUser.name,
    currentUser.role,
    'MAINTENANCE_COMPLETE',
    'Machine',
    machine.id,
    `Completed ${type} maintenance for ${machine.name} (${downtime} mins downtime)`
  );

  res.json(machine);
});

// ==========================================
// RAW MATERIALS & INVENTORY ENDPOINTS
// ==========================================
app.get('/api/materials', (req, res) => {
  res.json(store.rawMaterials);
});

app.post('/api/materials', (req, res) => {
  const {
    name,
    sku,
    category,
    availableQuantity,
    unitOfMeasurement,
    minimumStockLevel,
    unitCost,
    supplierName,
    supplierContact,
  } = req.body;

  if (!name || !unitOfMeasurement || !minimumStockLevel) {
    return res.status(400).json({ error: 'Missing required material information' });
  }

  const initialQty = Number(availableQuantity) || 0;
  const minStock = Number(minimumStockLevel);
  const status = initialQty <= 0 ? 'Critical Shortage' : initialQty < minStock ? 'Low Stock' : 'In Stock';

  const newMat: RawMaterial = {
    id: `MAT-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    name,
    sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
    category: category || 'Metals & Alloys',
    availableQuantity: initialQty,
    reservedQuantity: 0,
    unitOfMeasurement,
    minimumStockLevel: minStock,
    unitCost: Number(unitCost) || 10,
    supplierName: supplierName || 'Global Industrial Supplies',
    supplierContact: supplierContact || 'info@industrial.com',
    lastRestockDate: new Date().toISOString().split('T')[0],
    status,
    recentTransactions: [],
  };

  store.rawMaterials.unshift(newMat);
  logAudit(currentUser.name, currentUser.role, 'CREATE_MATERIAL', 'Material', newMat.id, `Created material entry ${name}`);

  res.status(201).json(newMat);
});

// Record Stock Transaction (Received, Consumed, Adjustment, Reserved)
app.post('/api/materials/:id/transaction', (req, res) => {
  const { id } = req.params;
  const { type, quantity, reference } = req.body;

  const matIndex = store.rawMaterials.findIndex((m) => m.id === id);
  if (matIndex === -1) {
    return res.status(404).json({ error: 'Material not found' });
  }

  const mat = store.rawMaterials[matIndex];
  const delta = Number(quantity);

  if (delta <= 0) {
    return res.status(400).json({ error: 'Quantity must be greater than zero' });
  }

  let newAvailable = mat.availableQuantity;
  let newReserved = mat.reservedQuantity;

  if (type === 'Received') {
    newAvailable += delta;
  } else if (type === 'Consumed') {
    if (newAvailable < delta) {
      return res.status(400).json({
        error: `Insufficient available stock (${newAvailable} ${mat.unitOfMeasurement}) to consume ${delta} ${mat.unitOfMeasurement}.`,
      });
    }
    newAvailable -= delta;
    if (newReserved >= delta) {
      newReserved -= delta;
    }
  } else if (type === 'Reserved') {
    if (newAvailable < delta) {
      return res.status(400).json({
        error: `Cannot reserve ${delta}; only ${newAvailable} available.`,
      });
    }
    newReserved += delta;
  } else if (type === 'Adjustment') {
    newAvailable = delta; // absolute reset
  }

  // Determine status
  let newStatus: RawMaterial['status'] = 'In Stock';
  if (newAvailable <= 0) {
    newStatus = 'Critical Shortage';
  } else if (newAvailable < mat.minimumStockLevel) {
    newStatus = 'Low Stock';
  }

  const tx = {
    id: `TX-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString(),
    type,
    quantity: delta,
    reference: reference || 'Manual Adjustment',
    performedBy: currentUser.name,
  };

  mat.availableQuantity = newAvailable;
  mat.reservedQuantity = newReserved;
  mat.status = newStatus;
  mat.recentTransactions.unshift(tx);
  if (type === 'Received') {
    mat.lastRestockDate = new Date().toISOString().split('T')[0];
  }

  store.rawMaterials[matIndex] = mat;

  // If low stock or critical shortage, trigger notification
  if (newStatus !== 'In Stock') {
    store.notifications.unshift({
      id: `NOTIF-${Date.now().toString().slice(-6)}`,
      title: `Stock Alert: ${mat.name}`,
      message: `${mat.name} is now ${newStatus} (${newAvailable} ${mat.unitOfMeasurement} remaining; threshold ${mat.minimumStockLevel}).`,
      type: 'low_stock',
      severity: newStatus === 'Critical Shortage' ? 'critical' : 'warning',
      read: false,
      createdAt: new Date().toISOString(),
      targetModule: 'materials',
      targetId: mat.id,
    });
  }

  logAudit(
    currentUser.name,
    currentUser.role,
    'STOCK_TRANSACTION',
    'Material',
    mat.id,
    `Recorded ${type} of ${delta} ${mat.unitOfMeasurement} for ${mat.name}. New total: ${newAvailable}`
  );

  res.json(mat);
});

// Link material shortage to production order delay
app.post('/api/materials/:id/create-delay', (req, res) => {
  const { id } = req.params;
  const { productionOrderId, estimatedDowntimeMinutes } = req.body;

  const mat = store.rawMaterials.find((m) => m.id === id);
  if (!mat) {
    return res.status(404).json({ error: 'Material not found' });
  }

  const order = store.productionOrders.find((o) => o.id === productionOrderId);
  const downtime = Number(estimatedDowntimeMinutes) || 60;
  const nextIncId = `INC-2026-0${80 + store.delayIncidents.length + 1}`;
  const now = new Date().toISOString();

  const newIncident: DelayIncident = {
    id: nextIncId,
    productionOrderId: order?.id,
    productionOrderNumber: order?.orderNumber,
    productName: order?.productName,
    productionLineId: order?.productionLineId || 'LINE-01',
    productionLineName: order?.productionLineName || 'Line 1',
    category: 'Raw Material Shortage',
    productionArea: 'Assembly Feed Station',
    startTime: now,
    durationMinutes: downtime,
    severity: 'High',
    description: `Production halted due to shortage of ${mat.name} (${mat.sku}). Only ${mat.availableQuantity} ${mat.unitOfMeasurement} available.`,
    rootCause: `Inventory depletion below safety stock threshold (${mat.minimumStockLevel}). Supplier shipment pending.`,
    assignedPersonId: currentUser.id,
    assignedPersonName: currentUser.name,
    correctiveAction: 'Expedite restock order with supplier; evaluate alternative lot.',
    status: 'Action Required',
    createdAt: now,
    updatedAt: now,
  };

  store.delayIncidents.unshift(newIncident);

  if (order) {
    const oIdx = store.productionOrders.findIndex((o) => o.id === order.id);
    if (oIdx !== -1 && store.productionOrders[oIdx].status !== 'Completed') {
      store.productionOrders[oIdx].status = 'Delayed';
      store.productionOrders[oIdx].isAtRisk = true;
    }
  }

  logAudit(
    currentUser.name,
    currentUser.role,
    'CREATE_DELAY_FROM_SHORTAGE',
    'Incident',
    newIncident.id,
    `Created shortage incident for ${mat.name} affecting order ${order?.orderNumber || 'General'}`
  );

  res.json(newIncident);
});

// ==========================================
// WORKFORCE & ATTENDANCE ENDPOINTS
// ==========================================
app.get('/api/workforce', (req, res) => {
  res.json(store.employees);
});

app.post('/api/workforce/shift-attendance', (req, res) => {
  const { employeeId, attendanceStatus } = req.body;
  const empIndex = store.employees.findIndex((e) => e.id === employeeId);
  if (empIndex === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  const emp = store.employees[empIndex];
  emp.attendanceStatus = attendanceStatus;
  emp.isAvailable = attendanceStatus === 'Present';

  store.employees[empIndex] = emp;

  logAudit(
    currentUser.name,
    currentUser.role,
    'UPDATE_ATTENDANCE',
    'Workforce',
    emp.id,
    `Updated attendance for ${emp.name} to ${attendanceStatus}`
  );

  res.json(emp);
});

// Report Workforce Delay
app.post('/api/workforce/report-delay', (req, res) => {
  const { lineId, absentCount, description, severity } = req.body;
  const line = PRODUCTION_LINES.find((l) => l.id === lineId) || PRODUCTION_LINES[0];
  const nextIncId = `INC-2026-0${80 + store.delayIncidents.length + 1}`;
  const now = new Date().toISOString();

  const newIncident: DelayIncident = {
    id: nextIncId,
    productionLineId: line.id,
    productionLineName: line.name,
    category: 'Worker Unavailability',
    productionArea: `${line.name} Shift Bay`,
    startTime: now,
    durationMinutes: 45,
    severity: severity || 'Medium',
    description: description || `Staffing shortage: ${absentCount || 2} workers unavailable on ${line.name}`,
    rootCause: 'Unscheduled absence and lack of certified standby cross-operators.',
    assignedPersonId: currentUser.id,
    assignedPersonName: currentUser.name,
    correctiveAction: 'Reassign standby cross-trained operators from secondary cell.',
    status: 'Open',
    createdAt: now,
    updatedAt: now,
  };

  store.delayIncidents.unshift(newIncident);

  logAudit(
    currentUser.name,
    currentUser.role,
    'WORKFORCE_DELAY',
    'Incident',
    newIncident.id,
    `Logged workforce delay for ${line.name}`
  );

  res.json(newIncident);
});

// ==========================================
// REPORTS & ANALYTICS ENDPOINTS
// ==========================================
app.get('/api/reports', (req, res) => {
  const { lineId, category, startDate, endDate } = req.query;

  let filteredIncidents = [...store.delayIncidents];
  let filteredOrders = [...store.productionOrders];

  if (lineId && lineId !== 'all') {
    filteredIncidents = filteredIncidents.filter((i) => i.productionLineId === lineId);
    filteredOrders = filteredOrders.filter((o) => o.productionLineId === lineId);
  }

  if (category && category !== 'all') {
    filteredIncidents = filteredIncidents.filter((i) => i.category === category);
  }

  // Calculate metrics
  const totalDowntimeMinutes = filteredIncidents.reduce((sum, i) => sum + i.durationMinutes, 0);
  const totalIncidents = filteredIncidents.length;
  const averageDelayDurationMinutes =
    totalIncidents > 0 ? Number((totalDowntimeMinutes / totalIncidents).toFixed(1)) : 0;

  const totalPlannedOutput = filteredOrders.reduce((sum, o) => sum + o.targetQuantity, 0);
  const totalActualOutput = filteredOrders.reduce((sum, o) => sum + o.completedQuantity, 0);
  const targetAchievementPercentage =
    totalPlannedOutput > 0
      ? Number(((totalActualOutput / totalPlannedOutput) * 100).toFixed(1))
      : 100;

  const completedOrders = filteredOrders.filter((o) => o.status === 'Completed');
  const onTimeCompleted = completedOrders.filter((o) => {
    if (!o.completedAt) return true;
    return new Date(o.completedAt) <= new Date(o.deadline);
  }).length;
  const onTimeCompletionRate =
    completedOrders.length > 0
      ? Number(((onTimeCompleted / completedOrders.length) * 100).toFixed(1))
      : 100;

  // Delay Frequency by Cause
  const frequencyByCause: Record<string, { count: number; minutes: number }> = {};
  filteredIncidents.forEach((i) => {
    if (!frequencyByCause[i.category]) {
      frequencyByCause[i.category] = { count: 0, minutes: 0 };
    }
    frequencyByCause[i.category].count += 1;
    frequencyByCause[i.category].minutes += i.durationMinutes;
  });

  const causeAnalysis = Object.keys(frequencyByCause).map((cause) => ({
    cause,
    count: frequencyByCause[cause].count,
    totalMinutes: frequencyByCause[cause].minutes,
    percentage:
      totalDowntimeMinutes > 0
        ? Number(((frequencyByCause[cause].minutes / totalDowntimeMinutes) * 100).toFixed(1))
        : 0,
  }));

  // Machine Availability
  const machineReport = store.machines.map((m) => {
    const scheduledMins = m.scheduledOperatingHoursPerDay * 60;
    const avail =
      scheduledMins > 0
        ? Math.max(0, Number((((scheduledMins - m.totalDowntimeMinutes) / scheduledMins) * 100).toFixed(1)))
        : 100;
    return {
      machineId: m.id,
      name: m.name,
      line: m.productionLineName,
      status: m.status,
      downtimeMinutes: m.totalDowntimeMinutes,
      availabilityPercentage: avail,
      healthScore: m.healthScore,
    };
  });

  res.json({
    metrics: {
      totalDowntimeMinutes,
      totalIncidents,
      averageDelayDurationMinutes,
      totalPlannedOutput,
      totalActualOutput,
      targetAchievementPercentage,
      onTimeCompletionRate,
      eligibleCompletedOrdersCount: completedOrders.length,
    },
    causeAnalysis,
    machineReport,
    incidents: filteredIncidents,
    orders: filteredOrders,
  });
});

// CSV Export
app.get('/api/reports/export-csv', (req, res) => {
  const { type } = req.query;

  if (type === 'incidents') {
    const headers = [
      'Incident ID',
      'Category',
      'Production Line',
      'Machine',
      'Severity',
      'Duration (Mins)',
      'Status',
      'Assigned Person',
      'Start Time',
      'Root Cause',
      'Corrective Action',
    ];
    const rows = store.delayIncidents.map((i) => [
      i.id,
      `"${i.category}"`,
      `"${i.productionLineName}"`,
      `"${i.machineName || 'N/A'}"`,
      i.severity,
      i.durationMinutes,
      i.status,
      `"${i.assignedPersonName}"`,
      i.startTime,
      `"${(i.rootCause || '').replace(/"/g, '""')}"`,
      `"${(i.correctiveAction || '').replace(/"/g, '""')}"`,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="delay-incidents-report.csv"');
    return res.send(csv);
  }

  // Default: Orders export
  const headers = [
    'Order ID',
    'Product Name',
    'SKU',
    'Production Line',
    'Target Qty',
    'Completed Qty',
    'Scrap Qty',
    'Progress %',
    'Priority',
    'Status',
    'Start Date',
    'Deadline',
  ];
  const rows = store.productionOrders.map((o) => [
    o.orderNumber,
    `"${o.productName}"`,
    o.productSku,
    `"${o.productionLineName}"`,
    o.targetQuantity,
    o.completedQuantity,
    o.scrapQuantity,
    o.progressPercentage,
    o.priority,
    o.status,
    o.startDate,
    o.deadline,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="production-orders-report.csv"');
  res.send(csv);
});

// ==========================================
// NOTIFICATIONS ENDPOINTS
// ==========================================
app.get('/api/notifications', (req, res) => {
  res.json(store.notifications);
});

app.put('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  const n = store.notifications.find((item) => item.id === id);
  if (n) {
    n.read = true;
  }
  res.json({ success: true, notification: n });
});

app.put('/api/notifications/read-all', (req, res) => {
  store.notifications.forEach((item) => {
    item.read = true;
  });
  res.json({ success: true });
});

// ==========================================
// AUDIT LOGS ENDPOINTS
// ==========================================
app.get('/api/audit-logs', (req, res) => {
  res.json(store.auditLogs);
});

// Reset Demo Data
app.post('/api/reset-demo-data', (req, res) => {
  store = initSeedData();
  logAudit(currentUser.name, currentUser.role, 'RESET_SYSTEM', 'Setting', 'STORE', 'Reset all system data to initial baseline.');
  res.json({ success: true, message: 'Factory simulation data reset successfully' });
});

// ==========================================
// VITE DEV SERVER INTEGRATION
// ==========================================
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  const PORT = process.env.PORT || 3000;
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Industrial Production Delay Tracking System running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
