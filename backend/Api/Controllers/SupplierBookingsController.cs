using System.Security.Claims;
using Backend.Application.DTOs.Booking;
using Backend.Application.DTOs.Common;
using Backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Api.Controllers;

/// <summary>
/// Booking endpoints scoped to the authenticated supplier.
///
/// Every endpoint:
///   * Requires authentication (<see cref="AuthorizeAttribute"/>).
///   * Is gated to the <c>Supplier</c> role.
///   * Filters by the authenticated supplier id — suppliers may only
///     see bookings whose related vehicle they own
///     (<c>booking.Vehicle.UserId == currentSupplierId</c>).
///
/// View-only for now: there are no approve / reject / edit / delete
/// actions here. Those continue to live on
/// <see cref="AdminBookingsController"/> to keep the admin contract
/// stable.
/// </summary>
[ApiController]
[Route("api/supplier/bookings")]
[Authorize(Roles = "Supplier")]
public class SupplierBookingsController : ControllerBase
{
    private readonly ISupplierBookingService _supplierBookingService;
    private readonly ILogger<SupplierBookingsController> _logger;

    public SupplierBookingsController(
        ISupplierBookingService supplierBookingService,
        ILogger<SupplierBookingsController> logger)
    {
        _supplierBookingService = supplierBookingService;
        _logger = logger;
    }

    /// <summary>
    /// Returns a paginated list of bookings for the supplier's own
    /// vehicles, with optional search and filters.
    /// </summary>
    /// <param name="search">Search term: booking number, customer name, vehicle make/model.</param>
    /// <param name="bookingStatus">Optional booking-status filter (Pending / Confirmed / Active / Completed / Cancelled).</param>
    /// <param name="paymentStatus">Optional payment-status filter (Pending / Authorized / Captured / Failed / Refunded / None).</param>
    /// <param name="page">Page number (1-based, default 1).</param>
    /// <param name="pageSize">Page size (default 10, capped at 100).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<SupplierBookingListItemDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<SupplierBookingListItemDto>>> GetBookings(
        [FromQuery] string? search,
        [FromQuery] string? bookingStatus,
        [FromQuery] string? paymentStatus,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetSupplierId(out var supplierId, out var unauthorized))
        {
            return unauthorized!;
        }

        var filter = new SupplierBookingListFilterRequest(search, bookingStatus, paymentStatus);

        var result = await _supplierBookingService.GetBookingsAsync(
            supplierId, page, pageSize, filter, cancellationToken);

        _logger.LogInformation(
            "Supplier {SupplierId} listed bookings — page {Page}, size {PageSize}, total {TotalCount}",
            supplierId, page, pageSize, result.TotalCount);

        return Ok(result);
    }

    /// <summary>
    /// Returns the details of a single booking owned (via the related
    /// vehicle) by the authenticated supplier. Returns <c>404</c> if
    /// the booking does not exist or belongs to another supplier — we
    /// do not differentiate to avoid leaking booking ids.
    /// </summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(SupplierBookingDetailsDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupplierBookingDetailsDto>> GetBooking(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetSupplierId(out var supplierId, out var unauthorized))
        {
            return unauthorized!;
        }

        var details = await _supplierBookingService.GetBookingByIdAsync(
            supplierId, id, cancellationToken);

        _logger.LogInformation(
            "Supplier {SupplierId} fetched booking {BookingId}", supplierId, id);

        return Ok(details);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /// <summary>
    /// Resolves the authenticated supplier id from the JWT claim.
    /// Defensive — the <c>[Authorize]</c> attribute already rejects
    /// anonymous and non-supplier callers, but a malformed claim
    /// should still produce a clean 401 instead of a 500.
    /// </summary>
    private bool TryGetSupplierId(out Guid supplierId, out ActionResult? unauthorized)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim is null || !Guid.TryParse(userIdClaim.Value, out supplierId))
        {
            unauthorized = Unauthorized(new { Message = "User not authenticated" });
            supplierId = Guid.Empty;
            return false;
        }

        unauthorized = null;
        return true;
    }
}
