namespace Backend.Application.DTOs.Booking;

/// <summary>
/// Driver information for bookings
/// </summary>
public record DriverDto(
    Guid Id,
    string FullName,
    string Phone);
