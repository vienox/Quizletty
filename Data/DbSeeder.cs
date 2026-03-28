using QuizApp.Models;

namespace QuizApp.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext context)
    {
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
            },
            new()
            {
                Content = "Which ocean lies between Africa and Australia?",
                Category = "Geography",
                Answers = new List<Answer>
                {
                    new() { Content = "Indian Ocean", IsCorrect = true },
                    new() { Content = "Atlantic Ocean", IsCorrect = false },
                    new() { Content = "Arctic Ocean", IsCorrect = false },
                    new() { Content = "Southern Ocean", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which country is home to the city of Kyoto?",
                Category = "Geography",
                Answers = new List<Answer>
                {
                    new() { Content = "Japan", IsCorrect = true },
                    new() { Content = "South Korea", IsCorrect = false },
                    new() { Content = "China", IsCorrect = false },
                    new() { Content = "Thailand", IsCorrect = false }
                }
            },
            new()
            {
                Content = "What gas do plants absorb from the atmosphere during photosynthesis?",
                Category = "Science",
                Answers = new List<Answer>
                {
                    new() { Content = "Carbon dioxide", IsCorrect = true },
                    new() { Content = "Oxygen", IsCorrect = false },
                    new() { Content = "Nitrogen", IsCorrect = false },
                    new() { Content = "Hydrogen", IsCorrect = false }
                }
            },
            new()
            {
                Content = "What is the chemical symbol for gold?",
                Category = "Science",
                Answers = new List<Answer>
                {
                    new() { Content = "Au", IsCorrect = true },
                    new() { Content = "Ag", IsCorrect = false },
                    new() { Content = "Gd", IsCorrect = false },
                    new() { Content = "Go", IsCorrect = false }
                }
            },
            new()
            {
                Content = "What is 9 x 8?",
                Category = "Math",
                Answers = new List<Answer>
                {
                    new() { Content = "72", IsCorrect = true },
                    new() { Content = "64", IsCorrect = false },
                    new() { Content = "81", IsCorrect = false },
                    new() { Content = "69", IsCorrect = false }
                }
            },
            new()
            {
                Content = "What is the square root of 144?",
                Category = "Math",
                Answers = new List<Answer>
                {
                    new() { Content = "12", IsCorrect = true },
                    new() { Content = "14", IsCorrect = false },
                    new() { Content = "10", IsCorrect = false },
                    new() { Content = "16", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Who wrote '1984'?",
                Category = "Literature",
                Answers = new List<Answer>
                {
                    new() { Content = "George Orwell", IsCorrect = true },
                    new() { Content = "Aldous Huxley", IsCorrect = false },
                    new() { Content = "Ernest Hemingway", IsCorrect = false },
                    new() { Content = "J.R.R. Tolkien", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which novel begins with the line 'Call me Ishmael'?",
                Category = "Literature",
                Answers = new List<Answer>
                {
                    new() { Content = "Moby-Dick", IsCorrect = true },
                    new() { Content = "The Odyssey", IsCorrect = false },
                    new() { Content = "The Great Gatsby", IsCorrect = false },
                    new() { Content = "Dracula", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which data structure works on a Last-In, First-Out principle?",
                Category = "Programming",
                Answers = new List<Answer>
                {
                    new() { Content = "Stack", IsCorrect = true },
                    new() { Content = "Queue", IsCorrect = false },
                    new() { Content = "Tree", IsCorrect = false },
                    new() { Content = "Graph", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which keyword declares an immutable variable in JavaScript?",
                Category = "Programming",
                Answers = new List<Answer>
                {
                    new() { Content = "const", IsCorrect = true },
                    new() { Content = "let", IsCorrect = false },
                    new() { Content = "var", IsCorrect = false },
                    new() { Content = "static", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which artist painted the ceiling of the Sistine Chapel?",
                Category = "Art",
                Answers = new List<Answer>
                {
                    new() { Content = "Michelangelo", IsCorrect = true },
                    new() { Content = "Leonardo da Vinci", IsCorrect = false },
                    new() { Content = "Raphael", IsCorrect = false },
                    new() { Content = "Donatello", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which art movement is Salvador Dali closely associated with?",
                Category = "Art",
                Answers = new List<Answer>
                {
                    new() { Content = "Surrealism", IsCorrect = true },
                    new() { Content = "Cubism", IsCorrect = false },
                    new() { Content = "Impressionism", IsCorrect = false },
                    new() { Content = "Baroque", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which instrument has 88 keys on a standard version?",
                Category = "Music",
                Answers = new List<Answer>
                {
                    new() { Content = "Piano", IsCorrect = true },
                    new() { Content = "Violin", IsCorrect = false },
                    new() { Content = "Trumpet", IsCorrect = false },
                    new() { Content = "Flute", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which clef is most commonly used for lower-pitched notes on sheet music?",
                Category = "Music",
                Answers = new List<Answer>
                {
                    new() { Content = "Bass clef", IsCorrect = true },
                    new() { Content = "Treble clef", IsCorrect = false },
                    new() { Content = "Alto clef", IsCorrect = false },
                    new() { Content = "Tenor clef", IsCorrect = false }
                }
            }
        };

        var existingContents = context.Questions
            .Select(question => question.Content)
            .ToHashSet();

        var missingQuestions = questions
            .Where(question => !existingContents.Contains(question.Content))
            .ToList();

        if (missingQuestions.Count == 0)
        {
            return;
        }

        context.Questions.AddRange(missingQuestions);
        context.SaveChanges();
    }
}
