namespace Backend.Application.DTOs.Supplier;

/// <summary>
/// Response DTO for supplier management operations
/// </summary>
public record SupplierManagementResponse(
    bool Success,
    string Message,
    Guid? SupplierId = null
);