using Backend.Application.DTOs.Common;
using Backend.Application.DTOs.DriverLicense;

namespace Backend.Application.Services
{
    /// <summary>
    /// Application service for Driver License Verification.
    /// Handles user submission/status retrieval as well as admin review
    /// (list, approve, reject) for the admin verification UI.
    /// </summary>
    public interface IDriverLicenseService
    {
        /// <summary>
        /// Creates a driver license record for the user if one does not exist,
        /// otherwise updates the existing record. Always resets verification
        /// status to Pending on submission/update.
        /// </summary>
        Task<DriverLicenseStatusResponse> SubmitOrUpdateAsync(
            Guid userId,
            SubmitDriverLicenseRequest request,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Returns the current driver license verification status for the user.
        /// Returns null when the user has not submitted a driver license yet.
        /// </summary>
        Task<DriverLicenseStatusResponse?> GetMyDriverLicenseAsync(
            Guid userId,
            CancellationToken cancellationToken = default);

        // ── Admin operations ────────────────────────────────────────────

        /// <summary>
        /// Paged list of driver license requests for admin review.
        /// Optional <paramref name="status"/> filter accepts
        /// "Pending" | "Verified" | "Rejected" (case-insensitive).
        /// </summary>
        Task<PagedResult<AdminDriverLicenseDto>> GetDriverLicensesForAdminAsync(
            int page,
            int pageSize,
            string? status,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Marks a pending driver license as Verified.
        /// </summary>
        Task<AdminDriverLicenseDto> ApproveDriverLicenseAsync(
            Guid driverLicenseId,
            Guid adminUserId,
            CancellationToken cancellationToken = default);

        /// <summary>
        /// Rejects a pending driver license with the supplied reason.
        /// </summary>
        Task<AdminDriverLicenseDto> RejectDriverLicenseAsync(
            Guid driverLicenseId,
            Guid adminUserId,
            string rejectionReason,
            CancellationToken cancellationToken = default);
    }
}
