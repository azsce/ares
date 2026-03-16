namespace Backend.Application.DTOs.Common;

/// <summary>
/// Generic paginated result DTO for API responses
/// </summary>
/// <typeparam name="T">Type of data items</typeparam>
public record PagedResult<T>(
    List<T> Data,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages)
{
    /// <summary>
    /// Indicates if there is a previous page
    /// </summary>
    public bool HasPreviousPage => Page > 1;

    /// <summary>
    /// Indicates if there is a next page
    /// </summary>
    public bool HasNextPage => Page < TotalPages;
}
