using Backend.Domain.Entities;

namespace Backend.Application.Interfaces;

/// <summary>
/// Repository interface for ApplicationUser entity with specialized user operations
/// </summary>
public interface IUserRepository : IPaginatedRepository<ApplicationUser>
{
    /// <summary>
    /// Gets a user by their email address
    /// </summary>
    /// <param name="email">User email address</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>User if found, null otherwise</returns>
    Task<ApplicationUser?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Checks if an email address is already registered
    /// </summary>
    /// <param name="email">Email address to check</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if email exists, false otherwise</returns>
    Task<bool> EmailExistsAsync(
        string email,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets roles for multiple users in a single batched query
    /// </summary>
    Task<Dictionary<Guid, List<string>>> GetUserRolesAsync(
        IEnumerable<Guid> userIds,
        CancellationToken cancellationToken = default);
}
