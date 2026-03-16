namespace Backend.Application.DTOs.UserProfile;

/// <summary>
/// DTO for user verification status
/// </summary>
public record VerificationStatusDto(
    bool Email,
    bool Phone,
    bool DriverLicense,
    string Kyc);
