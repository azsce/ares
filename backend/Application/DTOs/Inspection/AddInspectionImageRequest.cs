using System.ComponentModel.DataAnnotations;

namespace Backend.Application.DTOs.Inspection;

/// <summary>
/// Adds a single image URL to an inspection. The actual file upload is
/// expected to be handled by the existing file-upload infrastructure
/// (frontend uploads to /uploads and posts the returned URL here).
/// </summary>
public record AddInspectionImageRequest(
    [Required, MaxLength(500)] string ImageUrl
);
