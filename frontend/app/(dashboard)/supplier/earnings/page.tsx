import { Metadata } from "next";
import SupplierEarningsClient from "./SupplierEarningsClient";

/**
 * Supplier Earnings dashboard — page entrypoint.
 *
 * The backend endpoints for the earnings module are implemented and
 * ownership-scoped:
 *
 *   - GET /api/supplier/earnings/stats
 *   - GET /api/supplier/earnings/chart
 *   - GET /api/supplier/earnings/top-vehicles
 *
 * The UI rendered by `SupplierEarningsClient` is intentionally a
 * *structural placeholder* — stat-card slots, an empty chart frame, and
 * an empty top-vehicles list — with no API wiring yet. Real data
 * binding will be added in a follow-up iteration. See `./README.md`
 * for the planned analytics sections, payload shapes, business rules
 * and security model.
 */

export const metadata: Metadata = {
  title: "Earnings | ARES Supplier",
  description: "Supplier Earnings dashboard — UI scaffolding (data binding pending).",
};

export default function SupplierEarningsPage() {
  return <SupplierEarningsClient />;
}
