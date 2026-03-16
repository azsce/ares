using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.Repositories;

public class LocationRepository : PaginatedRepository<UserAddress>, ILocationRepository
{
    public LocationRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<UserAddress>> AutocompleteAsync(
        string query,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 3)
        {
            return Enumerable.Empty<UserAddress>();
        }

        var lowerQuery = query.ToLower();

        return await _context.Set<UserAddress>()
            .Where(a =>
                (a.AddressLine != null && a.AddressLine.ToLower().Contains(lowerQuery)) ||
                (a.City != null && a.City.ToLower().Contains(lowerQuery)) ||
                (a.Governorate != null && a.Governorate.ToLower().Contains(lowerQuery)) ||
                (a.Country != null && a.Country.ToLower().Contains(lowerQuery)))
            .Take(10)
            .ToListAsync(cancellationToken);
    }
}
