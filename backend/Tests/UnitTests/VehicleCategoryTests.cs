using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Backend.Infrastructure.Data;
using Backend.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace Backend.Tests.UnitTests;

public class VehicleCategoryTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly Guid _locationId;
    private readonly Guid _userId;
    private readonly string _testCity = "Cairo";

    public VehicleCategoryTests()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new ApplicationDbContext(options);
        _vehicleRepository = new VehicleRepository(_context);
        _context.Database.EnsureCreated();

        // Setup user
        _userId = Guid.NewGuid();
        var user = new ApplicationUser
        {
            Id = _userId,
            Email = $"test{_userId}@example.com",
            FirstName = "Test",
            LastName = "User",
            UserName = $"test{_userId}@example.com"
        };
        _context.Users.Add(user);

        // Setup location
        _locationId = Guid.NewGuid();
        var address = new UserAddress
        {
            Id = _locationId,
            City = _testCity,
            Governorate = "Cairo Governorate",
            Country = "Egypt",
            AddressLine = "Test Address",
            PostalCode = "12345",
            UserId = _userId,
            IsPrimary = true
        };
        _context.UserAddresses.Add(address);
        _context.SaveChanges();
    }

    private Vehicle CreateBaseVehicle(string model, int seats, decimal price, string description = "")
    {
        return new Vehicle
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            Make = "TestMake",
            Model = model,
            Year = 2024,
            Color = "Black",
            LicensePlate = "Plate-" + Guid.NewGuid().ToString().Substring(0, 5),
            Transmission = "Automatic",
            FuelType = "Gasoline",
            Seats = seats,
            PricePerDay = price,
            LocationCity = _testCity,
            Description = description,
            Status = "available",
            AvailabilityStatus = "Available",
            IsActive = true,
            ApprovedAt = DateTime.UtcNow
        };
    }

    [Fact]
    public async Task CompactMiniFilter_ShouldIncludeNormal4Seats_ButExcludeSuvAndLarge()
    {
        // Arrange
        // 1. Normal 4-seat vehicle (Should match Compact)
        var normalCompact = CreateBaseVehicle("Compact Sedan", seats: 4, price: 40);

        // 2. 4-seat SUV/Crossover (Should NOT match Compact)
        var crossoverSuv = CreateBaseVehicle("Kona SUV", seats: 4, price: 90, description: "A compact crossover SUV");

        // 3. Large 4-seat wagon (Should NOT match Compact)
        var largeWagon = CreateBaseVehicle("Large Wagon", seats: 4, price: 70, description: "Spacious estate wagon");

        _context.Vehicles.AddRange(normalCompact, crossoverSuv, largeWagon);
        await _context.SaveChangesAsync();

        // Step-by-step debugging assertions
        var addressesInDb = await _context.UserAddresses.ToListAsync();
        Assert.Single(addressesInDb);
        Assert.Equal(_locationId, addressesInDb[0].Id);
        Assert.Equal(_testCity, addressesInDb[0].City);

        var vehiclesInDb = await _context.Vehicles.ToListAsync();
        Assert.Equal(3, vehiclesInDb.Count);
        Assert.All(vehiclesInDb, v => Assert.True(v.IsActive));
        Assert.All(vehiclesInDb, v => Assert.Equal("Available", v.AvailabilityStatus));
        Assert.All(vehiclesInDb, v => Assert.Equal(_testCity, v.LocationCity));

        var locationRecords = await _context.UserAddresses
            .Where(address => address.Id == _locationId)
            .Select(address => new { address.City, address.Governorate, address.Country })
            .ToListAsync();
        var locationTerms = locationRecords
            .SelectMany(address => new[] { address.City, address.Governorate, address.Country })
            .Where(term => !string.IsNullOrWhiteSpace(term))
            .Select(term => term!.Trim().ToLowerInvariant())
            .Distinct()
            .ToList();
        Assert.Contains(_testCity.ToLowerInvariant(), locationTerms);

        var directQueryVehicles = await _context.Vehicles
            .Where(v => v.IsActive && v.AvailabilityStatus == "Available")
            .Where(v => v.LocationCity != null && locationTerms.Contains(v.LocationCity.Trim().ToLower()))
            .ToListAsync();
        Assert.Equal(3, directQueryVehicles.Count);

        // Act
        var results = await _vehicleRepository.SearchAvailableVehiclesAsync(
            pickupLocationId: _locationId,
            returnLocationId: null,
            pickupDate: DateTime.UtcNow.AddDays(1),
            returnDate: DateTime.UtcNow.AddDays(3),
            category: "Compact"
        );

        var resultList = results.ToList();

        // Assert
        Assert.Contains(resultList, v => v.Id == normalCompact.Id);
        Assert.DoesNotContain(resultList, v => v.Id == crossoverSuv.Id);
        Assert.DoesNotContain(resultList, v => v.Id == largeWagon.Id);
    }

    [Fact]
    public async Task StandardFilter_ShouldIncludeLarge4Seats_AndNormal4Or5Seats_ButExcludeSuv()
    {
        // Arrange
        // 1. Large 4-seat wagon (Should match Standard)
        var largeWagon = CreateBaseVehicle("Executive Wagon", seats: 4, price: 110, description: "A large executive family wagon");

        // 2. Normal 4-seat vehicle (Should match Standard since seats == 4 and price <= 120)
        var normalSedan = CreateBaseVehicle("Midsize Sedan", seats: 5, price: 60);

        // 3. 4-seat SUV (Should NOT match Standard, should match Premium)
        var crossoverSuv = CreateBaseVehicle("Creta SUV", seats: 4, price: 85);

        _context.Vehicles.AddRange(largeWagon, normalSedan, crossoverSuv);
        await _context.SaveChangesAsync();

        // Act
        var results = await _vehicleRepository.SearchAvailableVehiclesAsync(
            pickupLocationId: _locationId,
            returnLocationId: null,
            pickupDate: DateTime.UtcNow.AddDays(1),
            returnDate: DateTime.UtcNow.AddDays(3),
            category: "Standard"
        );

        var resultList = results.ToList();

        // Assert
        Assert.Contains(resultList, v => v.Id == largeWagon.Id);
        Assert.Contains(resultList, v => v.Id == normalSedan.Id);
        Assert.DoesNotContain(resultList, v => v.Id == crossoverSuv.Id);
    }

    [Fact]
    public async Task PremiumFilter_ShouldInclude4SeatSuv_AndExpensive5Seat_And6PlusSeat()
    {
        // Arrange
        // 1. 4-seat SUV (Should match Premium)
        var crossoverSuv = CreateBaseVehicle("Tucson Crossover", seats: 4, price: 95);

        // 2. Expensive 5-seat sedan (Should match Premium since seats >= 5 and price > 80)
        var premiumSedan = CreateBaseVehicle("Mercedes E-Class", seats: 5, price: 150);

        // 3. 6+ seat vehicle (Should match Premium since seats >= 6)
        var minivan = CreateBaseVehicle("Family Van", seats: 7, price: 75);

        // 4. Normal 4-seat sedan (Should NOT match Premium)
        var cheapSedan = CreateBaseVehicle("Economical Hatchback", seats: 4, price: 35);

        _context.Vehicles.AddRange(crossoverSuv, premiumSedan, minivan, cheapSedan);
        await _context.SaveChangesAsync();

        // Act
        var results = await _vehicleRepository.SearchAvailableVehiclesAsync(
            pickupLocationId: _locationId,
            returnLocationId: null,
            pickupDate: DateTime.UtcNow.AddDays(1),
            returnDate: DateTime.UtcNow.AddDays(3),
            category: "Premium"
        );

        var resultList = results.ToList();

        // Assert
        Assert.Contains(resultList, v => v.Id == crossoverSuv.Id);
        Assert.Contains(resultList, v => v.Id == premiumSedan.Id);
        Assert.Contains(resultList, v => v.Id == minivan.Id);
        Assert.DoesNotContain(resultList, v => v.Id == cheapSedan.Id);
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
