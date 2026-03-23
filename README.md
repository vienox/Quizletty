# Quizletty

Small ASP.NET Core quiz API backed by SQLite. The app creates the database on startup and seeds a small question set the first time it runs.

## Run locally

```bash
dotnet run
```

The API is exposed under `/api/quiz`.

## Endpoints

### `GET /api/quiz/categories`

Returns the distinct quiz categories sorted alphabetically.

### `GET /api/quiz/stats`

Returns a high-level summary of the quiz bank, including total question count and question counts per category.

### `GET /api/quiz/questions`

Returns quiz questions without exposing which answer is correct.

Optional query parameters:

- `category`: exact category name, for example `Programming`
- `limit`: positive number of questions to return
- `shuffle`: set to `true` to randomize question order before applying `limit`

Example:

```text
/api/quiz/questions?category=Science&limit=1&shuffle=true
```

### `GET /api/quiz/questions/{id}`

Returns a single question by id. Responds with `404 Not Found` when the question does not exist.

### `POST /api/quiz/submit`

Scores a completed quiz submission.

Validation rules:

- `answers` must contain at least one item
- each question can only appear once
- `questionId` and `answerId` must be positive
- every `answerId` must belong to the provided `questionId`

Example request body:

```json
{
  "answers": [
    { "questionId": 1, "answerId": 1 },
    { "questionId": 2, "answerId": 5 }
  ]
}
```

Example response body:

```json
{
  "totalQuestions": 2,
  "correctAnswers": 2,
  "incorrectAnswers": 0,
  "percentage": 100,
  "score": "2/2",
  "review": [
    {
      "questionId": 1,
      "questionContent": "What is the capital of France?",
      "category": "Geography",
      "selectedAnswerId": 1,
      "selectedAnswerContent": "Paris",
      "correctAnswerId": 1,
      "correctAnswerContent": "Paris",
      "isCorrect": true
    }
  ],
  "categories": [
    {
      "category": "Geography",
      "totalQuestions": 1,
      "correctAnswers": 1
    },
    {
      "category": "Science",
      "totalQuestions": 1,
      "correctAnswers": 1
    }
  ]
}
```
