using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QuizApp.Data;
using QuizApp.Dtos;
using QuizApp.Models;

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

    [HttpGet("questions")]
    public async Task<ActionResult<IEnumerable<QuestionDto>>> GetQuestions()
    {
        var questions = await _context.Questions
            .Include(q => q.Answers)
            .ToListAsync();

        var result = questions.Select(q => new QuestionDto
        {
            Id = q.Id,
            Content = q.Content,
            Answers = q.Answers.Select(a => new AnswerDto
            {
                Id = a.Id,
                Content = a.Content
            }).ToList()
        });

        return Ok(result);
    }

    [HttpPost("submit")]
    public async Task<ActionResult> SubmitQuiz([FromBody] SubmitQuizDto dto)
    {
        var questionIds = dto.Answers.Select(a => a.QuestionId).ToList();

        var questions = await _context.Questions
            .Include(q => q.Answers)
            .Where(q => questionIds.Contains(q.Id))
            .ToListAsync();

        int correctAnswers = 0;

        foreach (var userAnswer in dto.Answers)
        {
            var question = questions.FirstOrDefault(q => q.Id == userAnswer.QuestionId);
            if (question == null) continue;

            var correctAnswer = question.Answers.FirstOrDefault(a => a.IsCorrect);
            if (correctAnswer != null && correctAnswer.Id == userAnswer.AnswerId)
            {
                correctAnswers++;
            }
        }

        return Ok(new
        {
            TotalQuestions = dto.Answers.Count,
            CorrectAnswers = correctAnswers,
            Score = $"{correctAnswers}/{dto.Answers.Count}"
        });
    }
}