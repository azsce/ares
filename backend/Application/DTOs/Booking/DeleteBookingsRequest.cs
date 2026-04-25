using System.ComponentModel.DataAnnotations;

namespace Backend.Application.DTOs.Booking;

/// <summary>
/// Request DTO for bulk deleting bookings
/// </summary>
public record DeleteBookingsRequest(
    [Required]
    List<Guid> Ids
);
