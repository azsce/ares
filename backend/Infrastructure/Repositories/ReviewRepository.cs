using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for Review entity with specialized review operations
/// </summary>
public class ReviewRepository : PaginatedRepository<Review>, IReviewRepository
{
    public ReviewRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Review>> GetVehicleReviewsAsync(
        Guid vehicleId,
        int page,
        int pageSize,
        string sortBy,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(r => r.User)
            .Include(r => r.Vehicle)
            .Where(r => r.VehicleId == vehicleId);

        query = sortBy?.ToLower() switch
        {
            "rating" => query.OrderByDescending(r => r.Rating),
            "date" => query.OrderByDescending(r => r.CreatedAt),
            _ => query.OrderByDescending(r => r.CreatedAt)
        };

        var skip = (page - 1) * pageSize;
        return await query
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<double> GetAverageRatingAsync(
        Guid vehicleId,
        CancellationToken cancellationToken = default)
    {
        var reviews = await _dbSet
            .Where(r => r.VehicleId == vehicleId && r.Rating.HasValue)
            .ToListAsync(cancellationToken);

        if (!reviews.Any())
        {
            return 0;
        }

        return reviews.Average(r => r.Rating ?? 0);
    }
}
