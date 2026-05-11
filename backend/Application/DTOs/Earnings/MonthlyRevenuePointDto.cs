namespace Backend.Application.DTOs.Earnings;

/// <summary>
/// One data point on the supplier earnings chart returned by
/// <c>GET /api/supplier/earnings/chart</c>.
///
/// Field names are camelCased on the wire (<c>month</c>, <c>revenue</c>, <c>year</c>)
/// so they drop straight into a Recharts / Chart.js bar chart on the frontend
/// without an adapter step. The payload is kept intentionally small.
/// </summary>
/// <param name="Month">Abbreviated month name (e.g. <c>"Jan"</c>, <c>"Feb"</c>) in invariant English.</param>
/// <param name="MonthNumber">1-based month number (1..12) — useful when the frontend wants to sort or localise.</param>
/// <param name="Year">Calendar year the point refers to (e.g. <c>2026</c>).</param>
/// <param name="Revenue">Sum of <c>TotalPrice</c> for the supplier's <c>Completed</c> bookings whose revenue date falls inside this month.</param>
public record MonthlyRevenuePointDto(
    string Month,
    int MonthNumber,
    int Year,
    decimal Revenue
);
