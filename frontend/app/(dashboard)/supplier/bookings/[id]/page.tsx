import { Metadata } from "next";

/**
 * Supplier Booking Details — placeholder.
 *
 * The backend endpoint (`GET /api/supplier/bookings/{id}`) is already
 * implemented and ownership-scoped (returns 404 when the booking
 * belongs to another supplier). This page intentionally renders only a
 * title; the actual details UI will be implemented in a follow-up
 * iteration.
 *
 * See `./README.md` for the planned features, expected payload shape,
 * and security rules.
 */

export const metadata: Metadata = {
  title: "Booking Details | ARES Supplier",
  description: "Supplier Booking Details — placeholder page (UI pending).",
};

export default function SupplierBookingDetailsPage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Supplier Booking Details Page</h1>
      <p>This page is a placeholder. The booking details UI will be implemented in a future iteration.</p>
    </main>
  );
}
