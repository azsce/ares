namespace Backend.Application.DTOs.UserProfile;

/// <summary>
/// Request DTO for updating user profile
/// </summary>
public record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string Phone,
    DateTime? DateOfBirth,
    AddressDto Address,
    EmergencyContactDto EmergencyContact,
    string LanguagePreference,
    string CurrencyPreference);
