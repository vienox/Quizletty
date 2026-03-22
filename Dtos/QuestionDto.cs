namespace QuizApp.Dtos;

public class QuestionDto
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public List<AnswerDto> Answers { get; set; } = new();
}
