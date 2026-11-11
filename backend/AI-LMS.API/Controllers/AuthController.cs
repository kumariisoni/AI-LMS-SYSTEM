using AI_LMS.API.DTOs;
using AI_LMS.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace AI_LMS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) ||
            string.IsNullOrWhiteSpace(dto.Email) ||
            string.IsNullOrWhiteSpace(dto.Password))
        {
            return BadRequest(new
            {
                message = "Name, email and password are required."
            });
        }

        if (!PasswordValidator.Validate(dto.Password, out var passwordErrors))
        {
            return BadRequest(new
            {
                message = passwordErrors[0],
                errors = passwordErrors
            });
        }

        var user = await _authService.Register(dto);

        if (user == null)
        {
            return Conflict(new
            {
                message = "Email already registered."
            });
        }

        return Ok(new
        {
            message = "Registration successful!",
            userId = user.Id,
            name = user.Name,
            email = user.Email,
            role = user.Role
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var token = await _authService.Login(dto);

        if (token == null)
        {
            return Unauthorized(new
            {
                message = "Invalid email or password."
            });
        }

        return Ok(new
        {
            message = "Login successful!",
            token = token
        });
    }
}