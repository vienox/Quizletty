namespace QuizApp.Models;

public class Question
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;

    public List<Answer> Answers { get; set; } = new();

    public string Category { get; set; } = string.Empty;
}