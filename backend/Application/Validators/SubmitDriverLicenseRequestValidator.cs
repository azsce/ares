using Backend.Application.DTOs.DriverLicense;
using FluentValidation;

namespace Backend.Application.Validators;

/// <summary>
/// Validator for driver license submission requests. The service layer also
/// re-validates these fields defensively, but this validator catches errors
/// at the API boundary so callers get standard FluentValidation messages.
/// </summary>
public class SubmitDriverLicenseRequestValidator
    : AbstractValidator<SubmitDriverLicenseRequest>
{
    public SubmitDriverLicenseRequestValidator()
    {
        RuleFor(x => x.LicenseNumber)
            .NotEmpty().WithMessage("License number is required.")
            .MinimumLength(3).WithMessage("License number must be at least 3 characters.")
            .MaximumLength(50).WithMessage("License number must not exceed 50 characters.");

        RuleFor(x => x.LicenseExpiryDate)
            .NotEmpty().WithMessage("License expiry date is required.")
            .Must(BeAFutureDate).WithMessage("License expiry date must be in the future.");

        RuleFor(x => x.LicenseImage)
            .NotNull().WithMessage("License image is required.")
            .Must(file => file != null && file.Length > 0)
                .WithMessage("License image cannot be empty.")
            .Must(file => file == null || file.Length <= 10 * 1024 * 1024)
                .WithMessage("License image exceeds the maximum allowed size of 10MB.");
    }

    private static bool BeAFutureDate(DateTime date)
    {
        if (date == default) return false;
        return date.ToUniversalTime().Date > DateTime.UtcNow.Date;
    }
}
