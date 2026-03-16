namespace Backend.Application.DTOs.Vehicle;

/// <summary>
/// DTO for vehicle list item in search results
/// </summary>
public record VehicleListDto(
    Guid VehicleId,
    string Make,
    string Model,
    string Category,
    decimal DailyRate,
    string Currency,
    string ImageUrl,
    double Rating,
    int ReviewCount,
    double? Distance,
    bool Available);
