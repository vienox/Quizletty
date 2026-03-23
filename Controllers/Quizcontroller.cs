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

    [HttpGet("stats")]
    public async Task<ActionResult<QuizStatsDto>> GetQuizStats()
    {
        var categoryCounts = await _context.Questions
            .AsNoTracking()
            .GroupBy(q => q.Category)
            .Select(group => new CategoryQuestionCountDto
            {
                Category = group.Key,
                QuestionCount = group.Count()
            })
            .OrderBy(item => item.Category)
            .ToListAsync();

        var result = new QuizStatsDto
        {
            TotalQuestions = categoryCounts.Sum(item => item.QuestionCount),
            TotalCategories = categoryCounts.Count,
            Categories = categoryCounts
        };

        return Ok(result);
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

        var result = questions.Select(MapQuestion);

        return Ok(result);
    }

    [HttpGet("questions/{id:int}")]
    public async Task<ActionResult<QuestionDto>> GetQuestionById(int id)
    {
        var question = await _context.Questions
            .AsNoTracking()
            .Include(q => q.Answers)
            .SingleOrDefaultAsync(q => q.Id == id);

        if (question == null)
        {
            return NotFound();
        }

        return Ok(MapQuestion(question));
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
        var review = new List<QuestionReviewDto>();

        foreach (var userAnswer in dto.Answers)
        {
            var question = questionsById[userAnswer.QuestionId];

            if (!question.Answers.Any(a => a.Id == userAnswer.AnswerId))
            {
                ModelState.AddModelError(nameof(dto.Answers), $"Answer id {userAnswer.AnswerId} does not belong to question id {userAnswer.QuestionId}.");
                return ValidationProblem(ModelState);
            }

            var selectedAnswer = question.Answers.First(a => a.Id == userAnswer.AnswerId);
            var correctAnswer = question.Answers.FirstOrDefault(a => a.IsCorrect);
            var isCorrect = correctAnswer != null && correctAnswer.Id == userAnswer.AnswerId;

            if (isCorrect)
            {
                correctAnswers++;
            }

            review.Add(new QuestionReviewDto
            {
                QuestionId = question.Id,
                QuestionContent = question.Content,
                Category = question.Category,
                SelectedAnswerId = selectedAnswer.Id,
                SelectedAnswerContent = selectedAnswer.Content,
                CorrectAnswerId = correctAnswer?.Id ?? 0,
                CorrectAnswerContent = correctAnswer?.Content ?? string.Empty,
                IsCorrect = isCorrect
            });
        }

        var totalQuestions = dto.Answers.Count;
        var incorrectAnswers = totalQuestions - correctAnswers;
        var percentage = totalQuestions == 0
            ? 0
            : Math.Round((double)correctAnswers / totalQuestions * 100, 2);
        var categories = review
            .GroupBy(item => item.Category)
            .Select(group => new CategoryScoreDto
            {
                Category = group.Key,
                TotalQuestions = group.Count(),
                CorrectAnswers = group.Count(item => item.IsCorrect)
            })
            .OrderBy(item => item.Category)
            .ToList();

        var result = new SubmitQuizResultDto
        {
            TotalQuestions = totalQuestions,
            CorrectAnswers = correctAnswers,
            IncorrectAnswers = incorrectAnswers,
            Percentage = percentage,
            Score = $"{correctAnswers}/{totalQuestions}",
            Review = review,
            Categories = categories
        };

        return Ok(result);
    }

    private static QuestionDto MapQuestion(Models.Question question)
    {
        return new QuestionDto
        {
            Id = question.Id,
            Content = question.Content,
            Category = question.Category,
            Answers = question.Answers.Select(answer => new AnswerDto
            {
                Id = answer.Id,
                Content = answer.Content
            }).ToList()
        };
    }
}
