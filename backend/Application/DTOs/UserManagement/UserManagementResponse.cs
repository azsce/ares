namespace Backend.Application.DTOs.UserManagement;

/// <summary>
/// Response DTO for user management operations
/// </summary>
public record UserManagementResponse(
    bool Success,
    string Message,
    Guid? UserId = null
);