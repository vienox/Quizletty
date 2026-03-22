namespace QuizApp.Dtos;

public class SubmitQuizResultDto
{
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int IncorrectAnswers { get; set; }
    public double Percentage { get; set; }
    public string Score { get; set; } = string.Empty;
}
