using System;
using System.Collections.Generic;

namespace Backend.Application.DTOs.Inspection;

/// <summary>
/// Full inspection details — used by the inspector dashboard "open assigned
/// inspection" screen and by admins viewing a completed report.
/// </summary>
public record InspectionDetailsDto(
    Guid InspectionId,
    Guid BookingId,
    string? BookingNumber,
    Guid VehicleId,
    string VehicleDisplayName,
    Guid InspectorId,
    string InspectorFullName,
    string Status,
    bool IsSubmitted,
    string? Notes,
    string? GeneralCondition,
    int OdometerReading,
    decimal FuelLevel,
    DateTime InspectionDate,
    DateTime? SubmittedAt,
    DateTime CreatedAt,
    List<InspectionImageDto> Images
);
