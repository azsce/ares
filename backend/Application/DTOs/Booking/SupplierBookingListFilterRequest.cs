namespace Backend.Application.DTOs.Booking;

/// <summary>
/// Filter / search payload for <c>GET /api/supplier/bookings</c>.
///
/// All fields are optional. Search runs across booking number,
/// customer first/last name and vehicle make/model. Status filters
/// are validated case-insensitively against
/// <see cref="Backend.Domain.Entities.Enums.BookingStatus"/> and the
/// payment status strings written by the payment service.
/// </summary>
public record SupplierBookingListFilterRequest(
    /// <summary>Free-text search term (booking number, customer name, vehicle make/model).</summary>
    string? Search,
    /// <summary>Booking status filter (e.g. "Pending", "Confirmed"). Case-insensitive.</summary>
    string? BookingStatus,
    /// <summary>Payment status filter (e.g. "Pending", "Captured"). Case-insensitive.</summary>
    string? PaymentStatus);
