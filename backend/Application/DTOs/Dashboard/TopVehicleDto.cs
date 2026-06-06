namespace Backend.Application.DTOs.Dashboard;

/// <summary>Top-performing vehicle for <c>GET /api/dashboard/top-vehicles</c>.</summary>
public record TopVehicleDto(
    string Id,
    string Make,
    string Model,
    int? Year,
    int BookingsCount,
    decimal Revenue,
    string? ImageUrl
);
