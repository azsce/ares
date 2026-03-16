using Backend.Application.DTOs.Common;
using Backend.Application.DTOs.Supplier;
using Backend.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Api.Controllers;

/// <summary>
/// Controller for supplier management operations
/// Validates: Requirements 13.1, 13.2, 13.3, 13.4
/// </summary>
[ApiController]
[Route("api/suppliers")]
[Authorize(Roles = "Admin")]
public class SuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;
    private readonly ILogger<SuppliersController> _logger;

    public SuppliersController(
        ISupplierService supplierService,
        ILogger<SuppliersController> logger)
    {
        _supplierService = supplierService;
        _logger = logger;
    }

    /// <summary>
    /// Get paginated list of suppliers (Admin only)
    /// Validates: Requirements 13.1
    /// </summary>
    /// <param name="page">Page number</param>
    /// <param name="size">Page size</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of suppliers</returns>
    [HttpPost("{page}/{size}")]
    [ProducesResponseType(typeof(PagedResult<SupplierManagementDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PagedResult<SupplierManagementDto>>> GetSuppliers(
        int page,
        int size,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Admin requesting paginated suppliers list - Page: {Page}, Size: {Size}", page, size);

        var result = await _supplierService.GetSuppliersAsync(page, size, cancellationToken);

        _logger.LogInformation(
            "Successfully retrieved {Count} suppliers from page {Page} of {TotalPages}",
            result.Data.Count,
            page,
            result.TotalPages);

        return Ok(result);
    }

    /// <summary>
    /// Get supplier by ID (Admin only)
    /// Validates: Requirements 13.2
    /// </summary>
    /// <param name="id">Supplier ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Supplier details if found</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(SupplierManagementDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<SupplierManagementDto>> GetSupplier(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Admin requesting supplier details for ID: {SupplierId}", id);

        var supplier = await _supplierService.GetSupplierByIdAsync(id, cancellationToken);
        if (supplier == null)
        {
            _logger.LogWarning("Supplier {SupplierId} not found", id);
            return NotFound(new { Message = $"Supplier with ID {id} not found" });
        }

        _logger.LogInformation("Successfully retrieved supplier {SupplierId}", id);
        return Ok(supplier);
    }
}

/// <summary>
/// Controller for admin supplier management operations
/// </summary>
[ApiController]
[Route("api/admin/suppliers")]
[Authorize(Roles = "Admin")]
public class AdminSuppliersController : ControllerBase
{
    private readonly ISupplierService _supplierService;
    private readonly ILogger<AdminSuppliersController> _logger;

    public AdminSuppliersController(
        ISupplierService supplierService,
        ILogger<AdminSuppliersController> logger)
    {
        _supplierService = supplierService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new supplier account (Admin only)
    /// Validates: Requirements 13.3
    /// </summary>
    /// <param name="request">Supplier creation request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Supplier creation response</returns>
    [HttpPost("create")]
    [ProducesResponseType(typeof(SupplierManagementResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SupplierManagementResponse>> CreateSupplier(
        [FromBody] CreateSupplierRequest request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Admin creating new supplier with email: {Email}", request.Email);

        var response = await _supplierService.CreateSupplierAsync(request, cancellationToken);

        _logger.LogInformation("Successfully created supplier {SupplierId} with email {Email}", response.SupplierId, request.Email);

        return CreatedAtAction(
            nameof(SuppliersController.GetSupplier),
            "Suppliers",
            new { id = response.SupplierId },
            response);
    }

    /// <summary>
    /// Update an existing supplier account (Admin only)
    /// Validates: Requirements 13.4
    /// </summary>
    /// <param name="id">Supplier ID to update</param>
    /// <param name="request">Supplier update request</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Supplier update response</returns>
    [HttpPut("{id}/edit")]
    [ProducesResponseType(typeof(SupplierManagementResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<SupplierManagementResponse>> UpdateSupplier(
        Guid id,
        [FromBody] UpdateSupplierRequest request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Admin updating supplier {SupplierId}", id);

        var response = await _supplierService.UpdateSupplierAsync(id, request, cancellationToken);

        _logger.LogInformation("Successfully updated supplier {SupplierId}", id);

        return Ok(response);
    }
}