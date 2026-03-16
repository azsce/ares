namespace Backend.Application.DTOs.Vehicle;

/// <summary>
/// Request DTO for vehicle pricing calculation
/// </summary>
public record PricingRequest(
    DateTime PickupDate,
    DateTime ReturnDate,
    string? InsuranceOptions = null,
    string? AdditionalServices = null,
    string? Currency = "USD");
