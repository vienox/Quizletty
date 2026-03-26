import { useEffect, useEffectEvent, useState } from 'react';
import RecentRunsPanel from './components/RecentRunsPanel.jsx';
import ResumeDraftCard from './components/ResumeDraftCard.jsx';
import QuestionStage from './components/QuestionStage.jsx';
import ResultStage from './components/ResultStage.jsx';
import { getCategories, getQuestions, getStats, submitQuiz } from './api/quizApi.js';
import { loadQuizPreferences, saveQuizPreferences } from './lib/quizPreferences.js';
import { clearRecentRuns, loadRecentRuns, saveRecentRun } from './lib/recentRuns.js';
import { clearSessionDraft, loadSessionDraft, saveSessionDraft } from './lib/sessionDraft.js';

export default function App() {
  const [storedPreferences] = useState(() => loadQuizPreferences());
  const [now] = useState(() => new Date().toISOString());
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(storedPreferences.selectedCategory);
  const [questionLimit, setQuestionLimit] = useState(storedPreferences.questionLimit);
  const [shuffleQuestions, setShuffleQuestions] = useState(storedPreferences.shuffleQuestions);
  const [metaError, setMetaError] = useState('');
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState('');
  const [phase, setPhase] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);
  const [recentRuns, setRecentRuns] = useState(() => loadRecentRuns());
  const [savedDraft, setSavedDraft] = useState(() => loadSessionDraft());
  const [sessionStartedAt, setSessionStartedAt] = useState(null);

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

        const hasStoredCategory = storedPreferences.selectedCategory === 'all'
          || categoryItems.includes(storedPreferences.selectedCategory);

        if (!hasStoredCategory) {
          setSelectedCategory('all');
        }
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

  useEffect(() => {
    setQuestionLimit((current) => {
      if (!maxQuestions) {
        return current;
      }

      return Math.min(Math.max(current, 1), maxQuestions);
    });
  }, [maxQuestions]);

  useEffect(() => {
    saveQuizPreferences({
      questionLimit,
      selectedCategory,
      shuffleQuestions
    });
  }, [questionLimit, selectedCategory, shuffleQuestions]);

  useEffect(() => {
    if (phase !== 'taking' || questions.length === 0) {
      return;
    }

    saveSessionDraft({
      activeQuestionIndex,
      answers,
      flaggedQuestions,
      questions,
      savedAt: new Date().toISOString(),
      startedAt: sessionStartedAt,
      settings: {
        questionLimit,
        selectedCategory,
        shuffleQuestions
      }
    });
    setSavedDraft(loadSessionDraft());
  }, [
    activeQuestionIndex,
    answers,
    flaggedQuestions,
    phase,
    questionLimit,
    questions,
    selectedCategory,
    sessionStartedAt,
    shuffleQuestions
  ]);

  async function startSession() {
    setIsLoadingQuestions(true);
    setQuestionError('');

    try {
      const questionItems = await getQuestions({
        category: selectedCategory,
        limit: Math.min(questionLimit, maxQuestions),
        shuffle: shuffleQuestions
      });

      setQuestions(questionItems);
      setAnswers({});
      setFlaggedQuestions({});
      setActiveQuestionIndex(0);
      setSessionStartedAt(new Date().toISOString());
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

  function toggleQuestionFlag(questionId) {
    setFlaggedQuestions((current) => {
      const nextFlags = { ...current };

      if (nextFlags[questionId]) {
        delete nextFlags[questionId];
      } else {
        nextFlags[questionId] = true;
      }

      return nextFlags;
    });
  }

  function jumpToNextMatchingQuestion(predicate) {
    if (questions.length === 0) {
      return;
    }

    for (let offset = 1; offset <= questions.length; offset += 1) {
      const candidateIndex = (activeQuestionIndex + offset) % questions.length;

      if (predicate(questions[candidateIndex])) {
        setActiveQuestionIndex(candidateIndex);
        return;
      }
    }
  }

  function resumeSavedDraft() {
    if (!savedDraft) {
      return;
    }

    setSelectedCategory(savedDraft.settings?.selectedCategory ?? 'all');
    setQuestionLimit(savedDraft.settings?.questionLimit ?? savedDraft.questions.length);
    setShuffleQuestions(savedDraft.settings?.shuffleQuestions ?? true);
    setQuestions(savedDraft.questions);
    setAnswers(savedDraft.answers ?? {});
    setFlaggedQuestions(savedDraft.flaggedQuestions ?? {});
    setActiveQuestionIndex(savedDraft.activeQuestionIndex ?? 0);
    setSessionStartedAt(savedDraft.startedAt ?? savedDraft.savedAt ?? now);
    setResult(null);
    setSubmitError('');
    setPhase('taking');
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
      const historyEntry = {
        id: `${Date.now()}`,
        category: selectedCategory,
        completedAt: new Date().toISOString(),
        percentage: submissionResult.percentage,
        questionCount: questions.length,
        score: submissionResult.score,
        shuffleQuestions
      };

      setRecentRuns(saveRecentRun(historyEntry));
      clearSessionDraft();
      setSavedDraft(null);
      setSessionStartedAt(null);
      setResult(submissionResult);
      setPhase('result');
    } catch (error) {
      setSubmitError('Could not score the quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const currentQuestion = questions[activeQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = activeQuestionIndex === questions.length - 1;

  const handleKeyboardShortcuts = useEffectEvent((event) => {
    if (phase !== 'taking' || !currentQuestion) {
      return;
    }

    const targetTagName = event.target instanceof HTMLElement ? event.target.tagName : '';
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(targetTagName)) {
      return;
    }

    if (/^[1-9]$/.test(event.key)) {
      const answerIndex = Number(event.key) - 1;
      const answer = currentQuestion.answers[answerIndex];

      if (answer) {
        event.preventDefault();
        handleSelectAnswer(currentQuestion.id, answer.id);
      }

      return;
    }

    if (event.key === 'ArrowLeft' && activeQuestionIndex > 0) {
      event.preventDefault();
      setActiveQuestionIndex((current) => current - 1);
      return;
    }

    if (event.key === 'ArrowRight' && activeQuestionIndex < questions.length - 1) {
      event.preventDefault();
      setActiveQuestionIndex((current) => current + 1);
      return;
    }

    if (event.key === 'Enter' && isLastQuestion && answeredCount === questions.length && !isSubmitting) {
      event.preventDefault();
      handleSubmitQuiz();
      return;
    }

    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      toggleQuestionFlag(currentQuestion.id);
    }
  });

  useEffect(() => {
    if (phase !== 'taking') {
      return undefined;
    }

    function onKeyDown(event) {
      handleKeyboardShortcuts(event);
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [phase]);

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
            The React client now covers the whole quiz flow, from saved setup
            preferences and resumable quiz drafts to scored results with
            shareable summaries.
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

              <div className="toggle-row">
                <label className="toggle-copy" htmlFor="shuffle">
                  Shuffle question order
                </label>
                <input
                  checked={shuffleQuestions}
                  disabled={isLoadingMeta || !!metaError || isLoadingQuestions}
                  id="shuffle"
                  onChange={(event) => setShuffleQuestions(event.target.checked)}
                  type="checkbox"
                />
              </div>

              <div className="category-pills">
                <button
                  className={`category-pill${selectedCategory === 'all' ? ' category-pill-active' : ''}`}
                  onClick={() => setSelectedCategory('all')}
                  type="button"
                >
                  All
                </button>

                {stats?.categories?.map((item) => (
                  <button
                    className={`category-pill${selectedCategory === item.category ? ' category-pill-active' : ''}`}
                    key={item.category}
                    onClick={() => setSelectedCategory(item.category)}
                    type="button"
                  >
                    {item.category}
                  </button>
                ))}
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
                {questionLimit} question{questionLimit === 1 ? '' : 's'}
                {shuffleQuestions ? ' / shuffled' : ' / fixed order'}.
              </p>

              {questionError && <p className="error-copy">{questionError}</p>}
            </article>

            <div className="setup-side-column">
              {savedDraft && (
                <ResumeDraftCard
                  draft={savedDraft}
                  onDiscard={() => {
                    clearSessionDraft();
                    setSavedDraft(null);
                  }}
                  onResume={resumeSavedDraft}
                />
              )}

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

              <RecentRunsPanel
                onClear={() => {
                  clearRecentRuns();
                  setRecentRuns([]);
                }}
                runs={recentRuns}
              />
            </div>
          </section>
        )}

        {phase === 'taking' && currentQuestion && (
          <QuestionStage
            activeIndex={activeQuestionIndex}
            answers={answers}
            flaggedQuestions={flaggedQuestions}
            hasFlaggedQuestions={questions.some((item) => Boolean(flaggedQuestions[item.id]))}
            hasUnansweredQuestions={questions.some((item) => answers[item.id] === undefined)}
            isSubmitting={isSubmitting}
            onJumpToQuestion={setActiveQuestionIndex}
            onJumpToNextFlagged={() => {
              jumpToNextMatchingQuestion((item) => Boolean(flaggedQuestions[item.id]));
            }}
            onJumpToNextUnanswered={() => {
              jumpToNextMatchingQuestion((item) => answers[item.id] === undefined);
            }}
            onBackToSetup={() => setPhase('setup')}
            onMoveNext={() => setActiveQuestionIndex((current) => current + 1)}
            onMovePrevious={() => setActiveQuestionIndex((current) => current - 1)}
            onSelectAnswer={handleSelectAnswer}
            onSubmit={handleSubmitQuiz}
            onToggleFlag={toggleQuestionFlag}
            questions={questions}
            question={currentQuestion}
            sessionSettings={{
              flaggedCount: Object.keys(flaggedQuestions).length,
              selectedCategory,
              sessionStartedAt,
              shuffleQuestions
            }}
            shortcutsEnabled
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
              setFlaggedQuestions({});
              setSessionStartedAt(null);
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
