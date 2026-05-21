using System;
using System.ComponentModel.DataAnnotations;

namespace Backend.Domain.Entities
{
    public class Driver : AuditableEntity
    {
        [Key]
        public new Guid Id { get; set; }

        [Required]
        public Guid UserId { get; set; }

        public ApplicationUser? User { get; set; }

        [Required]
        [MaxLength(50)]
        public string LicenseNumber { get; set; } = string.Empty;

        [Required]
        public DateTime LicenseExpiryDate { get; set; }

        public string? LicenseImage { get; set; }

        public bool IsAvailable { get; set; } = true;

        public bool IsVerified { get; set; } = false;

        public bool IsActive { get; set; } = true;

        // ── Admin review fields (purely additive, do not affect booking logic) ──
        /// <summary>
        /// Explicit admin review state for the driver license:
        /// "Pending" | "Verified" | "Rejected". Null is treated as "Pending"
        /// for backward compatibility with rows that pre-date this column.
        /// </summary>
        [MaxLength(20)]
        public string? VerificationStatus { get; set; }

        /// <summary>
        /// Reason supplied by the admin when rejecting the license.
        /// </summary>
        [MaxLength(500)]
        public string? RejectionReason { get; set; }

        /// <summary>
        /// Admin user who approved or rejected this license.
        /// </summary>
        public Guid? ReviewedBy { get; set; }

        /// <summary>
        /// Timestamp of the most recent admin review decision.
        /// </summary>
        public DateTime? ReviewedAt { get; set; }

        public new DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public new DateTime? UpdatedAt { get; set; }
    }
}
