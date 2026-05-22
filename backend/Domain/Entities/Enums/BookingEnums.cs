using System;

namespace Backend.Domain.Entities.Enums
{
    public enum BookingStatus
    {
        Pending,
        Confirmed,
        Active,
        Completed,
        Cancelled,
        // ─── Inspection workflow extensions ───────────────────────────────
        // Appended at the end so any existing rows persisted by index keep
        // their meaning. BookingStatus is persisted as a string (see
        // BookingConfiguration), so adding values is safe.
        Approved,             // Admin approved booking, ready for inspector assignment
        ReadyForDelivery,     // Inspection approved — vehicle ready to hand over
        InspectionFailed      // Inspection rejected — vehicle not safe to deliver
    }

    public enum PaymentStatus
    {
        Pending,
        Authorized,
        Captured,
        Refunded,
        Failed
    }

    public enum ModificationType
    {
        Dates,
        Vehicle,
        Location,
        Services,
        Insurance,
        Other
    }

    public enum PaymentAdjustmentStatus
    {
        Pending,
        Processed,
        Failed
    }

    public enum PolicyType
    {
        Free,
        Partial,
        NoRefund,
        ForceMajeure
    }

    public enum RefundStatus
    {
        Pending,
        Processing,
        Completed,
        Failed
    }

    public enum ReasonCategory
    {
        PlansChanged,
        FoundAlternative,
        Emergency,
        Other
    }

    public enum BookingEventType
    {
        Created,
        Modified,
        Cancelled,
        Confirmed,
        PickupCompleted,
        ReturnCompleted,
        PaymentProcessed,
        RefundProcessed
    }

    public enum EventActorType
    {
        Customer,
        Admin,
        System,
        Support
    }

    public enum MaintenanceStatus
    {
        Scheduled,
        InProgress,
        Completed,
        Cancelled
    }
}
