using Backend.Application.DTOs.Common;
using Backend.Application.DTOs.Review;
using Backend.Application.Exceptions;
using Backend.Application.Interfaces;
using Backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Application.Services;

/// <summary>
/// Service implementation for review-related operations
/// Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5
/// </summary>
public class ReviewService : IReviewService
{
    private readonly IReviewRepository _reviewRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IApplicationDbContext _context;

    public ReviewService(
        IReviewRepository reviewRepository,
        IBookingRepository bookingRepository,
        IVehicleRepository vehicleRepository,
        IApplicationDbContext context)
    {
        _reviewRepository = reviewRepository;
        _bookingRepository = bookingRepository;
        _vehicleRepository = vehicleRepository;
        _context = context;
    }

    public async Task<PagedResult<ReviewDto>> GetVehicleReviewsAsync(
        Guid vehicleId,
        int page,
        int pageSize,
        string sortBy,
        CancellationToken cancellationToken = default)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(vehicleId, cancellationToken);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {vehicleId} not found");
        }

        var reviews = await _reviewRepository.GetVehicleReviewsAsync(
            vehicleId,
            page,
            pageSize,
            sortBy,
            cancellationToken);

        var totalCount = await _context.Reviews
            .CountAsync(r => r.VehicleId == vehicleId, cancellationToken);

        var reviewDtos = reviews.Select(r => new ReviewDto(
            r.Id,
            r.VehicleId,
            r.UserId,
            $"{r.User?.FirstName} {r.User?.LastName}".Trim(),
            r.Rating ?? 0,
            r.Comment,
            r.AdminResponse,
            r.CreatedAt
        )).ToList();

        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        return new PagedResult<ReviewDto>(
            reviewDtos,
            page,
            pageSize,
            totalCount,
            totalPages);
    }

    public async Task<ReviewResponse> CreateReviewAsync(
        CreateReviewRequest request,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(request.VehicleId, cancellationToken);
        if (vehicle == null)
        {
            throw new NotFoundException($"Vehicle with ID {request.VehicleId} not found");
        }

        var booking = await _bookingRepository.GetBookingWithDetailsAsync(
            request.BookingId,
            cancellationToken);

        if (booking == null)
        {
            throw new NotFoundException($"Booking with ID {request.BookingId} not found");
        }

        if (booking.UserId != userId)
        {
            throw new ForbiddenException("You can only review vehicles from your own bookings");
        }

        if (booking.VehicleId != request.VehicleId)
        {
            throw new ValidationException("BookingId", "The booking does not match the vehicle being reviewed");
        }

        if (!IsBookingCompleted(booking))
        {
            throw new ValidationException("BookingId", "You can only review vehicles from completed bookings");
        }

        var existingReview = await _context.Reviews
            .FirstOrDefaultAsync(r => r.BookingId == request.BookingId, cancellationToken);

        if (existingReview != null)
        {
            throw new ConflictException("A review already exists for this booking");
        }

        var review = new Review
        {
            VehicleId = request.VehicleId,
            UserId = userId,
            BookingId = request.BookingId,
            Rating = request.Rating,
            Comment = request.Comment
        };

        var createdReview = await _reviewRepository.AddAsync(review, cancellationToken);
        await _reviewRepository.SaveChangesAsync(cancellationToken);

        return new ReviewResponse(
            createdReview.Id,
            createdReview.VehicleId,
            createdReview.Rating ?? 0,
            "Review created successfully");
    }

    private bool IsBookingCompleted(Booking booking)
    {
        var completedStatuses = new[] { Backend.Domain.Entities.Enums.BookingStatus.Completed, Backend.Domain.Entities.Enums.BookingStatus.Confirmed };
        var isStatusCompleted = completedStatuses.Contains(booking.Status);

        if (!isStatusCompleted)
        {
            return false;
        }

        if (booking.ReturnDate.HasValue && booking.ReturnDate.Value > DateTime.UtcNow)
        {
            return false;
        }

        return true;
    }
}
