using MongoDB.Driver;
using AI_LMS.API.Models;
using System.Text.RegularExpressions;

namespace AI_LMS.API.Data;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;
    private readonly string _connectionString;

    public MongoDbContext(IConfiguration configuration)
    {
        var rawConn =
            Environment.GetEnvironmentVariable("MONGODB_URI") ??
            Environment.GetEnvironmentVariable("MongoDB__ConnectionString") ??
            configuration["MongoDB:ConnectionString"] ??
            configuration.GetConnectionString("MongoDB") ??
            "mongodb://localhost:27017";

        _connectionString = rawConn.Trim();

        var client = new MongoClient(_connectionString);

        // Allow database name from env, config, or connection string
        string? urlDb = null;
        try
        {
            var mongoUrl = MongoUrl.Create(_connectionString);
            urlDb = mongoUrl.DatabaseName;
        }
        catch
        {
            // Fall back to configured database name
        }

        var databaseName =
            Environment.GetEnvironmentVariable("MONGODB_DATABASE") ??
            configuration["MongoDB:DatabaseName"] ??
            urlDb ??
            "AI_LMS";

        _database = client.GetDatabase(databaseName);
    }

    public IMongoDatabase Database => _database;

    public string DatabaseName => _database.DatabaseNamespace.DatabaseName;

    public string MaskedConnectionString
    {
        get
        {
            if (string.IsNullOrEmpty(_connectionString)) return "Not configured";
            return Regex.Replace(_connectionString, @":([^:@]+)@", ":****@");
        }
    }

    public IMongoCollection<User> Users =>
        _database.GetCollection<User>("users");

    public IMongoCollection<Course> Courses =>
        _database.GetCollection<Course>("courses");

    public IMongoCollection<Faculty> Faculty =>
        _database.GetCollection<Faculty>("faculty");

    public IMongoCollection<Enrollment> Enrollments =>
        _database.GetCollection<Enrollment>("enrollments");

    public IMongoCollection<StudentProgress> StudentProgress =>
        _database.GetCollection<StudentProgress>("studentProgress");

    public IMongoCollection<Certificate> Certificates =>
        _database.GetCollection<Certificate>("certificates");
}
