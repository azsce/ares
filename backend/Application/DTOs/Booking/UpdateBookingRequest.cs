namespace Backend.Application.DTOs.Booking;

/// <summary>
/// Request DTO for editing an existing booking.
///
/// Editable fields ONLY:
///   * PickupDate
///   * ReturnDate
///   * PickupLocation
///   * DropOffLocation
///   * Status
///
/// Read-only fields (Customer, Vehicle, BookingId, Payment, Supplier) are
/// resolved server-side from the existing booking — they cannot be changed
/// via this endpoint.
///
/// Any field left as null is interpreted as "no change", so the frontend
/// can submit only the fields the user actually edited.
/// </summary>
public record UpdateBookingRequest(
    DateTime? PickupDate = null,
    DateTime? ReturnDate = null,
    string? PickupLocation = null,
    string? DropOffLocation = null,
    string? Status = null);
