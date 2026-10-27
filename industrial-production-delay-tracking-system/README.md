# Industrial Production Delay Tracking System

A comprehensive, production-grade enterprise web application for manufacturing facilities to monitor daily production targets, track progress, log unexpected delays, identify root causes, calculate machine downtime, track inventory buffers, manage workforce availability, and generate actionable reports.

---

## 🏭 Key Features & Modules

1. **Operations Dashboard**
   - 8 dynamic KPI cards: Today's Production Target, Units Produced, Target Achievement %, Active Delays, Machines Operational, Machine Downtime (mins), Material Shortages, Workforce Attendance %.
   - Interactive Production Performance Bar Chart (Planned vs Actual by line or day/week/month).
   - Delay Cause Distribution Doughnut Chart with lost minute tallies and percentage breakdown.
   - Live Production Orders Table with schedule risk detection.
   - Recent Delay Incidents Table with immediate click-through to resolution drawers.

2. **Production Order Management**
   - Full CRUD operations with role-based authorization.
   - Assign products, machines, lines, and supervisors.
   - Automated remaining quantity and completion percentage calculations.
   - Automatic risk flagging for orders falling behind expected pace.
   - Batch output logging (completed units, scrap items, QA notes).

3. **Production Delay Tracking (Core Module)**
   - Record stoppages with 9 delay categories: Machine Breakdown, Raw Material Shortage, Worker Unavailability, Quality Control Failure, Power Failure, Equipment Maintenance, Supplier Delay, Production Planning Issue, Other.
   - Capture root causes, affected stations, severity (Low, Medium, High, Critical), and durations.
   - Enforce resolution validation: cannot resolve without recording technical corrective action and timestamp.
   - Automatic dispatch of in-app critical alerts and status synchronization with machines and orders.

4. **Machine Management & Reliability**
   - Track machine status: Operational, Running with Warning, Under Maintenance, Breakdown, Offline.
   - Automatic creation of linked delay incidents when reporting a breakdown.
   - Preventive & corrective maintenance logging with downtime tracking.
   - Machine Availability % calculation: `(Operational Time / Scheduled Operating Time) * 100`.

5. **Raw Material & Inventory Management**
   - Real-time stock buffer tracking with Low Stock and Critical Shortage alerts.
   - Ledger transactions (Received, Consumed, Reserved, Audit Adjustment).
   - "Log Delay from Shortage" action allowing managers to link inventory bottlenecks directly to affected production orders.

6. **Workforce & Shift Management**
   - Track scheduled workers across Morning, Afternoon, and Night shifts.
   - Quick attendance status updates (Present, On Break, Absent, On Leave).
   - "Report Workforce Delay" action linking staffing deficits directly to incident logs.

7. **Reports & Analytics**
   - Multi-criteria filtering by date range, line, machine, and delay cause.
   - Delay Frequency by Cause & Root Cause Analysis.
   - One-click export to CSV for incidents and production orders.
   - Clean printable / PDF export stylesheet (`@media print`).

8. **In-App Notifications & Alert Center**
   - Real-time unread badge counter, alert triage, and direct navigation to affected records.

9. **Security, RBAC & Audit Trail**
   - Role switcher to test 5 industrial personas:
     - **Administrator**: Full control over users, settings, and factory baseline reset.
     - **Production Manager**: Manages orders, reviews delays, assigns actions, exports reports.
     - **Production Supervisor**: Logs batch outputs, reports stoppages on assigned lines.
     - **Maintenance Technician**: Resolves machine breakdowns, logs maintenance overhauls.
     - **Inventory Manager**: Manages stock transactions, supplier orders, and shortage incidents.
   - Immutable audit logging for all critical operations.

---

## 🛠 Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React, Recharts.
- **Backend**: Node.js Express REST API, tsx runtime.
- **Testing**: Automated test suite (`npm test`).

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Start full-stack development server on port 3000
npm run dev

# Run automated tests
npm test

# Build for production
npm run build
```
