namespace Backend.Application.DTOs.Booking;

/// <summary>
/// DTO for admin booking statistics.
/// CompletedBookings represents the total number of completed bookings (all-time),
/// not just today. The legacy "CompletedToday" property is kept for backward
/// compatibility with older clients and mirrors the same value.
/// </summary>
public record AdminBookingStatsDto(
    int ActiveBookings,
    int PendingBookings,
    int TotalCompletedBookings
)
{
    /// <summary>
    /// Backward-compat alias for older frontend builds that read CompletedToday.
    /// Mirrors TotalCompletedBookings (all-time completed bookings).
    /// </summary>
    public int CompletedToday => TotalCompletedBookings;

    /// <summary>
    /// Backward-compat alias matching prior naming used by some clients.
    /// Mirrors TotalCompletedBookings.
    /// </summary>
    public int CompletedBookings => TotalCompletedBookings;
}
