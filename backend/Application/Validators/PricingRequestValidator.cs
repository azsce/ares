using Backend.Application.DTOs.Vehicle;
using FluentValidation;

namespace Backend.Application.Validators;

/// <summary>
/// Validator for vehicle pricing calculation requests
/// </summary>
public class PricingRequestValidator : AbstractValidator<PricingRequest>
{
    public PricingRequestValidator()
    {
        RuleFor(x => x.PickupDate)
            .NotEmpty().WithMessage("Pickup date is required")
            .GreaterThanOrEqualTo(DateTime.Today).WithMessage("Pickup date must be today or in the future");

        RuleFor(x => x.ReturnDate)
            .NotEmpty().WithMessage("Return date is required")
            .GreaterThan(x => x.PickupDate).WithMessage("Return date must be after pickup date");

        RuleFor(x => x.Currency)
            .MaximumLength(3).When(x => !string.IsNullOrWhiteSpace(x.Currency))
            .WithMessage("Currency code must be 3 characters");
    }
}
