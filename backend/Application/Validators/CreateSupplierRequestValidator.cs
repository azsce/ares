using Backend.Application.DTOs.Supplier;
using FluentValidation;

namespace Backend.Application.Validators;

/// <summary>
/// Validator for CreateSupplierRequest
/// </summary>
public class CreateSupplierRequestValidator : AbstractValidator<CreateSupplierRequest>
{
    public CreateSupplierRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required")
            .EmailAddress().WithMessage("Invalid email format")
            .MaximumLength(256).WithMessage("Email must not exceed 256 characters");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters")
            .MaximumLength(100).WithMessage("Password must not exceed 100 characters")
            .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)").WithMessage("Password must contain at least one lowercase letter, one uppercase letter, and one digit");

        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required")
            .MaximumLength(100).WithMessage("First name must not exceed 100 characters");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required")
            .MaximumLength(100).WithMessage("Last name must not exceed 100 characters");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters")
            .Matches(@"^\+?[1-9]\d{1,14}$").WithMessage("Phone number must be in valid international format")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber));

        RuleFor(x => x.Status)
            .MaximumLength(50).WithMessage("Status must not exceed 50 characters")
            .When(x => !string.IsNullOrEmpty(x.Status));

        RuleFor(x => x.CompanyName)
            .NotEmpty().WithMessage("Company name is required")
            .MaximumLength(255).WithMessage("Company name must not exceed 255 characters")
            .Matches(@"^[a-zA-Z0-9\s\-\.\,\&]+$").WithMessage("Company name contains invalid characters");

        RuleFor(x => x.CommercialRegistrationNumber)
            .MaximumLength(100).WithMessage("Commercial registration number must not exceed 100 characters")
            .Matches(@"^[a-zA-Z0-9\-]+$").WithMessage("Commercial registration number can only contain letters, numbers, and hyphens")
            .When(x => !string.IsNullOrEmpty(x.CommercialRegistrationNumber));

        RuleFor(x => x.TaxId)
            .MaximumLength(100).WithMessage("Tax ID must not exceed 100 characters")
            .Matches(@"^[a-zA-Z0-9\-]+$").WithMessage("Tax ID can only contain letters, numbers, and hyphens")
            .When(x => !string.IsNullOrEmpty(x.TaxId));
    }
}