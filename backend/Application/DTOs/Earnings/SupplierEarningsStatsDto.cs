namespace Backend.Application.DTOs.Earnings;

/// <summary>
/// Headline earnings figures returned by <c>GET /api/supplier/earnings/stats</c>.
///
/// All sums and counts are restricted to <c>Completed</c> bookings on vehicles
/// owned by the authenticated supplier — pending, cancelled and in-flight
/// bookings are excluded by design.
/// </summary>
/// <param name="TotalEarnings">Lifetime sum of <c>TotalPrice</c> across all of the supplier's <c>Completed</c> bookings.</param>
/// <param name="ThisMonthRevenue">Sum of <c>TotalPrice</c> for <c>Completed</c> bookings whose revenue date falls inside the current calendar month (UTC).</param>
/// <param name="LastMonthRevenue">Sum of <c>TotalPrice</c> for <c>Completed</c> bookings whose revenue date falls inside the previous calendar month (UTC).</param>
/// <param name="CompletedBookingsCount">Count of <c>Completed</c> bookings on the supplier's vehicles (lifetime).</param>
public record SupplierEarningsStatsDto(
    decimal TotalEarnings,
    decimal ThisMonthRevenue,
    decimal LastMonthRevenue,
    int CompletedBookingsCount
);
