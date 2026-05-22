namespace Backend.Application.DTOs.Booking;

/// <summary>
/// Lightweight customer info for booking details
/// </summary>
public record BookingCustomerDto(
    Guid Id,
    string FullName,
    string? Email,
    string? Phone);

/// <summary>
/// Inspection overview attached to a booking — operational data only,
/// no nested per-image / per-checklist payloads.
/// </summary>
public record BookingInspectionOverviewDto(
    string PreInspectionStatus,   // Pending / Approved / Rejected / NotRequired
    string PostInspectionStatus,  // Pending / Approved / Rejected / NotRequired
    Guid? AssignedInspectorId,
    string? AssignedInspectorName,
    DateTime? PreInspectionDate,
    DateTime? PostInspectionDate);

/// <summary>
/// DTO for detailed booking information
/// </summary>
public record BookingDetailsDto(
    Guid Id,
    string? BookingNumber,
    BookingCustomerDto? Customer,
    VehicleWithSupplierDto Car,
    DriverDto? Driver,
    LocationDto PickupLocation,
    LocationDto DropOffLocation,
    DateTime From,
    DateTime To,
    int? TotalDays,
    decimal Price,
    decimal? DailyRate,
    string Status,
    bool PayLater,
    string? PaymentStatus,
    string? PaymentMethod,
    BookingInspectionOverviewDto? Inspection,
    DateTime? CreatedAt,
    DateTime? UpdatedAt);
