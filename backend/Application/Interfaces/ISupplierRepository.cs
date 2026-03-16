using Backend.Application.DTOs.Common;
using Backend.Domain.Entities;

namespace Backend.Application.Interfaces;

/// <summary>
/// Repository interface for supplier-specific operations
/// </summary>
public interface ISupplierRepository : IPaginatedRepository<ApplicationUser>
{
    /// <summary>
    /// Gets paginated list of suppliers (users with Supplier role)
    /// </summary>
    /// <param name="page">Page number (1-based)</param>
    /// <param name="pageSize">Number of items per page</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of suppliers</returns>
    Task<PagedResult<ApplicationUser>> GetSuppliersAsync(
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a supplier by ID with company profile
    /// </summary>
    /// <param name="supplierId">Supplier ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Supplier with company profile if found</returns>
    Task<ApplicationUser?> GetSupplierWithCompanyProfileAsync(
        Guid supplierId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets company profile for a supplier
    /// </summary>
    /// <param name="supplierId">Supplier ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Company profile if found</returns>
    Task<CompanyProfile?> GetCompanyProfileAsync(
        Guid supplierId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Creates or updates company profile for a supplier
    /// </summary>
    /// <param name="companyProfile">Company profile to create or update</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created or updated company profile</returns>
    Task<CompanyProfile> UpsertCompanyProfileAsync(
        CompanyProfile companyProfile,
        CancellationToken cancellationToken = default);
}