using Microsoft.AspNetCore.Authorization;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System.Reflection;

namespace Backend.Api.Filters;

/// <summary>
/// Operation filter to add authentication requirement information to Swagger documentation
/// </summary>
public class AuthenticationRequirementOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Check if the action or controller has [Authorize] attribute
        var hasAuthorize = context.MethodInfo.DeclaringType?.GetCustomAttributes(true)
            .Union(context.MethodInfo.GetCustomAttributes(true))
            .OfType<AuthorizeAttribute>()
            .Any() ?? false;

        // Check if the action has [AllowAnonymous] attribute
        var hasAllowAnonymous = context.MethodInfo.GetCustomAttributes(true)
            .OfType<AllowAnonymousAttribute>()
            .Any();

        if (hasAuthorize && !hasAllowAnonymous)
        {
            // Add authentication requirement to operation description
            var authInfo = GetAuthenticationInfo(context);
            
            if (!string.IsNullOrEmpty(authInfo))
            {
                operation.Description = $"{operation.Description}\n\n**Authentication Required**: {authInfo}";
            }

            // Add 401 and 403 responses if not already present
            if (!operation.Responses.ContainsKey("401"))
            {
                operation.Responses.Add("401", new OpenApiResponse
                {
                    Description = "Unauthorized - Authentication required"
                });
            }

            if (!operation.Responses.ContainsKey("403"))
            {
                operation.Responses.Add("403", new OpenApiResponse
                {
                    Description = "Forbidden - Insufficient permissions"
                });
            }
        }
    }

    private string GetAuthenticationInfo(OperationFilterContext context)
    {
        var authorizeAttributes = context.MethodInfo.DeclaringType?.GetCustomAttributes(true)
            .Union(context.MethodInfo.GetCustomAttributes(true))
            .OfType<AuthorizeAttribute>()
            .ToList() ?? new List<AuthorizeAttribute>();

        if (!authorizeAttributes.Any())
            return string.Empty;

        var roles = authorizeAttributes
            .Where(a => !string.IsNullOrEmpty(a.Roles))
            .SelectMany(a => a.Roles!.Split(','))
            .Select(r => r.Trim())
            .Distinct()
            .ToList();

        var policies = authorizeAttributes
            .Where(a => !string.IsNullOrEmpty(a.Policy))
            .Select(a => a.Policy!)
            .Distinct()
            .ToList();

        var authInfo = new List<string>();

        if (roles.Any())
        {
            authInfo.Add($"Required roles: {string.Join(", ", roles)}");
        }

        if (policies.Any())
        {
            authInfo.Add($"Required policies: {string.Join(", ", policies)}");
        }

        if (!authInfo.Any())
        {
            authInfo.Add("Valid JWT token required");
        }

        return string.Join(". ", authInfo);
    }
}