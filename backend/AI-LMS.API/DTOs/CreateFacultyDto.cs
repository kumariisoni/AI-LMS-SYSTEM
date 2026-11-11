namespace AI_LMS.API.DTOs;

public class CreateFacultyDto
{
    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    public string Department { get; set; } = string.Empty;

    public string Designation { get; set; } = string.Empty;

    public int ExperienceYears { get; set; }

    public string Bio { get; set; } = string.Empty;

    public List<string> Subjects { get; set; } = new();

    public string OfficeHours { get; set; } = string.Empty;

    public string ProfileImage { get; set; } = string.Empty;
}
