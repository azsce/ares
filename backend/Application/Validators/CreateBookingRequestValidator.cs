using Backend.Application.DTOs.Booking;
using Backend.Application.Interfaces;
using FluentValidation;

namespace Backend.Application.Validators;

/// <summary>
/// Validator for booking creation requests
/// Validates: Requirements 4.4, 14.1
/// </summary>
public class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
{
    private readonly IVehicleRepository _vehicleRepository;

    public CreateBookingRequestValidator(IVehicleRepository vehicleRepository)
    {
        _vehicleRepository = vehicleRepository;

        RuleFor(x => x.VehicleId)
            .NotEmpty().WithMessage("Vehicle ID is required")
            .MustAsync(VehicleExistsAsync).WithMessage("Vehicle does not exist");

        // Location fields are now stored as free-text on the entity. A label
        // OR a legacy non-empty Id is acceptable. We only require that at
        // least one form of pickup/dropoff location is supplied.
        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.PickupLocation) || x.PickupLocationId != Guid.Empty)
            .WithMessage("Pickup location is required")
            .WithName("PickupLocation");

        RuleFor(x => x)
            .Must(x => !string.IsNullOrWhiteSpace(x.DropOffLocation) || x.DropOffLocationId != Guid.Empty)
            .WithMessage("Drop-off location is required")
            .WithName("DropOffLocation");

        RuleFor(x => x.PickupDate)
            .NotEmpty().WithMessage("Pickup date is required")
            .GreaterThanOrEqualTo(DateTime.Today).WithMessage("Pickup date must be today or in the future");

        RuleFor(x => x.ReturnDate)
            .NotEmpty().WithMessage("Return date is required")
            .GreaterThan(x => x.PickupDate).WithMessage("Return date must be after pickup date");

        RuleFor(x => x)
            .MustAsync(VehicleIsAvailableAsync)
            .WithMessage("Vehicle is not available for the selected dates")
            .When(x => x.VehicleId != Guid.Empty && x.PickupDate < x.ReturnDate);
    }

    private async Task<bool> VehicleExistsAsync(Guid vehicleId, CancellationToken cancellationToken)
    {
        return await _vehicleRepository.ExistsAsync(vehicleId, cancellationToken);
    }

    private async Task<bool> VehicleIsAvailableAsync(CreateBookingRequest request, CancellationToken cancellationToken)
    {
        return await _vehicleRepository.IsAvailableAsync(
            request.VehicleId,
            request.PickupDate,
            request.ReturnDate,
            cancellationToken);
    }
}
