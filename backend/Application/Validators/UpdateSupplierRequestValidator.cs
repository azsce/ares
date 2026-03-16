using Backend.Application.DTOs.Supplier;
using FluentValidation;

namespace Backend.Application.Validators;

/// <summary>
/// Validator for UpdateSupplierRequest
/// </summary>
public class UpdateSupplierRequestValidator : AbstractValidator<UpdateSupplierRequest>
{
    public UpdateSupplierRequestValidator()
    {
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