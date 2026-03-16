namespace Backend.Application.DTOs.UserProfile;

/// <summary>
/// DTO for emergency contact information
/// </summary>
public record EmergencyContactDto(
    string Name,
    string Phone,
    string Relationship);
