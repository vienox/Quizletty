# Quizletty

Quizletty is a small ASP.NET Core quiz API with a React frontend. The backend uses SQLite, creates the database on startup and seeds a small question set the first time it runs.

## Run the app

The built React app is served by ASP.NET from `/`.

```bash
dotnet run --launch-profile https
```

Open `https://localhost:7229/` for the quiz page.

## Frontend workflow

React source lives in `ClientApp/`. After frontend changes, rebuild the static assets that ASP.NET serves:
es
```bash
cd ClientApp
npm install
npm run build
```

For faster frontend iteration during development, run both servers in parallel:

```bash
dotnet run --launch-profile https
cd ClientApp
npm run dev
```

The Vite dev server proxies `/api/*` requests to `https://localhost:7229` by default. You can override that target with `QUIZ_API_URL`.

## What the page does

- loads quiz categories and stats from the API
- remembers setup choices like category, limit and shuffle mode in browser storage
- autosaves an unfinished quiz session in browser storage while you are solving
- lets you pick a category, question count and shuffled order
- lets you resume or discard a saved draft from the setup screen
- walks through the quiz one question at a time
- shows a live session overview, question navigator and review flags while you answer
- submits the selected answers back to the API
- shows the score, per-category breakdown and per-question review
- lets you filter review cards by correct vs missed answers
- lets you copy a compact score summary to the clipboard
- stores the latest runs in browser storage and shows them on the setup screen
- supports keyboard shortcuts during the quiz: `1-9` to pick, arrows to move, `Enter` to submit on the last card
- supports `F` while solving to flag the current question for later review

## API

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
