import { useEffect, useEffectEvent, useState } from 'react';
import AchievementBadgesCard from './components/AchievementBadgesCard.jsx';
import DailyChallengeCard from './components/DailyChallengeCard.jsx';
import FavoriteSetupsCard from './components/FavoriteSetupsCard.jsx';
import HomePage from './components/HomePage.jsx';
import RecentRunsPanel from './components/RecentRunsPanel.jsx';
import ResumeDraftCard from './components/ResumeDraftCard.jsx';
import TrainingSummaryCard from './components/TrainingSummaryCard.jsx';
import QuestionStage from './components/QuestionStage.jsx';
import ResultStage from './components/ResultStage.jsx';
import { getCategories, getQuestions, getStats, submitQuiz } from './api/quizApi.js';
import { getCategoryTheme } from './lib/categoryThemes.js';
import {
  hasFavoriteSetup,
  loadFavoriteSetups,
  removeFavoriteSetup,
  saveFavoriteSetup
} from './lib/favoriteSetups.js';
import { loadQuizPreferences, saveQuizPreferences } from './lib/quizPreferences.js';
import { clearRecentRuns, loadRecentRuns, saveRecentRun } from './lib/recentRuns.js';
import { clearSessionDraft, loadSessionDraft, saveSessionDraft } from './lib/sessionDraft.js';
import { getAchievementBadges } from './lib/achievementBadges.js';
import { getDailyChallenge } from './lib/dailyChallenge.js';
import { calculateTrainingStats } from './lib/trainingStats.js';

const phaseToPath = {
  home: '/',
  result: '/result',
  setup: '/setup',
  taking: '/session'
};

function normalizePathname(pathname) {
  const normalizedPath = pathname !== '/' && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;

  return Object.values(phaseToPath).includes(normalizedPath)
    ? normalizedPath
    : '/';
}

function getPhaseFromPathname(pathname) {
  const normalizedPath = normalizePathname(pathname);

  return Object.entries(phaseToPath).find(([, value]) => value === normalizedPath)?.[0] ?? 'home';
}

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
  const [phase, setPhase] = useState(() => getPhaseFromPathname(window.location.pathname));
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);
  const [recentRuns, setRecentRuns] = useState(() => loadRecentRuns());
  const [favoriteSetups, setFavoriteSetups] = useState(() => loadFavoriteSetups());
  const [savedDraft, setSavedDraft] = useState(() => loadSessionDraft());
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [pendingNavigationPhase, setPendingNavigationPhase] = useState(null);
  const [sessionStartedAt, setSessionStartedAt] = useState(null);
  const trainingStats = calculateTrainingStats(recentRuns, new Date(now));
  const achievementBadges = getAchievementBadges(recentRuns, trainingStats);

  const steps = [
    'Choose a featured pack or tune the setup yourself.',
    'Move through the questions, answer calmly and flag anything worth revisiting.',
    'Use the score, breakdown and follow-up suggestion to choose the next run.'
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

        setMetaError('Could not load the quiz setup right now.');
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

  useEffect(() => {
    const normalizedPath = normalizePathname(window.location.pathname);

    if (window.location.pathname !== normalizedPath) {
      window.history.replaceState({}, '', normalizedPath);
      setPhase(getPhaseFromPathname(normalizedPath));
    }

    function handlePopState() {
      setPhase(getPhaseFromPathname(window.location.pathname));
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  function navigateToPhase(nextPhase, { replace = false } = {}) {
    const nextPath = phaseToPath[nextPhase] ?? '/';

    if (replace) {
      window.history.replaceState({}, '', nextPath);
    } else if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    setPhase(nextPhase);
  }

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
      value: metaError ? 'Unavailable' : 'Instant answer review'
    },
    {
      label: 'Streak',
      value: trainingStats.totalRuns === 0
        ? 'Start today'
        : `${trainingStats.currentStreak}-day streak`
    }
  ];

  const maxQuestions = selectedCategory === 'all'
    ? stats?.totalQuestions ?? 1
    : stats?.categories?.find((item) => item.category === selectedCategory)?.questionCount ?? 1;
  const selectedCategoryTheme = getCategoryTheme(selectedCategory);
  const categoryQuestionCounts = new Map(
    (stats?.categories ?? []).map((item) => [item.category, item.questionCount])
  );

  function getQuestionCountForCategory(category) {
    if (category === 'all') {
      return stats?.totalQuestions ?? 1;
    }

    return categoryQuestionCounts.get(category) ?? 1;
  }

  function getAvailableCategory(preferredCategories) {
    return preferredCategories.find((category) => categoryQuestionCounts.has(category)) ?? 'all';
  }

  function normalizeSessionSettings(settings) {
    const normalizedCategory = settings.category && settings.category !== 'all' && categoryQuestionCounts.has(settings.category)
      ? settings.category
      : 'all';
    const availableQuestions = getQuestionCountForCategory(normalizedCategory);

    return {
      category: normalizedCategory,
      questionLimit: Math.min(Math.max(settings.questionLimit ?? 1, 1), availableQuestions),
      shuffleQuestions: Boolean(settings.shuffleQuestions)
    };
  }

  const featuredQuizPacks = [
    {
      category: 'all',
      eyebrow: 'Featured pack',
      label: 'Starter mix',
      questionLimit: Math.min(6, getQuestionCountForCategory('all')),
      shuffleQuestions: true,
      summary: 'A balanced pass across the full bank when you want a quick but varied session.',
      detail: 'Good first run when you want to sample the whole app.'
    },
    {
      category: getAvailableCategory(['Programming', 'Science', 'History']),
      eyebrow: 'Featured pack',
      label: 'Deep focus',
      questionLimit: Math.min(8, getQuestionCountForCategory(getAvailableCategory(['Programming', 'Science', 'History']))),
      shuffleQuestions: false,
      summary: 'A denser single-category run with fewer context switches and steadier pacing.',
      detail: 'Built for staying inside one lane and tightening recall.'
    },
    {
      category: getAvailableCategory(['History', 'Literature', 'Art']),
      eyebrow: 'Featured pack',
      label: 'Storyline route',
      questionLimit: Math.min(7, getQuestionCountForCategory(getAvailableCategory(['History', 'Literature', 'Art']))),
      shuffleQuestions: false,
      summary: 'A themed run centered on narrative, context and recognition across richer prompts.',
      detail: 'Works well when you want a more classic knowledge run.'
    },
    {
      category: getAvailableCategory(['Sports', 'Math', 'Music']),
      eyebrow: 'Featured pack',
      label: 'Fast reflex',
      questionLimit: Math.min(7, getQuestionCountForCategory(getAvailableCategory(['Sports', 'Math', 'Music']))),
      shuffleQuestions: true,
      summary: 'Shorter questions, quicker choices and a sharper pace with random order turned on.',
      detail: 'Best when you want a compact run with momentum.'
    }
  ];
  const quickStartPresets = [
    {
      category: 'all',
      label: 'Quick warm-up',
      questionLimit: 5,
      shuffleQuestions: true,
      summary: 'Short mixed run to get moving fast.'
    },
    {
      category: 'all',
      label: 'Deep mixed run',
      questionLimit: 10,
      shuffleQuestions: true,
      summary: 'Broader session across the full bank.'
    },
    {
      category: selectedCategory === 'all' ? 'all' : selectedCategory,
      label: 'Focused category drill',
      questionLimit: Math.min(6, maxQuestions),
      shuffleQuestions: false,
      summary: selectedCategory === 'all'
        ? 'Switch to one category first for a tighter practice run.'
        : `Stay inside ${selectedCategory} and review it in sequence.`
    }
  ];
  const challengePresets = [
    {
      category: 'all',
      label: 'Shuffle sprint',
      questionLimit: 8,
      shuffleQuestions: true,
      summary: 'Fast mixed pressure with no fixed order.'
    },
    {
      category: selectedCategory === 'all' ? 'Programming' : selectedCategory,
      label: 'Topic lock-in',
      questionLimit: Math.min(8, selectedCategory === 'all'
        ? stats?.categories?.find((item) => item.category === 'Programming')?.questionCount ?? 8
        : maxQuestions),
      shuffleQuestions: false,
      summary: selectedCategory === 'all'
        ? 'A denser focused run in one technical lane.'
        : `Push deeper inside ${selectedCategory} without randomization.`
    },
    {
      category: 'all',
      label: 'Long review',
      questionLimit: Math.min(12, stats?.totalQuestions ?? 12),
      shuffleQuestions: false,
      summary: 'A steadier full-bank run for a longer review block.'
    }
  ];
  const categoryCards = [
    {
      category: 'all',
      label: 'All categories',
      questionCount: stats?.totalQuestions ?? 0,
      ...getCategoryTheme('all')
    },
    ...(stats?.categories?.map((item) => ({
      category: item.category,
      label: item.category,
      questionCount: item.questionCount,
      ...getCategoryTheme(item.category)
    })) ?? [])
  ];
  const selectedRunCoverage = maxQuestions === 0
    ? 0
    : Math.round((questionLimit / maxQuestions) * 100);
  const selectedBankLabel = maxQuestions >= 10
    ? 'Deep bank'
    : maxQuestions >= 6
      ? 'Solid bank'
      : 'Compact bank';
  const selectedRunDepthLabel = selectedRunCoverage >= 80
    ? 'Deep pass'
    : selectedRunCoverage >= 50
      ? 'Balanced pass'
      : 'Compact pass';
  const recommendedMode = selectedCategory === 'all'
    ? {
        label: 'Shuffled mix',
        detail: 'Best for broad recall across multiple topics.'
      }
    : {
        label: 'Fixed category drill',
        detail: `Start ${selectedCategory} in sequence, then add shuffle once the lane feels stable.`
      };
  const selectedQuizGuidance = selectedCategory === 'all'
    ? 'Use the mixed track when you want a quick read on what is holding up well across the whole bank.'
    : `Stay inside ${selectedCategory} when you want fewer context switches and a cleaner repetition loop.`;
  const selectedQuizActions = selectedCategory === 'all'
    ? [
        {
          category: 'all',
          label: 'Balanced mix',
          questionLimit: Math.min(8, maxQuestions),
          shuffleQuestions: true,
          summary: 'Wider all-category run with random order for better spread.'
        },
        {
          category: 'all',
          label: 'Long review',
          questionLimit: Math.min(12, maxQuestions),
          shuffleQuestions: false,
          summary: 'Longer mixed pass when you want a steadier review block.'
        }
      ]
    : [
        {
          category: selectedCategory,
          label: 'Short drill',
          questionLimit: Math.min(5, maxQuestions),
          shuffleQuestions: false,
          summary: `Fast ${selectedCategory} run to tighten the core questions first.`
        },
        {
          category: selectedCategory,
          label: 'Full track pass',
          questionLimit: Math.min(8, maxQuestions),
          shuffleQuestions: false,
          summary: `Use more of ${selectedCategory} in sequence for a deeper review.`
        }
      ];
  const selectedQuizMetrics = [
    {
      label: 'Question bank',
      value: `${maxQuestions}`,
      detail: selectedBankLabel
    },
    {
      label: 'Current slice',
      value: `${selectedRunCoverage}%`,
      detail: selectedRunDepthLabel
    },
    {
      label: 'Recommended mode',
      value: recommendedMode.label,
      detail: selectedCategory === 'all' ? 'Across the full bank' : 'Inside one topic'
    }
  ];
  const resultFollowUpPreset = result
    ? (() => {
        const rankedCategories = [...result.categories]
          .map((item) => ({
            ...item,
            accuracy: item.totalQuestions === 0 ? 0 : item.correctAnswers / item.totalQuestions
          }))
          .sort((left, right) => {
            if (left.accuracy !== right.accuracy) {
              return left.accuracy - right.accuracy;
            }

            return right.totalQuestions - left.totalQuestions;
          });
        const weakestCategory = rankedCategories[0];

        if (!weakestCategory) {
          return {
            category: 'all',
            label: 'Run another mixed check',
            questionLimit: Math.min(6, getQuestionCountForCategory('all')),
            shuffleQuestions: true,
            summary: 'Start another broad pass across the quiz bank.'
          };
        }

        return {
          category: weakestCategory.category,
          label: `Drill ${weakestCategory.category}`,
          questionLimit: Math.min(
            Math.max(weakestCategory.totalQuestions, 4),
            getQuestionCountForCategory(weakestCategory.category)
          ),
          shuffleQuestions: false,
          summary: `${Math.round(weakestCategory.accuracy * 100)}% accuracy in ${weakestCategory.category} makes it the clearest next follow-up.`
        };
      })()
    : null;
  const isCurrentSetupFavorite = hasFavoriteSetup(favoriteSetups, {
    category: selectedCategory,
    questionLimit,
    shuffleQuestions
  });
  const dailyChallenge = stats
    ? getDailyChallenge({
        categoryItems: stats.categories,
        referenceDate: new Date(now),
        totalQuestions: stats.totalQuestions
      })
    : null;

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

  useEffect(() => {
    if (phase === 'taking' && questions.length === 0 && !isLoadingQuestions) {
      if (savedDraft?.questions?.length) {
        resumeSavedDraft({ navigate: false });
        return;
      }

      navigateToPhase('setup', { replace: true });
    }

    if (phase === 'result' && !result) {
      navigateToPhase('setup', { replace: true });
    }
  }, [isLoadingQuestions, phase, questions.length, result, savedDraft]);

  async function startSessionWithSettings(settings) {
    const normalizedSettings = normalizeSessionSettings(settings);

    setSelectedCategory(normalizedSettings.category);
    setQuestionLimit(normalizedSettings.questionLimit);
    setShuffleQuestions(normalizedSettings.shuffleQuestions);
    setIsLoadingQuestions(true);
    setQuestionError('');

    try {
      const questionItems = await getQuestions({
        category: normalizedSettings.category,
        limit: normalizedSettings.questionLimit,
        shuffle: normalizedSettings.shuffleQuestions
      });

      setQuestions(questionItems);
      setAnswers({});
      setFlaggedQuestions({});
      setActiveQuestionIndex(0);
      setSessionStartedAt(new Date().toISOString());
      setResult(null);
      setSubmitError('');
      setShowExitPrompt(false);
      setPendingNavigationPhase(null);
      navigateToPhase('taking');
    } catch (error) {
      setQuestionError('Could not load questions for the selected setup.');
    } finally {
      setIsLoadingQuestions(false);
    }
  }

  async function startSession() {
    await startSessionWithSettings({
      category: selectedCategory,
      questionLimit,
      shuffleQuestions
    });
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

  function resumeSavedDraft({ navigate = true } = {}) {
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
    setShowExitPrompt(false);
    setPendingNavigationPhase(null);

    if (navigate) {
      navigateToPhase('taking');
    }
  }

  function applyQuickStartPreset(preset) {
    const normalizedPreset = normalizeSessionSettings(preset);

    setSelectedCategory(normalizedPreset.category);
    setQuestionLimit(normalizedPreset.questionLimit);
    setShuffleQuestions(normalizedPreset.shuffleQuestions);
  }

  function toggleFavoriteSetupEntry(setup) {
    if (hasFavoriteSetup(favoriteSetups, setup)) {
      setFavoriteSetups(removeFavoriteSetup(setup));
      return;
    }

    setFavoriteSetups(saveFavoriteSetup(setup));
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
        categories: submissionResult.categories,
        id: `${Date.now()}`,
        category: selectedCategory,
        completedAt: new Date().toISOString(),
        correctAnswers: submissionResult.correctAnswers,
        incorrectAnswers: submissionResult.incorrectAnswers,
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
      navigateToPhase('result');
    } catch (error) {
      setSubmitError('Could not score the quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function requestNavigation(nextPhase) {
    if (phase === 'taking') {
      setPendingNavigationPhase(nextPhase);
      setShowExitPrompt(true);
      return;
    }

    navigateToPhase(nextPhase);
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
        <header className="top-bar">
          <button className="brand-link" onClick={() => requestNavigation('home')} type="button">
            Quizletty
          </button>

          {phase !== 'home' && (
            <p className="top-bar-copy">
              {phase === 'setup' ? 'Quiz builder' : phase === 'taking' ? 'Quiz session' : 'Results'}
            </p>
          )}
        </header>

        {phase === 'home' && (
          <HomePage
            dailyChallenge={dailyChallenge}
            highlights={highlights}
            isLoadingChallenge={isLoadingMeta || isLoadingQuestions}
            onOpenSetup={() => navigateToPhase('setup')}
            onResumeDraft={() => resumeSavedDraft()}
            onStartChallenge={(challenge) => {
              startSessionWithSettings(challenge);
            }}
            savedDraft={savedDraft}
            trainingStats={trainingStats}
          />
        )}

        {phase === 'setup' && (
          <>
            <section className="page-section-head">
              <div>
                <p className="eyebrow">Quiz builder</p>
                <h1>Build the run on its own page.</h1>
              </div>

              <p className="masthead-copy">
                Keep this screen for the full setup, saved shortcuts and deeper training controls.
              </p>
            </section>

            <section className="workspace-grid">
            <article className="setup-card">
              <div className="card-header">
                <p className="eyebrow">Session setup</p>
                <h2>Pick the shape of your run.</h2>
              </div>

              <p className="status-chip">
                {isLoadingMeta ? 'Loading setup...' : metaError || 'Ready to start'}
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

              <div className="featured-pack-shell">
                <div className="card-header">
                  <p className="eyebrow">Featured quiz packs</p>
                  <h2>Start from a ready-made run instead of building one from scratch.</h2>
                </div>

                <div className="featured-pack-grid">
                  {featuredQuizPacks.map((pack) => {
                    const packTheme = getCategoryTheme(pack.category);
                    const isPackFavorite = hasFavoriteSetup(favoriteSetups, pack);

                    return (
                      <article
                        className="featured-pack-card"
                        key={`${pack.label}-${pack.category}-${pack.questionLimit}`}
                      >
                        <div
                          className="featured-pack-artwork"
                          style={{ backgroundImage: `url("${packTheme.artwork}")` }}
                        />

                        <div className="featured-pack-copy">
                          <p className="eyebrow">{pack.eyebrow}</p>
                          <h2>{pack.label}</h2>
                          <p className="history-copy">{pack.summary}</p>
                          <p className="history-copy">{pack.detail}</p>

                          <div className="featured-pack-meta">
                            <span className="review-status review-status-correct">
                              {pack.category === 'all' ? 'Mixed run' : pack.category}
                            </span>
                            <span className="review-status review-status-correct">
                              {pack.questionLimit} question{pack.questionLimit === 1 ? '' : 's'}
                            </span>
                            <span className="review-status review-status-correct">
                              {pack.shuffleQuestions ? 'Shuffled' : 'Fixed order'}
                            </span>
                          </div>

                          <div className="featured-pack-actions">
                            <button
                              className="secondary-button"
                              onClick={() => applyQuickStartPreset(pack)}
                              type="button"
                            >
                              Use this pack
                            </button>

                            <button
                              className="ghost-button"
                              onClick={() => toggleFavoriteSetupEntry({
                                ...pack,
                                summary: `${pack.summary} ${pack.questionLimit} question${pack.questionLimit === 1 ? '' : 's'} / ${pack.shuffleQuestions ? 'shuffled' : 'fixed order'}.`
                              })}
                              type="button"
                            >
                              {isPackFavorite ? 'Remove favorite' : 'Save pack'}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <div className="quick-start-grid">
                {quickStartPresets.map((preset) => (
                  <button
                    className="quick-start-card"
                    key={`${preset.label}-${preset.category}-${preset.questionLimit}`}
                    onClick={() => applyQuickStartPreset(preset)}
                    type="button"
                  >
                    <p className="highlight-label">{preset.label}</p>
                    <p className="highlight-value">
                      {preset.questionLimit} question{preset.questionLimit === 1 ? '' : 's'}
                    </p>
                    <p className="history-copy">{preset.summary}</p>
                  </button>
                ))}
              </div>

              <div className="challenge-run-grid">
                {challengePresets.map((preset) => (
                  <button
                    className="challenge-run-card"
                    key={`${preset.label}-${preset.category}-${preset.questionLimit}`}
                    onClick={() => applyQuickStartPreset(preset)}
                    type="button"
                  >
                    <p className="eyebrow">Challenge run</p>
                    <h2>{preset.label}</h2>
                    <p className="history-copy">{preset.summary}</p>
                    <p className="history-copy">
                      {preset.questionLimit} question{preset.questionLimit === 1 ? '' : 's'}
                      {' / '}
                      {preset.shuffleQuestions ? 'shuffled' : 'fixed order'}
                    </p>
                  </button>
                ))}
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

              <div className="category-card-grid">
                {categoryCards.map((item) => (
                  <button
                    className={`category-card-choice${selectedCategory === item.category ? ' category-card-choice-active' : ''}`}
                    key={item.category}
                    onClick={() => setSelectedCategory(item.category)}
                    type="button"
                  >
                    <div
                      className="category-card-artwork"
                      style={{ backgroundImage: `url("${item.artwork}")` }}
                    />

                    <div className="category-card-copy">
                      <p className="eyebrow">{item.eyebrow}</p>
                      <h2>{item.label}</h2>
                      <p className="history-copy">{item.summary}</p>
                      <p className="history-copy">
                        {item.questionCount} question{item.questionCount === 1 ? '' : 's'}
                      </p>
                    </div>
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

              <article className="category-focus-card">
                <div
                  className="category-focus-artwork"
                  style={{ backgroundImage: `url("${selectedCategoryTheme.artwork}")` }}
                />

                <div className="category-focus-copy">
                  <p className="eyebrow">{selectedCategoryTheme.eyebrow}</p>
                  <h2>
                    {selectedCategory === 'all' ? 'Mixed quiz selection' : selectedCategory}
                  </h2>
                  <p className="helper-copy">
                    {selectedCategoryTheme.summary}
                  </p>

                  <div className="category-focus-metrics">
                    {selectedQuizMetrics.map((item) => (
                      <article className="category-focus-metric" key={item.label}>
                        <p className="highlight-label">{item.label}</p>
                        <p className="highlight-value">{item.value}</p>
                        <p className="history-copy">{item.detail}</p>
                      </article>
                    ))}
                  </div>

                  <div className="category-focus-guidance">
                    <p className="highlight-label">Best for</p>
                    <p className="history-copy">{selectedQuizGuidance}</p>
                    <p className="highlight-label">Recommended setup</p>
                    <p className="history-copy">{recommendedMode.detail}</p>
                  </div>

                  <div className="category-focus-action-grid">
                    {selectedQuizActions.map((preset) => (
                      <button
                        className="category-focus-action"
                        key={`${preset.label}-${preset.category}-${preset.questionLimit}`}
                        onClick={() => applyQuickStartPreset(preset)}
                        type="button"
                      >
                        <p className="highlight-label">{preset.label}</p>
                        <p className="highlight-value">
                          {preset.questionLimit} question{preset.questionLimit === 1 ? '' : 's'}
                        </p>
                        <p className="history-copy">{preset.summary}</p>
                      </button>
                    ))}
                  </div>

                  <button
                    className="ghost-button"
                    onClick={() => toggleFavoriteSetupEntry({
                      category: selectedCategory,
                      label: selectedCategory === 'all' ? 'Saved mixed setup' : `${selectedCategory} saved setup`,
                      questionLimit,
                      shuffleQuestions,
                      summary: `${questionLimit} question${questionLimit === 1 ? '' : 's'} / ${shuffleQuestions ? 'shuffled' : 'fixed order'}`
                    })}
                    type="button"
                  >
                    {isCurrentSetupFavorite ? 'Remove from favorites' : 'Save current setup'}
                  </button>
                </div>
              </article>

              {questionError && <p className="error-copy">{questionError}</p>}
            </article>

            <div className="setup-side-column">
              <DailyChallengeCard
                challenge={dailyChallenge}
                isLoading={isLoadingMeta || isLoadingQuestions}
                onStartChallenge={(challenge) => {
                  startSessionWithSettings(challenge);
                }}
              />

              <FavoriteSetupsCard
                favoriteSetups={favoriteSetups}
                isLaunchingRun={isLoadingQuestions}
                onRemoveFavorite={(favoriteKey) => {
                  setFavoriteSetups(removeFavoriteSetup(favoriteKey));
                }}
                onStartFavorite={(favoriteSetup) => {
                  startSessionWithSettings(favoriteSetup);
                }}
              />

              <TrainingSummaryCard trainingStats={trainingStats} />

              <AchievementBadgesCard badges={achievementBadges} />

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
                  <p className="eyebrow">How it flows</p>
                  <h2>The run stays simple from setup to review.</h2>
                </div>

                <ol className="steps-list">
                  {steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </article>

              <RecentRunsPanel
                isLaunchingRun={isLoadingQuestions}
                onClear={() => {
                  clearRecentRuns();
                  setRecentRuns([]);
                }}
                onReplayRun={(run) => {
                  startSessionWithSettings({
                    category: run.category,
                    questionLimit: run.questionCount,
                    shuffleQuestions: run.shuffleQuestions
                  });
                }}
                onStartRecommendedRun={(preset) => {
                  startSessionWithSettings(preset);
                }}
                runs={recentRuns}
              />
            </div>
            </section>
          </>
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
            onBackToSetup={() => requestNavigation('setup')}
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
            followUpPreset={resultFollowUpPreset}
            isStartingFollowUp={isLoadingQuestions}
            onRestart={() => {
              navigateToPhase('setup');
              setQuestions([]);
              setAnswers({});
              setFlaggedQuestions({});
              setSessionStartedAt(null);
              setResult(null);
              setActiveQuestionIndex(0);
            }}
            onStartFollowUp={() => {
              if (!resultFollowUpPreset) {
                return;
              }

              startSessionWithSettings(resultFollowUpPreset);
            }}
            result={result}
          />
        )}

        {showExitPrompt && (
          <section className="overlay-shell" role="dialog" aria-modal="true" aria-labelledby="exit-quiz-title">
            <article className="overlay-card">
              <p className="eyebrow">Leave quiz</p>
              <h2 id="exit-quiz-title">
                {pendingNavigationPhase === 'home' ? 'Go back to the home page?' : 'Go back to setup?'}
              </h2>
              <p className="helper-copy">
                Your current progress stays saved as a draft, so you can come back later from the builder.
              </p>

              <div className="result-actions">
                <button
                  className="ghost-button result-button"
                  onClick={() => {
                    setPendingNavigationPhase(null);
                    setShowExitPrompt(false);
                  }}
                  type="button"
                >
                  Keep solving
                </button>

                <button
                  className="primary-button result-button"
                  onClick={() => {
                    setShowExitPrompt(false);
                    navigateToPhase(pendingNavigationPhase ?? 'setup');
                    setPendingNavigationPhase(null);
                  }}
                  type="button"
                >
                  {pendingNavigationPhase === 'home' ? 'Leave to home' : 'Leave to setup'}
                </button>
              </div>
            </article>
          </section>
        )}
      </section>
    </main>
  );
}
