using System;
using System.Collections.Generic;

namespace Backend.Application.DTOs.Inspector;

/// <summary>
/// Full inspector view for the admin Inspector Details page. Includes
/// aggregate workload stats and recent inspection history.
/// </summary>
public record InspectorDetailsDto(
    InspectorDto Inspector,
    int AssignedCount,
    int PendingCount,
    int ApprovedCount,
    int RejectedCount,
    List<InspectorRecentInspectionDto> RecentInspections
);

public record InspectorRecentInspectionDto(
    Guid InspectionId,
    Guid BookingId,
    string? BookingNumber,
    string Status,
    DateTime InspectionDate,
    DateTime? SubmittedAt
);
