namespace Backend.Application.DTOs.Location;

public record LocationSuggestionDto(
    Guid LocationId,
    string DisplayText,
    string Address,
    string LocationType,
    double? Distance,
    bool IsLandmark);
