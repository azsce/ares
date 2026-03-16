using Backend.Application.DTOs.Review;
using FluentValidation;

namespace Backend.Application.Validators;

/// <summary>
/// Validator for review creation requests
/// Validates: Requirements 8.3, 14.1
/// </summary>
public class CreateReviewRequestValidator : AbstractValidator<CreateReviewRequest>
{
    public CreateReviewRequestValidator()
    {
        RuleFor(x => x.VehicleId)
            .NotEmpty().WithMessage("Vehicle ID is required");

        RuleFor(x => x.BookingId)
            .NotEmpty().WithMessage("Booking ID is required");

        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5");

        RuleFor(x => x.Comment)
            .MaximumLength(1000).WithMessage("Review comment must not exceed 1000 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.Comment));
    }
}
