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

    public async Task<Dictionary<Guid, CompanyProfile>> GetCompanyProfilesAsync(
        IEnumerable<Guid> supplierIds,
        CancellationToken cancellationToken = default)
    {
        var idList = supplierIds.ToList();
        if (idList.Count == 0) return new Dictionary<Guid, CompanyProfile>();

        return await _context.CompanyProfiles
            .Where(cp => idList.Contains(cp.UserId))
            .ToDictionaryAsync(cp => cp.UserId, cancellationToken);
    }

    public async Task<Dictionary<Guid, int>> GetVehicleCountsAsync(
        IEnumerable<Guid> supplierIds,
        CancellationToken cancellationToken = default)
    {
        var idList = supplierIds.ToList();
        if (idList.Count == 0) return new Dictionary<Guid, int>();

        return await _context.Vehicles
            .Where(v => idList.Contains(v.UserId))
            .GroupBy(v => v.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, cancellationToken);
    }

    public async Task<Dictionary<Guid, int>> GetBookingCountsAsync(
        IEnumerable<Guid> supplierIds,
        CancellationToken cancellationToken = default)
    {
        var idList = supplierIds.ToList();
        if (idList.Count == 0) return new Dictionary<Guid, int>();

        return await _context.Bookings
            .Where(b => b.Vehicle != null && idList.Contains(b.Vehicle.UserId))
            .GroupBy(b => b.Vehicle!.UserId)
            .Select(g => new { UserId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.UserId, x => x.Count, cancellationToken);
    }
}