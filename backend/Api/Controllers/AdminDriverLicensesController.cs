using Backend.Application.DTOs.Common;
using Backend.Application.DTOs.DriverLicense;
using Backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Api.Controllers
{
    /// <summary>
    /// Admin-only endpoints for reviewing user driver license submissions.
    /// Mirrors the route shape of <see cref="AdminVerificationsController"/>
    /// so the admin verification UI can reuse the same patterns through
    /// dedicated tabs.
    /// </summary>
    [ApiController]
    [Route("api/admin/driver-licenses")]
    [Authorize(Roles = "Admin")]
    public class AdminDriverLicensesController : ControllerBase
    {
        private readonly IDriverLicenseService _driverLicenseService;
        private readonly ILogger<AdminDriverLicensesController> _logger;

        public AdminDriverLicensesController(
            IDriverLicenseService driverLicenseService,
            ILogger<AdminDriverLicensesController> logger)
        {
            _driverLicenseService = driverLicenseService;
            _logger = logger;
        }

        /// <summary>
        /// List driver license requests for admin review with paging and an
        /// optional status filter (`Pending` | `Verified` | `Rejected`).
        /// </summary>
        [HttpGet]
        [ProducesResponseType(typeof(PagedResult<AdminDriverLicenseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<PagedResult<AdminDriverLicenseDto>>> GetDriverLicenses(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? status = null,
            CancellationToken cancellationToken = default)
        {
            _logger.LogInformation(
                "Admin listing driver licenses - Page: {Page}, Size: {Size}, Status: {Status}",
                page, pageSize, status ?? "<all>");

            var result = await _driverLicenseService.GetDriverLicensesForAdminAsync(
                page, pageSize, status, cancellationToken);

            return Ok(result);
        }

        /// <summary>
        /// Approve a pending driver license request.
        /// </summary>
        [HttpPatch("{id}/approve")]
        [ProducesResponseType(typeof(AdminDriverLicenseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<AdminDriverLicenseDto>> ApproveDriverLicense(
            Guid id,
            CancellationToken cancellationToken = default)
        {
            var adminId = TryGetAdminId();
            if (adminId == null)
            {
                return Unauthorized();
            }

            _logger.LogInformation(
                "Admin {AdminId} approving driver license {DriverLicenseId}", adminId, id);

            var result = await _driverLicenseService.ApproveDriverLicenseAsync(
                id, adminId.Value, cancellationToken);

            return Ok(result);
        }

        /// <summary>
        /// Reject a pending driver license request. Requires a rejection reason.
        /// </summary>
        [HttpPatch("{id}/reject")]
        [ProducesResponseType(typeof(AdminDriverLicenseDto), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<AdminDriverLicenseDto>> RejectDriverLicense(
            Guid id,
            [FromBody] RejectDriverLicenseRequest request,
            CancellationToken cancellationToken = default)
        {
            var adminId = TryGetAdminId();
            if (adminId == null)
            {
                return Unauthorized();
            }

            if (request == null)
            {
                return BadRequest(new { Message = "Rejection reason is required." });
            }

            _logger.LogInformation(
                "Admin {AdminId} rejecting driver license {DriverLicenseId}", adminId, id);

            var result = await _driverLicenseService.RejectDriverLicenseAsync(
                id, adminId.Value, request.RejectionReason, cancellationToken);

            return Ok(result);
        }

        private Guid? TryGetAdminId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim == null) return null;
            return Guid.TryParse(idClaim.Value, out var id) ? id : null;
        }
    }
}
