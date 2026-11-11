using AI_LMS.API.Models;
using MongoDB.Driver;

namespace AI_LMS.API.Data;

public static class DbSeeder
{
    public static async Task SeedDatabaseAsync(IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<MongoDbContext>();
        await SeedDatabaseDirectAsync(context);
    }

    public static async Task SeedDatabaseDirectAsync(MongoDbContext context)
    {
        Console.WriteLine("[DbSeeder] Starting Learnova AI database seeding...");

        // 1. Seed Admin Users (Configurable via environment variables without hardcoded secrets)
        var adminEmail = Environment.GetEnvironmentVariable("ADMIN_EMAIL") ?? "admin@learnova.ai";
        var adminPassword = Environment.GetEnvironmentVariable("ADMIN_PASSWORD");
        await SeedAdminAsync(context, "System Administrator", adminEmail, adminPassword);

        // 2. Seed AI Agent User
        await SeedAiAgentAsync(context);

        // 3. Clean up deprecated placeholder instructor records if they exist
        var deprecatedEmails = new[]
        {
            "arjun.mehta@learnova.ai",
            "priya.sharma@learnova.ai",
            "kabir.rao@learnova.ai",
            "sneha.patel@learnova.ai",
            "vikram.malhotra@learnova.ai"
        };
        await context.Faculty.DeleteManyAsync(f => deprecatedEmails.Contains(f.Email));
        await context.Users.DeleteManyAsync(u => deprecatedEmails.Contains(u.Email));

        // 4. Seed the 7 Academic Faculty Profiles (Idempotent)
        var profChetan = await SeedFacultyAsync(context,
            name: "Prof. Chetan Chudasma",
            email: "chetan.chudasma@learnova.ai",
            password: "Faculty@123",
            department: "Computer Science & Engineering",
            designation: "Professor & HOD",
            experience: 14,
            bio: "Distinguished professor in Computer Science with over 14 years of teaching and software engineering experience. Specializes in the .NET ecosystem, ASP.NET Core enterprise architecture, and secure scalable web APIs.",
            subjects: new List<string> { "ASP.NET / .NET", "C#", "Web API", "Enterprise Software" },
            officeHours: "Mon, Wed 10:00 AM - 12:00 PM IST",
            profileImage: ""
        );

        var profPapu = await SeedFacultyAsync(context,
            name: "Prof. Papu Kumar Rai",
            email: "papu.rai@learnova.ai",
            password: "Faculty@123",
            department: "Computer Science & Engineering",
            designation: "Associate Professor",
            experience: 11,
            bio: "Senior faculty specializing in Design and Analysis of Algorithms, algorithmic complexity, graph theory, and advanced data structures with a passion for competitive programming and mathematical foundations.",
            subjects: new List<string> { "Design and Analysis of Algorithms", "DAA", "Data Structures", "Graph Theory" },
            officeHours: "Tue, Thu 2:00 PM - 4:00 PM IST",
            profileImage: ""
        );

        var profPartik = await SeedFacultyAsync(context,
            name: "Prof. Partik Chauhan",
            email: "partik.chauhan@learnova.ai",
            password: "Faculty@123",
            department: "Computer Science & Engineering",
            designation: "Assistant Professor",
            experience: 8,
            bio: "Educator and researcher in modern Data Science, statistical modeling, machine learning algorithms, exploratory data analysis, and predictive AI pipelines using Python.",
            subjects: new List<string> { "Data Science", "Python", "Machine Learning", "Statistical Analysis" },
            officeHours: "Mon, Fri 11:00 AM - 1:00 PM IST",
            profileImage: ""
        );

        var profKamlesh = await SeedFacultyAsync(context,
            name: "Prof. Kamlesh Patle",
            email: "kamlesh.patle@learnova.ai",
            password: "Faculty@123",
            department: "Computer Engineering",
            designation: "Associate Professor",
            experience: 12,
            bio: "Expert in microprocessor architectures, assembly language programming, microcontrollers, embedded hardware interfaces, and computer systems organization.",
            subjects: new List<string> { "Fundamentals of Microprocessor", "Microprocessors", "8085 / 8086 Assembly", "Computer Architecture" },
            officeHours: "Wed, Fri 3:00 PM - 5:00 PM IST",
            profileImage: ""
        );

        var profShiva = await SeedFacultyAsync(context,
            name: "Prof. Dr. Shiva Kumar Nadranjan",
            email: "shiva.kumar@learnova.ai",
            password: "Faculty@123",
            department: "Information Technology & Data Engineering",
            designation: "Professor & Research Lead",
            experience: 16,
            bio: "Doctorate in Data Warehousing and Knowledge Discovery. Research focuses on OLAP data modeling, ETL architectures, association rule mining, and enterprise data mining frameworks.",
            subjects: new List<string> { "Data Warehouse & Data Mining", "Data Mining", "Data Warehousing", "Big Data Analytics" },
            officeHours: "Tue, Thu 11:00 AM - 1:00 PM IST",
            profileImage: ""
        );

        var profNiraj = await SeedFacultyAsync(context,
            name: "Prof. Niraj Bhagchandani",
            email: "niraj.bhagchandani@learnova.ai",
            password: "Faculty@123",
            department: "Computer Science & Engineering",
            designation: "Associate Professor",
            experience: 10,
            bio: "Computer Networks educator specializing in network protocol engineering, TCP/IP stack, network security, packet routing architectures, and distributed systems.",
            subjects: new List<string> { "Computer Networks", "Network Security", "TCP/IP Protocols", "Distributed Systems" },
            officeHours: "Mon, Wed 2:00 PM - 4:00 PM IST",
            profileImage: ""
        );

        var profSahir = await SeedFacultyAsync(context,
            name: "Prof. Sahir Suma",
            email: "sahir.suma@learnova.ai",
            password: "Faculty@123",
            department: "Artificial Intelligence & Machine Learning",
            designation: "Assistant Professor",
            experience: 9,
            bio: "Researcher and lecturer in Artificial Intelligence, state-space search algorithms, knowledge representation, neural computation, and automated reasoning systems.",
            subjects: new List<string> { "Artificial Intelligence", "Knowledge Systems", "Search Algorithms", "Machine Learning" },
            officeHours: "Tue, Fri 10:00 AM - 12:00 PM IST",
            profileImage: ""
        );

        // 5. Seed Student Users
        await SeedStudentAsync(context, "Aarav Patel", "student@learnova.ai", "Student@123");
        await SeedStudentAsync(context, "Ananya Roy", "demo.student@learnova.ai", "Student@123");

        // 6. Clean up old dummy courses that lack verified curriculum
        var dummyTitles = new[]
        {
            "Full Stack Web & AI Development",
            "UI/UX Design Mastery & Figma Systems",
            "Generative AI & LLM Agent Architecture",
            "Modern React 19 & Next.js Architecture",
            "Enterprise Cloud Architecture on AWS & Azure",
            "Applied Data Science with Python & ML"
        };
        var deleteResult = await context.Courses.DeleteManyAsync(c => dummyTitles.Contains(c.Title));
        if (deleteResult.DeletedCount > 0)
        {
            Console.WriteLine($"[DbSeeder] Removed {deleteResult.DeletedCount} deprecated dummy course records.");
        }

        // 7. Seed Real YouTube Educational Courses (7 Courses mapped to assigned faculty)
        await SeedRealCoursesAsync(context, profChetan, profPapu, profPartik, profKamlesh, profShiva, profNiraj, profSahir);

        // 8. Clean existing duplicate enrollments safely and ensure unique compound database indexes
        await EnsureIndexesAndCleanDuplicatesAsync(context);

        Console.WriteLine("[DbSeeder] Database seeding completed successfully!");
    }

    private static async Task SeedAdminAsync(MongoDbContext context, string name, string email, string? configuredPassword)
    {
        var existing = await context.Users.Find(u => u.Email == email).FirstOrDefaultAsync();
        if (existing == null)
        {
            var isProduction = string.Equals(
                Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
                "Production",
                StringComparison.OrdinalIgnoreCase);

            string initialPassword;
            if (!string.IsNullOrWhiteSpace(configuredPassword))
            {
                initialPassword = configuredPassword;
                Console.WriteLine($"[DbSeeder] Initializing Admin user: {email} (configured via ADMIN_PASSWORD environment variable)");
            }
            else if (!isProduction)
            {
                initialPassword = "DevAdminPassword123!";
                Console.WriteLine($"[DbSeeder] Initializing Admin user: {email} with default development password.");
            }
            else
            {
                initialPassword = GenerateSecurePassword(16);
                Console.WriteLine($"[DbSeeder] Initial Admin password generated for {email}: {initialPassword}");
                Console.WriteLine("[DbSeeder] TIP: Set the ADMIN_PASSWORD environment variable in your deployment configuration to define a custom password.");
            }

            var admin = new User
            {
                Name = name,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(initialPassword),
                Role = "Admin",
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.InsertOneAsync(admin);
            Console.WriteLine($"[DbSeeder] Admin user created: {email}");
        }
    }

    private static string GenerateSecurePassword(int length = 16)
    {
        const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const string lower = "abcdefghijkmnopqrstuvwxyz";
        const string digits = "23456789";
        const string special = "!@#$%^&*";
        var chars = upper + lower + digits + special;

        var bytes = System.Security.Cryptography.RandomNumberGenerator.GetBytes(length);
        var result = new char[length];
        result[0] = upper[bytes[0] % upper.Length];
        result[1] = lower[bytes[1] % lower.Length];
        result[2] = digits[bytes[2] % digits.Length];
        result[3] = special[bytes[3] % special.Length];

        for (int i = 4; i < length; i++)
        {
            result[i] = chars[bytes[i] % chars.Length];
        }

        return new string(result.OrderBy(_ => System.Security.Cryptography.RandomNumberGenerator.GetInt32(int.MaxValue)).ToArray());
    }

    private static async Task SeedAiAgentAsync(MongoDbContext context)
    {
        var email = "ai.agent@learnova.ai";
        var existing = await context.Users.Find(u => u.Email == email).FirstOrDefaultAsync();
        if (existing == null)
        {
            var agentPassword = Environment.GetEnvironmentVariable("AI_AGENT_PASSWORD") ?? GenerateSecurePassword(24);
            var agent = new User
            {
                Name = "Learnova AI Adaptive Agent",
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(agentPassword),
                Role = "AI_Agent",
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.InsertOneAsync(agent);
            Console.WriteLine($"[DbSeeder] Created AI Agent: {email} (Role: AI_Agent)");
        }
    }

    private static async Task<User> SeedFacultyAsync(
        MongoDbContext context,
        string name,
        string email,
        string password,
        string department,
        string designation,
        int experience,
        string bio,
        List<string> subjects,
        string officeHours,
        string profileImage)
    {
        var existing = await context.Users.Find(u => u.Email == email).FirstOrDefaultAsync();
        if (existing == null)
        {
            var user = new User
            {
                Name = name,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = "Faculty",
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.InsertOneAsync(user);

            var profile = new Faculty
            {
                UserId = user.Id!,
                Name = name,
                Email = email,
                Department = department,
                Designation = designation,
                ExperienceYears = experience,
                Bio = bio,
                Subjects = subjects,
                OfficeHours = officeHours,
                ProfileImage = profileImage,
                Rating = 4.9,
                TotalStudents = 4500,
                CreatedAt = DateTime.UtcNow
            };
            await context.Faculty.InsertOneAsync(profile);

            Console.WriteLine($"[DbSeeder] Created Faculty user & profile: {email} ({designation})");
            return user;
        }
        else
        {
            // Idempotent: preserve existing user password, ensure Name & Role
            var userUpdate = Builders<User>.Update
                .Set(u => u.Name, name)
                .Set(u => u.Role, "Faculty");
            await context.Users.UpdateOneAsync(u => u.Id == existing.Id, userUpdate);

            // Ensure Faculty profile exists or is updated
            var profile = await context.Faculty.Find(f => f.UserId == existing.Id || f.Email == email).FirstOrDefaultAsync();
            if (profile == null)
            {
                var newProfile = new Faculty
                {
                    UserId = existing.Id!,
                    Name = name,
                    Email = email,
                    Department = department,
                    Designation = designation,
                    ExperienceYears = experience,
                    Bio = bio,
                    Subjects = subjects,
                    OfficeHours = officeHours,
                    ProfileImage = profileImage,
                    Rating = 4.9,
                    TotalStudents = 4500,
                    CreatedAt = DateTime.UtcNow
                };
                await context.Faculty.InsertOneAsync(newProfile);
                Console.WriteLine($"[DbSeeder] Seeded missing Faculty profile for existing user: {email}");
            }
            else
            {
                var profileUpdate = Builders<Faculty>.Update
                    .Set(f => f.UserId, existing.Id)
                    .Set(f => f.Name, name)
                    .Set(f => f.Email, email)
                    .Set(f => f.Department, department)
                    .Set(f => f.Designation, designation)
                    .Set(f => f.ExperienceYears, experience)
                    .Set(f => f.Bio, bio)
                    .Set(f => f.Subjects, subjects)
                    .Set(f => f.OfficeHours, officeHours)
                    .Set(f => f.ProfileImage, profileImage);
                await context.Faculty.UpdateOneAsync(f => f.Id == profile.Id, profileUpdate);
                Console.WriteLine($"[DbSeeder] Updated Faculty profile: {email} ({name})");
            }

            return existing;
        }
    }

    private static async Task SeedStudentAsync(MongoDbContext context, string name, string email, string password)
    {
        var existing = await context.Users.Find(u => u.Email == email).FirstOrDefaultAsync();
        if (existing == null)
        {
            var student = new User
            {
                Name = name,
                Email = email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = "Student",
                CreatedAt = DateTime.UtcNow
            };
            await context.Users.InsertOneAsync(student);
            Console.WriteLine($"[DbSeeder] Created Student user: {email}");
        }
    }

    private static async Task SeedInitialCoursesAsync(
        MongoDbContext context,
        User arjun,
        User priya,
        User kabir,
        User sneha,
        User vikram)
    {
        var initialCourses = new List<Course>
        {
            new Course
            {
                Title = "Full Stack Web & AI Development",
                Description = "Master modern full-stack engineering with React 19, Node.js, and integrating LLMs, LangChain, and real-time streaming APIs.",
                Category = "Development",
                Level = "Intermediate",
                InstructorId = arjun.Id ?? "arjun_id",
                InstructorName = "Arjun Mehta",
                Thumbnail = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
                Price = 1499,
                OriginalPrice = 3999,
                DurationHours = 42,
                Rating = 4.9,
                EnrolledStudents = 4820,
                IsPublished = true,
                Tags = new List<string> { "React 19", "Node.js", "AI Labs", "Full-Stack" }
            },
            new Course
            {
                Title = "UI/UX Design Mastery & Figma Systems",
                Description = "Learn design thinking, scalable Figma design systems, tokens, micro-interactions, and AI-accelerated wireframing.",
                Category = "Design",
                Level = "Beginner",
                InstructorId = priya.Id ?? "priya_id",
                InstructorName = "Priya Sharma",
                Thumbnail = "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80",
                Price = 999,
                OriginalPrice = 2499,
                DurationHours = 28,
                Rating = 4.9,
                EnrolledStudents = 2310,
                IsPublished = true,
                Tags = new List<string> { "Figma", "UI/UX", "Design Systems", "Prototyping" }
            },
            new Course
            {
                Title = "Generative AI & LLM Agent Architecture",
                Description = "Build autonomous agents from scratch using PyTorch, Hugging Face transformers, and vector databases with hands-on labs.",
                Category = "Data & AI",
                Level = "Advanced",
                InstructorId = kabir.Id ?? "kabir_id",
                InstructorName = "Dr. Kabir Rao",
                Thumbnail = "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
                Price = 1999,
                OriginalPrice = 4999,
                DurationHours = 48,
                Rating = 4.9,
                EnrolledStudents = 3120,
                IsPublished = true,
                Tags = new List<string> { "PyTorch", "LLMs", "LangChain", "VectorDB" }
            },
            new Course
            {
                Title = "Modern React 19 & Next.js Architecture",
                Description = "Server components, server actions, streaming HTML, Supabase authentication, and enterprise performance optimizations.",
                Category = "Development",
                Level = "Intermediate",
                InstructorId = sneha.Id ?? "sneha_id",
                InstructorName = "Sneha Patel",
                Thumbnail = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80",
                Price = 1299,
                OriginalPrice = 3499,
                DurationHours = 32,
                Rating = 4.8,
                EnrolledStudents = 3750,
                IsPublished = true,
                Tags = new List<string> { "React 19", "Next.js", "Server Actions", "TypeScript" }
            },
            new Course
            {
                Title = "Enterprise Cloud Architecture on AWS & Azure",
                Description = "Architect resilient microservices, scale AI model inference clusters with Kubernetes, and automate production CI/CD.",
                Category = "Cloud DevOps",
                Level = "Advanced",
                InstructorId = vikram.Id ?? "vikram_id",
                InstructorName = "Vikram Malhotra",
                Thumbnail = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
                Price = 1699,
                OriginalPrice = 4199,
                DurationHours = 40,
                Rating = 4.7,
                EnrolledStudents = 2890,
                IsPublished = true,
                Tags = new List<string> { "AWS", "Azure", "Kubernetes", "DevOps" }
            },
            new Course
            {
                Title = "Applied Data Science with Python & ML",
                Description = "NumPy, Pandas, Scikit-Learn, and statistical machine learning models with automated diagnostic quizzes.",
                Category = "Data & AI",
                Level = "All Levels",
                InstructorId = kabir.Id ?? "kabir_id",
                InstructorName = "Dr. Kabir Rao",
                Thumbnail = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
                Price = 0,
                OriginalPrice = 0,
                DurationHours = 35,
                Rating = 4.8,
                EnrolledStudents = 6100,
                IsPublished = true,
                Tags = new List<string> { "Python", "Data Science", "Machine Learning", "Free" }
            }
        };

        foreach (var c in initialCourses)
        {
            var existing = await context.Courses.Find(x => x.Title == c.Title).FirstOrDefaultAsync();
            if (existing == null)
            {
                await context.Courses.InsertOneAsync(c);
            }
        }
    }

    private static async Task SeedRealCoursesAsync(
        MongoDbContext context,
        User profChetan,
        User profPapu,
        User profPartik,
        User profKamlesh,
        User profShiva,
        User profNiraj,
        User profSahir)
    {
        var possiblePaths = new[]
        {
            Path.Combine(AppContext.BaseDirectory, "Data", "courses_seed.json"),
            Path.Combine(AppContext.BaseDirectory, "courses_seed.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "Data", "courses_seed.json"),
            Path.Combine(Directory.GetCurrentDirectory(), "backend", "AI-LMS.API", "Data", "courses_seed.json")
        };

        string? jsonPath = possiblePaths.FirstOrDefault(File.Exists);
        if (jsonPath == null)
        {
            Console.WriteLine("[DbSeeder] courses_seed.json not found, skipping real courses seed.");
            return;
        }

        try
        {
            var json = await File.ReadAllTextAsync(jsonPath);
            using var doc = System.Text.Json.JsonDocument.Parse(json);

            var facultyMap = new Dictionary<string, (string id, string name)>
            {
                { ".NET / ASP.NET", (profChetan.Id ?? "chetan_id", "Prof. Chetan Chudasma") },
                { "Algorithms", (profPapu.Id ?? "papu_id", "Prof. Papu Kumar Rai") },
                { "Data Science", (profPartik.Id ?? "partik_id", "Prof. Partik Chauhan") },
                { "Microprocessors", (profKamlesh.Id ?? "kamlesh_id", "Prof. Kamlesh Patle") },
                { "Data Mining", (profShiva.Id ?? "shiva_id", "Prof. Dr. Shiva Kumar Nadranjan") },
                { "Computer Networks", (profNiraj.Id ?? "niraj_id", "Prof. Niraj Bhagchandani") },
                { "Artificial Intelligence", (profSahir.Id ?? "sahir_id", "Prof. Sahir Suma") }
            };

            foreach (var elem in doc.RootElement.EnumerateArray())
            {
                var title = elem.GetProperty("title").GetString() ?? "";
                var category = elem.GetProperty("category").GetString() ?? "Development";
                var level = elem.GetProperty("level").GetString() ?? "Intermediate";
                var description = elem.GetProperty("description").GetString() ?? "";
                var thumbnail = elem.GetProperty("thumbnail").GetString() ?? "";

                var chapters = new List<Chapter>();
                var totalDurationMinutes = 0;

                if (elem.TryGetProperty("modules", out var modulesElem))
                {
                    int chapOrder = 1;
                    foreach (var modElem in modulesElem.EnumerateArray())
                    {
                        var modTitle = modElem.GetProperty("title").GetString() ?? $"Module {chapOrder}";
                        var modId = modElem.TryGetProperty("id", out var mid) ? mid.GetString() ?? Guid.NewGuid().ToString() : Guid.NewGuid().ToString();
                        var chapter = new Chapter
                        {
                            Id = modId,
                            Title = modTitle,
                            Order = chapOrder++
                        };

                        if (modElem.TryGetProperty("lessons", out var lessonsElem))
                        {
                            int lessonOrder = 1;
                            foreach (var lesElem in lessonsElem.EnumerateArray())
                            {
                                var lId = lesElem.TryGetProperty("id", out var lid) ? lid.GetString() ?? Guid.NewGuid().ToString() : Guid.NewGuid().ToString();
                                var lTitle = lesElem.GetProperty("title").GetString() ?? "";
                                var lDesc = lesElem.TryGetProperty("description", out var d) ? d.GetString() ?? "" : "";
                                var lUrl = lesElem.TryGetProperty("videoUrl", out var u) ? u.GetString() ?? "" : "";
                                var lVidId = lesElem.TryGetProperty("youtubeVideoId", out var y) ? y.GetString() ?? "" : "";
                                var lAuthor = lesElem.TryGetProperty("author", out var a) ? a.GetString() ?? "" : "";
                                var lDur = lesElem.TryGetProperty("duration", out var dur) ? dur.GetString() ?? "20 min" : "20 min";
                                var isPrev = lesElem.TryGetProperty("isPreview", out var ip) && ip.GetBoolean();

                                chapter.Lessons.Add(new Lesson
                                {
                                    Id = lId,
                                    Title = lTitle,
                                    Description = lDesc,
                                    VideoUrl = lUrl,
                                    YoutubeVideoId = lVidId,
                                    Author = lAuthor,
                                    Duration = lDur,
                                    Order = lessonOrder++,
                                    IsPreview = isPrev
                                });

                                totalDurationMinutes += 20;
                            }
                        }

                        chapter.Duration = $"{Math.Max(1, chapter.Lessons.Count * 20 / 60)} hrs";
                        chapters.Add(chapter);
                    }
                }

                (string facultyId, string facultyName) = facultyMap.TryGetValue(category, out var f) ? f : (profChetan.Id ?? "chetan_id", "Prof. Chetan Chudasma");
                var durationHours = Math.Max(20, totalDurationMinutes / 60);

                var existingCourse = await context.Courses.Find(c => c.Title == title).FirstOrDefaultAsync();
                if (existingCourse == null)
                {
                    var newCourse = new Course
                    {
                        Title = title,
                        Description = description,
                        Category = category,
                        Level = level,
                        InstructorId = facultyId,
                        InstructorName = facultyName,
                        Thumbnail = thumbnail,
                        Price = 0,
                        OriginalPrice = 1999,
                        DurationHours = durationHours,
                        Rating = 4.9,
                        EnrolledStudents = 2400,
                        IsPublished = true,
                        Tags = new List<string> { category, "Free Track", "Verified Syllabus" },
                        Chapters = chapters,
                        CreatedAt = DateTime.UtcNow
                    };
                    await context.Courses.InsertOneAsync(newCourse);
                    Console.WriteLine($"[DbSeeder] Seeded real course: {title} ({chapters.Count} modules, {chapters.Sum(c => c.Lessons.Count)} lessons)");
                }
                else
                {
                    var update = Builders<Course>.Update
                        .Set(c => c.Chapters, chapters)
                        .Set(c => c.DurationHours, durationHours)
                        .Set(c => c.Category, category)
                        .Set(c => c.Description, description)
                        .Set(c => c.Level, level)
                        .Set(c => c.Thumbnail, thumbnail)
                        .Set(c => c.InstructorId, facultyId)
                        .Set(c => c.InstructorName, facultyName);
                    await context.Courses.UpdateOneAsync(c => c.Id == existingCourse.Id, update);
                    Console.WriteLine($"[DbSeeder] Updated real course: {title} (Instructor: {facultyName}) with {chapters.Count} modules and {chapters.Sum(c => c.Lessons.Count)} lessons");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DbSeeder] Error seeding real courses: {ex.Message}");
        }
    }

    private static async Task EnsureIndexesAndCleanDuplicatesAsync(MongoDbContext context)
    {
        try
        {
            // 1. Safely identify and resolve existing duplicate enrollments for the same (StudentId, CourseId)
            var allEnrollments = await context.Enrollments.Find(_ => true).ToListAsync();
            var duplicateGroups = allEnrollments
                .GroupBy(e => new { e.StudentId, e.CourseId })
                .Where(g => g.Count() > 1 && !string.IsNullOrEmpty(g.Key.StudentId) && !string.IsNullOrEmpty(g.Key.CourseId))
                .ToList();

            foreach (var group in duplicateGroups)
            {
                // Preserve the enrollment document with highest ProgressPercent, or earliest EnrolledAt
                var bestRecord = group
                    .OrderByDescending(e => e.ProgressPercent)
                    .ThenBy(e => e.EnrolledAt)
                    .First();

                var duplicateIds = group
                    .Where(e => e.Id != bestRecord.Id)
                    .Select(e => e.Id)
                    .Where(id => id != null)
                    .ToList();

                if (duplicateIds.Count > 0)
                {
                    await context.Enrollments.DeleteManyAsync(e => duplicateIds.Contains(e.Id));
                    Console.WriteLine($"[DbSeeder] Safely resolved {duplicateIds.Count} duplicate enrollment(s) for Student '{group.Key.StudentId}' on Course '{group.Key.CourseId}'. Preserved primary record {bestRecord.Id} with {bestRecord.ProgressPercent}% progress.");
                }
            }

            // 2. Compound unique index on enrollments (StudentId + CourseId)
            var enrollmentIndexKeys = Builders<Enrollment>.IndexKeys
                .Ascending(e => e.StudentId)
                .Ascending(e => e.CourseId);
            var enrollmentIndexOptions = new CreateIndexOptions { Unique = true, Name = "UX_Enrollment_Student_Course" };
            await context.Enrollments.Indexes.CreateOneAsync(new CreateIndexModel<Enrollment>(enrollmentIndexKeys, enrollmentIndexOptions));

            // 3. Compound unique index on studentProgress (StudentId + CourseId + LessonId)
            var progressIndexKeys = Builders<StudentProgress>.IndexKeys
                .Ascending(p => p.StudentId)
                .Ascending(p => p.CourseId)
                .Ascending(p => p.LessonId);
            var progressIndexOptions = new CreateIndexOptions { Unique = true, Name = "UX_StudentProgress_Student_Course_Lesson" };
            await context.StudentProgress.Indexes.CreateOneAsync(new CreateIndexModel<StudentProgress>(progressIndexKeys, progressIndexOptions));

            // 4. Unique index on users (Email)
            var userEmailIndexKeys = Builders<User>.IndexKeys.Ascending(u => u.Email);
            var userEmailIndexOptions = new CreateIndexOptions { Unique = true, Name = "UX_User_Email" };
            await context.Users.Indexes.CreateOneAsync(new CreateIndexModel<User>(userEmailIndexKeys, userEmailIndexOptions));

            // 5. Index on certificates (StudentId + CourseId)
            var certIndexKeys = Builders<Certificate>.IndexKeys
                .Ascending(c => c.StudentId)
                .Ascending(c => c.CourseId);
            var certIndexOptions = new CreateIndexOptions { Name = "IX_Certificate_Student_Course" };
            await context.Certificates.Indexes.CreateOneAsync(new CreateIndexModel<Certificate>(certIndexKeys, certIndexOptions));

            Console.WriteLine("[DbSeeder] Verified and enforced unique database indexes for Enrollments, StudentProgress, Users, and Certificates.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[DbSeeder] Note on index setup / duplicate resolution: {ex.Message}");
        }
    }
}
