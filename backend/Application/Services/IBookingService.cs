using Backend.Application.DTOs.Booking;
using Backend.Application.DTOs.Common;

namespace Backend.Application.Services;

/// <summary>
/// Service interface for booking-related operations
/// </summary>
public interface IBookingService
{
    /// <summary>
    /// Creates a new booking for a vehicle
    /// </summary>
    /// <param name="request">Booking creation request</param>
    /// <param name="userId">ID of the user creating the booking</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Booking response with booking details</returns>
    Task<BookingResponse> CreateBookingAsync(
        CreateBookingRequest request,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets paginated list of user bookings with filters
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="request">Booking list request with filters</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated booking list</returns>
    Task<PagedResult<BookingListDto>> GetUserBookingsAsync(
        Guid userId,
        BookingListRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets detailed information about a specific booking
    /// </summary>
    /// <param name="bookingId">Booking ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Booking details</returns>
    Task<BookingDetailsDto> GetBookingDetailsAsync(
        Guid bookingId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Cancels a booking
    /// </summary>
    /// <param name="bookingId">Booking ID</param>
    /// <param name="userId">User ID for authorization</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if cancellation was successful</returns>
    Task<bool> CancelBookingAsync(
        Guid bookingId,
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a user has any bookings
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if user has bookings</returns>
    Task<bool> HasUserBookingsAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}
