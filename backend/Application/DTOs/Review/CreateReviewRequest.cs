namespace Backend.Application.DTOs.Review;

/// <summary>
/// Request DTO for creating a new review
/// </summary>
/// <param name="VehicleId">The ID of the vehicle being reviewed</param>
/// <param name="BookingId">The ID of the completed booking</param>
/// <param name="Rating">The rating (1-5)</param>
/// <param name="Comment">Optional review comment</param>
public record CreateReviewRequest(
    Guid VehicleId,
    Guid BookingId,
    int Rating,
    string? Comment);
