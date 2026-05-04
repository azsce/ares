using Backend.Application.Interfaces;
using Backend.Domain.Entities.Enums;
using Backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Backend.Infrastructure.Services;

public class BookingStatusUpdateService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BookingStatusUpdateService> _logger;

    public BookingStatusUpdateService(
        IServiceProvider serviceProvider,
        ILogger<BookingStatusUpdateService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("BookingStatusUpdateService is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await UpdateBookingStatusesAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing BookingStatusUpdateService.");
            }

            // Run every 2 minutes
            await Task.Delay(TimeSpan.FromMinutes(2), stoppingToken);
        }

        _logger.LogInformation("BookingStatusUpdateService is stopping.");
    }

    private async Task UpdateBookingStatusesAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var now = DateTime.Now; // Using local time to match DB values in typical local dev
        _logger.LogDebug($"Checking for booking status updates at {now}");

        // 1. Confirmed -> Active (Pickup date reached)
        var bookingsToActivate = await context.Bookings
            .Where(b => b.Status == BookingStatus.Confirmed &&
                        b.PickupDate.HasValue && 
                        b.PickupDate.Value <= now)
            .ToListAsync(cancellationToken);

        foreach (var booking in bookingsToActivate)
        {
            booking.Status = BookingStatus.Active;
            booking.UpdatedAt = now;
            _logger.LogInformation($"Booking {booking.Id} (Num: {booking.BookingNumber}) transitioned from Confirmed to Active.");
        }

        // 2. Active -> Completed (Return date reached)
        var bookingsToComplete = await context.Bookings
            .Where(b => b.Status == BookingStatus.Active &&
                        b.ReturnDate.HasValue && 
                        b.ReturnDate.Value <= now)
            .ToListAsync(cancellationToken);

        foreach (var booking in bookingsToComplete)
        {
            booking.Status = BookingStatus.Completed;
            booking.UpdatedAt = now;
            _logger.LogInformation($"Booking {booking.Id} (Num: {booking.BookingNumber}) transitioned from Active to Completed.");
        }

        // 3. Pending -> Cancelled (Pickup date passed but never confirmed)
        var pendingToCancel = await context.Bookings
            .Where(b => b.Status == BookingStatus.Pending &&
                        b.PickupDate.HasValue && 
                        b.PickupDate.Value <= now.AddHours(-1)) // Give 1 hour grace period
            .ToListAsync(cancellationToken);

        foreach (var booking in pendingToCancel)
        {
            booking.Status = BookingStatus.Cancelled;
            booking.CancellationReason = "Automatic cancellation: Pickup date passed without confirmation.";
            booking.CancelledAt = now;
            booking.UpdatedAt = now;
            _logger.LogInformation($"Booking {booking.Id} (Num: {booking.BookingNumber}) automatically Cancelled (was Pending after pickup date).");
        }

        if (bookingsToActivate.Any() || bookingsToComplete.Any() || pendingToCancel.Any())
        {
            await context.SaveChangesAsync(cancellationToken);
            _logger.LogInformation($"Saved {bookingsToActivate.Count + bookingsToComplete.Count + pendingToCancel.Count} status transitions.");
        }
    }
}
