using Backend.Application.DTOs.Common;
using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for supplier-specific operations
/// </summary>
public class SupplierRepository : PaginatedRepository<ApplicationUser>, ISupplierRepository
{
    private readonly UserManager<ApplicationUser> _userManager;

    public SupplierRepository(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager) : base(context)
    {
        _userManager = userManager;
    }

    /// <summary>
    /// Gets paginated list of suppliers (users with Supplier role)
    /// </summary>
    public async Task<PagedResult<ApplicationUser>> GetSuppliersAsync(
        int page = 1,
        int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        // Get users with Supplier role
        var suppliersInRole = await _userManager.GetUsersInRoleAsync("Supplier");
        var supplierIds = suppliersInRole.Select(u => u.Id).ToList();

        // Apply pagination to suppliers
        return await GetPagedAsync(
            page,
            pageSize,
            filter: u => supplierIds.Contains(u.Id),
            orderBy: query => query.OrderBy(u => u.CreatedAt),
            cancellationToken);
    }

    /// <summary>
    /// Gets a supplier by ID with company profile
    /// </summary>
    public async Task<ApplicationUser?> GetSupplierWithCompanyProfileAsync(
        Guid supplierId,
        CancellationToken cancellationToken = default)
    {
        var supplier = await _context.Users
            .Where(u => u.Id == supplierId)
            .FirstOrDefaultAsync(cancellationToken);

        if (supplier == null)
            return null;

        // Verify user has Supplier role
        var isSupplier = await _userManager.IsInRoleAsync(supplier, "Supplier");
        if (!isSupplier)
            return null;

        return supplier;
    }

    /// <summary>
    /// Gets company profile for a supplier
    /// </summary>
    public async Task<CompanyProfile?> GetCompanyProfileAsync(
        Guid supplierId,
        CancellationToken cancellationToken = default)
    {
        return await _context.CompanyProfiles
            .Where(cp => cp.UserId == supplierId)
            .FirstOrDefaultAsync(cancellationToken);
    }

    /// <summary>
    /// Creates or updates company profile for a supplier
    /// </summary>
    public async Task<CompanyProfile> UpsertCompanyProfileAsync(
        CompanyProfile companyProfile,
        CancellationToken cancellationToken = default)
    {
        var existingProfile = await GetCompanyProfileAsync(companyProfile.UserId, cancellationToken);

        if (existingProfile == null)
        {
            // Create new profile
            _context.CompanyProfiles.Add(companyProfile);
        }
        else
        {
            // Update existing profile
            existingProfile.CompanyName = companyProfile.CompanyName;
            existingProfile.CommercialRegistrationNumber = companyProfile.CommercialRegistrationNumber;
            existingProfile.TaxId = companyProfile.TaxId;
            existingProfile.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return existingProfile ?? companyProfile;
    }
}