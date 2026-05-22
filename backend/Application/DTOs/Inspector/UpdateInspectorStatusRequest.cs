namespace Backend.Application.DTOs.Inspector;

/// <summary>
/// Admin payload for enabling / disabling an inspector account.
/// Setting <see cref="IsActive"/> to false prevents the inspector from
/// being assigned to new bookings and disables their ability to log in /
/// act on existing inspections.
/// </summary>
public record UpdateInspectorStatusRequest(bool IsActive, bool? IsAvailable);
