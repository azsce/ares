namespace Backend.Application.DTOs.Auth;

public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    bool AcceptedTerms,
    bool AcceptedPrivacy
);
