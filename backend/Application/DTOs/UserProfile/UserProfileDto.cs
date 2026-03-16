namespace Backend.Application.DTOs.UserProfile;

/// <summary>
/// DTO for complete user profile information
/// </summary>
public record UserProfileDto(
    Guid UserId,
    string FirstName,
    string LastName,
    string Email,
    bool EmailVerified,
    string Phone,
    bool PhoneVerified,
    DateTime? DateOfBirth,
    string? ProfilePhotoUrl,
    AddressDto Address,
    EmergencyContactDto EmergencyContact,
    string LanguagePreference,
    string CurrencyPreference,
    int ProfileCompleteness,
    VerificationStatusDto VerificationStatus);
