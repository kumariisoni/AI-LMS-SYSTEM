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
// 5. Dynamic & Permissive Cloud CORS Configuration
// ========================================
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") 
    ?? builder.Configuration["FRONTEND_URL"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrWhiteSpace(origin)) return false;

            // Allow localhost on any port
            if (origin.StartsWith("http://localhost:", StringComparison.OrdinalIgnoreCase) ||
                origin.StartsWith("https://localhost:", StringComparison.OrdinalIgnoreCase))
            {
                return true;
            }

            // Allow any Vercel domain (*.vercel.app)
            try
            {
                var host = new Uri(origin).Host;
                if (host.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(host, "vercel.app", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }
            }
            catch { }

            // Allow custom configured FRONTEND_URL
            if (!string.IsNullOrWhiteSpace(frontendUrl))
            {
                var splitOrigins = frontendUrl
                    .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                    .Select(u => u.TrimEnd('/'));

                if (splitOrigins.Any(o => string.Equals(o, origin.TrimEnd('/'), StringComparison.OrdinalIgnoreCase)))
                {
                    return true;
                }
            }

            return false;
        })
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
            message = exception?.Message ?? "An unexpected server error occurred.",
            type = exception?.GetType().Name
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
// 9. Root & Health Check Endpoints
// ========================================
app.MapGet("/", () => Results.Ok(new
{
    service = "AI-LMS.API",
    name = "Learnova AI Learning Management System API",
    status = "running",
    runtime = ".NET 10.0",
    health = "/health",
    databaseHealth = "/api/health",
    frontend = "https://ai-lms-system.vercel.app",
    timestamp = DateTime.UtcNow
}));

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    service = "AI-LMS.API",
    runtime = ".NET 10.0",
    timestamp = DateTime.UtcNow
}));

// ========================================
// 10. Swagger API Documentation
// ========================================
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "AI-LMS API v1");
    c.RoutePrefix = "swagger";
});

// ========================================
// 11. CORS & Intelligent Route Rewriting
// ========================================
app.UseCors("AllowFrontend");

// Auto-prefix /api for requests that omit the /api segment (e.g. /Courses -> /api/Courses)
app.Use(async (context, next) =>
{
    var path = context.Request.Path.Value ?? "";
    if (!path.StartsWith("/api", StringComparison.OrdinalIgnoreCase) &&
        !path.StartsWith("/health", StringComparison.OrdinalIgnoreCase) &&
        !path.StartsWith("/swagger", StringComparison.OrdinalIgnoreCase) &&
        path != "/")
    {
        context.Request.Path = "/api" + path;
    }
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

// ========================================
// 12. Database Connectivity Health Check & Diagnostics
// ========================================
app.MapGet("/api/health", async (MongoDbContext db, CancellationToken ct) =>
{
    if (db.InitializationException != null)
    {
        return Results.Json(
            new
            {
                status = "unhealthy",
                database = db.DatabaseName,
                connection = "Failed to initialize",
                error = db.InitializationException.Message,
                hint = "Please check your MONGODB_URI on Render dashboard. If your password contains special characters, make sure they are URL encoded.",
                timestamp = DateTime.UtcNow
            },
            statusCode: StatusCodes.Status503ServiceUnavailable
        );
    }

    try
    {
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
        cts.CancelAfter(TimeSpan.FromSeconds(5));

        await db.Database.RunCommandAsync<MongoDB.Bson.BsonDocument>(
            new MongoDB.Bson.BsonDocument("ping", 1),
            cancellationToken: cts.Token
        );

        return Results.Ok(new
        {
            status = "healthy",
            database = db.DatabaseName,
            connection = "Connected",
            connectionUri = db.MaskedConnectionString,
            timestamp = DateTime.UtcNow
        });
    }
    catch (Exception ex)
    {
        var hint = ex.Message.Contains("timeout", StringComparison.OrdinalIgnoreCase)
            ? "Connection timed out. In MongoDB Atlas, go to Network Access and verify 0.0.0.0/0 (Allow Access from Anywhere) is active."
            : (ex.Message.Contains("Authentication", StringComparison.OrdinalIgnoreCase) || ex.Message.Contains("auth", StringComparison.OrdinalIgnoreCase)
                ? "Authentication failed. Check your database username and password in MONGODB_URI."
                : "Database connection failed. Verify your connection string.");

        return Results.Json(
            new
            {
                status = "unhealthy",
                database = db.DatabaseName,
                connection = "Disconnected",
                message = ex.Message,
                hint,
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
