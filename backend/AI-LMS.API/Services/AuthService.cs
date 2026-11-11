using AI_LMS.API.Data;
using AI_LMS.API.DTOs;
using AI_LMS.API.Models;
using BCrypt.Net;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AI_LMS.API.Services;

public class AuthService
{
    private readonly MongoDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(
        MongoDbContext context,
        IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<User?> Register(RegisterDto dto)
    {
        var existingUser = await _context.Users
            .Find(u => u.Email == dto.Email)
            .FirstOrDefaultAsync();

        if (existingUser != null)
        {
            return null;
        }

        var user = new User
        {
            Name = dto.Name,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = "Student", // Public registration is strictly forced to Student
            CreatedAt = DateTime.UtcNow
        };

        await _context.Users.InsertOneAsync(user);

        return user;
    }

    public async Task<string?> Login(LoginDto dto)
    {
        var user = await _context.Users
            .Find(u => u.Email == dto.Email)
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return null;
        }

        bool passwordValid = BCrypt.Net.BCrypt.Verify(
            dto.Password,
            user.PasswordHash
        );

        if (!passwordValid)
        {
            return null;
        }

        return GenerateToken(user);
    }

    private string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                user.Id ?? string.Empty
            ),

            new Claim(
                ClaimTypes.Name,
                user.Name
            ),

            new Claim(
                ClaimTypes.Email,
                user.Email
            ),

            new Claim(
                ClaimTypes.Role,
                user.Role
            )
        };

        var configJwtKey = _configuration["Jwt:Key"];
        var envJwtKey = Environment.GetEnvironmentVariable("JWT_SECRET") ?? _configuration["JWT_SECRET"];
        var jwtKey = !string.IsNullOrWhiteSpace(envJwtKey)
            ? envJwtKey
            : (!string.IsNullOrWhiteSpace(configJwtKey)
                ? configJwtKey
                : "Learnova_AI_LMS_Secure_JWT_Key_2026_Enterprise_Edition_256Bits!");

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey)
        );

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(
                double.Parse(
                    _configuration["Jwt:DurationInMinutes"] ?? "60"
                )
            ),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}