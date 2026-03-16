namespace Backend.Application.DTOs.Payment;

/// <summary>
/// Request DTO for querying payment history with filters and pagination.
/// </summary>
/// <param name="StartDate">Optional start date filter</param>
/// <param name="EndDate">Optional end date filter</param>
/// <param name="Status">Optional payment status filter</param>
/// <param name="PaymentMethod">Optional payment method filter</param>
/// <param name="Page">Page number (default: 1)</param>
/// <param name="PageSize">Number of items per page (default: 20)</param>
/// <param name="SortBy">Field to sort by (default: "createdAt")</param>
/// <param name="SortOrder">Sort order: "asc" or "desc" (default: "desc")</param>
public record PaymentHistoryRequest(
    DateTime? StartDate = null,
    DateTime? EndDate = null,
    string? Status = null,
    string? PaymentMethod = null,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "createdAt",
    string SortOrder = "desc"
);
