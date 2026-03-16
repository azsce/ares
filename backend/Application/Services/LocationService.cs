using Backend.Application.DTOs.Common;
using Backend.Application.DTOs.Location;
using Backend.Application.Interfaces;
using Backend.Domain.Entities;

namespace Backend.Application.Services;

public class LocationService : ILocationService
{
    private readonly ILocationRepository _locationRepository;

    public LocationService(ILocationRepository locationRepository)
    {
        _locationRepository = locationRepository;
    }

    public async Task<IEnumerable<LocationSuggestionDto>> AutocompleteAsync(
        string query,
        string? type,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(query) || query.Length < 3)
        {
            return Enumerable.Empty<LocationSuggestionDto>();
        }

        var locations = await _locationRepository.AutocompleteAsync(query, cancellationToken);

        return locations.Select(location => new LocationSuggestionDto(
            LocationId: location.Id,
            DisplayText: BuildDisplayText(location),
            Address: BuildAddress(location),
            LocationType: DetermineLocationType(location),
            Distance: null,
            IsLandmark: false
        ));
    }

    public async Task<PagedResult<LocationDto>> GetLocationsAsync(
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var pagedResult = await _locationRepository.GetPagedAsync(
            page,
            pageSize,
            filter: null,
            orderBy: q => q.OrderBy(l => l.City).ThenBy(l => l.AddressLine),
            cancellationToken);

        var locationDtos = pagedResult.Data.Select(location => new LocationDto(
            Id: location.Id,
            AddressLine: location.AddressLine,
            City: location.City,
            Governorate: location.Governorate,
            Country: location.Country,
            PostalCode: location.PostalCode,
            Latitude: location.Latitude,
            Longitude: location.Longitude,
            IsPrimary: location.IsPrimary,
            CreatedAt: location.CreatedAt,
            UpdatedAt: location.UpdatedAt
        )).ToList();

        return new PagedResult<LocationDto>(
            Data: locationDtos,
            Page: pagedResult.Page,
            PageSize: pagedResult.PageSize,
            TotalCount: pagedResult.TotalCount,
            TotalPages: pagedResult.TotalPages);
    }

    public async Task<LocationDto> CreateLocationAsync(
        CreateLocationRequest request,
        CancellationToken cancellationToken = default)
    {
        var location = new UserAddress
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            AddressLine = request.AddressLine,
            City = request.City,
            Governorate = request.Governorate,
            Country = request.Country,
            PostalCode = request.PostalCode,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            IsPrimary = request.IsPrimary
        };

        var createdLocation = await _locationRepository.AddAsync(location, cancellationToken);
        await _locationRepository.SaveChangesAsync(cancellationToken);

        return new LocationDto(
            Id: createdLocation.Id,
            AddressLine: createdLocation.AddressLine,
            City: createdLocation.City,
            Governorate: createdLocation.Governorate,
            Country: createdLocation.Country,
            PostalCode: createdLocation.PostalCode,
            Latitude: createdLocation.Latitude,
            Longitude: createdLocation.Longitude,
            IsPrimary: createdLocation.IsPrimary,
            CreatedAt: createdLocation.CreatedAt,
            UpdatedAt: createdLocation.UpdatedAt);
    }

    public async Task<LocationDto> UpdateLocationAsync(
        Guid locationId,
        UpdateLocationRequest request,
        CancellationToken cancellationToken = default)
    {
        var location = await _locationRepository.GetByIdAsync(locationId, cancellationToken);
        if (location == null)
        {
            throw new ArgumentException($"Location with ID {locationId} not found.", nameof(locationId));
        }

        // Update location properties
        location.AddressLine = request.AddressLine;
        location.City = request.City;
        location.Governorate = request.Governorate;
        location.Country = request.Country;
        location.PostalCode = request.PostalCode;
        location.Latitude = request.Latitude;
        location.Longitude = request.Longitude;
        location.IsPrimary = request.IsPrimary;

        await _locationRepository.UpdateAsync(location, cancellationToken);
        await _locationRepository.SaveChangesAsync(cancellationToken);

        return new LocationDto(
            Id: location.Id,
            AddressLine: location.AddressLine,
            City: location.City,
            Governorate: location.Governorate,
            Country: location.Country,
            PostalCode: location.PostalCode,
            Latitude: location.Latitude,
            Longitude: location.Longitude,
            IsPrimary: location.IsPrimary,
            CreatedAt: location.CreatedAt,
            UpdatedAt: location.UpdatedAt);
    }

    private static string BuildDisplayText(Domain.Entities.UserAddress location)
    {
        var parts = new List<string>();

        if (!string.IsNullOrWhiteSpace(location.City))
            parts.Add(location.City);

        if (!string.IsNullOrWhiteSpace(location.Governorate))
            parts.Add(location.Governorate);

        if (!string.IsNullOrWhiteSpace(location.Country))
            parts.Add(location.Country);

        return parts.Count > 0 ? string.Join(", ", parts) : "Unknown Location";
    }

    private static string BuildAddress(Domain.Entities.UserAddress location)
    {
        var parts = new List<string>();

        if (!string.IsNullOrWhiteSpace(location.AddressLine))
            parts.Add(location.AddressLine);

        if (!string.IsNullOrWhiteSpace(location.City))
            parts.Add(location.City);

        if (!string.IsNullOrWhiteSpace(location.Governorate))
            parts.Add(location.Governorate);

        if (!string.IsNullOrWhiteSpace(location.Country))
            parts.Add(location.Country);

        if (!string.IsNullOrWhiteSpace(location.PostalCode))
            parts.Add(location.PostalCode);

        return parts.Count > 0 ? string.Join(", ", parts) : string.Empty;
    }

    private static string DetermineLocationType(Domain.Entities.UserAddress location)
    {
        if (location.IsPrimary)
            return "primary";

        return "address";
    }
}
