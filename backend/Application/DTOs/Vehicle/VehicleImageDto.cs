namespace Backend.Application.DTOs.Vehicle;

/// <summary>
/// DTO for vehicle image information
/// </summary>
public record VehicleImageDto(
    Guid ImageId,
    string Url,
    string Size,
    bool IsPrimary);
