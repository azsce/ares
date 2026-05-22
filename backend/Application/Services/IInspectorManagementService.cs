using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Backend.Application.DTOs.Inspector;

namespace Backend.Application.Services;

/// <summary>
/// Admin-facing operations for managing the pool of vehicle inspectors.
/// Inspectors are normal <see cref="Backend.Domain.Entities.ApplicationUser"/>
/// records with the "Inspector" role; this service owns the lifecycle
/// (provisioning, enable/disable, listing) and exposes workload aggregates
/// used by the admin dashboard.
/// </summary>
public interface IInspectorManagementService
{
    Task<IReadOnlyList<InspectorDto>> GetAllAsync(
        bool? activeOnly = null,
        CancellationToken cancellationToken = default);

    Task<InspectorDetailsDto?> GetByIdAsync(
        Guid inspectorId,
        CancellationToken cancellationToken = default);

    Task<InspectorDto> CreateAsync(
        CreateInspectorRequest request,
        CancellationToken cancellationToken = default);

    Task<InspectorDto> UpdateStatusAsync(
        Guid inspectorId,
        UpdateInspectorStatusRequest request,
        CancellationToken cancellationToken = default);
}
