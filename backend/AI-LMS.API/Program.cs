using AI_LMS.API.Data;
using AI_LMS.API.Services;
using AI_LMS.API.AI.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ========================================
// 1. Controllers & API Services
// ========================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();

// ========================================
// 2. Database & Application Services
// ========================================
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IGeminiService, GeminiService>();
builder.Services.AddScoped<GeminiService>();
builder.Services.AddScoped<ProgressService>();

// ========================================
// 3. JWT Authentication Configuration
// ========================================
var envJwtKey = Environment.GetEnvironmentVariable("JWT_SECRET") 
    ?? Environment.GetEnvironmentVariable("Jwt__Key");
var configJwtKey = builder.Configuration["Jwt:Key"];

var jwtKey = !string.IsNullOrWhiteSpace(envJwtKey)
    ? envJwtKey
    : (!string.IsNullOrWhiteSpace(configJwtKey) && Encoding.UTF8.GetByteCount(configJwtKey) >= 32
        ? configJwtKey
        : "Learnova_AI_LMS_Secure_JWT_Key_2026_Enterprise_Edition_256Bits!");

var jwtIssuer = Environment.GetEnvironmentVariable("Jwt__Issuer") 
    ?? builder.Configuration["Jwt:Issuer"] 
    ?? "AI-LMS";

var jwtAudience = Environment.GetEnvironmentVariable("Jwt__Audience") 
    ?? builder.Configuration["Jwt:Audience"] 
    ?? "AI-LMS-Users";

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,

            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey)
            ),

            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

// ========================================
// 4. Authorization
// ========================================
builder.Services.AddAuthorization();

// ========================================
// 5. CORS Configuration
// ========================================
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") 
    ?? builder.Configuration["FRONTEND_URL"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var allowedOrigins = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "https://localhost:5173",
            "https://localhost:5174"
        };

        if (!string.IsNullOrWhiteSpace(frontendUrl))
        {
            var splitOrigins = frontendUrl
                .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Select(u => u.TrimEnd('/'));

            foreach (var o in splitOrigins)
            {
                allowedOrigins.Add(o);
            }
        }

        policy.WithOrigins(allowedOrigins.ToArray())
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ========================================
// 6. Build Application
// ========================================
var app = builder.Build();

// ========================================
// 7. Global Exception Handler
// ========================================
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var feature = context.Features.Get<IExceptionHandlerPathFeature>();
        var exception = feature?.Error;

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        await context.Response.WriteAsJsonAsync(new
        {
            success = false,
            error = "Server Exception",
            message = app.Environment.IsDevelopment()
                ? exception?.Message
                : "An internal server error occurred.",
            type = app.Environment.IsDevelopment()
                ? exception?.GetType().Name
                : null
        });
    });
});

// ========================================
// 8. Forwarded Headers for Cloud Reverse Proxies
// ========================================
app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// ========================================
// 9. Production Early Health Check Endpoint
// ========================================
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    service = "AI-LMS.API",
    runtime = ".NET 10.0",
    timestamp = DateTime.UtcNow
}));

// ========================================
// 10. Swagger (Development Mode)
// ========================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ========================================
// 11. CORS, Authentication & Authorization Pipeline
// ========================================
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// ========================================
// 12. Database Connectivity Health Check
// ========================================
app.MapGet("/api/health", async (MongoDbContext db, CancellationToken ct) =>
{
    try
    {
        await db.Database.RunCommandAsync<MongoDB.Bson.BsonDocument>(
            new MongoDB.Bson.BsonDocument("ping", 1),
            cancellationToken: ct
        );

        return Results.Ok(new
        {
            status = "healthy",
            database = db.DatabaseName,
            connection = "Connected",
            timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        return Results.Json(
            new
            {
                status = "unhealthy",
                database = db.DatabaseName,
                connection = "Disconnected",
                message = app.Environment.IsDevelopment()
                    ? ex.Message
                    : "Database connection failed.",
                timestamp = DateTime.UtcNow
            },
            statusCode: StatusCodes.Status503ServiceUnavailable
        );
    }
});

// ========================================
// 13. Map Controllers
// ========================================
app.MapControllers();

// ========================================
// 14. Database Seeding (Non-blocking / Resilient)
// ========================================
var enableSeeding = builder.Configuration.GetValue<bool>("SeedDatabase", true);
if (enableSeeding)
{
    try
    {
        await DbSeeder.SeedDatabaseAsync(app);
        Console.WriteLine("[Startup] Database seeding completed successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Startup Warning] Database seeding skipped or encountered error: {ex.Message}");
    }
}

// ========================================
// 15. Run Application
// ========================================
app.Run();
