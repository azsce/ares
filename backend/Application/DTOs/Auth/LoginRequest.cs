namespace Backend.Application.DTOs.Auth;

public record LoginRequest(
    string Email,
    string Password,
    bool? StayConnected
);
