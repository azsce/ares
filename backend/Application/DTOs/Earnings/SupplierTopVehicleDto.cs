namespace Backend.Application.DTOs.Earnings;

/// <summary>
/// Row item in the "top performing vehicles" leaderboard returned by
/// <c>GET /api/supplier/earnings/top-vehicles</c>.
///
/// Every row is ranked by <see cref="TotalEarnings"/> descending and is
/// guaranteed to belong to a vehicle owned by the authenticated supplier.
/// Earnings and counts are derived exclusively from <c>Completed</c>
/// bookings.
/// </summary>
/// <param name="VehicleId">Vehicle primary key.</param>
/// <param name="Make">Vehicle make (e.g. "Toyota"); empty string if unknown.</param>
/// <param name="Model">Vehicle model (e.g. "Corolla"); empty string if unknown.</param>
/// <param name="ImageUrl">Primary image URL, or empty string if the vehicle has no images.</param>
/// <param name="TotalEarnings">Sum of <c>TotalPrice</c> across the vehicle's <c>Completed</c> bookings.</param>
/// <param name="CompletedBookingsCount">Count of <c>Completed</c> bookings for the vehicle.</param>
public record SupplierTopVehicleDto(
    Guid VehicleId,
    string Make,
    string Model,
    string ImageUrl,
    decimal TotalEarnings,
    int CompletedBookingsCount
);
