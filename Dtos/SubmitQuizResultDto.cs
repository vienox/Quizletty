namespace QuizApp.Dtos;

public class SubmitQuizResultDto
{
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
    public int IncorrectAnswers { get; set; }
    public double Percentage { get; set; }
    public string Score { get; set; } = string.Empty;
    public List<QuestionReviewDto> Review { get; set; } = new();
    public List<CategoryScoreDto> Categories { get; set; } = new();
}

public class QuestionReviewDto
{
    public int QuestionId { get; set; }
    public string QuestionContent { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int SelectedAnswerId { get; set; }
    public string SelectedAnswerContent { get; set; } = string.Empty;
    public int CorrectAnswerId { get; set; }
    public string CorrectAnswerContent { get; set; } = string.Empty;
    public bool IsCorrect { get; set; }
}

public class CategoryScoreDto
{
    public string Category { get; set; } = string.Empty;
    public int TotalQuestions { get; set; }
    public int CorrectAnswers { get; set; }
}
