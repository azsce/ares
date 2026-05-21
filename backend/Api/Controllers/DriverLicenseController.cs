using Backend.Application.DTOs.DriverLicense;
using Backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Api.Controllers
{
    /// <summary>
    /// Driver License Verification — submission and status endpoints for the
    /// authenticated user. Admin review endpoints live in
    /// <see cref="AdminDriverLicensesController"/> under
    /// <c>/api/admin/driver-licenses</c>.
    /// </summary>
    [ApiController]
    [Route("api/driver-license")]
    [Authorize]
    public class DriverLicenseController : ControllerBase
    {
        private readonly IDriverLicenseService _driverLicenseService;
        private readonly ILogger<DriverLicenseController> _logger;

        public DriverLicenseController(
            IDriverLicenseService driverLicenseService,
            ILogger<DriverLicenseController> logger)
        {
            _driverLicenseService = driverLicenseService;
            _logger = logger;
        }

        /// <summary>
        /// Submit (create or update) the authenticated user's driver license.
        /// The license image is uploaded as multipart/form-data. Any submission
        /// resets the verification status to unverified.
        /// </summary>
        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(15 * 1024 * 1024)] // 15MB hard ceiling for the request
        [ProducesResponseType(typeof(DriverLicenseStatusResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<DriverLicenseStatusResponse>> SubmitOrUpdate(
            [FromForm] SubmitDriverLicenseRequest request,
            CancellationToken cancellationToken)
        {
            var userIdResult = TryGetUserId();
            if (userIdResult is null)
            {
                return Unauthorized();
            }

            _logger.LogInformation(
                "User {UserId} submitting driver license", userIdResult.Value);

            var result = await _driverLicenseService.SubmitOrUpdateAsync(
                userIdResult.Value, request, cancellationToken);

            return Ok(result);
        }

        /// <summary>
        /// Get the authenticated user's current driver license verification
        /// status, expiry date, image URL and submitted data. Returns 404
        /// when the user has not submitted a driver license yet.
        /// </summary>
        [HttpGet("me")]
        [ProducesResponseType(typeof(DriverLicenseStatusResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DriverLicenseStatusResponse>> GetMine(
            CancellationToken cancellationToken)
        {
            var userIdResult = TryGetUserId();
            if (userIdResult is null)
            {
                return Unauthorized();
            }

            var result = await _driverLicenseService.GetMyDriverLicenseAsync(
                userIdResult.Value, cancellationToken);

            if (result == null)
            {
                return NotFound(new
                {
                    Message = "No driver license has been submitted for this user."
                });
            }

            return Ok(result);
        }

        private Guid? TryGetUserId()
        {
            var claim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (claim == null) return null;
            return Guid.TryParse(claim.Value, out var id) ? id : null;
        }
    }
}
