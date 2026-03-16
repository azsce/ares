namespace Backend.Application.DTOs.Payment;

/// <summary>
/// Response DTO for payment creation.
/// </summary>
/// <param name="TransactionId">The unique identifier of the payment transaction</param>
/// <param name="Status">The payment status (e.g., "pending", "completed", "failed")</param>
/// <param name="Message">A message describing the payment result</param>
public record PaymentResponse(
    Guid TransactionId,
    string Status,
    string Message
);
