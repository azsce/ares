namespace Backend.Application.DTOs.UserProfile;

/// <summary>
/// Response DTO for profile update operation
/// </summary>
public record UpdateProfileResponse(
    bool Success,
    string Message,
    VerificationRequiredDto VerificationRequired);
