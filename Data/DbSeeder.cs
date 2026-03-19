using QuizApp.Models;

namespace QuizApp.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext context)
    {
        if (context.Questions.Any())
        {
            return;
        }

        var questions = new List<Question>
        {
            new()
            {
                Content = "What is the capital of France?",
                Category = "Geography",
                Answers = new List<Answer>
                {
                    new() { Content = "Paris", IsCorrect = true },
                    new() { Content = "Berlin", IsCorrect = false },
                    new() { Content = "Madrid", IsCorrect = false },
                    new() { Content = "Rome", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which planet is known as the Red Planet?",
                Category = "Science",
                Answers = new List<Answer>
                {
                    new() { Content = "Mars", IsCorrect = true },
                    new() { Content = "Venus", IsCorrect = false },
                    new() { Content = "Jupiter", IsCorrect = false },
                    new() { Content = "Mercury", IsCorrect = false }
                }
            },
            new()
            {
                Content = "What is 7 + 5?",
                Category = "Math",
                Answers = new List<Answer>
                {
                    new() { Content = "12", IsCorrect = true },
                    new() { Content = "10", IsCorrect = false },
                    new() { Content = "13", IsCorrect = false },
                    new() { Content = "11", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Who wrote 'Romeo and Juliet'?",
                Category = "Literature",
                Answers = new List<Answer>
                {
                    new() { Content = "William Shakespeare", IsCorrect = true },
                    new() { Content = "Charles Dickens", IsCorrect = false },
                    new() { Content = "Mark Twain", IsCorrect = false },
                    new() { Content = "Jane Austen", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which language is primarily used for ASP.NET Core?",
                Category = "Programming",
                Answers = new List<Answer>
                {
                    new() { Content = "C#", IsCorrect = true },
                    new() { Content = "Python", IsCorrect = false },
                    new() { Content = "Java", IsCorrect = false },
                    new() { Content = "Go", IsCorrect = false }
                }
            }
        };

        context.Questions.AddRange(questions);
        context.SaveChanges();
    }
}
