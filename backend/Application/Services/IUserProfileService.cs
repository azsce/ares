using Backend.Application.DTOs.UserProfile;
using Microsoft.AspNetCore.Http;

namespace Backend.Application.Services;

/// <summary>
/// Service interface for user profile management operations
/// </summary>
public interface IUserProfileService
{
    /// <summary>
    /// Gets complete user profile information
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Complete user profile with verification status and completeness percentage</returns>
    Task<UserProfileDto> GetProfileAsync(
        Guid userId,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates user profile information
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="request">Profile update request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Update response with verification requirements</returns>
    Task<UpdateProfileResponse> UpdateProfileAsync(
        Guid userId,
        UpdateProfileRequest request,
        CancellationToken cancellationToken = default);

    /// <summary>
    /// Uploads user profile photo
    /// </summary>
    /// <param name="userId">User ID</param>
    /// <param name="photo">Photo file</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>URL of the uploaded photo</returns>
    Task<string> UploadProfilePhotoAsync(
        Guid userId,
        IFormFile photo,
        CancellationToken cancellationToken = default);
}
