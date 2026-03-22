using System.ComponentModel.DataAnnotations;

namespace QuizApp.Dtos;

public class SubmitQuizDto
{
    [Required]
    [MinLength(1)]
    public List<UserAnswerDto> Answers { get; set; } = new();
}

public class UserAnswerDto
{
    [Range(1, int.MaxValue)]
    public int QuestionId { get; set; }

    [Range(1, int.MaxValue)]
    public int AnswerId { get; set; }
}
