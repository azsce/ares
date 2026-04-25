namespace Backend.Application.DTOs.Booking;

/// <summary>
/// Request DTO for retrieving paginated booking list
/// </summary>
public record BookingListRequest(
    Guid? UserId,
    List<Guid>? Suppliers,
    List<string>? Statuses,
    Guid? CarId,
    BookingFilters? Filter,
    int Page,
    int Size,
    string Language);
