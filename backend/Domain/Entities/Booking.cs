using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System;
using Backend.Domain.Entities.Enums;

namespace Backend.Domain.Entities
{
    public class Booking : AuditableEntity
    {
        [MaxLength(100)]
        public string? BookingNumber { get; set; }

        [Required]
        public Guid UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public ApplicationUser? User { get; set; }

        [Required]
        public Guid VehicleId { get; set; }

        [ForeignKey(nameof(VehicleId))]
        public Vehicle? Vehicle { get; set; }

        public DateTime? PickupDate { get; set; }
        public DateTime? ReturnDate { get; set; }

        [MaxLength(255)]
        public string? PickupLocation { get; set; }

        [MaxLength(255)]
        public string? DropoffLocation { get; set; }

        public int? TotalDays { get; set; }

        public bool RequiresDriver { get; set; } = false;

        public Guid? DriverId { get; set; }

        [ForeignKey(nameof(DriverId))]
        public Driver? Driver { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? TotalPrice { get; set; }

        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        public DateTime? CancelledAt { get; set; }

        public string? CancellationReason { get; set; }

        public virtual Review? Review { get; set; }

        // ─── Inspection workflow ─────────────────────────────────────────
        // The inspector (ApplicationUser with Inspector role) assigned by an
        // admin to perform the pre-delivery vehicle inspection.
        public Guid? AssignedInspectorId { get; set; }

        [ForeignKey(nameof(AssignedInspectorId))]
        public ApplicationUser? AssignedInspector { get; set; }

        // Inspection status mirror — kept on the booking for fast filtering
        // and to avoid a join on every listing.
        public BookingInspectionStatus InspectionStatus { get; set; } = BookingInspectionStatus.NotRequired;
    }
}
