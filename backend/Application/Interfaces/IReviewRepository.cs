using Backend.Domain.Entities;

namespace Backend.Application.Interfaces;

/// <summary>
/// Repository interface for Review entity with specialized review operations
/// </summary>
public interface IReviewRepository : IPaginatedRepository<Review>
{
    /// <summary>
    /// Gets reviews for a specific vehicle with pagination and sorting
    /// </summary>
    /// <param name="vehicleId">Vehicle ID</param>
    /// <param name="page">Page number</param>
    /// <param name="pageSize">Number of items per page</param>
    /// <param name="sortBy">Sort field (date, rating, helpfulness)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Collection of reviews for the vehicle</returns>
    Task<IEnumerable<Review>> GetVehicleReviewsAsync(
        Guid vehicleId,
        int page,
        int pageSize,
        string sortBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Calculates the average rating for a specific vehicle
    /// </summary>
    /// <param name="vehicleId">Vehicle ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Average rating (0 if no reviews)</returns>
    Task<double> GetAverageRatingAsync(
        Guid vehicleId,
        CancellationToken cancellationToken = default);
}
