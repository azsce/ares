namespace Backend.Application.DTOs.Auth;

public record AuthResponse(
    Guid UserId,
    string Email,
    bool EmailVerified,
    string Message
);
