using System.Linq.Expressions;
using Backend.Application.DTOs.Common;

namespace Backend.Application.Interfaces;

/// <summary>
/// Generic paginated repository interface extending basic repository with pagination support
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public interface IPaginatedRepository<T> : IRepository<T> where T : class
{
    /// <summary>
    /// Gets a paginated result set with optional filtering and ordering
    /// </summary>
    /// <param name="page">Page number (1-based)</param>
    /// <param name="pageSize">Number of items per page</param>
    /// <param name="filter">Optional filter expression</param>
    /// <param name="orderBy">Optional ordering function</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated result containing data and pagination metadata</returns>
    Task<PagedResult<T>> GetPagedAsync(
        int page,
        int pageSize,
        Expression<Func<T, bool>>? filter = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        CancellationToken cancellationToken = default);
}
