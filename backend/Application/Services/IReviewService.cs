using Backend.Application.DTOs.Common;
using Backend.Application.DTOs.Review;

namespace Backend.Application.Services;

/// <summary>
/// Service interface for review-related operations
/// </summary>
public interface IReviewService
{
    /// <summary>
    /// Gets reviews for a specific vehicle with pagination and sorting
    /// </summary>
    /// <param name="vehicleId">Vehicle ID</param>
    /// <param name="page">Page number</param>
    /// <param name="pageSize">Number of items per page</param>
    /// <param name="sortBy">Sort field (date, rating, helpfulness)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of reviews</returns>
    Task<PagedResult<ReviewDto>> GetVehicleReviewsAsync(
        Guid vehicleId,
        int page,
        int pageSize,
        string sortBy,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates a new review for a vehicle
    /// </summary>
    /// <param name="request">Review creation request</param>
    /// <param name="userId">User ID creating the review</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Review creation response</returns>
    Task<ReviewResponse> CreateReviewAsync(
        CreateReviewRequest request,
        Guid userId,
        CancellationToken cancellationToken = default);
}
