using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Infrastructure.Repositories;

/// <summary>
/// Repository implementation for BookingPayment entity with specialized payment operations
/// </summary>
public class PaymentRepository : PaginatedRepository<BookingPayment>, IPaymentRepository
{
    public PaymentRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<BookingPayment>> GetUserPaymentsAsync(
        Guid userId,
        DateTime? startDate = null,
        DateTime? endDate = null,
        string? status = null,
        string? paymentMethod = null,
        CancellationToken cancellationToken = default)
    {
        var query = _dbSet
            .Include(p => p.Booking)
                .ThenInclude(b => b!.Vehicle)
            .Include(p => p.Booking)
                .ThenInclude(b => b!.User)
            .Where(p => p.Booking != null && p.Booking.UserId == userId);

        // Filter by date range
        if (startDate.HasValue)
        {
            query = query.Where(p => p.CreatedAt >= startDate.Value);
        }

        if (endDate.HasValue)
        {
            query = query.Where(p => p.CreatedAt <= endDate.Value);
        }

        // Filter by status
        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(p => p.Status == status);
        }

        // Filter by payment method
        if (!string.IsNullOrWhiteSpace(paymentMethod))
        {
            query = query.Where(p => p.PaymentMethod == paymentMethod);
        }

        return await query
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<BookingPayment?> GetByTransactionIdAsync(
        Guid transactionId,
        CancellationToken cancellationToken = default)
    {
        return await _dbSet
            .Include(p => p.Booking)
                .ThenInclude(b => b!.Vehicle)
            .Include(p => p.Booking)
                .ThenInclude(b => b!.User)
            .FirstOrDefaultAsync(p => p.TransactionId == transactionId, cancellationToken);
    }
}
