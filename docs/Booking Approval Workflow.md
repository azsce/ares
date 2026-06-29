# Booking Approval Workflow — Implementation Summary

## Overview

New customer bookings now require admin approval before they become active. After payment is captured, bookings enter `PendingApproval` status instead of being immediately `Confirmed`. An admin must approve or reject the booking. Admin-created bookings skip approval entirely.

## Decisions

| Decision | Choice |
|---|---|
| Admin-created bookings | Auto-approved (skip approval) |
| Approval timing | After payment capture (replaces `Confirmed` as the post-payment status) |
| Notifications | In-app + email to customer on approve/reject |
| Rejection | Booking set to `Rejected` + payment refunded |

---

## Backend Changes

### New Enum Values

`backend/Domain/Entities/Enums/BookingEnums.cs`

```
Draft, PaymentPending, PendingApproval, Confirmed, Active, Completed, Cancelled, CancelledByAdmin, Expired, Rejected
```

### New Entity Fields

`backend/Domain/Entities/Booking.cs`

| Field | Type | Description |
|---|---|---|
| `ApprovedBy` | `Guid?` | Admin who approved the booking |
| `ApprovedAt` | `DateTime?` | Timestamp of approval |
| `RejectionReason` | `string?` | Reason provided on rejection |

### Status Transition Map

```
Draft           → PaymentPending, Cancelled
PaymentPending  → PendingApproval, Cancelled, Expired
PendingApproval → Confirmed, Rejected, CancelledByAdmin
Confirmed       → Active, Cancelled
Active          → Completed, Cancelled
Completed       → (terminal)
Cancelled       → (terminal)
CancelledByAdmin→ (terminal)
Expired         → (terminal)
Rejected        → (terminal)
```

`PendingApproval` is in `ReservingStatuses` (vehicle stays reserved while awaiting approval).

### API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| `PATCH` | `/api/admin/booking-approvals/{id}/approve` | Admin | Approve a pending booking → `Confirmed` |
| `PATCH` | `/api/admin/booking-approvals/{id}/reject` | Admin | Reject a pending booking → `Rejected` |

Approve sets `Status=Confirmed`, `ApprovedBy`, `ApprovedAt`. Reject sets `Status=Rejected`, `RejectionReason`, and initiates refund for captured payments, releases driver, and releases vehicle reservation.

### Checkout Flow Changes

- **Customer staged checkout** (`ConfirmAsync`): Sets `PendingApproval` instead of `Confirmed` after payment capture
- **Customer express checkout** (`CheckoutAsync`): Sets `PendingApproval` instead of `Confirmed`
- **Admin create-on-behalf** (`CreateBookingAsync`): No change — remains `Confirmed` (auto-approved)

### Background Service

`BookingStatusUpdateService` now auto-expires `PendingApproval` bookings when `HoldExpiresAt` has passed. Expired bookings get refunded and the vehicle reservation is released.

### DTOs

- `RejectBookingRequest` — `{ Reason: string }` (required, max 500 chars, FluentValidation)
- All booking response DTOs updated with `ApprovedBy`, `ApprovedAt`, `RejectionReason`

### Database Migration

`20260629022753_AddBookingApprovalFields`

Adds three nullable columns to `Bookings` table: `ApprovedBy` (uniqueidentifier), `ApprovedAt` (datetime2), `RejectionReason` (nvarchar(max)). No data migration needed.

### Tests

- 7 new unit tests in `BookingServiceTests` (approve/reject workflows, admin skip-approval)
- 2 new tests in `CheckoutServiceTests` (staged + express checkout set PendingApproval)
- 2 new property tests in `BookingCreationPropertyTests`
- 2 new property tests in `BookingManagementPropertyTests`
- Updated existing assertions from `Confirmed` → `PendingApproval` for customer path
- 37 total tests pass

---

## Frontend Changes

### API Client

`frontend/api-clients/bookings/bookings.ts`

- New fields on `Booking` interface: `approvedBy`, `approvedAt`, `rejectionReason`
- New functions: `approveBooking(accessToken, bookingId)`, `rejectBooking(accessToken, bookingId, reason)`

### Admin UI

| Component | Change |
|---|---|
| `ApproveBookingDialog` | New — confirm dialog with approve action |
| `RejectBookingDialog` | New — dialog with required reason TextField |
| `BookingActionsMenu` | Added Approve/Reject items (visible for `PendingApproval` only) |
| `BookingsClient` | Wired up approval dialogs + state |
| `BookingsFilterBar` | Added `PendingApproval`, `Rejected` to status filters |
| `ChangeStatusModal` | Added `PendingApproval`, `Rejected` statuses; `PendingApproval` is system-set only |
| `BookingDetailsClient` | Approval banner + Approve/Reject buttons + approval info display |
| `BookingsTable` | Status badge configs for `PendingApproval` and `Rejected` |
| `BookingOverview` | Added `PendingApproval`, `Rejected` to expected statuses and counts |
| `BookingsAnalytics` | Added `PendingApproval`, `Rejected` to chart status order |

### Customer UI

| Component | Change |
|---|---|
| `BookingCard` | `PendingApproval` (warning) and `Rejected` (error) status badges |
| `BookingFilters` | Added `pendingApproval` and `rejected` filter options |
| `BookingDetailsView` | PendingApproval banner, Rejected banner with rejection reason |

### Theme

`frontend/providers/theme.ts`

| Status | Light | Dark | Usage |
|---|---|---|---|
| `status.pendingApproval` | `#f59e0b` (amber) | `#fbbf24` | Awaiting admin action |
| `status.rejected` | `#ea580c` (orange) | `#fb923c` | Admin denied (distinct from cancelled) |

### Translations

**English + Arabic** translations added for:

- `dashboardAdmin.bookings.approvals.*` (dialog titles, buttons, success messages)
- `dashboardAdmin.bookings.filters.statuses.pendingApproval/rejected`
- `dashboardAdmin.bookings.analytics.statuses.pendingApproval/rejected`
- `dashboardAdmin.bookings.changeStatusModal.statuses.pendingApproval/rejected`
- `customer.bookings.list.status.pendingApproval/rejected`
- `customer.bookingDetail.approval.*` (pending/rejected messages, rejection reason)
- Type definitions updated in `types/dashboard/admin/bookings.ts`, `types/customer/bookings.ts`, `types/customer/booking-detail.ts`
