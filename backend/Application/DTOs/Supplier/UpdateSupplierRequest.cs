using System.ComponentModel.DataAnnotations;

namespace Backend.Application.DTOs.Supplier;

/// <summary>
/// Request DTO for updating an existing supplier account
/// </summary>
public record UpdateSupplierRequest(
    [Required]
    [MaxLength(100)]
    string FirstName,

    [Required]
    [MaxLength(100)]
    string LastName,

    [Phone]
    [MaxLength(20)]
    string? PhoneNumber,

    [MaxLength(50)]
    string? Status,

    [Required]
    [MaxLength(255)]
    string CompanyName,

    [MaxLength(100)]
    string? CommercialRegistrationNumber,

    [MaxLength(100)]
    string? TaxId
);