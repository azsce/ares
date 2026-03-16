using System.ComponentModel.DataAnnotations;
using System;

namespace Backend.Domain.Entities
{
    public class InspectorApplication : AuditableEntity
    {
        [Key]
        public new Guid Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [MaxLength(20)]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string NationalId { get; set; } = string.Empty;

        public string? NationalIdImage { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "Pending";

        public Guid? ReviewedBy { get; set; }
        
        public DateTime? ReviewedAt { get; set; }
        
        public string? RejectionReason { get; set; }

        public new DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
