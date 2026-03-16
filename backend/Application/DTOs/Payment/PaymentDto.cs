namespace Backend.Application.DTOs.Payment;

/// <summary>
/// DTO for payment transaction data transfer.
/// </summary>
/// <param name="TransactionId">The unique identifier of the payment transaction</param>
/// <param name="BookingId">The ID of the associated booking</param>
/// <param name="Amount">The payment amount</param>
/// <param name="Currency">The currency code (e.g., "USD", "EUR")</param>
/// <param name="PaymentMethod">The payment method used</param>
/// <param name="Status">The payment status</param>
/// <param name="CreatedAt">The timestamp when the payment was created</param>
public record PaymentDto(
    Guid TransactionId,
    Guid BookingId,
    decimal Amount,
    string Currency,
    string PaymentMethod,
    string Status,
    DateTime CreatedAt
);
