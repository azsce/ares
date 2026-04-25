using Backend.Application.DTOs.Common;

namespace Backend.Application.DTOs.Booking;

/// <summary>
/// DTO for booking list item
/// </summary>
public record BookingListDto(
    Guid Id,
    VehicleBasicDto Car,
    SupplierDto Supplier,
    DriverDto? Driver,
    LocationDto PickupLocation,
    LocationDto DropOffLocation,
    DateTime From,
    DateTime To,
    decimal Price,
    string Status,
    bool PayLater);
