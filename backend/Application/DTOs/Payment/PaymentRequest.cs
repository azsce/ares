namespace Backend.Application.DTOs.Payment;

/// <summary>
/// Request DTO for creating a payment transaction.
/// </summary>
/// <param name="BookingId">The ID of the booking to pay for</param>
/// <param name="Amount">The payment amount</param>
/// <param name="PaymentMethodId">The ID of the payment method to use</param>
/// <param name="PaymentMethod">The payment method type (e.g., "credit_card", "debit_card", "paypal")</param>
public record PaymentRequest(
    Guid BookingId,
    decimal Amount,
    Guid PaymentMethodId,
    string PaymentMethod
);
