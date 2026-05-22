using System;

namespace Backend.Application.DTOs.Inspector;

/// <summary>
/// Lightweight inspector summary used in admin list & assignment dropdowns.
/// </summary>
public record InspectorDto(
    Guid InspectorId,        // Inspector profile entity Id
    Guid UserId,             // Underlying ApplicationUser Id
    string FirstName,
    string LastName,
    string Email,
    string? PhoneNumber,
    string EmployeeCode,
    bool IsAvailable,
    bool IsActive,
    DateTime CreatedAt
);
