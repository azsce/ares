namespace Backend.Application.DTOs.Supplier;

/// <summary>
/// DTO for supplier management operations
/// </summary>
public record SupplierManagementDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    bool EmailConfirmed,
    bool PhoneNumberConfirmed,
    string? Status,
    List<string> Roles,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    CompanyProfileDto? CompanyProfile
);

/// <summary>
/// DTO for company profile information
/// </summary>
public record CompanyProfileDto(
    string CompanyName,
    string? CommercialRegistrationNumber,
    string? TaxId
);