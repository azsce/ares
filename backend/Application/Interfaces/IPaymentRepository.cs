using Backend.Domain.Entities;

namespace Backend.Application.Interfaces;

/// <summary>
/// Repository interface for BookingPayment entity with specialized payment operations
/// </summary>
public interface IPaymentRepository : IPaginatedRepository<BookingPayment>
{
    /// <summary>
    /// Gets payment transactions for a specific user with optional filters
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="startDate">Optional start date filter</param>
    /// <param name="endDate">Optional end date filter</param>
    /// <param name="status">Optional payment status filter</param>
    /// <param name="paymentMethod">Optional payment method filter</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Collection of payment transactions matching the criteria</returns>
    Task<IEnumerable<BookingPayment>> GetUserPaymentsAsync(
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        string? status = null,
        string? paymentMethod = null,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets a payment transaction by transaction ID with related booking details
    /// </summary>
    /// <param name="transactionId">Transaction ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Payment transaction with booking details, or null if not found</returns>
    Task<BookingPayment?> GetByTransactionIdAsync(
        Guid transactionId,
        CancellationToken cancellationToken = default);
}
