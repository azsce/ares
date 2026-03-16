namespace Backend.Application.DTOs;

public record ErrorResponse(
    int StatusCode,
    string Message,
    List<ValidationError>? ValidationErrors = null);

public record ValidationError(
    string Field,
    string Message);
