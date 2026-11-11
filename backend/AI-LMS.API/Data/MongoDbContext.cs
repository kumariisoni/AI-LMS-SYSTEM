using MongoDB.Driver;
using AI_LMS.API.Models;
using System.Text.RegularExpressions;

namespace AI_LMS.API.Data;

public class MongoDbContext
{
    private readonly IMongoClient? _client;
    private readonly IMongoDatabase? _database;
    private readonly string _connectionString;
    private readonly Exception? _initializationException;

    public string DatabaseName { get; }
    public Exception? InitializationException => _initializationException;

    public MongoDbContext(IConfiguration configuration)
    {
        var rawConn =
            Environment.GetEnvironmentVariable("MONGODB_URI") ??
            Environment.GetEnvironmentVariable("MongoDB__ConnectionString") ??
            configuration["MongoDB:ConnectionString"] ??
            configuration.GetConnectionString("MongoDB") ??
            "mongodb://localhost:27017";

        // Clean any surrounding quotes or extra whitespace from cloud dashboard copy-paste
        _connectionString = rawConn.Trim().Trim('"', '\'');

        try
        {
            var mongoUrl = MongoUrl.Create(_connectionString);
            _client = new MongoClient(mongoUrl);

            var dbFromUrl = mongoUrl.DatabaseName;
            DatabaseName =
                Environment.GetEnvironmentVariable("MONGODB_DATABASE") ??
                configuration["MongoDB:DatabaseName"] ??
                (!string.IsNullOrWhiteSpace(dbFromUrl) ? dbFromUrl : "AI_LMS");

            _database = _client.GetDatabase(DatabaseName);
        }
        catch (Exception ex)
        {
            _initializationException = ex;
            DatabaseName = Environment.GetEnvironmentVariable("MONGODB_DATABASE") ?? configuration["MongoDB:DatabaseName"] ?? "AI_LMS";
            Console.WriteLine($"[MongoDbContext Error] Could not initialize MongoDB: {ex.Message}");
        }
    }

    public IMongoDatabase Database =>
        _database ?? throw new InvalidOperationException($"MongoDB database is unavailable: {_initializationException?.Message}");

    public string MaskedConnectionString
    {
        get
        {
            if (string.IsNullOrEmpty(_connectionString)) return "Not configured";
            return Regex.Replace(_connectionString, @":([^:@]+)@", ":****@");
        }
    }

    public IMongoCollection<User> Users =>
        Database.GetCollection<User>("users");

    public IMongoCollection<Course> Courses =>
        Database.GetCollection<Course>("courses");

    public IMongoCollection<Faculty> Faculty =>
        Database.GetCollection<Faculty>("faculty");

    public IMongoCollection<Enrollment> Enrollments =>
        Database.GetCollection<Enrollment>("enrollments");

    public IMongoCollection<StudentProgress> StudentProgress =>
        Database.GetCollection<StudentProgress>("studentProgress");

    public IMongoCollection<Certificate> Certificates =>
        Database.GetCollection<Certificate>("certificates");
}
