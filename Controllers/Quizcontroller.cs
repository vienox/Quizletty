using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizApp.Data;
using QuizApp.Dtos;

namespace QuizApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuizController : ControllerBase
{
    private readonly AppDbContext _context;

    public QuizController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IEnumerable<string>>> GetCategories()
    {
        var categories = await _context.Questions
            .AsNoTracking()
            .Select(q => q.Category)
            .Distinct()
            .OrderBy(category => category)
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("questions")]
    public async Task<ActionResult<IEnumerable<QuestionDto>>> GetQuestions(
        [FromQuery] string? category,
        [FromQuery] int? limit,
        [FromQuery] bool shuffle = false)
    {
        if (limit is <= 0)
        {
            return BadRequest("The limit query parameter must be greater than 0.");
        }

        var query = _context.Questions
            .AsNoTracking()
            .Include(q => q.Answers)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
        {
            var normalizedCategory = category.Trim();
            query = query.Where(q => q.Category == normalizedCategory);
        }

        var questions = await query
            .OrderBy(q => q.Id)
            .ToListAsync();

        if (shuffle)
        {
            questions = questions
                .OrderBy(_ => Guid.NewGuid())
                .ToList();
        }

        if (limit.HasValue)
        {
            questions = questions
                .Take(limit.Value)
                .ToList();
        }

        var result = questions.Select(q => new QuestionDto
        {
            Id = q.Id,
            Content = q.Content,
            Category = q.Category,
            Answers = q.Answers.Select(a => new AnswerDto
            {
                Id = a.Id,
                Content = a.Content
            }).ToList()
        });

        return Ok(result);
    }

    [HttpPost("submit")]
    public async Task<ActionResult<SubmitQuizResultDto>> SubmitQuiz([FromBody] SubmitQuizDto dto)
    {
        var questionIds = dto.Answers.Select(a => a.QuestionId).ToList();

        if (questionIds.Count != questionIds.Distinct().Count())
        {
            ModelState.AddModelError(nameof(dto.Answers), "Each question can only be answered once.");
            return ValidationProblem(ModelState);
        }

        var questions = await _context.Questions
            .AsNoTracking()
            .Include(q => q.Answers)
            .Where(q => questionIds.Contains(q.Id))
            .ToListAsync();

        if (questions.Count != questionIds.Count)
        {
            ModelState.AddModelError(nameof(dto.Answers), "One or more question ids are invalid.");
            return ValidationProblem(ModelState);
        }

        var questionsById = questions.ToDictionary(q => q.Id);
        int correctAnswers = 0;

        foreach (var userAnswer in dto.Answers)
        {
            var question = questionsById[userAnswer.QuestionId];

            if (!question.Answers.Any(a => a.Id == userAnswer.AnswerId))
            {
                ModelState.AddModelError(nameof(dto.Answers), $"Answer id {userAnswer.AnswerId} does not belong to question id {userAnswer.QuestionId}.");
                return ValidationProblem(ModelState);
            }

            var correctAnswer = question.Answers.FirstOrDefault(a => a.IsCorrect);
            if (correctAnswer != null && correctAnswer.Id == userAnswer.AnswerId)
            {
                correctAnswers++;
            }
        }

        var result = new SubmitQuizResultDto
        {
            TotalQuestions = dto.Answers.Count,
            CorrectAnswers = correctAnswers,
            Score = $"{correctAnswers}/{dto.Answers.Count}"
        };

        return Ok(result);
    }
}
