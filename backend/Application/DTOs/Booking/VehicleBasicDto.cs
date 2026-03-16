namespace Backend.Application.DTOs.Booking;

/// <summary>
/// Basic vehicle information for booking lists
/// </summary>
public record VehicleBasicDto(
    Guid Id,
    string Name,
    string Image);
