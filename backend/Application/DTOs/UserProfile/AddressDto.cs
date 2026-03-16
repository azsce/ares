namespace Backend.Application.DTOs.UserProfile;

/// <summary>
/// DTO for user address information
/// </summary>
public record AddressDto(
    string Street,
    string City,
    string State,
    string PostalCode,
    string Country);
