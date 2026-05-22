using System;

namespace Backend.Application.DTOs.Inspection;

/// <summary>
/// Lightweight inspection summary for inspector dashboard listings &
/// admin views.
/// </summary>
public record InspectionDto(
    Guid InspectionId,
    Guid BookingId,
    string? BookingNumber,
    Guid VehicleId,
    string VehicleDisplayName,
    Guid InspectorId,
    string InspectorFullName,
    string Status,           // Pending / Approved / Rejected
    bool IsSubmitted,
    DateTime InspectionDate,
    DateTime? SubmittedAt,
    int ImageCount
);
