namespace Backend.Domain.Entities.Enums
{
    /// <summary>
    /// Single source of truth for how booking statuses affect vehicle
    /// availability and checkout recovery. Used by the availability check
    /// (LINQ), the race-safe reservation (raw SQL) and the hold-expiry sweep
    /// so all three agree on what "reserves a vehicle" means.
    /// </summary>
    public static class BookingStatusPolicy
    {
        /// <summary>
        /// Statuses that reserve a vehicle for its rental window and therefore
        /// block any overlapping booking.
        ///
        /// NOTE: <see cref="BookingStatus.Draft"/> and
        /// <see cref="BookingStatus.DriverSelected"/> are deliberately absent —
        /// multiple customers may hold drafts for the same vehicle.
        /// <see cref="BookingStatus.PaymentPending"/> only blocks while its hold
        /// has not expired; callers add that condition
        /// (<c>HoldExpiresAt &gt; now</c>) on top of this set.
        ///
        /// IMPORTANT: keep this list in sync with the literal status list in
        /// <c>BookingRepository.ReserveVehicleAtomicAsync</c> (raw SQL).
        /// </summary>
        public static readonly BookingStatus[] ReservingStatuses =
        {
            BookingStatus.Pending,           // legacy admin-created booking
            BookingStatus.PaymentPending,    // active hold (while not expired)
            BookingStatus.Confirmed,         // paid & confirmed
            BookingStatus.Active,            // rental in progress
            BookingStatus.Approved,          // admin-approved, awaiting inspection
            BookingStatus.ReadyForDelivery,  // inspected, ready to hand over
            // The driver-workflow / inspection states below were already
            // treated as "occupied" by the previous availability rule (which
            // blocked everything except Cancelled/Completed). They are kept
            // here so this change introduces no behavioural regression.
            BookingStatus.WaitingForDriver,
            BookingStatus.NoDriverAvailable,
            BookingStatus.InspectionFailed
        };

        /// <summary>
        /// In-flight customer checkout states that can be resumed after a
        /// refresh, lost connection or application error.
        /// </summary>
        public static readonly BookingStatus[] ResumableStatuses =
        {
            BookingStatus.Draft,
            BookingStatus.DriverSelected,
            BookingStatus.PaymentPending
        };
    }
}
