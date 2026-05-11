import { Metadata } from "next";

/**
 * Supplier Bookings list — placeholder.
 *
 * The backend endpoint (`GET /api/supplier/bookings`) is already
 * implemented and ownership-scoped. This page intentionally renders
 * only a title; the UI (table, filters, pagination, status badges,
 * row-level navigation) will be implemented in a follow-up iteration.
 *
 * See `./README.md` for the planned features, expected payload shape,
 * and security rules.
 */

export const metadata: Metadata = {
  title: "Bookings | ARES Supplier",
  description: "Supplier Bookings list — placeholder page (UI pending).",
};

export default function SupplierBookingsPage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Supplier Bookings Page</h1>
      <p>This page is a placeholder. The bookings list UI will be implemented in a future iteration.</p>
    </main>
  );
}
