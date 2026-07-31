# Dashboard: Kanban → List View Migration Plan

## Overview

Replace the Kanban board with a **simple client/vehicle list**. Remove all status-related UI (badges, stats breakdown, StatusDrawer, WhatsApp modal). The dashboard becomes a clean registry for the mechanic to browse, search, and sort their clients and vehicles.

## Current Architecture

```
DashboardPage (server)
├── Stats bar (total + per-status counts)
├── SearchBar (client)
├── KanbanBoard (client) — 4-column grid grouped by status
│   ├── VehicleCard × N
│   ├── StatusDrawer (change status)
│   └── WhatsappConfirmModal (notify on "ready_for_pickup")
└── CreateVehicleDialog
```

## Target Architecture

```
DashboardPage (server)
├── Stats bar (simplified — total only)
├── SearchBar (client)
├── SortControls (client) — sort dropdown
├── VehicleList (client) — flat list of client/vehicle rows
└── CreateVehicleDialog
```

## Changes Required

### 1. Types (`src/types/index.ts`)
- Add `SortBy` type: `"brand" | "lastService"`
- Add `SortOrder` type: `"asc" | "desc"`
- Add `VehicleWithLastService` type extending `Vehicle` with optional `lastServiceDate`
- Update `DashboardSearchParams` to include `sortBy` and `sortOrder`

### 2. Server Action (`src/lib/actions/vehicle-actions.ts`)
- Update `getVehicles()` signature: accept `sortBy?: SortBy`, `sortOrder?: SortOrder`
- Remove `statusFilter` parameter (no longer needed)
- Add LEFT JOIN with subquery to get latest `service_date` per vehicle
- Apply dynamic `ORDER BY`:
  - `brand asc/desc` → `ORDER BY vehicles.brand`
  - `lastService asc/desc` → `ORDER BY last_service_date NULLS LAST`
- Return `VehicleWithLastService[]`

### 3. New Component: `SortControls` (`src/components/dashboard/sort-controls.tsx`)
- Client component
- Select dropdown with options:
  - "Marca (A-Z)" → `sortBy=brand&sortOrder=asc`
  - "Marca (Z-A)" → `sortBy=brand&sortOrder=desc`
  - "Último servicio (nuevo)" → `sortBy=lastService&sortOrder=desc`
  - "Último servicio (antiguo)" → `sortBy=lastService&sortOrder=asc`
- Updates URL search params (same pattern as SearchBar)

### 4. New Component: `VehicleList` (`src/components/dashboard/vehicle-list.tsx`)
- Client component replacing `KanbanBoard`
- Receives `VehicleWithLastService[]`
- Renders a clean list:
  - Desktop: table with columns (Owner, Vehicle, Plate, Mileage, Last Service)
  - Mobile: stacked cards
- Each row links to `/vehicles/[vehicleId]`
- **No status badges, no status drawer, no WhatsApp modal**

### 5. Update Dashboard Page (`src/app/(dashboard)/dashboard/page.tsx`)
- Replace `KanbanBoard` with `VehicleList`
- Add `SortControls` next to `SearchBar`
- Read `sortBy` and `sortOrder` from `searchParams`
- Pass sort params to `getVehicles()`
- Simplify stats bar: show only total count
- Remove `statusFilter` from searchParams type
- Remove imports for `StatusDrawer`, `WhatsappConfirmModal`

### 6. Remove Unused Components
- `src/components/dashboard/kanban-board.tsx` — delete
- `src/components/dashboard/vehicle-card.tsx` — delete
- `src/components/dashboard/status-drawer.tsx` — delete (no longer used in dashboard; keep file if used elsewhere, but it's only used in KanbanBoard)

## Data Flow

```
URL params: ?q=ford&sortBy=brand&sortOrder=asc
       │
       ▼
DashboardPage (server)
  ├── Reads q, sortBy, sortOrder from searchParams
  └── Calls getVehicles(q, sortBy, sortOrder)
              │
              ▼
        Server Action
  ├── Builds query with search filter + sort
  ├── LEFT JOIN with latest service_date subquery
  └── Returns VehicleWithLastService[]
              │
              ▼
        VehicleList (client)
  └── Renders rows linking to vehicle detail page
```

## SQL Query (Drizzle)

```typescript
const latestService = db.$with("latest_service").as(
  db
    .select({
      vehicleId: serviceRecords.vehicleId,
      lastServiceDate: sql<string>`MAX(${serviceRecords.serviceDate})`.as("last_service_date"),
    })
    .from(serviceRecords)
    .groupBy(serviceRecords.vehicleId),
);

const result = await db
  .with(latestService)
  .select({
    ...vehicles,
    lastServiceDate: latestService.lastServiceDate,
  })
  .from(vehicles)
  .leftJoin(latestService, eq(vehicles.id, latestService.vehicleId))
  .where(and(...conditions))
  .orderBy(orderByClause);
```

## UI Mockup

```
┌──────────────────────────────────────────────────────────────┐
│  Total: 12 vehículos                    [+ Nuevo Vehículo]   │
├──────────────────────────────────────────────────────────────┤
│  🔍 [  Buscá por nombre, modelo o patente...           ]     │
│  Ordenar: [Marca (A-Z)                    ▼]                 │
├──────────────────────────────────────────────────────────────┤
│  Cliente       │ Vehículo        │ Patente  │ Km     │ Último│
│ ──────────────────────────────────────────────────────────── │
│  Juan Pérez    │ Ford Focus      │ ABC123   │ 85,000 │ 15/03 │
│  María García  │ Toyota Corolla  │ XYZ789   │ 62,000 │ 10/01 │
│  Carlos López  │ VW Gol          │ DEF456   │ 120,000│ —     │
│  ...                                                            │
└──────────────────────────────────────────────────────────────┘
```

## Files to Modify/Create/Delete

| Action | File |
|--------|------|
| MODIFY | `src/types/index.ts` |
| MODIFY | `src/lib/actions/vehicle-actions.ts` |
| CREATE | `src/components/dashboard/sort-controls.tsx` |
| CREATE | `src/components/dashboard/vehicle-list.tsx` |
| MODIFY | `src/app/(dashboard)/dashboard/page.tsx` |
| DELETE | `src/components/dashboard/kanban-board.tsx` |
| DELETE | `src/components/dashboard/vehicle-card.tsx` |
| DELETE | `src/components/dashboard/status-drawer.tsx` |