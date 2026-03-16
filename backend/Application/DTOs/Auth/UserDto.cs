namespace Backend.Application.DTOs.Auth;

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    List<string> Roles,
    bool EmailVerified
);
