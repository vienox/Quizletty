import { useEffect, useState } from 'react';
import QuestionStage from './components/QuestionStage.jsx';
import ResultStage from './components/ResultStage.jsx';
import { getCategories, getQuestions, getStats, submitQuiz } from './api/quizApi.js';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [questionLimit, setQuestionLimit] = useState(5);
  const [metaError, setMetaError] = useState('');
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState('');
  const [phase, setPhase] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);

  const steps = [
    'Pick a category or keep the full mix.',
    'Start the session and answer one card at a time.',
    'Review the score, category split and every correction.'
  ];

  useEffect(() => {
    let isActive = true;

    async function loadMeta() {
      try {
        const [categoryItems, statsResponse] = await Promise.all([
          getCategories(),
          getStats()
        ]);

        if (!isActive) {
          return;
        }

        setCategories(categoryItems);
        setStats(statsResponse);
        setQuestionLimit(Math.min(statsResponse.totalQuestions || 5, 5));
      } catch (error) {
        if (!isActive) {
          return;
        }

        setMetaError('Could not load quiz metadata from the API.');
      } finally {
        if (isActive) {
          setIsLoadingMeta(false);
        }
      }
    }

    loadMeta();

    return () => {
      isActive = false;
    };
  }, []);

  const highlights = [
    {
      label: 'Question bank',
      value: isLoadingMeta ? 'Loading...' : `${stats?.totalQuestions ?? 0} live prompts`
    },
    {
      label: 'Categories',
      value: isLoadingMeta ? 'Loading...' : `${stats?.totalCategories ?? 0} focus tracks`
    },
    {
      label: 'Mode',
      value: metaError ? 'Offline' : 'Instant answer review'
    }
  ];

  const maxQuestions = selectedCategory === 'all'
    ? stats?.totalQuestions ?? 1
    : stats?.categories?.find((item) => item.category === selectedCategory)?.questionCount ?? 1;

  async function startSession() {
    setIsLoadingQuestions(true);
    setQuestionError('');

    try {
      const questionItems = await getQuestions({
        category: selectedCategory,
        limit: Math.min(questionLimit, maxQuestions)
      });

      setQuestions(questionItems);
      setAnswers({});
      setActiveQuestionIndex(0);
      setResult(null);
      setSubmitError('');
      setPhase('taking');
    } catch (error) {
      setQuestionError('Could not load questions for the selected setup.');
    } finally {
      setIsLoadingQuestions(false);
    }
  }

  function handleSelectAnswer(questionId, answerId) {
    setAnswers((current) => ({
      ...current,
      [questionId]: answerId
    }));
  }

  async function handleSubmitQuiz() {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        answers: questions.map((question) => ({
          questionId: question.id,
          answerId: answers[question.id]
        }))
      };

      const submissionResult = await submitQuiz(payload);
      setResult(submissionResult);
      setPhase('result');
    } catch (error) {
      setSubmitError('Could not score the quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentQuestion = questions[activeQuestionIndex];

  return (
    <main className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <section className="page-frame">
        <header className="masthead">
          <div>
            <p className="eyebrow">Quizletty / React Client</p>
            <h1>Run the quiz in one calm, focused flow.</h1>
          </div>

          <p className="masthead-copy">
            A dedicated quiz page now reads live metadata from the ASP.NET API.
            Next up: loading questions, answering them and scoring the session
            end to end.
          </p>
        </header>

        <section className="highlight-grid">
          {highlights.map((item) => (
            <article className="highlight-card" key={item.label}>
              <p className="highlight-label">{item.label}</p>
              <p className="highlight-value">{item.value}</p>
            </article>
          ))}
        </section>

        {phase === 'setup' && (
          <section className="workspace-grid">
            <article className="setup-card">
              <div className="card-header">
                <p className="eyebrow">Session setup</p>
                <h2>Pick the shape of your run.</h2>
              </div>

              <p className="status-chip">
                {isLoadingMeta ? 'Loading metadata...' : metaError || 'Metadata ready'}
              </p>

              <div className="field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(event) => setSelectedCategory(event.target.value)}
                  disabled={isLoadingMeta || !!metaError || isLoadingQuestions}
                >
                  <option value="all">All categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="limit">Questions</label>
                <input
                  id="limit"
                  type="number"
                  min="1"
                  max={maxQuestions}
                  value={questionLimit}
                  onChange={(event) => setQuestionLimit(Number(event.target.value))}
                  disabled={isLoadingMeta || !!metaError || isLoadingQuestions}
                />
              </div>

              <button
                className="primary-button"
                disabled={isLoadingMeta || !!metaError || isLoadingQuestions}
                onClick={startSession}
                type="button"
              >
                {isLoadingQuestions ? 'Loading questions...' : 'Start quiz session'}
              </button>

              <p className="helper-copy">
                Current choice: {selectedCategory === 'all' ? 'all categories' : selectedCategory}
                {' / '}
                {questionLimit} question{questionLimit === 1 ? '' : 's'}.
              </p>

              {questionError && <p className="error-copy">{questionError}</p>}
            </article>

            <article className="steps-card">
              <div className="card-header">
                <p className="eyebrow">Roadmap</p>
                <h2>The full user path is already mapped.</h2>
              </div>

              <ol className="steps-list">
                {steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>
          </section>
        )}

        {phase === 'taking' && currentQuestion && (
          <QuestionStage
            activeIndex={activeQuestionIndex}
            answers={answers}
            isSubmitting={isSubmitting}
            onBackToSetup={() => setPhase('setup')}
            onMoveNext={() => setActiveQuestionIndex((current) => current + 1)}
            onMovePrevious={() => setActiveQuestionIndex((current) => current - 1)}
            onSelectAnswer={handleSelectAnswer}
            onSubmit={handleSubmitQuiz}
            question={currentQuestion}
            submitError={submitError}
            totalQuestions={questions.length}
          />
        )}

        {phase === 'result' && result && (
          <ResultStage
            onRestart={() => {
              setPhase('setup');
              setQuestions([]);
              setAnswers({});
              setResult(null);
              setActiveQuestionIndex(0);
            }}
            result={result}
          />
        )}
      </section>
    </main>
  );
}
