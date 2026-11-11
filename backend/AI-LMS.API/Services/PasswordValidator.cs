using System.Text.RegularExpressions;

namespace AI_LMS.API.Services;

public static class PasswordValidator
{
    private static readonly Regex SpecialCharRegex = new(@"[@#$%!&*_\-+=~^()[\]{}|:;""'<>,.?/\\`]", RegexOptions.Compiled);

    public static bool Validate(string? password, out List<string> errors)
    {
        errors = new List<string>();

        if (string.IsNullOrEmpty(password))
        {
            errors.Add("Password is required.");
            return false;
        }

        if (password.Length < 8)
        {
            errors.Add("Password must contain at least 8 characters.");
        }

        if (!password.Any(char.IsUpper))
        {
            errors.Add("Password must contain at least one uppercase letter.");
        }

        if (!password.Any(char.IsDigit))
        {
            errors.Add("Password must contain at least one digit.");
        }

        if (!SpecialCharRegex.IsMatch(password))
        {
            errors.Add("Password must contain at least one special character.");
        }

        return errors.Count == 0;
    }
}
