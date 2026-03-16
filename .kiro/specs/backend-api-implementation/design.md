# Design Document: Backend API Implementation

## Overview

This design document specifies the implementation of a comprehensive backend API infrastructure for a car rental application using ASP.NET Core with Clean Architecture. The system provides RESTful APIs for authentication, vehicle management, booking operations, user management, payments, notifications, and reviews.

### Technology Stack

- **Framework**: ASP.NET Core 8.0
- **Authentication**: ASP.NET Identity with JWT tokens
- **ORM**: Entity Framework Core 8.0
- **Database**: SQL Server
- **Validation**: FluentValidation
- **Logging**: Serilog
- **API Documentation**: Swagger/OpenAPI
- **Mapping**: AutoMapper
- **Architecture**: Clean Architecture (Domain, Application, Infrastructure, Api layers)

### Design Principles

1. **Clean Architecture**: Separation of concerns with dependency inversion
2. **SOLID Principles**: Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion
3. **Repository Pattern**: Abstract data access layer
4. **Service Layer**: Business logic separated from controllers
5. **DTO Pattern**: Data transfer objects for API contracts
6. **Dependency Injection**: Constructor injection for all dependencies
7. **Async/Await**: Asynchronous operations throughout
8. **Error Handling**: Global exception handling middleware
9. **Validation**: Request validation with FluentValidation
10. **Logging**: Structured logging with Serilog

## Architecture

### Layer Structure

```
┌─────────────────────────────────────────┐
│           Api Layer                     │
│  - Controllers                          │
│  - Middleware                           │
│  - Filters                              │
│  - Program.cs (Startup)                 │
└─────────────────────────────────────────┘
              ↓ depends on
┌─────────────────────────────────────────┐
│       Application Layer                 │
│  - Services (Interfaces & Impl)         │
│  - DTOs (Request/Response)              │
│  - Validators (FluentValidation)        │
│  - Mapping Profiles (AutoMapper)        │
└─────────────────────────────────────────┘
              ↓ depends on
┌─────────────────────────────────────────┐
│      Infrastructure Layer               │
│  - Repositories (Interfaces & Impl)     │
│  - DbContext                            │
│  - Migrations                           │
│  - External Services                    │
└─────────────────────────────────────────┘
              ↓ depends on
┌─────────────────────────────────────────┐
│         Domain Layer                    │
│  - Entities                             │
│  - Enums                                │
│  - Domain Interfaces                    │
└─────────────────────────────────────────┘
```


### Request Flow

```
HTTP Request
    ↓
Middleware Pipeline (CORS, Auth, Logging, Exception Handling)
    ↓
Controller (API Layer)
    ↓
Request Validation (FluentValidation)
    ↓
Service (Application Layer)
    ↓
Business Logic & Validation
    ↓
Repository (Infrastructure Layer)
    ↓
Entity Framework Core
    ↓
SQL Server Database
    ↓
Response (DTO) ← AutoMapper ← Entity
    ↓
HTTP Response
```

### Priority-Based Implementation

The implementation is organized by priority based on frontend dependencies:

**Priority 1 (Critical)**:
- Authentication APIs (login, register)
- Vehicle search and listing APIs
- Vehicle details APIs
- Location autocomplete API

**Priority 2 (High)**:
- Booking creation API
- Booking management APIs
- Customer profile APIs

**Priority 3 (Medium)**:
- Payment APIs
- Review APIs
- Notification APIs
- Booking cancellation API

**Priority 4 (Low)**:
- Admin vehicle management
- Location management
- User management
- Supplier management

## Components and Interfaces

### 1. Domain Layer Components

The Domain layer contains entities and domain interfaces. These are already implemented in the existing codebase.

**Existing Entities**:
- `ApplicationUser` - User account (extends IdentityUser<Guid>)
- `Vehicle` - Vehicle information
- `Booking` - Rental booking
- `Driver` - Professional driver
- `BookingPayment` - Payment transaction
- `Review` - Vehicle review
- `Notification` - User notification
- `UserAddress` - User address information
- `CompanyProfile` - Supplier company information
- `VehicleImage` - Vehicle photos
- `VehicleFeature` - Vehicle features
- `VehicleInspection` - Inspection records
- `Inspector` - Vehicle inspector
- `InspectorApplication` - Inspector application
- `DriverApplication` - Driver application
- `BookingCancellation` - Cancellation records
- `PaymentMethod` - Payment method information
- `InspectionPhoto` - Inspection photos
- `Verification` - User verification records


### 2. Infrastructure Layer Components

#### 2.1 Generic Repository Interface

```csharp
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(T entity, CancellationToken cancellationToken = default);
    Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
```

#### 2.2 Paginated Repository Interface

```csharp
public interface IPaginatedRepository<T> : IRepository<T> where T : class
{
    Task<PagedResult<T>> GetPagedAsync(
        int page, 
        int pageSize, 
        Expression<Func<T, bool>>? filter = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        CancellationToken cancellationToken = default);
}
```

#### 2.3 Specific Repository Interfaces

```csharp
public interface IVehicleRepository : IPaginatedRepository<Vehicle>
{
    Task<IEnumerable<Vehicle>> SearchAvailableVehiclesAsync(
        Guid pickupLocationId,
        Guid? returnLocationId,
        DateTime pickupDate,
        DateTime returnDate,
        VehicleSearchFilters filters,
        CancellationToken cancellationToken = default);
    
    Task<bool> IsAvailableAsync(
        Guid vehicleId, 
        DateTime startDate, 
        DateTime endDate,
        CancellationToken cancellationToken = default);
    
    Task<IEnumerable<VehicleImage>> GetVehicleImagesAsync(
        Guid vehicleId,
        CancellationToken cancellationToken = default);
}

public interface IBookingRepository : IPaginatedRepository<Booking>
{
    Task<IEnumerable<Booking>> GetUserBookingsAsync(
        Guid userId,
        BookingFilters filters,
        CancellationToken cancellationToken = default);
    
    Task<bool> HasActiveBookingsAsync(
        Guid vehicleId,
        CancellationToken cancellationToken = default);
    
    Task<bool> HasUserBookingsAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
    
    Task<Booking?> GetBookingWithDetailsAsync(
        Guid bookingId,
        CancellationToken cancellationToken = default);
}

public interface IUserRepository : IRepository<ApplicationUser>
{
    Task<ApplicationUser?> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default);
    
    Task<bool> EmailExistsAsync(
        string email,
        CancellationToken cancellationToken = default);
}

public interface ILocationRepository : IPaginatedRepository<UserAddress>
{
    Task<IEnumerable<UserAddress>> AutocompleteAsync(
        string query,
        CancellationToken cancellationToken = default);
}

public interface IReviewRepository : IPaginatedRepository<Review>
{
    Task<IEnumerable<Review>> GetVehicleReviewsAsync(
        Guid vehicleId,
        int page,
        int pageSize,
        string sortBy,
        CancellationToken cancellationToken = default);
    
    Task<double> GetAverageRatingAsync(
        Guid vehicleId,
        CancellationToken cancellationToken = default);
}

public interface IPaymentRepository : IPaginatedRepository<BookingPayment>
{
    Task<IEnumerable<BookingPayment>> GetUserPaymentsAsync(
        Guid userId,
        PaymentFilters filters,
        CancellationToken cancellationToken = default);
}

public interface INotificationRepository : IRepository<Notification>
{
    Task<IEnumerable<Notification>> GetUserNotificationsAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
    
    Task MarkAsReadAsync(
        Guid notificationId,
        CancellationToken cancellationToken = default);
}
```


### 3. Application Layer Components

#### 3.1 Service Interfaces

```csharp
public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);
    Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default);
    Task<bool> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default);
    Task<bool> VerifyEmailAsync(string userId, string token, CancellationToken cancellationToken = default);
}

public interface IVehicleService
{
    Task<PagedResult<VehicleListDto>> SearchVehiclesAsync(
        VehicleSearchRequest request,
        CancellationToken cancellationToken = default);
    
    Task<VehicleDetailsDto> GetVehicleDetailsAsync(
        Guid vehicleId,
        DateTime? pickupDate,
        DateTime? returnDate,
        string? currency,
        CancellationToken cancellationToken = default);
    
    Task<VehicleAvailabilityDto> GetAvailabilityAsync(
        Guid vehicleId,
        DateTime startDate,
        DateTime endDate,
        CancellationToken cancellationToken = default);
    
    Task<VehiclePricingDto> CalculatePricingAsync(
        Guid vehicleId,
        PricingRequest request,
        CancellationToken cancellationToken = default);
    
    Task<IEnumerable<VehicleImageDto>> GetImagesAsync(
        Guid vehicleId,
        string? size,
        CancellationToken cancellationToken = default);
}

public interface IBookingService
{
    Task<BookingResponse> CreateBookingAsync(
        CreateBookingRequest request,
        Guid userId,
        CancellationToken cancellationToken = default);
    
    Task<PagedResult<BookingListDto>> GetUserBookingsAsync(
        Guid userId,
        BookingListRequest request,
        CancellationToken cancellationToken = default);
    
    Task<BookingDetailsDto> GetBookingDetailsAsync(
        Guid bookingId,
        Guid userId,
        CancellationToken cancellationToken = default);
    
    Task<bool> CancelBookingAsync(
        Guid bookingId,
        Guid userId,
        CancellationToken cancellationToken = default);
    
    Task<bool> HasUserBookingsAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
}

public interface IUserProfileService
{
    Task<UserProfileDto> GetProfileAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
    
    Task<UpdateProfileResponse> UpdateProfileAsync(
        Guid userId,
        UpdateProfileRequest request,
        CancellationToken cancellationToken = default);
    
    Task<string> UploadProfilePhotoAsync(
        Guid userId,
        IFormFile photo,
        CancellationToken cancellationToken = default);
}

public interface ILocationService
{
    Task<IEnumerable<LocationSuggestionDto>> AutocompleteAsync(
        string query,
        string? type,
        CancellationToken cancellationToken = default);
}

public interface IReviewService
{
    Task<PagedResult<ReviewDto>> GetVehicleReviewsAsync(
        Guid vehicleId,
        int page,
        int pageSize,
        string sortBy,
        CancellationToken cancellationToken = default);
    
    Task<ReviewResponse> CreateReviewAsync(
        CreateReviewRequest request,
        Guid userId,
        CancellationToken cancellationToken = default);
}

public interface IPaymentService
{
    Task<PaymentResponse> ProcessPaymentAsync(
        PaymentRequest request,
        Guid userId,
        CancellationToken cancellationToken = default);
    
    Task<PagedResult<PaymentDto>> GetPaymentHistoryAsync(
        Guid userId,
        PaymentHistoryRequest request,
        CancellationToken cancellationToken = default);
    
    Task<byte[]> GenerateReceiptAsync(
        Guid transactionId,
        string format,
        CancellationToken cancellationToken = default);
}

public interface INotificationService
{
    Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(
        Guid userId,
        CancellationToken cancellationToken = default);
    
    Task MarkAsReadAsync(
        Guid notificationId,
        CancellationToken cancellationToken = default);
    
    Task CreateNotificationAsync(
        Guid userId,
        string type,
        string message,
        CancellationToken cancellationToken = default);
}
```


### 4. API Layer Components

#### 4.1 Controllers

```csharp
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    // POST /api/auth/register
    // POST /api/auth/login
    // POST /api/auth/forgot-password
    // POST /api/auth/reset-password
    // POST /api/auth/verify-email
}

[ApiController]
[Route("api/vehicles")]
public class VehiclesController : ControllerBase
{
    // GET /api/vehicles/search
    // GET /api/vehicles/{vehicleId}
    // GET /api/vehicles/{vehicleId}/availability
    // GET /api/vehicles/{vehicleId}/pricing
    // GET /api/vehicles/{vehicleId}/reviews
    // GET /api/vehicles/{vehicleId}/images
    // POST /api/vehicles/{vehicleId}/favorites [Authorize]
}

[ApiController]
[Route("api/locations")]
public class LocationsController : ControllerBase
{
    // GET /api/locations/autocomplete
}

[ApiController]
[Route("api/bookings")]
[Authorize]
public class BookingsController : ControllerBase
{
    // POST /api/bookings/create
    // POST /api/bookings/{page}/{size}/{language}
    // GET /api/bookings/history
    // GET /api/has-bookings/{driver}
}

[ApiController]
[Route("api/booking")]
[Authorize]
public class BookingController : ControllerBase
{
    // GET /api/booking/{id}/{language}
    // POST /api/cancel-booking/{id}
}

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    // GET /api/users/{userId}/profile
    // PUT /api/users/{userId}/profile
    // POST /api/users/{userId}/profile/photo
}

[ApiController]
[Route("api/v1/payments")]
[Authorize]
public class PaymentsController : ControllerBase
{
    // GET /api/v1/payments/history
    // GET /api/v1/payments/{transactionId}
    // GET /api/v1/payments/{transactionId}/receipt
    // GET /api/v1/payments/pending
    // GET /api/v1/payments/failed
    // POST /api/payments/create
}

[ApiController]
[Route("api/reviews")]
public class ReviewsController : ControllerBase
{
    // GET /api/reviews/{vehicleId}
    // POST /api/reviews/create [Authorize]
}

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    // GET /api/notifications
    // PUT /api/notifications/{id}/read
}
```

#### 4.2 Middleware

```csharp
public class GlobalExceptionHandlerMiddleware
{
    // Catches all unhandled exceptions
    // Returns standardized error responses
    // Logs exceptions with Serilog
}

public class RequestLoggingMiddleware
{
    // Logs all incoming requests
    // Logs request method, path, and response time
}

public class RateLimitingMiddleware
{
    // Implements rate limiting per endpoint
    // Configurable limits per endpoint
}
```


## Data Models

### Request DTOs

#### Authentication DTOs

```csharp
public record RegisterRequest(
    string Email,
    string Password,
    string FirstName,
    string LastName,
    bool AcceptedTerms,
    bool AcceptedPrivacy);

public record LoginRequest(
    string Email,
    string Password,
    bool? StayConnected);

public record ForgotPasswordRequest(string Email);

public record ResetPasswordRequest(
    string Email,
    string Token,
    string NewPassword);
```

#### Vehicle DTOs

```csharp
public record VehicleSearchRequest(
    Guid PickupLocationId,
    Guid? ReturnLocationId,
    DateTime PickupDate,
    DateTime ReturnDate,
    string? Category,
    string? Transmission,
    decimal? MinPrice,
    decimal? MaxPrice,
    string? SortBy,
    int Page = 1,
    int Limit = 20);

public record VehicleSearchFilters(
    string? Category,
    string? Transmission,
    decimal? MinPrice,
    decimal? MaxPrice);

public record PricingRequest(
    DateTime PickupDate,
    DateTime ReturnDate,
    string? InsuranceOptions,
    string? AdditionalServices,
    string? Currency);
```

#### Booking DTOs

```csharp
public record CreateBookingRequest(
    Guid VehicleId,
    Guid PickupLocationId,
    Guid DropOffLocationId,
    DateTime PickupDate,
    DateTime ReturnDate,
    Guid? DriverId,
    bool PayLater);

public record BookingListRequest(
    Guid UserId,
    List<Guid>? Suppliers,
    List<string>? Statuses,
    Guid? CarId,
    BookingFilters? Filter,
    int Page,
    int Size,
    string Language);

public record BookingFilters(
    DateTime? From,
    DateTime? To,
    string? Keyword,
    Guid? PickupLocation,
    Guid? DropOffLocation);
```

#### User Profile DTOs

```csharp
public record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string Phone,
    DateTime? DateOfBirth,
    AddressDto Address,
    EmergencyContactDto EmergencyContact,
    string LanguagePreference,
    string CurrencyPreference);

public record AddressDto(
    string Street,
    string City,
    string State,
    string PostalCode,
    string Country);

public record EmergencyContactDto(
    string Name,
    string Phone,
    string Relationship);
```

#### Payment DTOs

```csharp
public record PaymentRequest(
    Guid BookingId,
    decimal Amount,
    Guid PaymentMethodId,
    string PaymentMethod);

public record PaymentHistoryRequest(
    DateTime? StartDate,
    DateTime? EndDate,
    string? Status,
    string? PaymentMethod,
    int Page = 1,
    int PageSize = 20,
    string SortBy = "createdAt",
    string SortOrder = "desc");
```


### Response DTOs

#### Authentication Response DTOs

```csharp
public record AuthResponse(
    Guid UserId,
    string Email,
    bool EmailVerified,
    string Message);

public record LoginResponse(
    string Token,
    DateTime ExpiresAt,
    UserDto User);

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    List<string> Roles,
    bool EmailVerified);
```

#### Vehicle Response DTOs

```csharp
public record VehicleListDto(
    Guid VehicleId,
    string Make,
    string Model,
    string Category,
    decimal DailyRate,
    string Currency,
    string ImageUrl,
    double Rating,
    int ReviewCount,
    double? Distance,
    bool Available);

public record VehicleDetailsDto(
    Guid VehicleId,
    string Make,
    string Model,
    int Year,
    string Color,
    string LicensePlate,
    string Transmission,
    string FuelType,
    int Seats,
    decimal PricePerDay,
    string LocationCity,
    string Description,
    string Status,
    string AvailabilityStatus,
    List<VehicleImageDto> Images,
    List<VehicleFeatureDto> Features,
    SupplierDto Supplier,
    double AverageRating,
    int ReviewCount);

public record VehicleAvailabilityDto(
    Guid VehicleId,
    List<DateRange> BookedDates,
    List<DateRange> BlockedDates);

public record VehiclePricingDto(
    decimal BasePrice,
    decimal InsuranceCost,
    decimal AdditionalServicesCost,
    decimal TotalPrice,
    string Currency,
    int TotalDays);

public record VehicleImageDto(
    Guid ImageId,
    string Url,
    string Size,
    bool IsPrimary);

public record LocationSuggestionDto(
    Guid LocationId,
    string DisplayText,
    string Address,
    string LocationType,
    double? Distance,
    bool IsLandmark);
```

#### Booking Response DTOs

```csharp
public record BookingResponse(
    Guid BookingId,
    string BookingNumber,
    string Status,
    decimal TotalPrice,
    string Message);

public record BookingListDto(
    Guid Id,
    VehicleBasicDto Car,
    SupplierDto Supplier,
    LocationDto PickupLocation,
    LocationDto DropOffLocation,
    DateTime From,
    DateTime To,
    decimal Price,
    string Status);

public record BookingDetailsDto(
    Guid Id,
    VehicleWithSupplierDto Car,
    DriverDto? Driver,
    LocationDto PickupLocation,
    LocationDto DropOffLocation,
    DateTime From,
    DateTime To,
    decimal Price,
    string Status,
    bool PayLater);

public record VehicleBasicDto(
    Guid Id,
    string Name,
    string Image);

public record VehicleWithSupplierDto(
    Guid Id,
    string Name,
    string Image,
    SupplierDto Supplier);

public record SupplierDto(
    Guid Id,
    string FullName);

public record LocationDto(
    Guid Id,
    string Name);

public record DriverDto(
    Guid Id,
    string FullName,
    string Email);
```

#### User Profile Response DTOs

```csharp
public record UserProfileDto(
    Guid UserId,
    string FirstName,
    string LastName,
    string Email,
    bool EmailVerified,
    string Phone,
    bool PhoneVerified,
    DateTime? DateOfBirth,
    string? ProfilePhotoUrl,
    AddressDto Address,
    EmergencyContactDto EmergencyContact,
    string LanguagePreference,
    string CurrencyPreference,
    int ProfileCompleteness,
    VerificationStatusDto VerificationStatus);

public record VerificationStatusDto(
    bool Email,
    bool Phone,
    bool DriverLicense,
    string Kyc);

public record UpdateProfileResponse(
    bool Success,
    string Message,
    VerificationRequiredDto VerificationRequired);

public record VerificationRequiredDto(
    bool Email,
    bool Phone);
```

#### Payment Response DTOs

```csharp
public record PaymentResponse(
    Guid TransactionId,
    string Status,
    string Message);

public record PaymentDto(
    Guid TransactionId,
    Guid BookingId,
    decimal Amount,
    string Currency,
    string PaymentMethod,
    string Status,
    DateTime CreatedAt);
```

#### Common Response DTOs

```csharp
public record PagedResult<T>(
    List<T> Data,
    int Page,
    int PageSize,
    int TotalCount,
    int TotalPages);

public record ApiResponse<T>(
    bool Success,
    T? Data,
    string? Message,
    List<string>? Errors);

public record ErrorResponse(
    int StatusCode,
    string Message,
    List<ValidationError>? ValidationErrors);

public record ValidationError(
    string Field,
    string Message);
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Authentication Properties

**Property 1: Registration creates account with required response fields**
*For any* valid registration request (email, password, firstName, lastName, acceptedTerms, acceptedPrivacy), the system should create a user account and return a response containing userId, email, emailVerified=false, and message.
**Validates: Requirements 1.1**

**Property 2: Login returns complete authentication response**
*For any* valid user credentials (email, password), the login endpoint should return a response containing token, expiresAt, and user object with id, email, firstName, lastName, roles array, and emailVerified status.
**Validates: Requirements 1.2**

**Property 3: StayConnected extends session duration**
*For any* login request with stayConnected=true, the expiresAt timestamp should be approximately 400 days in the future (within 1 day tolerance).
**Validates: Requirements 1.3**

**Property 4: Invalid credentials return 401**
*For any* invalid credentials (non-existent email or wrong password), the login endpoint should return 401 Unauthorized.
**Validates: Requirements 1.4**

**Property 5: Invalid registration data returns 400 with validation errors**
*For any* registration request with invalid data (invalid email format, weak password, missing required fields), the system should return 400 Bad Request with structured validation errors.
**Validates: Requirements 1.7**

### Vehicle Search Properties

**Property 6: Location autocomplete returns matching suggestions**
*For any* query string (minimum 3 characters), the autocomplete endpoint should return only suggestions where displayText or address contains the query string (case-insensitive).
**Validates: Requirements 2.1**

**Property 7: Vehicle search returns paginated results**
*For any* valid search request (pickupLocationId, pickupDate, returnDate, page, limit), the response should contain vehicles array, total count, page number, and limit, where vehicles.length <= limit.
**Validates: Requirements 2.2**

**Property 8: Vehicle search filters return only matching vehicles**
*For any* search request with filters (category, transmission, minPrice, maxPrice), all returned vehicles should match ALL specified filter criteria.
**Validates: Requirements 2.3**

**Property 9: Vehicle search sorting orders results correctly**
*For any* search request with sortBy parameter (price, distance, rating), the returned vehicles should be ordered by the specified field in the correct direction.
**Validates: Requirements 2.4**


### Vehicle Details Properties

**Property 10: Vehicle details returns complete information**
*For any* existing vehicle, the details endpoint should return a response containing all required fields: vehicleId, make, model, year, color, transmission, fuelType, seats, pricePerDay, locationCity, description, status, images, features, supplier, and rating information.
**Validates: Requirements 3.1**

**Property 11: Non-existent vehicle returns 404**
*For any* non-existent vehicle ID (random GUID not in database), the details endpoint should return 404 Not Found.
**Validates: Requirements 3.2**

**Property 12: Pricing calculation is accurate**
*For any* vehicle and valid date range (pickupDate < returnDate), the calculated totalPrice should equal (days * vehicle.pricePerDay) + insuranceCost + additionalServicesCost, where days = (returnDate - pickupDate).Days.
**Validates: Requirements 3.3**

**Property 13: Invalid date range returns 400**
*For any* pricing request where pickupDate >= returnDate, the system should return 400 Bad Request.
**Validates: Requirements 3.4**

### Booking Properties

**Property 14: Booking creation updates vehicle availability**
*For any* valid booking request, after successful booking creation, querying vehicle availability for the booked date range should show the vehicle as unavailable.
**Validates: Requirements 4.1**

**Property 15: Booking price calculation is correct**
*For any* created booking, the totalPrice should equal (returnDate - pickupDate).Days * vehicle.pricePerDay.
**Validates: Requirements 4.2**

**Property 16: Double-booking is prevented**
*For any* vehicle with an existing booking for dates [D1, D2], attempting to create a new booking with overlapping dates should be rejected with appropriate error.
**Validates: Requirements 4.3**

**Property 17: Booking numbers are unique**
*For any* set of created bookings, all booking numbers should be unique (no duplicates).
**Validates: Requirements 4.5**

**Property 18: Booking list pagination works correctly**
*For any* user with N bookings, requesting page P with size S should return at most S bookings, and total count should equal N.
**Validates: Requirements 5.2**

**Property 19: Booking filters return only matching bookings**
*For any* booking list request with filters (statuses, date range, keyword, locations), all returned bookings should match ALL specified filter criteria.
**Validates: Requirements 5.3**

**Property 20: Booking details returns complete information**
*For any* existing booking, the details endpoint should return a response containing all required fields: id, car (with supplier), driver, pickupLocation, dropOffLocation, from, to, price, status, and payLater flag.
**Validates: Requirements 5.4**

**Property 21: Booking cancellation updates status**
*For any* eligible booking (status allows cancellation), after successful cancellation, the booking status should be "Cancelled" and the vehicle should become available for those dates.
**Validates: Requirements 5.6**


### User Profile Properties

**Property 22: User profile returns complete information**
*For any* existing user, the profile endpoint should return a response containing all required fields: userId, firstName, lastName, email, emailVerified, phone, phoneVerified, dateOfBirth, profilePhotoUrl, address, emergencyContact, languagePreference, currencyPreference, profileCompleteness, and verificationStatus.
**Validates: Requirements 6.1**

**Property 23: Profile update persists changes**
*For any* valid profile update request, after successful update, retrieving the profile should return the updated values for all modified fields.
**Validates: Requirements 6.2**

**Property 24: Profile photo upload succeeds for valid images**
*For any* valid image file (JPEG, PNG, under size limit), the photo upload should succeed and return a profilePhotoUrl that can be accessed.
**Validates: Requirements 6.4**

**Property 25: Profile completeness calculation is accurate**
*For any* user profile, the profileCompleteness percentage should equal (number of filled optional fields / total optional fields) * 100, rounded to nearest integer.
**Validates: Requirements 6.5**

### Payment Properties

**Property 26: Payment history pagination works correctly**
*For any* user with N payments, requesting page P with pageSize S should return at most S payments, and total count should equal N.
**Validates: Requirements 7.1**

**Property 27: Payment details returns complete information**
*For any* existing payment transaction, the details endpoint should return a response containing all required fields: transactionId, bookingId, amount, currency, paymentMethod, status, and createdAt.
**Validates: Requirements 7.2**

**Property 28: Payment creation links to booking**
*For any* valid payment request, after successful payment creation, querying the payment by transactionId should return a payment record with the correct bookingId linkage.
**Validates: Requirements 7.4**

**Property 29: Successful payment updates booking status**
*For any* booking with status "Pending", after successful payment processing, the booking status should be updated to "Paid" or "Reserved".
**Validates: Requirements 7.5**


## Error Handling

### Global Exception Handling Middleware

The system implements a global exception handling middleware that catches all unhandled exceptions and returns standardized error responses.

```csharp
public class GlobalExceptionHandlerMiddleware
{
    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (ValidationException ex)
        {
            await HandleValidationExceptionAsync(context, ex);
        }
        catch (NotFoundException ex)
        {
            await HandleNotFoundExceptionAsync(context, ex);
        }
        catch (UnauthorizedException ex)
        {
            await HandleUnauthorizedExceptionAsync(context, ex);
        }
        catch (ForbiddenException ex)
        {
            await HandleForbiddenExceptionAsync(context, ex);
        }
        catch (ConflictException ex)
        {
            await HandleConflictExceptionAsync(context, ex);
        }
        catch (Exception ex)
        {
            await HandleGenericExceptionAsync(context, ex);
        }
    }
}
```

### Exception Types

**Custom Exceptions**:
- `ValidationException` - Returns 400 Bad Request with validation errors
- `NotFoundException` - Returns 404 Not Found
- `UnauthorizedException` - Returns 401 Unauthorized
- `ForbiddenException` - Returns 403 Forbidden
- `ConflictException` - Returns 409 Conflict
- `BusinessRuleException` - Returns 422 Unprocessable Entity

### Error Response Format

All error responses follow a consistent format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "validationErrors": [
    {
      "field": "Email",
      "message": "Email is required"
    }
  ]
}
```

### Logging Strategy

All exceptions are logged with appropriate severity levels:
- **Critical**: Database connection failures, configuration errors
- **Error**: Unhandled exceptions, business rule violations
- **Warning**: Validation failures, authorization failures
- **Information**: Successful operations, authentication events


## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests**:
- Verify specific examples and edge cases
- Test error conditions and validation
- Test integration points between components
- Focus on concrete scenarios

**Property-Based Tests**:
- Verify universal properties across all inputs
- Use randomized input generation
- Ensure properties hold for large input spaces
- Catch edge cases not considered in unit tests

### Property-Based Testing Configuration

**Framework**: Use a property-based testing library for .NET:
- **Recommended**: FsCheck (F# library usable from C#)
- **Alternative**: CsCheck

**Configuration**:
- Minimum 100 iterations per property test
- Each property test must reference its design document property
- Tag format: `[Property] // Feature: backend-api-implementation, Property {number}: {property_text}`

**Example Property Test**:

```csharp
[Property]
// Feature: backend-api-implementation, Property 15: Booking price calculation is correct
public Property BookingPriceCalculationIsCorrect()
{
    return Prop.ForAll(
        Arb.Generate<Vehicle>().Where(v => v.PricePerDay > 0),
        Arb.Generate<DateTime>(),
        Arb.Generate<int>().Where(days => days > 0 && days < 365),
        (vehicle, startDate, days) =>
        {
            var endDate = startDate.AddDays(days);
            var booking = new Booking
            {
                VehicleId = vehicle.Id,
                PickupDate = startDate,
                ReturnDate = endDate,
                TotalPrice = days * vehicle.PricePerDay
            };
            
            var expectedPrice = days * vehicle.PricePerDay;
            return booking.TotalPrice == expectedPrice;
        });
}
```

### Unit Testing Strategy

**Test Organization**:
- One test class per service/repository
- Arrange-Act-Assert pattern
- Use mocking for dependencies (Moq library)

**Coverage Goals**:
- Services: 80% code coverage minimum
- Repositories: 70% code coverage minimum
- Controllers: 60% code coverage minimum

**Test Categories**:
1. **Happy Path Tests**: Verify successful operations
2. **Validation Tests**: Verify input validation
3. **Error Handling Tests**: Verify exception handling
4. **Authorization Tests**: Verify access control
5. **Edge Case Tests**: Verify boundary conditions

### Integration Testing

**API Integration Tests**:
- Use WebApplicationFactory for in-memory testing
- Test complete request/response cycles
- Verify middleware pipeline
- Test authentication and authorization

**Database Integration Tests**:
- Use in-memory SQLite for fast tests
- Test repository implementations
- Verify EF Core configurations
- Test complex queries

### Test Data Generation

**For Property-Based Tests**:
- Use FsCheck generators for primitive types
- Create custom generators for domain entities
- Ensure generated data satisfies business rules
- Use shrinking to find minimal failing cases

**For Unit Tests**:
- Use builder pattern for test data
- Create factory methods for common scenarios
- Use AutoFixture for simple object creation

### Continuous Integration

**Test Execution**:
- Run all tests on every commit
- Fail build if any test fails
- Generate code coverage reports
- Track test execution time

**Test Reporting**:
- Generate test results in JUnit XML format
- Publish coverage reports
- Track property test iterations
- Report failing property test examples

