using Backend.Application.DTOs.Booking;
using Backend.Application.DTOs.Common;

namespace Backend.Application.Services;

/// <summary>
/// Application-layer contract for the Supplier Bookings module.
///
/// Every method takes the authenticated <c>supplierId</c> as the
/// first argument and is responsible for guaranteeing that the
/// caller can only see bookings whose related vehicle is owned by
/// that supplier (<c>booking.Vehicle.UserId == supplierId</c>).
///
/// The supplier portal is view-only for bookings at this stage —
/// no approve / reject / edit operations are exposed here. Those
/// remain on the existing <see cref="IBookingService"/> admin API
/// so we don't fork behaviour.
/// </summary>
public interface ISupplierBookingService
{
    /// <summary>
    /// Returns a paginated list of bookings whose related vehicle is
    /// owned by the supplier, with optional search and filters.
    /// </summary>
    /// <param name="supplierId">Authenticated supplier id from the JWT claim.</param>
    /// <param name="page">1-based page index. Values &lt; 1 are coerced to 1.</param>
    /// <param name="pageSize">Page size; values are clamped to [1, 100].</param>
    /// <param name="filter">Optional search / booking-status / payment-status filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    Task<PagedResult<SupplierBookingListItemDto>> GetBookingsAsync(
        Guid supplierId,
        int page,
        int pageSize,
        SupplierBookingListFilterRequest filter,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Returns the details of a single booking if its vehicle is
    /// owned by the supplier. Otherwise throws
    /// <see cref="Backend.Application.Exceptions.NotFoundException"/>
    /// — we deliberately don't return 403 to avoid leaking the
    /// existence of bookings belonging to other suppliers.
    /// </summary>
    Task<SupplierBookingDetailsDto> GetBookingByIdAsync(
        Guid supplierId,
        Guid bookingId,
        CancellationToken cancellationToken = default);
}
