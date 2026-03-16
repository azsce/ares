# Implementation Plan: Backend API Implementation

## Overview

This implementation plan breaks down the backend API infrastructure into discrete coding tasks organized by priority. The plan follows Clean Architecture principles with clear separation between Domain, Application, Infrastructure, and API layers. Tasks are ordered to deliver Priority 1 features (authentication and vehicle search) first, followed by Priority 2 (bookings and profile), then Priority 3 (payments and reviews).

## Tasks

- [x] 1. Set up infrastructure foundation
  - [x] 1.1 Install required NuGet packages
    - Install FluentValidation.AspNetCore
    - Install AutoMapper.Extensions.Microsoft.DependencyInjection
    - Install Serilog.AspNetCore, Serilog.Sinks.Console, Serilog.Sinks.File
    - Install Microsoft.AspNetCore.Authentication.JwtBearer
    - Install Swashbuckle.AspNetCore (Swagger)
    - Install FsCheck for property-based testing
    - _Requirements: 13.5, 13.7, 21.1_

  - [x] 1.2 Configure Serilog structured logging
    - Configure Serilog in Program.cs with console and file sinks
    - Set up log levels for development and production
    - Configure request logging middleware
    - _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_
  
  - [x] 1.3 Implement global exception handling middleware
    - Create GlobalExceptionHandlerMiddleware class
    - Handle ValidationException, NotFoundException, UnauthorizedException, ForbiddenException, ConflictException
    - Return standardized error responses with proper status codes
    - Log all exceptions with appropriate severity
    - _Requirements: 14.1, 14.2, 14.3, 14.6_
  
  - [x] 1.4 Configure CORS for Next.js frontend
    - Add CORS policy in Program.cs
    - Allow requests from frontend origin
    - Configure allowed methods and headers
    - _Requirements: 13.1_
  
  - [x] 1.5 Configure Swagger/OpenAPI documentation
    - Set up Swagger in Program.cs
    - Configure JWT authentication in Swagger
    - Add XML documentation comments support
    - _Requirements: 13.5_


- [ ] 2. Implement generic repository pattern
  - [x] 2.1 Create IRepository<T> interface in Infrastructure layer
    - Define GetByIdAsync, GetAllAsync, AddAsync, UpdateAsync, DeleteAsync methods
    - Define ExistsAsync and SaveChangesAsync methods
    - All methods should be async and accept CancellationToken
    - _Requirements: 15.1, 15.3, 15.4_
  
  - [x] 2.2 Create IPaginatedRepository<T> interface
    - Extend IRepository<T>
    - Define GetPagedAsync method with filter, orderBy, page, pageSize parameters
    - _Requirements: 15.5, 19.1_
  
  - [x] 2.3 Implement generic Repository<T> base class
    - Implement all IRepository<T> methods using EF Core
    - Use ApplicationDbContext for database operations
    - _Requirements: 15.1, 15.2, 15.3_
  
  - [x] 2.4 Implement PaginatedRepository<T> base class
    - Extend Repository<T>
    - Implement GetPagedAsync with pagination logic
    - Return PagedResult<T> with data, page, pageSize, totalCount, totalPages
    - _Requirements: 15.5, 15.6, 19.1, 19.2, 19.3, 19.4_
  
  - [x] 2.5 Write property tests for repository pagination
    - **Property 18: Booking list pagination works correctly**
    - **Validates: Requirements 5.2**
    - **Property 26: Payment history pagination works correctly**
    - **Validates: Requirements 7.1**

- [ ] 3. Implement Priority 1: Authentication APIs (CRITICAL)
  - [x] 3.1 Configure JWT authentication
    - Add JWT configuration in appsettings.json (secret key, issuer, audience, expiration)
    - Configure JWT authentication in Program.cs
    - Create JwtTokenService for token generation
    - _Requirements: 1.2, 1.7, 1.12_
  
  - [x] 3.2 Create authentication DTOs
    - Create RegisterRequest, LoginRequest, ForgotPasswordRequest, ResetPasswordRequest records
    - Create AuthResponse, LoginResponse, UserDto records
    - _Requirements: 1.1, 1.2_
  
  - [x] 3.3 Create authentication request validators
    - Create RegisterRequestValidator using FluentValidation
    - Validate email format, password strength, required fields
    - Create LoginRequestValidator
    - _Requirements: 1.7, 14.1, 14.4, 14.5_
  
  - [x] 3.4 Implement IAuthService interface and AuthService
    - Implement RegisterAsync method
    - Implement LoginAsync method with JWT token generation
    - Implement ForgotPasswordAsync and ResetPasswordAsync methods
    - Implement VerifyEmailAsync method
    - Use ASP.NET Identity UserManager and SignInManager
    - _Requirements: 1.1, 1.2, 1.3, 1.9, 1.10, 1.11_
  
  - [x] 3.5 Implement AuthController
    - POST /api/auth/register endpoint
    - POST /api/auth/login endpoint
    - POST /api/auth/forgot-password endpoint
    - POST /api/auth/reset-password endpoint
    - POST /api/auth/verify-email endpoint
    - Return proper status codes (200, 201, 400, 401, 403, 409, 429)
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.9, 1.10, 1.11_
  
  - [x] 3.6 Implement rate limiting for auth endpoints
    - Add rate limiting middleware
    - Configure 5 login attempts per 15 minutes
    - Configure 5 registration attempts per hour per IP
    - _Requirements: 1.8, 13.6_
  
  - [x] 3.7 Write property tests for authentication
    - **Property 1: Registration creates account with required response fields**
    - **Validates: Requirements 1.1**
    - **Property 2: Login returns complete authentication response**
    - **Validates: Requirements 1.2**
    - **Property 3: StayConnected extends session duration**
    - **Validates: Requirements 1.3**
    - **Property 4: Invalid credentials return 401**
    - **Validates: Requirements 1.4**
    - **Property 5: Invalid registration data returns 400 with validation errors**
    - **Validates: Requirements 1.7**
  
  - [x] 3.8 Write unit tests for AuthService
    - Test successful registration
    - Test duplicate email registration
    - Test successful login
    - Test invalid credentials
    - Test unverified account login
    - Test password reset flow


- [x] 4. Checkpoint - Ensure authentication tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement Priority 1: Location autocomplete API (CRITICAL)
  - [x] 5.1 Create ILocationRepository interface and implementation
    - Extend IPaginatedRepository<UserAddress>
    - Add AutocompleteAsync method
    - Implement search logic with LIKE query on name and address fields
    - _Requirements: 11.1_
  
  - [x] 5.2 Create location DTOs
    - Create LocationSuggestionDto record
    - Include locationId, displayText, address, locationType, distance, isLandmark fields
    - _Requirements: 2.1_
  
  - [x] 5.3 Implement ILocationService interface and LocationService
    - Implement AutocompleteAsync method
    - Filter by query string (minimum 3 characters)
    - Map entities to DTOs using AutoMapper
    - _Requirements: 2.1, 11.1_
  
  - [x] 5.4 Implement LocationsController
    - GET /api/locations/autocomplete endpoint
    - Accept query and type parameters
    - Return location suggestions
    - _Requirements: 2.1, 11.1_
  
  - [x] 5.5 Write property tests for location autocomplete
    - **Property 6: Location autocomplete returns matching suggestions**
    - **Validates: Requirements 2.1**
  
  - [x] 5.6 Write unit tests for LocationService
    - Test autocomplete with various query strings
    - Test minimum character requirement
    - Test case-insensitive matching

- [x] 6. Implement Priority 1: Vehicle search and listing APIs (CRITICAL)
  - [x] 6.1 Create IVehicleRepository interface and implementation
    - Extend IPaginatedRepository<Vehicle>
    - Add SearchAvailableVehiclesAsync method
    - Add IsAvailableAsync method
    - Add GetVehicleImagesAsync method
    - Implement availability check by querying bookings for date overlaps
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [x] 6.2 Create vehicle DTOs
    - Create VehicleSearchRequest, VehicleSearchFilters records
    - Create VehicleListDto, VehicleDetailsDto records
    - Create VehicleImageDto, VehicleFeatureDto records
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  
  - [x] 6.3 Create vehicle request validators
    - Create VehicleSearchRequestValidator
    - Validate required fields (pickupLocationId, pickupDate, returnDate)
    - Validate date range (pickup before return)
    - Validate pagination parameters
    - _Requirements: 2.6, 19.4_
  
  - [x] 6.4 Implement IVehicleService interface and VehicleService
    - Implement SearchVehiclesAsync method
    - Apply filters (category, transmission, price range)
    - Apply sorting (price, distance, rating)
    - Return paginated results
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  
  - [x] 6.5 Implement VehiclesController search endpoint
    - GET /api/vehicles/search endpoint
    - Accept all search parameters as query strings
    - Return paginated vehicle list
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  
  - [x] 6.6 Write property tests for vehicle search
    - **Property 7: Vehicle search returns paginated results**
    - **Validates: Requirements 2.2**
    - **Property 8: Vehicle search filters return only matching vehicles**
    - **Validates: Requirements 2.3**
    - **Property 9: Vehicle search sorting orders results correctly**
    - **Validates: Requirements 2.4**
  
  - [x] 6.7 Write unit tests for VehicleService search
    - Test search with various filter combinations
    - Test pagination
    - Test sorting by different fields
    - Test availability filtering


- [x] 7. Implement Priority 1: Vehicle details APIs (CRITICAL)
  - [x] 7.1 Implement VehicleService GetVehicleDetailsAsync method
    - Retrieve vehicle with all related data (images, features, supplier)
    - Calculate average rating from reviews
    - Include availability status
    - _Requirements: 3.1, 3.5_
  
  - [x] 7.2 Implement VehicleService GetAvailabilityAsync method
    - Query bookings for the vehicle in date range
    - Return booked and blocked dates
    - _Requirements: 3.5_
  
  - [x] 7.3 Implement VehicleService CalculatePricingAsync method
    - Calculate base price (days * pricePerDay)
    - Add insurance costs if specified
    - Add additional services costs if specified
    - Return detailed pricing breakdown
    - Validate date range (pickup before return)
    - _Requirements: 3.6, 3.7_
  
  - [x] 7.4 Implement IReviewRepository interface and implementation
    - Extend IPaginatedRepository<Review>
    - Add GetVehicleReviewsAsync method with pagination and sorting
    - Add GetAverageRatingAsync method
    - _Requirements: 3.2, 8.1, 8.2, 8.3, 8.5_
  
  - [x] 7.5 Implement VehicleService GetImagesAsync method
    - Retrieve vehicle images
    - Support size parameter (thumbnail, medium, large)
    - _Requirements: 3.9_
  
  - [x] 7.6 Implement VehiclesController details endpoints
    - GET /api/vehicles/{vehicleId} endpoint
    - GET /api/vehicles/{vehicleId}/availability endpoint
    - GET /api/vehicles/{vehicleId}/pricing endpoint
    - GET /api/vehicles/{vehicleId}/reviews endpoint
    - GET /api/vehicles/{vehicleId}/images endpoint
    - POST /api/vehicles/{vehicleId}/favorites endpoint (authenticated)
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11_
  
  - [x] 7.7 Write property tests for vehicle details
    - **Property 10: Vehicle details returns complete information**
    - **Validates: Requirements 3.1**
    - **Property 11: Non-existent vehicle returns 404**
    - **Validates: Requirements 3.2**
    - **Property 12: Pricing calculation is accurate**
    - **Validates: Requirements 3.3**
    - **Property 13: Invalid date range returns 400**
    - **Validates: Requirements 3.4**
  
  - [x] 7.8 Write unit tests for VehicleService details methods
    - Test GetVehicleDetailsAsync with existing and non-existent vehicles
    - Test GetAvailabilityAsync with various date ranges
    - Test CalculatePricingAsync with different scenarios
    - Test pricing calculation accuracy
    - Test invalid date range handling

- [x] 8. Checkpoint - Ensure Priority 1 tests pass
  - Ensure all tests pass, solve all build errors and warnings for prject "backend" and it's all sub projects

- [ ] 9. Implement Priority 2: Booking creation API (HIGH)
  - [x] 9.1 Create IBookingRepository interface and implementation
    - Extend IPaginatedRepository<Booking>
    - Add GetUserBookingsAsync method with filters
    - Add HasActiveBookingsAsync method for vehicles
    - Add HasUserBookingsAsync method for users
    - Add GetBookingWithDetailsAsync method with includes
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 9.2 Create booking DTOs
    - Create CreateBookingRequest, BookingListRequest, BookingFilters records
    - Create BookingResponse, BookingListDto, BookingDetailsDto records
    - Create supporting DTOs (VehicleBasicDto, LocationDto, DriverDto, etc.)
    - _Requirements: 4.1, 4.9, 5.1, 5.8, 5.17, 5.18_
  
  - [x] 9.3 Create booking request validators
    - Create CreateBookingRequestValidator
    - Validate required fields
    - Validate date range (pickup before return)
    - Validate vehicle exists and is available
    - _Requirements: 4.4, 14.1_
  
  - [x] 9.4 Implement IBookingService interface and BookingService
    - Implement CreateBookingAsync method
    - Generate unique booking number
    - Calculate total price (days * pricePerDay)
    - Check vehicle availability for date range
    - Prevent double-booking
    - Create booking with status "Pending"
    - Create notification for customer
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_
  
  - [x] 9.5 Implement BookingsController create endpoint
    - POST /api/bookings/create endpoint
    - Require authentication
    - Return booking response with bookingId, bookingNumber, status, totalPrice
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_
  
  - [x] 9.6 Write property tests for booking creation
    - **Property 14: Booking creation updates vehicle availability**
    - **Validates: Requirements 4.1**
    - **Property 15: Booking price calculation is correct**
    - **Validates: Requirements 4.2**
    - **Property 16: Double-booking is prevented**
    - **Validates: Requirements 4.3**
    - **Property 17: Booking numbers are unique**
    - **Validates: Requirements 4.5**
  
  - [x] 9.7 Write unit tests for BookingService
    - Test successful booking creation
    - Test booking with unavailable vehicle
    - Test double-booking prevention
    - Test price calculation
    - Test booking number generation


- [ ] 10. Implement Priority 2: Booking management APIs (HIGH)
  - [x] 10.1 Implement BookingService GetUserBookingsAsync method
    - Apply filters (suppliers, statuses, car, date range, keyword, locations)
    - Return paginated results with vehicle, supplier, and location details
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.14, 5.15, 5.16, 5.17, 5.18_
  
  - [x] 10.2 Implement BookingService GetBookingDetailsAsync method
    - Retrieve booking with all related data (vehicle, driver, locations, supplier)
    - Verify booking belongs to authenticated user (authorization)
    - _Requirements: 5.8, 5.9, 5.10, 5.17, 5.18_
  
  - [x] 10.3 Implement BookingService HasUserBookingsAsync method
    - Check if user has any bookings
    - _Requirements: 5.1_
  
  - [x] 10.4 Implement BookingService CancelBookingAsync method
    - Verify booking belongs to user
    - Verify booking can be cancelled (status check)
    - Update booking status to "Cancelled"
    - Make vehicle available again for those dates
    - Create cancellation record
    - _Requirements: 5.11, 5.12, 5.13, 20.1, 20.2, 20.3, 20.5_
  
  - [x] 10.5 Implement BookingsController and BookingController endpoints
    - GET /api/has-bookings/{driver} endpoint
    - POST /api/bookings/{page}/{size}/{language} endpoint
    - GET /api/bookings/history endpoint
    - GET /api/booking/{id}/{language} endpoint
    - POST /api/cancel-booking/{id} endpoint
    - All endpoints require authentication
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 5.13, 5.14, 5.15_
  
  - [x] 10.6 Write property tests for booking management
    - **Property 18: Booking list pagination works correctly**
    - **Validates: Requirements 5.2**
    - **Property 19: Booking filters return only matching bookings**
    - **Validates: Requirements 5.3**
    - **Property 20: Booking details returns complete information**
    - **Validates: Requirements 5.4**
    - **Property 21: Booking cancellation updates status**
    - **Validates: Requirements 5.6**
  
  - [x] 10.7 Write unit tests for BookingService management methods
    - Test GetUserBookingsAsync with various filters
    - Test GetBookingDetailsAsync authorization
    - Test CancelBookingAsync with eligible and ineligible bookings
    - Test HasUserBookingsAsync

- [ ] 11. Implement Priority 2: Customer profile APIs (HIGH)
  - [x] 11.1 Create IUserRepository interface and implementation
    - Extend IRepository<ApplicationUser>
    - Add GetByEmailAsync method
    - Add EmailExistsAsync method
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 11.2 Create user profile DTOs
    - Create UpdateProfileRequest, AddressDto, EmergencyContactDto records
    - Create UserProfileDto, VerificationStatusDto, UpdateProfileResponse records
    - _Requirements: 6.1, 6.4, 6.5, 6.10, 6.11, 6.12, 6.13_
  
  - [x] 11.3 Create profile request validators
    - Create UpdateProfileRequestValidator
    - Validate phone format, date of birth, address fields
    - _Requirements: 6.7, 14.1_
  
  - [x] 11.4 Implement IUserProfileService interface and UserProfileService
    - Implement GetProfileAsync method
    - Calculate profileCompleteness percentage
    - Include verificationStatus (email, phone, driverLicense, kyc)
    - _Requirements: 6.1, 6.10, 6.11_
  
  - [x] 11.5 Implement UserProfileService UpdateProfileAsync method
    - Update user profile fields
    - Validate email uniqueness if changed
    - Validate phone uniqueness if changed
    - Return verificationRequired flags if email/phone changed
    - _Requirements: 6.2, 6.4, 6.5, 6.6, 6.7, 6.12, 6.13_
  
  - [x] 11.6 Implement UserProfileService UploadProfilePhotoAsync method
    - Validate file type (JPEG, PNG)
    - Validate file size
    - Save file to storage
    - Update user profilePhotoUrl
    - Return new photo URL
    - _Requirements: 6.8, 6.9_
  
  - [x] 11.7 Implement UsersController profile endpoints
    - GET /api/users/{userId}/profile endpoint
    - PUT /api/users/{userId}/profile endpoint
    - POST /api/users/{userId}/profile/photo endpoint
    - All endpoints require authentication
    - Verify userId matches authenticated user
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_
  
  - [x] 11.8 Write property tests for user profile
    - **Property 22: User profile returns complete information**
    - **Validates: Requirements 6.1**
    - **Property 23: Profile update persists changes**
    - **Validates: Requirements 6.2**
    - **Property 24: Profile photo upload succeeds for valid images**
    - **Validates: Requirements 6.4**
    - **Property 25: Profile completeness calculation is accurate**
    - **Validates: Requirements 6.5**
  
  - [x] 11.9 Write unit tests for UserProfileService
    - Test GetProfileAsync
    - Test UpdateProfileAsync with various scenarios
    - Test email/phone uniqueness validation
    - Test UploadProfilePhotoAsync with valid and invalid files
    - Test profileCompleteness calculation

- [x] 12. Checkpoint - Ensure Priority 2 tests pass
  - Ensure all tests pass, ask the user if questions arise.


- [x] 13. Implement Priority 3: Payment APIs (MEDIUM)
  - [x] 13.1 Create IPaymentRepository interface and implementation
    - Extend IPaginatedRepository<BookingPayment>
    - Add GetUserPaymentsAsync method with filters
    - _Requirements: 7.1, 7.2_
  
  - [x] 13.2 Create payment DTOs
    - Create PaymentRequest, PaymentHistoryRequest records
    - Create PaymentResponse, PaymentDto records
    - _Requirements: 7.1, 7.2, 7.10, 7.11, 7.14_
  
  - [x] 13.3 Create payment request validators
    - Create PaymentRequestValidator
    - Validate amount, paymentMethodId, bookingId
    - _Requirements: 7.11, 14.1_
  
  - [x] 13.4 Implement IPaymentService interface and PaymentService
    - Implement ProcessPaymentAsync method
    - Create payment record linked to booking
    - Update booking status after successful payment
    - Store payment method information securely
    - _Requirements: 7.10, 7.11, 7.12, 7.13, 7.14_
  
  - [x] 13.5 Implement PaymentService GetPaymentHistoryAsync method
    - Apply filters (startDate, endDate, status, paymentMethod)
    - Apply sorting (sortBy, sortOrder)
    - Return paginated results
    - _Requirements: 7.1_
  
  - [x] 13.6 Implement PaymentService GenerateReceiptAsync method
    - Generate receipt in specified format (pdf or html)
    - Include transaction details
    - _Requirements: 7.5_
  
  - [x] 13.7 Implement PaymentsController endpoints
    - GET /api/v1/payments/history endpoint
    - GET /api/v1/payments/{transactionId} endpoint
    - GET /api/v1/payments/{transactionId}/receipt endpoint
    - GET /api/v1/payments/pending endpoint
    - GET /api/v1/payments/failed endpoint
    - POST /api/payments/create endpoint
    - All endpoints require authentication
    - Verify user owns the payment/transaction
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10_
  
  - [x] 13.8 Write property tests for payments
    - **Property 26: Payment history pagination works correctly**
    - **Validates: Requirements 7.1**
    - **Property 27: Payment details returns complete information**
    - **Validates: Requirements 7.2**
    - **Property 28: Payment creation links to booking**
    - **Validates: Requirements 7.4**
    - **Property 29: Successful payment updates booking status**
    - **Validates: Requirements 7.5**
  
  - [x] 13.9 Write unit tests for PaymentService
    - Test ProcessPaymentAsync
    - Test GetPaymentHistoryAsync with filters
    - Test GenerateReceiptAsync
    - Test payment authorization

- [x] 14. Implement Priority 3: Review APIs (MEDIUM)
  - [x] 14.1 Create review DTOs
    - Create CreateReviewRequest record
    - Create ReviewResponse, ReviewDto records
    - _Requirements: 8.1, 8.2_
  
  - [x] 14.2 Create review request validators
    - Create CreateReviewRequestValidator
    - Validate rating range (1-5)
    - Validate review text
    - _Requirements: 8.3, 14.1_
  
  - [x] 14.3 Implement IReviewService interface and ReviewService
    - Implement GetVehicleReviewsAsync method with pagination and sorting
    - Implement CreateReviewAsync method
    - Verify user has completed booking for vehicle before allowing review
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 14.4 Implement ReviewsController endpoints
    - GET /api/reviews/{vehicleId} endpoint (public)
    - POST /api/reviews/create endpoint (authenticated)
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [x] 14.5 Write unit tests for ReviewService
    - Test GetVehicleReviewsAsync with pagination and sorting
    - Test CreateReviewAsync with valid and invalid data
    - Test review authorization (completed booking check)

- [x] 15. Implement Priority 3: Notification APIs (MEDIUM)
  - [x] 15.1 Create INotificationRepository interface and implementation
    - Extend IRepository<Notification>
    - Add GetUserNotificationsAsync method
    - Add MarkAsReadAsync method
    - _Requirements: 9.1, 9.2_
  
  - [x] 15.2 Create notification DTOs
    - Create NotificationDto record
    - _Requirements: 9.1, 9.4_
  
  - [x] 15.3 Implement INotificationService interface and NotificationService
    - Implement GetUserNotificationsAsync method
    - Implement MarkAsReadAsync method
    - Implement CreateNotificationAsync method
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [x] 15.4 Implement NotificationsController endpoints
    - GET /api/notifications endpoint
    - PUT /api/notifications/{id}/read endpoint
    - Both endpoints require authentication
    - _Requirements: 9.1, 9.2_
  
  - [x] 15.5 Write unit tests for NotificationService
    - Test GetUserNotificationsAsync
    - Test MarkAsReadAsync
    - Test CreateNotificationAsync

- [ ] 16. Implement AutoMapper configuration
  - [x] 16.1 Create mapping profiles for all DTOs
    - Create AuthMappingProfile (User <-> UserDto, etc.)
    - Create VehicleMappingProfile (Vehicle <-> VehicleListDto, VehicleDetailsDto, etc.)
    - Create BookingMappingProfile (Booking <-> BookingListDto, BookingDetailsDto, etc.)
    - Create UserProfileMappingProfile (ApplicationUser <-> UserProfileDto, etc.)
    - Create PaymentMappingProfile (BookingPayment <-> PaymentDto, etc.)
    - Create ReviewMappingProfile (Review <-> ReviewDto, etc.)
    - Create NotificationMappingProfile (Notification <-> NotificationDto, etc.)
    - _Requirements: 16.5_
  
  - [x] 16.2 Register AutoMapper in Program.cs
    - Add AutoMapper to dependency injection
    - Register all mapping profiles
    - _Requirements: 16.5_


- [ ] 17. Configure dependency injection
  - [x] 17.1 Register all repositories in Program.cs
    - Register IRepository<T> and Repository<T>
    - Register IPaginatedRepository<T> and PaginatedRepository<T>
    - Register all specific repositories (IVehicleRepository, IBookingRepository, etc.)
    - _Requirements: 13.7, 15.1, 15.2_
  
  - [x] 17.2 Register all services in Program.cs
    - Register IAuthService and AuthService
    - Register IVehicleService and VehicleService
    - Register IBookingService and BookingService
    - Register IUserProfileService and UserProfileService
    - Register ILocationService and LocationService
    - Register IPaymentService and PaymentService
    - Register IReviewService and ReviewService
    - Register INotificationService and NotificationService
    - _Requirements: 13.7, 16.1, 16.2_
  
  - [x] 17.3 Register middleware in Program.cs
    - Register GlobalExceptionHandlerMiddleware
    - Register RequestLoggingMiddleware
    - Register RateLimitingMiddleware
    - Configure middleware pipeline order
    - _Requirements: 13.2, 13.3, 13.4_

- [ ] 18. Implement Priority 4: Admin vehicle management APIs (LOW)
  - [x] 18.1 Implement admin vehicle management methods in VehicleService
    - Implement CreateVehicleAsync method
    - Implement UpdateVehicleAsync method
    - Implement DeleteVehicleAsync method (soft delete)
    - Implement CheckActiveBookingsAsync method
    - _Requirements: 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [x] 18.2 Create admin vehicle DTOs and validators
    - Create CreateVehicleRequest, UpdateVehicleRequest records
    - Create validators for vehicle creation and update
    - _Requirements: 10.5_
  
  - [x] 18.3 Implement admin vehicle endpoints in VehiclesController
    - POST /api/admin/cars/create endpoint
    - PUT /api/admin/cars/{id}/edit endpoint
    - DELETE /api/delete-car/{id} endpoint
    - GET /api/check-car/{id} endpoint
    - Require Admin or Supplier role authorization
    - _Requirements: 10.2, 10.3, 10.4, 10.5_
  
  - [x] 18.4 Write unit tests for admin vehicle management
    - Test CreateVehicleAsync
    - Test UpdateVehicleAsync
    - Test DeleteVehicleAsync with and without active bookings
    - Test authorization

- [ ] 19. Implement Priority 4: Location management APIs (LOW)
  - [x] 19.1 Implement location management methods in LocationService
    - Implement GetLocationsAsync method with pagination
    - Implement CreateLocationAsync method
    - Implement UpdateLocationAsync method
    - _Requirements: 11.2, 11.3, 11.4, 11.5_
  
  - [x] 19.2 Create location DTOs and validators
    - Create CreateLocationRequest, UpdateLocationRequest records
    - Create validators for location creation and update
    - _Requirements: 11.5_
  
  - [x] 19.3 Implement location management endpoints in LocationsController
    - POST /api/locations/{page}/{size} endpoint
    - POST /api/admin/locations/create endpoint
    - PUT /api/admin/locations/{id}/edit endpoint
    - Require Admin role authorization for create/update
    - _Requirements: 11.2, 11.3, 11.4_
  
  - [x] 19.4 Write unit tests for location management
    - Test GetLocationsAsync with pagination
    - Test CreateLocationAsync
    - Test UpdateLocationAsync
    - Test authorization

- [ ] 20. Implement Priority 4: User management APIs (LOW)
  - [x] 20.1 Implement user management methods in a new UserManagementService
    - Implement GetUsersAsync method with pagination
    - Implement GetUserByIdAsync method
    - Implement CreateUserAsync method
    - Implement UpdateUserAsync method
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 20.2 Create user management DTOs and validators
    - Create CreateUserRequest, UpdateUserRequest records
    - Create validators for user creation and update
    - _Requirements: 12.5_
  
  - [x] 20.3 Implement user management endpoints in UsersController
    - POST /api/users/{page}/{size} endpoint
    - GET /api/users/{id} endpoint
    - POST /api/admin/users/create endpoint
    - PUT /api/admin/users/{id}/edit endpoint
    - Require Admin role authorization
    - _Requirements: 12.1, 12.2, 12.3, 12.4_
  
  - [x] 20.4 Write unit tests for user management
    - Test GetUsersAsync with pagination
    - Test CreateUserAsync
    - Test UpdateUserAsync
    - Test authorization

- [ ] 21. Implement Priority 4: Supplier management APIs (LOW)
  - [x] 21.1 Implement supplier management methods in a new SupplierService
    - Implement GetSuppliersAsync method with pagination
    - Implement GetSupplierByIdAsync method
    - Implement CreateSupplierAsync method
    - Implement UpdateSupplierAsync method
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
  
  - [x] 21.2 Create supplier DTOs and validators
    - Create CreateSupplierRequest, UpdateSupplierRequest records
    - Include CompanyProfile information
    - Create validators
    - _Requirements: 13.5_
  
  - [x] 21.3 Implement supplier management endpoints in a new SuppliersController
    - POST /api/suppliers/{page}/{size} endpoint
    - GET /api/suppliers/{id} endpoint
    - POST /api/admin/suppliers/create endpoint
    - PUT /api/admin/suppliers/{id}/edit endpoint
    - Require Admin role authorization
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [x] 21.4 Write unit tests for supplier management
    - Test GetSuppliersAsync with pagination
    - Test CreateSupplierAsync
    - Test UpdateSupplierAsync
    - Test authorization

- [ ] 22. Final integration testing and documentation
  - [x] 22.1 Run all property-based tests
    - Verify all 29 properties pass with 100+ iterations
    - Document any failing cases
  
  - [x] 22.2 Run all unit tests
    - Verify all unit tests pass
    - Check code coverage meets goals (Services: 80%, Repositories: 70%, Controllers: 60%)
  
  - [x] 22.3 Test API endpoints with Swagger
    - Verify all endpoints are documented
    - Test authentication flow
    - Test Priority 1 endpoints (auth, vehicle search, vehicle details)
    - Test Priority 2 endpoints (bookings, profile)
    - Test Priority 3 endpoints (payments, reviews, notifications)
  
  - [x] 22.4 Update API documentation
    - Ensure all endpoints have XML documentation comments
    - Verify Swagger UI displays correctly
    - Document authentication requirements
    - Document rate limiting

- [x] 23. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with 100+ iterations
- Unit tests validate specific examples and edge cases
- Priority 1 tasks (authentication, vehicle search/details) must be completed first
- Priority 2 tasks (bookings, profile) should be completed second
- Priority 3 and 4 tasks can be deferred if needed for faster delivery
