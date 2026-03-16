# Requirements Document

## Introduction

This document specifies the requirements for implementing a comprehensive backend API infrastructure for a car rental application. The system will provide RESTful APIs for authentication, vehicle management, booking operations, user management, payments, notifications, and reviews. The backend uses ASP.NET Core with Clean Architecture, ASP.NET Identity for authentication, Entity Framework Core for data access, and SQL Server as the database.

## API Endpoint Mapping

This section maps the frontend API expectations to backend implementation requirements. The backend MUST implement these exact endpoints with the specified request/response formats.

### Priority 1 Endpoints (Authentication & Vehicle Search)

| Frontend Endpoint | Method | Purpose | Frontend Page |
|-------------------|--------|---------|---------------|
| `/api/auth/login` | POST | User authentication | `/sign-in` |
| `/api/auth/register` | POST | User registration | `/sign-up` |
| `/api/locations/autocomplete` | GET | Location search suggestions | `/search` |
| `/api/vehicles/search` | GET | Search available vehicles | `/search` |
| `/api/vehicles/{vehicleId}` | GET | Vehicle details | `/vehicles/[vehicleId]` |
| `/api/vehicles/{vehicleId}/availability` | GET | Vehicle availability calendar | `/vehicles/[vehicleId]` |
| `/api/vehicles/{vehicleId}/pricing` | GET | Calculate rental pricing | `/vehicles/[vehicleId]` |
| `/api/vehicles/{vehicleId}/reviews` | GET | Vehicle reviews | `/vehicles/[vehicleId]` |
| `/api/vehicles/{vehicleId}/images` | GET | Vehicle image gallery | `/vehicles/[vehicleId]` |

### Priority 2 Endpoints (Booking & Profile)

| Frontend Endpoint | Method | Purpose | Frontend Page |
|-------------------|--------|---------|---------------|
| `/api/booking/:id/:language` | GET | Get booking details | `/booking/[id]` |
| `/api/cancel-booking/:id` | POST | Cancel booking | `/booking/[id]` |
| `/api/has-bookings/:driver` | GET | Check if user has bookings | `/bookings` |
| `/api/bookings/:page/:size/:language` | POST | Paginated bookings list | `/bookings` |
| `/api/bookings/history` | GET | Booking history | `/account/bookings` |
| `/api/users/{userId}/profile` | GET | Get user profile | `/account/profile` |
| `/api/users/{userId}/profile` | PUT | Update user profile | `/account/profile` |
| `/api/users/{userId}/profile/photo` | POST | Upload profile photo | `/account/profile` |

### Priority 3 Endpoints (Payments & Additional Features)

| Frontend Endpoint | Method | Purpose | Frontend Page |
|-------------------|--------|---------|---------------|
| `/api/v1/payments/history` | GET | Payment history | `/account/payments` |
| `/api/v1/payments/{transactionId}` | GET | Payment details | `/account/payments` |
| `/api/v1/payments/{transactionId}/receipt` | GET | Download receipt | `/account/payments` |
| `/api/vehicles/{vehicleId}/favorites` | POST | Add to favorites | `/vehicles/[vehicleId]` |

## Glossary

- **System**: The backend API infrastructure
- **API**: Application Programming Interface
- **User**: Any authenticated person using the system (Customer, Admin, Supplier)
- **Customer**: A user who rents vehicles
- **Admin**: A user with administrative privileges
- **Supplier**: A user who provides vehicles for rent
- **Vehicle**: A car available for rental
- **Booking**: A reservation for a vehicle
- **Driver**: A professional driver who can be hired with a vehicle
- **Payment**: A financial transaction for a booking
- **Review**: Customer feedback for a vehicle
- **Notification**: A system message sent to users
- **Location**: A geographic place where vehicles can be picked up or returned
- **JWT**: JSON Web Token for authentication
- **DTO**: Data Transfer Object
- **Repository**: Data access abstraction layer
- **Service**: Business logic layer component
- **Controller**: API endpoint handler
- **Middleware**: Request/response processing component
- **Validator**: Input validation component
- **Inspector**: A user who performs vehicle inspections
- **VehicleInspection**: A record of vehicle condition assessment
- **CompanyProfile**: Business information for suppliers

## Requirements Priority

The requirements are organized by priority based on frontend page dependencies:

**Priority 1 (Critical)**: Authentication, Vehicle Search/Listing, Vehicle Details
**Priority 2 (High)**: Booking Creation, Booking Management, Customer Profile
**Priority 3 (Medium)**: Payments, Reviews, Notifications
**Priority 4 (Low)**: Admin features, Supplier management, Inspector features

## Requirements

### Requirement 1: User Authentication and Authorization (Priority 1)

**User Story:** As a user, I want to register, login, and manage my account securely, so that I can access the car rental system with proper authentication.

**Frontend Dependencies:**
- `/sign-in` - Login page
- `/sign-up` - Register page
- All authenticated routes

#### Acceptance Criteria

1. WHEN a user submits valid registration data to POST `/api/auth/register`, THE System SHALL create a new user account with hashed password and return userId, email, emailVerified status, and message
2. WHEN a user submits valid login credentials to POST `/api/auth/login`, THE System SHALL return a JWT token, expiresAt timestamp, and user object containing id, email, firstName, lastName, roles array, and emailVerified status
3. WHEN a user includes stayConnected=true in login request, THE System SHALL extend session up to 400 days
4. WHEN invalid credentials are submitted to login endpoint, THE System SHALL return 401 Unauthorized
5. WHEN an unverified account attempts login, THE System SHALL return 403 Forbidden
6. WHEN registration receives duplicate email, THE System SHALL return 409 Conflict
7. WHEN registration receives invalid data, THE System SHALL return 400 Bad Request with validation errors
8. THE System SHALL implement rate limiting: 5 login attempts per 15 minutes, 5 registration attempts per hour per IP
9. WHEN a user requests password reset, THE System SHALL send a password reset token via email
10. WHEN a user submits a valid reset token and new password, THE System SHALL update the user password
11. WHEN a user verifies their email with a valid token, THE System SHALL mark the email as confirmed
12. WHEN an authenticated request is received, THE System SHALL validate the JWT token
13. WHEN a user attempts an unauthorized action, THE System SHALL return a 403 Forbidden response
14. THE System SHALL support role-based authorization for Customer, Admin, and Supplier roles

**API Contract:**

POST `/api/auth/register`
- Request: `{ email, password, firstName, lastName, acceptedTerms, acceptedPrivacy }`
- Response 201: `{ userId, email, emailVerified: false, message }`
- Errors: 400 (validation), 409 (duplicate email), 429 (rate limit)

POST `/api/auth/login`
- Request: `{ email, password, stayConnected? }`
- Response 200: `{ token, expiresAt, user: { id, email, firstName, lastName, roles[], emailVerified } }`
- Errors: 401 (invalid credentials), 403 (unverified/suspended), 429 (rate limit)

### Requirement 2: Vehicle Search and Listing (Priority 1)

**User Story:** As a customer, I want to search and browse available vehicles, so that I can find a vehicle that meets my needs.

**Frontend Dependencies:**
- `/` - Home page (featured vehicles)
- `/search` - Vehicle search/listing page

#### Acceptance Criteria

1. WHEN a GET request to `/api/locations/autocomplete` with query parameter (min 3 chars) is received, THE System SHALL return matching location suggestions with locationId, displayText, address, locationType, distance, and isLandmark
2. WHEN a GET request to `/api/vehicles/search` with pickupLocationId, pickupDate, and returnDate is received, THE System SHALL return available vehicles with pagination
3. WHEN vehicle search includes optional filters (returnLocationId, category, transmission, minPrice, maxPrice), THE System SHALL return only vehicles matching all specified filters
4. WHEN vehicle search includes sortBy parameter (price, distance, rating), THE System SHALL return vehicles sorted accordingly
5. THE System SHALL return vehicle data including vehicleId, make, model, category, dailyRate, currency, imageUrl, rating, reviewCount, distance, and available status
6. THE System SHALL validate search parameters before executing queries
7. THE System SHALL support pagination with page and limit parameters (default: page=1, limit=20)
8. THE System SHALL return total count of matching vehicles for pagination

**API Contract:**

GET `/api/locations/autocomplete?query={term}&type={pickup|dropoff}`
- Response 200: `{ suggestions: [{ locationId, displayText, address, locationType, distance, isLandmark }] }`

GET `/api/vehicles/search?pickupLocationId={id}&returnLocationId={id}&pickupDate={iso}&returnDate={iso}&category={cat}&transmission={manual|automatic}&minPrice={num}&maxPrice={num}&sortBy={price|distance|rating}&page={num}&limit={num}`
- Response 200: `{ vehicles: [{ vehicleId, make, model, category, dailyRate, currency, imageUrl, rating, reviewCount, distance, available }], total, page, limit }`

### Requirement 3: Vehicle Details (Priority 1)

**User Story:** As a customer, I want to view detailed information about a vehicle, so that I can make an informed rental decision.

**Frontend Dependencies:**
- `/vehicles/[vehicleId]` - Vehicle details page

#### Acceptance Criteria

1. WHEN a GET request to `/api/vehicles/{vehicleId}` is received, THE System SHALL return complete vehicle information including specifications, features, supplier details, and current availability status
2. WHEN vehicle details request includes pickupDate and returnDate query parameters, THE System SHALL calculate and return pricing for that specific period
3. WHEN vehicle details request includes currency parameter, THE System SHALL return prices in the specified currency
4. WHEN a vehicle ID does not exist, THE System SHALL return 404 Not Found
5. WHEN a GET request to `/api/vehicles/{vehicleId}/availability` with startDate and endDate is received, THE System SHALL return availability calendar showing booked and blocked dates
6. WHEN a GET request to `/api/vehicles/{vehicleId}/pricing` with pickupDate, returnDate, and optional insuranceOptions and additionalServices is received, THE System SHALL calculate and return detailed pricing breakdown
7. WHEN pricing calculation receives invalid dates (pickup after return), THE System SHALL return 400 Bad Request
8. WHEN a GET request to `/api/vehicles/{vehicleId}/reviews` is received, THE System SHALL return paginated reviews with page, pageSize, and sortBy parameters (date, rating, helpfulness)
9. WHEN a GET request to `/api/vehicles/{vehicleId}/images` is received, THE System SHALL return vehicle image gallery with optional size parameter (thumbnail, medium, large)
10. WHEN an authenticated user sends POST request to `/api/vehicles/{vehicleId}/favorites`, THE System SHALL add vehicle to user's favorites and return 201 Created
11. WHEN an unauthenticated user attempts to add favorites, THE System SHALL return 401 Unauthorized

**API Contract:**

GET `/api/vehicles/{vehicleId}?pickupDate={iso}&returnDate={iso}&currency={code}`
- Response 200: Complete vehicle object with specs, features, supplier, availability
- Errors: 404 (not found), 500 (server error)

GET `/api/vehicles/{vehicleId}/availability?startDate={iso}&endDate={iso}`
- Response 200: Availability calendar with booked/blocked dates

GET `/api/vehicles/{vehicleId}/pricing?pickupDate={iso}&returnDate={iso}&insuranceOptions={type}&additionalServices={csv}&currency={code}`
- Response 200: Detailed pricing breakdown
- Errors: 400 (invalid dates), 404 (not found)

GET `/api/vehicles/{vehicleId}/reviews?page={num}&pageSize={num}&sortBy={date|rating|helpfulness}`
- Response 200: Paginated reviews list

GET `/api/vehicles/{vehicleId}/images?size={thumbnail|medium|large}`
- Response 200: Image gallery array

POST `/api/vehicles/{vehicleId}/favorites`
- Response 201: Success confirmation
- Errors: 401 (unauthorized), 404 (not found)

### Requirement 4: Booking Creation (Priority 2)

**User Story:** As a customer, I want to create a booking for a vehicle, so that I can reserve it for specific dates.

**Frontend Dependencies:**
- `/booking/[id]` - Booking creation page

#### Acceptance Criteria

1. WHEN a create booking request with valid data is received, THE System SHALL create a booking and mark the vehicle as unavailable for those dates
2. WHEN a create booking request is received, THE System SHALL calculate total price based on rental days and vehicle price per day
3. WHEN a create booking request is received, THE System SHALL validate that the vehicle is available for the requested dates
4. WHEN a create booking request is received, THE System SHALL validate that pickup date is before return date
5. WHEN a create booking request is received, THE System SHALL generate a unique booking number
6. THE System SHALL prevent double-booking of vehicles for overlapping dates
7. THE System SHALL support optional driver selection in booking creation
8. THE System SHALL create a notification for the customer after successful booking creation
9. THE System SHALL support payLater option in booking creation
10. THE System SHALL set initial booking status to "Pending"

**API Contract:**

POST `/api/bookings/create`
- Request: `{ vehicleId, userId, pickupLocationId, dropOffLocationId, pickupDate, returnDate, driverId?, payLater }`
- Response 201: `{ bookingId, bookingNumber, status, totalPrice, message }`
- Errors: 400 (validation/unavailable), 401 (unauthorized), 409 (double booking)

### Requirement 5: Booking Management (Priority 2)

**User Story:** As a customer, I want to view and manage my bookings, so that I can track my rental history and upcoming reservations.

**Frontend Dependencies:**
- `/bookings` - Customer bookings list
- `/account/bookings` - Customer bookings list (alternate route)
- `/booking/[id]` - Booking details page

#### Acceptance Criteria

1. WHEN a GET request to `/api/has-bookings/:driver` is received, THE System SHALL return 200 if driver has bookings or 204 if no bookings found
2. WHEN a POST request to `/api/bookings/:page/:size/:language` with user filter is received, THE System SHALL return paginated bookings with resultData array and pageInfo containing totalRecords
3. WHEN bookings request includes suppliers filter, THE System SHALL return only bookings from specified suppliers
4. WHEN bookings request includes statuses filter, THE System SHALL return only bookings with specified statuses (Pending, Deposit, Paid, Reserved, Cancelled)
5. WHEN bookings request includes date range filter (from/to), THE System SHALL return only bookings within that range
6. WHEN bookings request includes keyword filter, THE System SHALL search across booking number, vehicle name, and location names
7. WHEN bookings request includes location filters (pickupLocation, dropOffLocation), THE System SHALL return only matching bookings
8. WHEN a GET request to `/api/booking/:id/:language` is received, THE System SHALL return complete booking details including car, driver, locations, dates, price, status, and payLater flag
9. WHEN booking details request is for a booking not belonging to the authenticated user, THE System SHALL return 403 Forbidden
10. WHEN booking details request is for non-existent booking, THE System SHALL return 404 Not Found
11. WHEN a POST request to `/api/cancel-booking/:id` is received for an eligible booking, THE System SHALL cancel the booking and return 200
12. WHEN cancel request is for a booking that cannot be cancelled (wrong status), THE System SHALL return 400 Bad Request
13. WHEN cancel request is for a booking not belonging to the user, THE System SHALL return 403 Forbidden
14. WHEN a GET request to `/api/bookings/history` is received, THE System SHALL return paginated booking history with filtering by status, date range, supplier, and search term
15. WHEN bookings history request includes sortBy parameter (date, price, status), THE System SHALL return bookings sorted accordingly
16. THE System SHALL include vehicle information (id, name, image) in booking responses
17. THE System SHALL include supplier information (id, fullName) in booking responses
18. THE System SHALL include location information (id, name) for both pickup and dropoff in booking responses

**API Contract:**

GET `/api/has-bookings/:driver`
- Response: 200 (has bookings) or 204 (no bookings)

POST `/api/bookings/:page/:size/:language`
- Request: `{ user, suppliers[], statuses[], car?, filter: { from?, to?, keyword?, pickupLocation?, dropOffLocation? } }`
- Response 200: `{ resultData: [{ _id, car: {_id, name, image}, supplier: {_id, fullName}, pickupLocation: {_id, name}, dropOffLocation: {_id, name}, from, to, price, status }], pageInfo: [{ totalRecords }] }`

GET `/api/booking/:id/:language`
- Response 200: `{ _id, car: {_id, name, image, supplier: {_id, fullName}}, driver: {_id, fullName, email}, pickupLocation: {_id, name}, dropOffLocation: {_id, name}, from, to, price, status, payLater }`
- Errors: 401 (unauthorized), 403 (forbidden), 404 (not found)

POST `/api/cancel-booking/:id`
- Response: 200 (success), 400 (cannot cancel), 403 (forbidden), 404 (not found)

GET `/api/bookings/history?status={csv}&startDate={iso}&endDate={iso}&supplierId={id}&search={term}&page={num}&limit={num}&sortBy={date|price|status}&sortOrder={asc|desc}`
- Response 200: Paginated booking history

### Requirement 6: Customer Profile Management (Priority 2)

**User Story:** As a customer, I want to view and update my profile, so that I can keep my account information current.

**Frontend Dependencies:**
- `/account/profile` - Customer profile page

#### Acceptance Criteria

1. WHEN a GET request to `/api/users/{userId}/profile` is received, THE System SHALL return complete user profile including firstName, lastName, email, emailVerified, phone, phoneVerified, dateOfBirth, profilePhotoUrl, address object, emergencyContact object, languagePreference, currencyPreference, profileCompleteness percentage, and verificationStatus object
2. WHEN profile request is for a different user than authenticated user, THE System SHALL return 403 Forbidden
3. WHEN profile request is for non-existent user, THE System SHALL return 404 Not Found
4. WHEN a PUT request to `/api/users/{userId}/profile` with valid data is received, THE System SHALL update the user profile and return success message with verificationRequired flags
5. WHEN profile update includes email change, THE System SHALL validate email uniqueness and return 409 if already in use
6. WHEN profile update includes phone change, THE System SHALL validate phone uniqueness and return 409 if already in use
7. WHEN profile update includes invalid data, THE System SHALL return 400 with validation errors
8. WHEN a POST request to `/api/users/{userId}/profile/photo` with multipart form data is received, THE System SHALL upload the profile photo and return the new photo URL
9. WHEN profile photo upload receives invalid file type or size, THE System SHALL return 400 Bad Request
10. THE System SHALL calculate profileCompleteness based on filled fields (0-100 percentage)
11. THE System SHALL include verificationStatus with email, phone, driverLicense booleans and kyc level (none, basic, standard, enhanced)
12. THE System SHALL support updating address with street, city, state, postalCode, and country
13. THE System SHALL support updating emergencyContact with name, phone, and relationship

**API Contract:**

GET `/api/users/{userId}/profile`
- Response 200: `{ userId, firstName, lastName, email, emailVerified, phone, phoneVerified, dateOfBirth, profilePhotoUrl, address: {street, city, state, postalCode, country}, emergencyContact: {name, phone, relationship}, languagePreference, currencyPreference, profileCompleteness, verificationStatus: {email, phone, driverLicense, kyc} }`
- Errors: 401 (unauthorized), 403 (forbidden), 404 (not found)

PUT `/api/users/{userId}/profile`
- Request: `{ firstName, lastName, phone, dateOfBirth, address: {street, city, state, postalCode, country}, emergencyContact: {name, phone, relationship}, languagePreference, currencyPreference }`
- Response 200: `{ success: true, message, verificationRequired: {email, phone} }`
- Errors: 400 (validation), 401 (unauthorized), 409 (email/phone in use)

POST `/api/users/{userId}/profile/photo`
- Request: multipart/form-data with photo field
- Response 200: `{ success: true, profilePhotoUrl }`
- Errors: 400 (invalid file), 401 (unauthorized)

### Requirement 7: Payment Processing (Priority 3)

**User Story:** As a customer, I want to process payments for bookings and view my payment history, so that I can complete my vehicle rental transactions and track my spending.

**Frontend Dependencies:**
- `/account/payments` - Payment history page

#### Acceptance Criteria

1. WHEN a GET request to `/api/v1/payments/history` is received, THE System SHALL return paginated payment transaction history with filtering by startDate, endDate, status, paymentMethod, and sorting options
2. WHEN a GET request to `/api/v1/payments/{transactionId}` is received, THE System SHALL return complete transaction details
3. WHEN payment details request is for a transaction not belonging to the user, THE System SHALL return 403 Forbidden
4. WHEN payment details request is for non-existent transaction, THE System SHALL return 404 Not Found
5. WHEN a GET request to `/api/v1/payments/{transactionId}/receipt` is received, THE System SHALL generate and return receipt file in specified format (pdf or html, default pdf)
6. WHEN a GET request to `/api/v1/refunds/{refundId}` is received, THE System SHALL return refund details and status timeline
7. WHEN a GET request to `/api/v1/payments/export` is received, THE System SHALL generate payment history export file in specified format (csv, pdf, excel) with optional refunds inclusion
8. WHEN a GET request to `/api/v1/payments/pending` is received, THE System SHALL return pending payment transactions with due dates
9. WHEN a GET request to `/api/v1/payments/failed` is received, THE System SHALL return recent failed payment attempts with optional limit parameter (default 10)
10. WHEN a payment request with valid data is received, THE System SHALL create a payment record linked to the booking
11. THE System SHALL validate payment data including amount and payment method
12. THE System SHALL update booking status after successful payment
13. THE System SHALL store payment method information securely
14. THE System SHALL support multiple payment methods (credit card, debit card, PayPal)

**API Contract:**

GET `/api/v1/payments/history?startDate={date}&endDate={date}&status={status}&paymentMethod={method}&page={num}&pageSize={num}&sortBy={field}&sortOrder={asc|desc}`
- Response 200: Paginated transaction list

GET `/api/v1/payments/{transactionId}`
- Response 200: Complete transaction details
- Errors: 401 (unauthorized), 403 (forbidden), 404 (not found)

GET `/api/v1/payments/{transactionId}/receipt?format={pdf|html}`
- Response 200: Receipt file
- Errors: 401 (unauthorized), 403 (forbidden), 404 (not found)

GET `/api/v1/refunds/{refundId}`
- Response 200: Refund details and status timeline

GET `/api/v1/payments/export`
- Request body: `{ startDate, endDate, format: csv|pdf|excel, includeRefunds }`
- Response 200: Export file download

GET `/api/v1/payments/pending`
- Response 200: Pending transactions with due dates

GET `/api/v1/payments/failed?limit={num}`
- Response 200: Recent failed payment attempts

POST `/api/payments/create`
- Request: `{ bookingId, amount, paymentMethodId, paymentMethod }`
- Response 201: `{ transactionId, status, message }`
- Errors: 400 (validation), 401 (unauthorized)

### Requirement 8: Review System (Priority 3)

**User Story:** As a customer, I want to create and view reviews for vehicles, so that I can share my experience and help other customers.

#### Acceptance Criteria

1. WHEN a create review request with valid data is received, THE System SHALL create a review record linked to the vehicle and user
2. WHEN a request for vehicle reviews is received, THE System SHALL return all reviews for the specified vehicle
3. THE System SHALL validate review data including rating range (1-5)
4. THE System SHALL only allow customers who have completed bookings to create reviews
5. THE System SHALL calculate and return average rating for vehicles

### Requirement 9: Notification System (Priority 3)

**User Story:** As a user, I want to receive and manage notifications, so that I stay informed about important events.

#### Acceptance Criteria

1. WHEN a request for user notifications is received, THE System SHALL return all notifications for the authenticated user
2. WHEN a mark notification as read request is received, THE System SHALL update the notification status
3. THE System SHALL create notifications for booking confirmations, cancellations, and payment confirmations
4. THE System SHALL include notification type, message, and timestamp in notification records
5. THE System SHALL support real-time notification delivery

### Requirement 10: Admin Vehicle Management (Priority 4)

**User Story:** As an admin or supplier, I want to manage vehicle listings, so that the vehicle inventory is maintained.

#### Acceptance Criteria

1. WHEN a request to check vehicle bookings is received, THE System SHALL return whether the vehicle has active bookings
2. WHEN a delete vehicle request is received for a vehicle without active bookings, THE System SHALL soft delete the vehicle
3. WHEN a create vehicle request with valid data is received, THE System SHALL create a new vehicle record
4. WHEN an update vehicle request with valid data is received, THE System SHALL update the vehicle record
5. THE System SHALL validate vehicle data against business rules before persisting
6. THE System SHALL support uploading multiple vehicle images

### Requirement 11: Location Management (Priority 4)

**User Story:** As a user, I want to search and manage locations, so that I can find vehicles near my desired pickup location.

#### Acceptance Criteria

1. WHEN an autocomplete request with a search term is received, THE System SHALL return matching location suggestions
2. WHEN a request for paginated locations is received, THE System SHALL return locations with pagination metadata
3. WHEN a create location request with valid data is received, THE System SHALL create a new location record
4. WHEN an update location request with valid data is received, THE System SHALL update the location record
5. THE System SHALL validate location data to ensure required fields are present

### Requirement 12: User Management (Priority 4)

**User Story:** As an admin, I want to manage user accounts, so that I can maintain the user base and handle user-related operations.

#### Acceptance Criteria

1. WHEN a request for paginated users is received, THE System SHALL return users with pagination metadata
2. WHEN a request for user details is received, THE System SHALL return complete user information
3. WHEN a create user request with valid data is received, THE System SHALL create a new user account
4. WHEN an update user request with valid data is received, THE System SHALL update the user record
5. THE System SHALL validate user data against business rules before persisting

### Requirement 13: Supplier Management (Priority 4)

**User Story:** As an admin, I want to manage supplier accounts, so that I can onboard and maintain vehicle suppliers.

#### Acceptance Criteria

1. WHEN a request for paginated suppliers is received, THE System SHALL return suppliers with pagination metadata
2. WHEN a request for supplier details is received, THE System SHALL return complete supplier information including company profile
3. WHEN a create supplier request with valid data is received, THE System SHALL create a new supplier account
4. WHEN an update supplier request with valid data is received, THE System SHALL update the supplier record
5. THE System SHALL validate supplier data including company profile information

### Requirement 14: Data Validation and Error Handling

**User Story:** As a developer, I want comprehensive validation and error handling, so that the API provides clear feedback and maintains data integrity.

#### Acceptance Criteria

1. WHEN invalid data is submitted to any endpoint, THE System SHALL return a 400 Bad Request with validation errors
2. WHEN a resource is not found, THE System SHALL return a 404 Not Found response
3. WHEN an unhandled exception occurs, THE System SHALL return a 500 Internal Server Error with a generic message
4. WHEN validation fails, THE System SHALL return all validation errors in a structured format
5. THE System SHALL use FluentValidation for all request DTO validation
6. THE System SHALL log all errors with appropriate severity levels
7. THE System SHALL not expose sensitive information in error responses

### Requirement 15: Repository Pattern Implementation

**User Story:** As a developer, I want a consistent data access layer, so that database operations are abstracted and testable.

#### Acceptance Criteria

1. THE System SHALL implement a generic repository interface with CRUD operations
2. THE System SHALL implement specific repositories for each domain entity
3. WHEN a repository method is called, THE System SHALL execute the corresponding database operation
4. THE System SHALL support asynchronous database operations
5. THE System SHALL implement pagination support in repository methods
6. THE System SHALL implement filtering and sorting capabilities in repository methods

### Requirement 16: Service Layer Implementation

**User Story:** As a developer, I want business logic separated from controllers, so that the application follows Clean Architecture principles.

#### Acceptance Criteria

1. THE System SHALL implement service interfaces in the Application layer
2. THE System SHALL implement service classes that contain business logic
3. WHEN a service method is called, THE System SHALL execute business rules and coordinate repository operations
4. THE System SHALL use DTOs for data transfer between layers
5. THE System SHALL implement AutoMapper for entity-to-DTO mapping
6. THE System SHALL validate business rules in service methods

### Requirement 17: API Configuration and Middleware

**User Story:** As a developer, I want proper API configuration, so that the application is secure, performant, and maintainable.

#### Acceptance Criteria

1. THE System SHALL configure CORS to allow requests from the Next.js frontend
2. THE System SHALL implement global exception handling middleware
3. THE System SHALL configure JWT authentication middleware
4. THE System SHALL implement request logging middleware
5. THE System SHALL configure Swagger/OpenAPI documentation
6. THE System SHALL implement rate limiting for API endpoints
7. THE System SHALL configure dependency injection for all services and repositories

### Requirement 18: Auditing and Timestamps

**User Story:** As a developer, I want automatic auditing of entity changes, so that we can track when records are created and modified.

#### Acceptance Criteria

1. WHEN an entity is created, THE System SHALL automatically set the CreatedAt timestamp
2. WHEN an entity is updated, THE System SHALL automatically set the UpdatedAt timestamp
3. THE System SHALL use an EF Core interceptor for automatic timestamp management
4. THE System SHALL apply auditing to all entities that inherit from AuditableEntity

### Requirement 19: Pagination and Filtering

**User Story:** As a user, I want to paginate and filter large datasets, so that I can efficiently browse through records.

#### Acceptance Criteria

1. WHEN a paginated request is received, THE System SHALL return data with page number, page size, total count, and total pages
2. THE System SHALL support filtering by multiple criteria
3. THE System SHALL support sorting by specified fields
4. THE System SHALL validate pagination parameters to prevent invalid requests
5. THE System SHALL implement a generic pagination response DTO

### Requirement 20: Booking Cancellation (Priority 3)

**User Story:** As a customer, I want to cancel bookings, so that I can change my rental plans.

#### Acceptance Criteria

1. WHEN a booking cancellation request is received, THE System SHALL create a cancellation record
2. WHEN a booking is cancelled, THE System SHALL update the booking status to cancelled
3. WHEN a booking is cancelled, THE System SHALL make the vehicle available again
4. THE System SHALL calculate cancellation fees based on cancellation policy
5. THE System SHALL validate that only the booking owner or admin can cancel bookings

### Requirement 21: Structured Logging

**User Story:** As a developer, I want structured logging throughout the application, so that we can monitor and troubleshoot issues effectively.

#### Acceptance Criteria

1. THE System SHALL use Serilog for structured logging
2. THE System SHALL log all API requests with method, path, and response time
3. THE System SHALL log all exceptions with stack traces
4. THE System SHALL log authentication events
5. THE System SHALL configure different log levels for development and production
6. THE System SHALL write logs to both console and file sinks
