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
                Content = "Which continent is the Sahara Desert located on?",
                Category = "Geography",
                Answers = new List<Answer>
                {
                    new() { Content = "Africa", IsCorrect = true },
                    new() { Content = "Asia", IsCorrect = false },
                    new() { Content = "Australia", IsCorrect = false },
                    new() { Content = "South America", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which sea separates Europe and Africa?",
                Category = "Geography",
                Answers = new List<Answer>
                {
                    new() { Content = "Mediterranean Sea", IsCorrect = true },
                    new() { Content = "Black Sea", IsCorrect = false },
                    new() { Content = "Baltic Sea", IsCorrect = false },
                    new() { Content = "Red Sea", IsCorrect = false }
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
                Content = "What part of the cell contains DNA in most organisms?",
                Category = "Science",
                Answers = new List<Answer>
                {
                    new() { Content = "Nucleus", IsCorrect = true },
                    new() { Content = "Membrane", IsCorrect = false },
                    new() { Content = "Cytoplasm", IsCorrect = false },
                    new() { Content = "Ribosome", IsCorrect = false }
                }
            },
            new()
            {
                Content = "What is the process by which liquid water becomes vapor?",
                Category = "Science",
                Answers = new List<Answer>
                {
                    new() { Content = "Evaporation", IsCorrect = true },
                    new() { Content = "Condensation", IsCorrect = false },
                    new() { Content = "Freezing", IsCorrect = false },
                    new() { Content = "Melting", IsCorrect = false }
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
                Content = "What is 15% of 200?",
                Category = "Math",
                Answers = new List<Answer>
                {
                    new() { Content = "30", IsCorrect = true },
                    new() { Content = "20", IsCorrect = false },
                    new() { Content = "25", IsCorrect = false },
                    new() { Content = "35", IsCorrect = false }
                }
            },
            new()
            {
                Content = "What is the value of pi rounded to two decimal places?",
                Category = "Math",
                Answers = new List<Answer>
                {
                    new() { Content = "3.14", IsCorrect = true },
                    new() { Content = "3.12", IsCorrect = false },
                    new() { Content = "3.41", IsCorrect = false },
                    new() { Content = "3.04", IsCorrect = false }
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
                Content = "Who wrote 'Pride and Prejudice'?",
                Category = "Literature",
                Answers = new List<Answer>
                {
                    new() { Content = "Jane Austen", IsCorrect = true },
                    new() { Content = "Emily Bronte", IsCorrect = false },
                    new() { Content = "Mary Shelley", IsCorrect = false },
                    new() { Content = "Virginia Woolf", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which fictional detective lives at 221B Baker Street?",
                Category = "Literature",
                Answers = new List<Answer>
                {
                    new() { Content = "Sherlock Holmes", IsCorrect = true },
                    new() { Content = "Hercule Poirot", IsCorrect = false },
                    new() { Content = "Sam Spade", IsCorrect = false },
                    new() { Content = "Philip Marlowe", IsCorrect = false }
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
                Content = "Which HTML tag is used to create a hyperlink?",
                Category = "Programming",
                Answers = new List<Answer>
                {
                    new() { Content = "<a>", IsCorrect = true },
                    new() { Content = "<link>", IsCorrect = false },
                    new() { Content = "<href>", IsCorrect = false },
                    new() { Content = "<nav>", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which SQL keyword is used to sort query results?",
                Category = "Programming",
                Answers = new List<Answer>
                {
                    new() { Content = "ORDER BY", IsCorrect = true },
                    new() { Content = "GROUP", IsCorrect = false },
                    new() { Content = "FILTER", IsCorrect = false },
                    new() { Content = "SELECT", IsCorrect = false }
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
                Content = "Which Dutch painter created 'The Starry Night'?",
                Category = "Art",
                Answers = new List<Answer>
                {
                    new() { Content = "Vincent van Gogh", IsCorrect = true },
                    new() { Content = "Piet Mondrian", IsCorrect = false },
                    new() { Content = "Johannes Vermeer", IsCorrect = false },
                    new() { Content = "Rembrandt", IsCorrect = false }
                }
            },
            new()
            {
                Content = "What is the art of paper folding called?",
                Category = "Art",
                Answers = new List<Answer>
                {
                    new() { Content = "Origami", IsCorrect = true },
                    new() { Content = "Calligraphy", IsCorrect = false },
                    new() { Content = "Mosaic", IsCorrect = false },
                    new() { Content = "Engraving", IsCorrect = false }
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
            },
            new()
            {
                Content = "How many strings does a standard guitar typically have?",
                Category = "Music",
                Answers = new List<Answer>
                {
                    new() { Content = "6", IsCorrect = true },
                    new() { Content = "4", IsCorrect = false },
                    new() { Content = "5", IsCorrect = false },
                    new() { Content = "8", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which family does the clarinet belong to?",
                Category = "Music",
                Answers = new List<Answer>
                {
                    new() { Content = "Woodwind", IsCorrect = true },
                    new() { Content = "Brass", IsCorrect = false },
                    new() { Content = "Percussion", IsCorrect = false },
                    new() { Content = "Strings", IsCorrect = false }
                }
            },
            new()
            {
                Content = "In which year did the Berlin Wall fall?",
                Category = "History",
                Answers = new List<Answer>
                {
                    new() { Content = "1989", IsCorrect = true },
                    new() { Content = "1979", IsCorrect = false },
                    new() { Content = "1991", IsCorrect = false },
                    new() { Content = "1969", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Who was the first President of the United States?",
                Category = "History",
                Answers = new List<Answer>
                {
                    new() { Content = "George Washington", IsCorrect = true },
                    new() { Content = "Thomas Jefferson", IsCorrect = false },
                    new() { Content = "John Adams", IsCorrect = false },
                    new() { Content = "Abraham Lincoln", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which civilization built Machu Picchu?",
                Category = "History",
                Answers = new List<Answer>
                {
                    new() { Content = "Inca", IsCorrect = true },
                    new() { Content = "Maya", IsCorrect = false },
                    new() { Content = "Aztec", IsCorrect = false },
                    new() { Content = "Roman", IsCorrect = false }
                }
            },
            new()
            {
                Content = "How many players from one team are typically on the court in basketball?",
                Category = "Sports",
                Answers = new List<Answer>
                {
                    new() { Content = "5", IsCorrect = true },
                    new() { Content = "6", IsCorrect = false },
                    new() { Content = "7", IsCorrect = false },
                    new() { Content = "8", IsCorrect = false }
                }
            },
            new()
            {
                Content = "Which country won the FIFA World Cup in 2018?",
                Category = "Sports",
                Answers = new List<Answer>
                {
                    new() { Content = "France", IsCorrect = true },
                    new() { Content = "Croatia", IsCorrect = false },
                    new() { Content = "Argentina", IsCorrect = false },
                    new() { Content = "Brazil", IsCorrect = false }
                }
            },
            new()
            {
                Content = "What is the maximum score with one dart in standard darts?",
                Category = "Sports",
                Answers = new List<Answer>
                {
                    new() { Content = "60", IsCorrect = true },
                    new() { Content = "50", IsCorrect = false },
                    new() { Content = "100", IsCorrect = false },
                    new() { Content = "180", IsCorrect = false }
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
