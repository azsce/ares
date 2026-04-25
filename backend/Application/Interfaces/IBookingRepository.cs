using Backend.Domain.Entities;

namespace Backend.Application.Interfaces;

/// <summary>
/// Repository interface for Booking entity with specialized booking operations
/// </summary>
public interface IBookingRepository : IPaginatedRepository<Booking>
{
    /// <summary>
    /// Gets bookings for a specific user with optional filters
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="suppliers">Optional list of supplier IDs to filter by</param>
    /// <param name="statuses">Optional list of booking statuses to filter by</param>
    /// <param name="carId">Optional vehicle ID to filter by</param>
    /// <param name="fromDate">Optional start date filter</param>
    /// <param name="toDate">Optional end date filter</param>
    /// <param name="keyword">Optional keyword to search in booking number, vehicle name, and location names</param>
    /// <param name="pickupLocationId">Optional pickup location ID filter</param>
    /// <param name="dropOffLocationId">Optional drop-off location ID filter</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Collection of bookings matching the criteria</returns>
    Task<IEnumerable<Booking>> GetUserBookingsAsync(
        Guid userId,
        List<Guid>? suppliers = null,
        List<string>? statuses = null,
        Guid? carId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? keyword = null,
        Guid? pickupLocationId = null,
        Guid? dropOffLocationId = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a vehicle has any active (non-cancelled) bookings
    /// </summary>
    /// <param name="vehicleId">Vehicle ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if vehicle has active bookings, false otherwise</returns>
    Task<bool> HasActiveBookingsAsync(
        Guid vehicleId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if a user has any bookings
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if user has bookings, false otherwise</returns>
    Task<bool> HasUserBookingsAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <returns>Booking with all related data if found, null otherwise</returns>
    Task<Booking?> GetBookingWithDetailsAsync(
        Guid bookingId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets all bookings with optional filters (Admin/Supplier view)
    /// </summary>
    /// <param name="supplierId">Optional supplier ID to filter by</param>
    /// <param name="statuses">Optional list of statuses</param>
    /// <param name="carId">Optional vehicle ID</param>
    /// <param name="fromDate">Optional start date</param>
    /// <param name="toDate">Optional end date</param>
    /// <param name="keyword">Optional keyword</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Collection of bookings</returns>
    Task<IEnumerable<Booking>> GetAdminBookingsAsync(
        Guid? supplierId = null,
        List<string>? statuses = null,
        Guid? carId = null,
        DateTime? fromDate = null,
        DateTime? toDate = null,
        string? keyword = null,
        CancellationToken cancellationToken = default);
}
