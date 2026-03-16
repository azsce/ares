namespace Backend.Application.DTOs.Vehicle;

/// <summary>
/// DTO for vehicle pricing breakdown
/// </summary>
public record VehiclePricingDto(
    decimal BasePrice,
    decimal InsuranceCost,
    decimal AdditionalServicesCost,
    decimal TotalPrice,
    string Currency,
    int TotalDays);
