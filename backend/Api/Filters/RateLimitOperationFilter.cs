using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Backend.Api.Filters;

/// <summary>
/// Operation filter to add rate limiting information to Swagger documentation
/// </summary>
public class RateLimitOperationFilter : IOperationFilter
{
    private static readonly Dictionary<string, string> RateLimitInfo = new()
    {
        { "/api/auth/login", "5 attempts per 15 minutes per IP address" },
        { "/api/auth/register", "5 attempts per hour per IP address" },
        { "/api/auth/forgot-password", "3 attempts per hour per IP address" },
        { "/api/auth/reset-password", "3 attempts per hour per IP address" }
    };

    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var path = context.ApiDescription.RelativePath?.ToLowerInvariant();
        
        if (string.IsNullOrEmpty(path))
            return;

        // Check if this endpoint has specific rate limiting
        var rateLimitRule = RateLimitInfo.FirstOrDefault(kvp => 
            path.StartsWith(kvp.Key.ToLowerInvariant())).Value;

        if (!string.IsNullOrEmpty(rateLimitRule))
        {
            // Add rate limiting information to operation description
            operation.Description = $"{operation.Description}\n\n**Rate Limiting**: {rateLimitRule}";

            // Add 429 response if not already present
            if (!operation.Responses.ContainsKey("429"))
            {
                operation.Responses.Add("429", new OpenApiResponse
                {
                    Description = "Too Many Requests - Rate limit exceeded"
                });
            }
        }
        else if (IsProtectedEndpoint(path))
        {
            // Add general rate limiting info for protected endpoints
            operation.Description = $"{operation.Description}\n\n**Rate Limiting**: Standard rate limiting applies to prevent abuse";
        }
    }

    private static bool IsProtectedEndpoint(string path)
    {
        // Most API endpoints have some form of rate limiting
        return path.StartsWith("/api/") && 
               !path.StartsWith("/api/vehicles/") && // Vehicle search endpoints are less restricted
               !path.StartsWith("/api/locations/autocomplete"); // Location autocomplete is less restricted
    }
}