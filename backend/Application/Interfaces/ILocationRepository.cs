using Backend.Domain.Entities;

namespace Backend.Application.Interfaces;

public interface ILocationRepository : IPaginatedRepository<UserAddress>
{
    Task<IEnumerable<UserAddress>> AutocompleteAsync(
        string query,
        CancellationToken cancellationToken = default);
}
