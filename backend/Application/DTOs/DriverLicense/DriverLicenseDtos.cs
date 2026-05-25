using Microsoft.AspNetCore.Http;

namespace Backend.Application.DTOs.DriverLicense
{
    /// <summary>
    /// Request to submit or update driver license information.
    /// Sent as multipart/form-data because of the LicenseImage upload.
    /// </summary>
    public record SubmitDriverLicenseRequest(
        string LicenseNumber,
        IFormFile LicenseImage,
        DateTime LicenseExpiryDate);

    /// <summary>
    /// Current driver-license verification status for the authenticated user.
    /// </summary>
    public record DriverLicenseStatusResponse(
        Guid Id,
        Guid UserId,
        string LicenseNumber,
        DateTime LicenseExpiryDate,
        string? LicenseImageUrl,
        bool IsVerified,
        DateTime SubmittedAt,
        DateTime? UpdatedAt,
        string? VerificationStatus = null,
        string? RejectionReason = null);

    /// <summary>
    /// Admin-facing DTO for driver license review. Mirrors the shape used by
    /// <see cref="Backend.Application.DTOs.Verification.AdminVerificationDto"/>
    /// so the existing admin verification UI patterns can be reused.
    /// </summary>
    public record AdminDriverLicenseDto(
        Guid Id,
        Guid UserId,
        string UserFirstName,
        string UserLastName,
        string UserEmail,
        string LicenseNumber,
        DateTime LicenseExpiryDate,
        string? LicenseImageUrl,
        string Status,
        DateTime SubmittedAt,
        DateTime? UpdatedAt,
        string? RejectionReason,
        Guid? ReviewedBy,
        DateTime? ReviewedAt);

    /// <summary>
    /// Request body for the admin reject endpoint. RejectionReason is required.
    /// </summary>
    public record RejectDriverLicenseRequest(string RejectionReason);
}
