namespace Backend.Application.DTOs.Review;

/// <summary>
/// Response DTO for review creation
/// </summary>
/// <param name="ReviewId">The unique identifier of the created review</param>
/// <param name="VehicleId">The ID of the vehicle reviewed</param>
/// <param name="Rating">The rating given (1-5)</param>
/// <param name="Message">A message describing the result</param>
public record ReviewResponse(
    Guid ReviewId,
    Guid VehicleId,
    int Rating,
    string Message);
