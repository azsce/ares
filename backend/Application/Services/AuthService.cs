using Backend.Application.DTOs.Auth;
using Backend.Application.Exceptions;
using Backend.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Backend.Application.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        IJwtTokenService jwtTokenService,
        ILogger<AuthService> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtTokenService = jwtTokenService;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Registration attempt for email: {Email}", request.Email);

        // Check if email already exists
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
        {
            _logger.LogWarning("Registration failed: Email already exists - {Email}", request.Email);
            throw new ConflictException("Email is already registered");
        }

        // Create new user
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            EmailConfirmed = false
        };

        var result = await _userManager.CreateAsync(user, request.Password);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            _logger.LogWarning("Registration failed for {Email}: {Errors}", request.Email, errors);
            var errorDict = new Dictionary<string, string[]>
            {
                { "Password", result.Errors.Select(e => e.Description).ToArray() }
            };
            throw new ValidationException(errorDict);
        }

        // Assign default Customer role
        await _userManager.AddToRoleAsync(user, "Customer");

        // Generate email confirmation token
        var emailToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        
        // TODO: Send email verification email with token
        _logger.LogInformation("User registered successfully: {UserId}, Email: {Email}", user.Id, user.Email);

        return new AuthResponse(
            UserId: user.Id,
            Email: user.Email!,
            EmailVerified: false,
            Message: "Registration successful. Please check your email to verify your account."
        );
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Login attempt for email: {Email}", request.Email);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            _logger.LogWarning("Login failed: User not found - {Email}", request.Email);
            throw new UnauthorizedException("Invalid email or password");
        }

        // Check if email is verified
        if (!user.EmailConfirmed)
        {
            _logger.LogWarning("Login failed: Email not verified - {Email}", request.Email);
            throw new ForbiddenException("Email not verified. Please verify your email before logging in.");
        }

        // Check if account is locked
        if (await _userManager.IsLockedOutAsync(user))
        {
            _logger.LogWarning("Login failed: Account locked - {Email}", request.Email);
            throw new ForbiddenException("Account is locked. Please try again later.");
        }

        // Verify password
        var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        
        if (!result.Succeeded)
        {
            if (result.IsLockedOut)
            {
                _logger.LogWarning("Account locked out after failed login attempt - {Email}", request.Email);
                throw new ForbiddenException("Account is locked due to multiple failed login attempts.");
            }

            _logger.LogWarning("Login failed: Invalid password - {Email}", request.Email);
            throw new UnauthorizedException("Invalid email or password");
        }

        // Get user roles
        var roles = await _userManager.GetRolesAsync(user);

        // Generate JWT token
        var stayConnected = request.StayConnected ?? false;
        var token = _jwtTokenService.GenerateToken(user, roles, stayConnected);
        var expiresAt = _jwtTokenService.GetTokenExpiration(stayConnected);

        _logger.LogInformation("User logged in successfully: {UserId}, Email: {Email}", user.Id, user.Email);

        return new LoginResponse(
            Token: token,
            ExpiresAt: expiresAt,
            User: new UserDto(
                Id: user.Id,
                Email: user.Email!,
                FirstName: user.FirstName ?? string.Empty,
                LastName: user.LastName ?? string.Empty,
                Roles: roles.ToList(),
                EmailVerified: user.EmailConfirmed
            )
        );
    }

    public async Task<bool> ForgotPasswordAsync(ForgotPasswordRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Password reset requested for email: {Email}", request.Email);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            // Don't reveal that the user doesn't exist
            _logger.LogInformation("Password reset requested for non-existent email: {Email}", request.Email);
            return true;
        }

        // Generate password reset token
        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

        // TODO: Send password reset email with token
        _logger.LogInformation("Password reset token generated for user: {UserId}", user.Id);

        return true;
    }

    public async Task<bool> ResetPasswordAsync(ResetPasswordRequest request, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Password reset attempt for email: {Email}", request.Email);

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
        {
            _logger.LogWarning("Password reset failed: User not found - {Email}", request.Email);
            throw new NotFoundException("User not found");
        }

        var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            _logger.LogWarning("Password reset failed for {Email}: {Errors}", request.Email, errors);
            var errorDict = new Dictionary<string, string[]>
            {
                { "Password", result.Errors.Select(e => e.Description).ToArray() }
            };
            throw new ValidationException(errorDict);
        }

        _logger.LogInformation("Password reset successful for user: {UserId}", user.Id);
        return true;
    }

    public async Task<bool> VerifyEmailAsync(string userId, string token, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Email verification attempt for user: {UserId}", userId);

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
        {
            _logger.LogWarning("Email verification failed: User not found - {UserId}", userId);
            throw new NotFoundException("User not found");
        }

        var result = await _userManager.ConfirmEmailAsync(user, token);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            _logger.LogWarning("Email verification failed for {UserId}: {Errors}", userId, errors);
            var errorDict = new Dictionary<string, string[]>
            {
                { "Token", result.Errors.Select(e => e.Description).ToArray() }
            };
            throw new ValidationException(errorDict);
        }

        _logger.LogInformation("Email verified successfully for user: {UserId}", userId);
        return true;
    }
}
