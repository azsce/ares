namespace Backend.Application.DTOs.Booking;

/// <summary>
/// DTO for detailed booking information
/// </summary>
public record BookingDetailsDto(
    Guid Id,
    VehicleWithSupplierDto Car,
    DriverDto? Driver,
    LocationDto PickupLocation,
    LocationDto DropOffLocation,
    DateTime From,
    DateTime To,
    decimal Price,
    string Status,
    bool PayLater);
