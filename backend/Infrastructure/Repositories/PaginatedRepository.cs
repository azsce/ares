using System.Linq.Expressions;
using Backend.Application.DTOs.Common;
using Backend.Application.Interfaces;
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.Repositories;

/// <summary>
/// Generic paginated repository implementation extending base repository with pagination support
/// </summary>
/// <typeparam name="T">Entity type</typeparam>
public class PaginatedRepository<T> : Repository<T>, IPaginatedRepository<T> where T : class
{
    public PaginatedRepository(ApplicationDbContext context) : base(context)
    {
    }

    public virtual async Task<PagedResult<T>> GetPagedAsync(
        int page,
        int pageSize,
        Expression<Func<T, bool>>? filter = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        CancellationToken cancellationToken = default)
    {
        // Start with the base query
        IQueryable<T> query = _dbSet;

        // Apply filter if provided
        if (filter != null)
        {
            query = query.Where(filter);
        }

        // Get total count before pagination
        var totalCount = await query.CountAsync(cancellationToken);

        // Apply ordering if provided
        if (orderBy != null)
        {
            query = orderBy(query);
        }

        // Calculate pagination
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
        var skip = (page - 1) * pageSize;

        // Apply pagination
        var data = await query
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PagedResult<T>(
            data,
            page,
            pageSize,
            totalCount,
            totalPages);
    }
}
