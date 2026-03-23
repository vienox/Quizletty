namespace QuizApp.Dtos;

public class QuizStatsDto
{
    public int TotalQuestions { get; set; }
    public int TotalCategories { get; set; }
    public List<CategoryQuestionCountDto> Categories { get; set; } = new();
}

public class CategoryQuestionCountDto
{
    public string Category { get; set; } = string.Empty;
    public int QuestionCount { get; set; }
}
