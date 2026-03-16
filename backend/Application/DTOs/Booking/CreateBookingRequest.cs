namespace Backend.Application.DTOs.Booking;

/// <summary>
/// Request DTO for creating a new booking
/// </summary>
public record CreateBookingRequest(
    Guid VehicleId,
    Guid PickupLocationId,
    Guid DropOffLocationId,
    DateTime PickupDate,
    DateTime ReturnDate,
    Guid? DriverId,
    bool PayLater);
