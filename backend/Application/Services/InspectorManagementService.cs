using Backend.Application.DTOs.Inspector;
using Backend.Application.Exceptions;
using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Backend.Domain.Entities.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Backend.Application.Services;

/// <summary>
/// Default implementation of <see cref="IInspectorManagementService"/>.
/// Uses Identity's <see cref="UserManager{TUser}"/> for credentials and
/// directly persists the <see cref="Inspector"/> profile via the generic
/// repository.
/// </summary>
public class InspectorManagementService : IInspectorManagementService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly IRepository<Inspector> _inspectorRepository;
    private readonly IRepository<VehicleInspection> _inspectionRepository;
    private readonly ILogger<InspectorManagementService> _logger;

    private const string InspectorRole = "Inspector";
    private const int RecentInspectionLimit = 10;

    public InspectorManagementService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        IRepository<Inspector> inspectorRepository,
        IRepository<VehicleInspection> inspectionRepository,
        ILogger<InspectorManagementService> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _inspectorRepository = inspectorRepository;
        _inspectionRepository = inspectionRepository;
        _logger = logger;
    }

    public async Task<IReadOnlyList<InspectorDto>> GetAllAsync(
        bool? activeOnly = null,
        CancellationToken cancellationToken = default)
    {
        var inspectors = await _inspectorRepository.GetAllAsync(cancellationToken);
        var filtered = activeOnly == true
            ? inspectors.Where(i => i.IsActive)
            : inspectors;

        var dtos = new List<InspectorDto>();
        foreach (var inspector in filtered)
        {
            var user = await _userManager.FindByIdAsync(inspector.UserId.ToString());
            if (user == null) continue;
            dtos.Add(ToDto(inspector, user));
        }

        return dtos
            .OrderByDescending(d => d.CreatedAt)
            .ToList();
    }

    public async Task<InspectorDetailsDto?> GetByIdAsync(
        Guid inspectorId,
        CancellationToken cancellationToken = default)
    {
        var inspector = await _inspectorRepository.GetByIdAsync(inspectorId, cancellationToken);
        if (inspector == null) return null;

        var user = await _userManager.FindByIdAsync(inspector.UserId.ToString());
        if (user == null) return null;

        // Pull all inspections for this inspector once and slice in-memory.
        // Volume per inspector is expected to be moderate; if it grows we
        // can move this to a dedicated repository method.
        var inspections = (await _inspectionRepository.GetAllAsync(cancellationToken))
            .Where(i => i.InspectorId == inspector.UserId)
            .OrderByDescending(i => i.SubmittedAt ?? i.InspectionDate)
            .ToList();

        int Count(InspectionStatus s) => inspections.Count(i => i.Status == s);

        var recent = inspections
            .Take(RecentInspectionLimit)
            .Select(i => new InspectorRecentInspectionDto(
                i.InspectionId,
                i.BookingId,
                i.Booking?.BookingNumber,
                i.Status.ToString(),
                i.InspectionDate,
                i.SubmittedAt))
            .ToList();

        return new InspectorDetailsDto(
            ToDto(inspector, user),
            AssignedCount: inspections.Count,
            PendingCount: Count(InspectionStatus.Pending),
            ApprovedCount: Count(InspectionStatus.Approved),
            RejectedCount: Count(InspectionStatus.Rejected),
            RecentInspections: recent);
    }

    public async Task<InspectorDto> CreateAsync(
        CreateInspectorRequest request,
        CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Admin creating new inspector account for {Email}", request.Email);

        // Ensure Inspector role exists (defensive: DbInitializer normally
        // seeds it, but a clean dev DB may skip seeding).
        if (!await _roleManager.RoleExistsAsync(InspectorRole))
        {
            var roleCreate = await _roleManager.CreateAsync(new IdentityRole<Guid>(InspectorRole));
            if (!roleCreate.Succeeded)
            {
                throw new InvalidOperationException(
                    $"Unable to create '{InspectorRole}' role: " +
                    string.Join(", ", roleCreate.Errors.Select(e => e.Description)));
            }
        }

        // Email uniqueness across the whole users table.
        var existingByEmail = await _userManager.FindByEmailAsync(request.Email);
        if (existingByEmail != null)
        {
            throw new ConflictException("A user with this email address already exists");
        }

        // Employee code uniqueness across inspectors.
        var existingByCode = (await _inspectorRepository.GetAllAsync(cancellationToken))
            .Any(i => string.Equals(i.EmployeeCode, request.EmployeeCode, StringComparison.OrdinalIgnoreCase));
        if (existingByCode)
        {
            throw new ConflictException("An inspector with this employee code already exists");
        }

        var user = new ApplicationUser
        {
            Id = Guid.NewGuid(),
            UserName = request.Email,
            Email = request.Email,
            EmailConfirmed = true,           // admin-provisioned accounts skip email verification
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            PhoneNumberConfirmed = !string.IsNullOrWhiteSpace(request.PhoneNumber),
            Status = "Active",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            LanguagePreference = "en",
            CurrencyPreference = "USD"
        };

        var createResult = await _userManager.CreateAsync(user, request.Password);
        if (!createResult.Succeeded)
        {
            throw new ValidationException(
                createResult.Errors.ToDictionary(e => e.Code, e => new[] { e.Description }));
        }

        var roleResult = await _userManager.AddToRoleAsync(user, InspectorRole);
        if (!roleResult.Succeeded)
        {
            _logger.LogError(
                "Failed to assign Inspector role to {UserId}: {Errors}",
                user.Id,
                string.Join(", ", roleResult.Errors.Select(e => e.Description)));
            throw new ValidationException(
                roleResult.Errors.ToDictionary(e => e.Code, e => new[] { e.Description }));
        }

        var inspector = new Inspector
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            EmployeeCode = request.EmployeeCode,
            IsAvailable = request.IsAvailable,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _inspectorRepository.AddAsync(inspector, cancellationToken);
        await _inspectorRepository.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Inspector account provisioned. InspectorId={InspectorId}, UserId={UserId}, EmployeeCode={EmployeeCode}",
            inspector.Id, user.Id, inspector.EmployeeCode);

        return ToDto(inspector, user);
    }

    public async Task<InspectorDto> UpdateStatusAsync(
        Guid inspectorId,
        UpdateInspectorStatusRequest request,
        CancellationToken cancellationToken = default)
    {
        var inspector = await _inspectorRepository.GetByIdAsync(inspectorId, cancellationToken)
            ?? throw new NotFoundException("Inspector", inspectorId);

        inspector.IsActive = request.IsActive;
        if (request.IsAvailable.HasValue)
        {
            inspector.IsAvailable = request.IsAvailable.Value;
        }
        inspector.UpdatedAt = DateTime.UtcNow;

        await _inspectorRepository.UpdateAsync(inspector, cancellationToken);
        await _inspectorRepository.SaveChangesAsync(cancellationToken);

        var user = await _userManager.FindByIdAsync(inspector.UserId.ToString())
            ?? throw new NotFoundException("Inspector user", inspector.UserId);

        // Mirror the active flag onto the underlying account so disabled
        // inspectors cannot authenticate.
        var desiredStatus = inspector.IsActive ? "Active" : "Disabled";
        if (!string.Equals(user.Status, desiredStatus, StringComparison.Ordinal))
        {
            user.Status = desiredStatus;
            user.UpdatedAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);
        }

        return ToDto(inspector, user);
    }

    // ─── helpers ─────────────────────────────────────────────────────────
    private static InspectorDto ToDto(Inspector inspector, ApplicationUser user) =>
        new(
            InspectorId: inspector.Id,
            UserId: user.Id,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Email: user.Email ?? string.Empty,
            PhoneNumber: user.PhoneNumber,
            EmployeeCode: inspector.EmployeeCode,
            IsAvailable: inspector.IsAvailable,
            IsActive: inspector.IsActive,
            CreatedAt: inspector.CreatedAt);
}
