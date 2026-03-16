using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Vehicle entity with specialized vehicle operations
/// </summary>
public class VehicleRepository : PaginatedRepository<Vehicle>, IVehicleRepository
{
    public VehicleRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Vehicle>> SearchAvailableVehiclesAsync(
        Guid pickupLocationId,
        Guid? returnLocationId,
        DateTime pickupDate,
        DateTime returnDate,
        string? category = null,
        string? transmission = null,
        decimal? minPrice = null,
        decimal? maxPrice = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(v => v.Images)
            .Include(v => v.User)
            .Where(v => v.IsActive && v.AvailabilityStatus == "Available");

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(v => v.Status == category);
        }

        if (!string.IsNullOrWhiteSpace(transmission))
        {
            query = query.Where(v => v.Transmission == transmission);
        }

        if (minPrice.HasValue)
        {
            query = query.Where(v => v.PricePerDay >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(v => v.PricePerDay <= maxPrice.Value);
        }

        var vehicles = await query.ToListAsync(cancellationToken);

        var availableVehicles = new List<Vehicle>();
        foreach (var vehicle in vehicles)
        {
            var isAvailable = await IsAvailableAsync(vehicle.Id, pickupDate, returnDate, cancellationToken);
            if (isAvailable)
            {
                availableVehicles.Add(vehicle);
            }
        }

        return availableVehicles;
    }

    public async Task<bool> IsAvailableAsync(
        Guid vehicleId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default)
    {
        var hasOverlappingBooking = await _context.Bookings
            .AnyAsync(b =>
                b.VehicleId == vehicleId &&
                b.Status != "Cancelled" &&
                b.PickupDate < endDate &&
                b.ReturnDate > startDate,
                cancellationToken);

        return !hasOverlappingBooking;
    }

    public async Task<IEnumerable<VehicleImage>> GetVehicleImagesAsync(
        Guid vehicleId,
        CancellationToken cancellationToken = default)
    {
        return await _context.VehicleImages
            .Where(vi => vi.VehicleId == vehicleId)
            .OrderByDescending(vi => vi.IsPrimary)
            .ThenBy(vi => vi.CreatedAt)
            .ToListAsync(cancellationToken);
    }
}
