namespace Backend.Application.DTOs.Vehicle;

/// <summary>
/// Response DTO for vehicle operations
/// </summary>
public record VehicleResponse(
    Guid VehicleId,
    string Message,
    bool Success = true
);