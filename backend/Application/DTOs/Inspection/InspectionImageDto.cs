using System;

namespace Backend.Application.DTOs.Inspection;

public record InspectionImageDto(
    Guid Id,
    Guid InspectionId,
    string ImageUrl,
    DateTime CreatedAt
);
