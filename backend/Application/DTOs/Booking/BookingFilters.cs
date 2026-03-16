namespace Backend.Application.DTOs.Booking;

/// <summary>
/// Filters for booking list queries
/// </summary>
public record BookingFilters(
    DateTime? From,
    DateTime? To,
    string? Keyword,
    Guid? PickupLocation,
    Guid? DropOffLocation);
