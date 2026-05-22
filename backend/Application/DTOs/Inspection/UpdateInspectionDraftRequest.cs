using System.ComponentModel.DataAnnotations;

namespace Backend.Application.DTOs.Inspection;

/// <summary>
/// Pre-submit edits an inspector can make to a draft inspection.
/// Forbidden once <c>IsSubmitted</c> is true.
/// </summary>
public record UpdateInspectionDraftRequest(
    [MaxLength(2000)] string? Notes,
    [MaxLength(50)] string? GeneralCondition,
    int OdometerReading = 0,
    decimal FuelLevel = 0m
);
