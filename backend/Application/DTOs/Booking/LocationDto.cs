namespace Backend.Application.DTOs.Booking;

/// <summary>
/// Location information for bookings
/// </summary>
public record LocationDto(
    Guid Id,
    string Name);
