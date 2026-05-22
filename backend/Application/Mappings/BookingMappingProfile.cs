using AutoMapper;
using Backend.Application.DTOs.Booking;
using Backend.Application.DTOs.Common;
using Backend.Domain.Entities;

namespace Backend.Application.Mappings;

/// <summary>
/// AutoMapper profile for booking-related mappings.
///
/// NOTE: BookingService now builds <see cref="BookingListDto"/> and
/// <see cref="BookingDetailsDto"/> manually because both DTOs contain
/// composite, conditional, and async-resolved data (latest payment,
/// inspection overview, supplier company-name fallback). The AutoMapper
/// definitions below are intentionally minimal — they only cover the
/// simple, side-effect-free mappings still consumed elsewhere in the
/// codebase, and they exist primarily so the AutoMapper startup
/// AssertConfigurationIsValid pass succeeds.
/// </summary>
public class BookingMappingProfile : Profile
{
    public BookingMappingProfile()
    {
        // Driver -> DriverDto (consumed elsewhere; safe to keep).
        CreateMap<Driver, DriverDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(
                dest => dest.FullName,
                opt => opt.MapFrom(src =>
                    src.User != null ? $"{src.User.FirstName} {src.User.LastName}" : string.Empty))
            .ForMember(
                dest => dest.Phone,
                opt => opt.MapFrom(src =>
                    src.User != null && src.User.PhoneNumber != null
                        ? src.User.PhoneNumber
                        : string.Empty));
    }
}