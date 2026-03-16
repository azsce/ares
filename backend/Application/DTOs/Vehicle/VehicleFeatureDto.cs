namespace Backend.Application.DTOs.Vehicle;

/// <summary>
/// DTO for vehicle feature information
/// </summary>
public record VehicleFeatureDto(
    Guid FeatureId,
    string Name,
    string? Description);
