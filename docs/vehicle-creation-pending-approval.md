# Vehicle Creation Pending Approval — Implementation Summary

## Overview

All newly created vehicles now start with **Pending** status requiring admin approval, regardless of who creates them (admin or supplier). Previously, admin-created vehicles were auto-approved.

## Changes

### Backend

| File | Change |
|------|--------|
| `backend/Application/Services/VehicleService.cs` | `CreateVehicleAsync` now forces `Status = "Pending"`, `AvailabilityStatus = "Unavailable"`, `ApprovedAt = null`. Added pending review notifications to vehicle owner and admins. |
| `backend/Application/Services/VehicleService.cs` | `UpdateVehicleAsync` now sets `ApprovedAt = DateTime.UtcNow` when admin transitions status to `"Approved"`. |
| `backend/Application/DTOs/Vehicle/CreateVehicleRequest.cs` | Defaults changed from `"Active"` / `"Available"` to `"Pending"` / `"Unavailable"`. |

### Frontend

| File | Change |
|------|--------|
| `frontend/app/[locale]/(dashboard)/admin/vehicles/create/CreateVehicleClient.tsx` | Removed `status` and `availabilityStatus` from create payload (server forces values). Fixed `"Sedan"` bug. |
| `frontend/api-clients/cars/cars.ts` | Made `status` and `availabilityStatus` optional in `CarPayload`. Added `Pending`, `Approved`, `Rejected` to `VehicleStatus` enum. Added all missing cases to `mapStatusToBackend`. |
| `frontend/app/[locale]/(dashboard)/admin/vehicles/page.tsx` | Added "Pending Review", "Approved", "Rejected" filter options to `STATUS_OPTIONS`. |

## Vehicle Creation Flow (After Changes)

```
Admin/Supplier creates vehicle
  ↓
Status = "Pending", AvailabilityStatus = "Unavailable", ApprovedAt = null
  ↓
Notifications sent: owner ("Vehicle pending review"), admins ("New vehicle pending review")
  ↓
Admin reviews via PUT /api/admin/cars/{id}/edit → sets Status = "Approved" or "Rejected"
  ↓ (if Approved)
ApprovedAt = DateTime.UtcNow, notification sent to owner ("Vehicle approved")
Owner can then toggle AvailabilityStatus to "Available"
  ↓ (if Rejected)
Vehicle becomes read-only for supplier, notification sent to owner ("Vehicle rejected")
```

## Bug Fixes

- **`CreateVehicleClient.tsx:41`** — Was defaulting `status` to `"Sedan"` (a vehicle category) instead of a lifecycle status. Removed from payload entirely since the server now hardcodes `"Pending"`.
- **`VehicleService.UpdateVehicleAsync`** — `ApprovedAt` was never set when admin approved a vehicle via the update endpoint. Now stamps `DateTime.UtcNow` on the `Pending → Approved` transition.
