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

        RuleFor(x => x.PickupLocationId)
            .NotEmpty().WithMessage("Pickup location is required");

        RuleFor(x => x.DropOffLocationId)
            .NotEmpty().WithMessage("Drop-off location is required");

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
