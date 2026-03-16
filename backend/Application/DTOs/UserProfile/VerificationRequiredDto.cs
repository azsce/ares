namespace Backend.Application.DTOs.UserProfile;

/// <summary>
/// DTO for verification requirements after profile update
/// </summary>
public record VerificationRequiredDto(
    bool Email,
    bool Phone);
