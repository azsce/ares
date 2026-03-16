using Backend.Application.DTOs.Payment;
using Backend.Application.Interfaces;
using FluentValidation;

namespace Backend.Application.Validators;

/// <summary>
/// Validator for payment request
/// Validates: Requirements 7.11, 14.1
/// </summary>
public class PaymentRequestValidator : AbstractValidator<PaymentRequest>
{
    private readonly IBookingRepository _bookingRepository;

    public PaymentRequestValidator(IBookingRepository bookingRepository)
    {
        _bookingRepository = bookingRepository;

        RuleFor(x => x.BookingId)
            .NotEmpty().WithMessage("Booking ID is required")
            .MustAsync(BookingExistsAsync).WithMessage("Booking does not exist");

        RuleFor(x => x.Amount)
            .NotEmpty().WithMessage("Amount is required")
            .GreaterThan(0).WithMessage("Amount must be greater than zero")
            .PrecisionScale(18, 2, ignoreTrailingZeros: false).WithMessage("Amount must have at most 2 decimal places");

        RuleFor(x => x.PaymentMethodId)
            .NotEmpty().WithMessage("Payment method ID is required");

        RuleFor(x => x.PaymentMethod)
            .NotEmpty().WithMessage("Payment method is required")
            .MaximumLength(50).WithMessage("Payment method must not exceed 50 characters")
            .Must(BeValidPaymentMethod).WithMessage("Payment method must be one of: credit_card, debit_card, paypal");
    }

    private async Task<bool> BookingExistsAsync(Guid bookingId, CancellationToken cancellationToken)
    {
        return await _bookingRepository.ExistsAsync(bookingId, cancellationToken);
    }

    private bool BeValidPaymentMethod(string paymentMethod)
    {
        var validMethods = new[] { "credit_card", "debit_card", "paypal" };
        return validMethods.Contains(paymentMethod.ToLowerInvariant());
    }
}
