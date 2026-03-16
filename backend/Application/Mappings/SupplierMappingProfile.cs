using AutoMapper;
using Backend.Application.DTOs.Supplier;
using Backend.Domain.Entities;

namespace Backend.Application.Mappings;

/// <summary>
/// AutoMapper profile for supplier-related mappings
/// Maps between domain entities and DTOs for supplier operations
/// </summary>
public class SupplierMappingProfile : Profile
{
    public SupplierMappingProfile()
    {
        // ApplicationUser -> SupplierManagementDto
        CreateMap<ApplicationUser, SupplierManagementDto>()
            .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Email))
            .ForMember(dest => dest.FirstName, opt => opt.MapFrom(src => src.FirstName))
            .ForMember(dest => dest.LastName, opt => opt.MapFrom(src => src.LastName))
            .ForMember(dest => dest.PhoneNumber, opt => opt.MapFrom(src => src.PhoneNumber))
            .ForMember(dest => dest.EmailConfirmed, opt => opt.MapFrom(src => src.EmailConfirmed))
            .ForMember(dest => dest.PhoneNumberConfirmed, opt => opt.MapFrom(src => src.PhoneNumberConfirmed))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status))
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => src.UpdatedAt))
            .ForMember(dest => dest.Roles, opt => opt.Ignore()) // Roles are handled separately in the service
            .ForMember(dest => dest.CompanyProfile, opt => opt.Ignore()); // CompanyProfile is handled separately in the service

        // CompanyProfile -> CompanyProfileDto
        CreateMap<CompanyProfile, CompanyProfileDto>()
            .ForMember(dest => dest.CompanyName, opt => opt.MapFrom(src => src.CompanyName))
            .ForMember(dest => dest.CommercialRegistrationNumber, opt => opt.MapFrom(src => src.CommercialRegistrationNumber))
            .ForMember(dest => dest.TaxId, opt => opt.MapFrom(src => src.TaxId));
    }
}