namespace QuizApp.Dtos;

public class SubmitQuizDto
{
    public List<UserAnswerDto> Answers { get; set; } = new();
}

public class UserAnswerDto
{
    public int QuestionId { get; set; }
    public int AnswerId { get; set; }
}