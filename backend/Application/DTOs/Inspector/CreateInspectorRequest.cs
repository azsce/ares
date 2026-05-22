using System.ComponentModel.DataAnnotations;

namespace Backend.Application.DTOs.Inspector;

/// <summary>
/// Admin-only request to provision a new inspector. The system creates the
/// underlying ApplicationUser, assigns the "Inspector" role and creates
/// the Inspector profile in a single transaction.
/// </summary>
public record CreateInspectorRequest(
    [Required, MaxLength(100)] string FirstName,
    [Required, MaxLength(100)] string LastName,
    [Required, EmailAddress, MaxLength(256)] string Email,
    [Phone, MaxLength(20)] string? PhoneNumber,
    [Required, MinLength(6), MaxLength(100)] string Password,
    [Required, MaxLength(50)] string EmployeeCode,
    bool IsAvailable = true
);
