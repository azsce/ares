namespace Backend.Application.DTOs.Vehicle;

/// <summary>
/// DTO for vehicle availability calendar
/// </summary>
public record VehicleAvailabilityDto(
    Guid VehicleId,
    List<DateRange> BookedDates,
    List<DateRange> BlockedDates);

/// <summary>
/// Represents a date range
/// </summary>
public record DateRange(
    DateTime StartDate,
    DateTime EndDate);
