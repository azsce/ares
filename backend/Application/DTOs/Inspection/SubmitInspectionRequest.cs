using System.ComponentModel.DataAnnotations;

namespace Backend.Application.DTOs.Inspection;

/// <summary>
/// Inspector's final submission. Once submitted the inspection is locked
/// and the underlying booking status is updated:
///   Approved  → BookingStatus.ReadyForDelivery
///   Rejected  → BookingStatus.InspectionFailed
/// </summary>
public record SubmitInspectionRequest(
    [Required] bool Approve,
    [Required, MinLength(3), MaxLength(2000)] string Notes,
    [MaxLength(50)] string? GeneralCondition,
    int OdometerReading = 0,
    decimal FuelLevel = 0m
);
