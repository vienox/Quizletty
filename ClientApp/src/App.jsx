import { useEffect, useEffectEvent, useState } from 'react';
import HomePage from './components/HomePage.jsx';
import LeaveSessionPrompt from './components/LeaveSessionPrompt.jsx';
import ResultPage from './components/ResultPage.jsx';
import SessionPage from './components/SessionPage.jsx';
import SetupPage from './components/SetupPage.jsx';
import { getCategories, getStats } from './api/quizApi.js';
import { getCategoryTheme } from './lib/categoryThemes.js';
import {
  hasFavoriteSetup,
  loadFavoriteSetups,
  removeFavoriteSetup,
  saveFavoriteSetup
} from './lib/favoriteSetups.js';
import { loadQuizPreferences, saveQuizPreferences } from './lib/quizPreferences.js';
import { clearRecentRuns, loadRecentRuns } from './lib/recentRuns.js';
import { getAchievementBadges } from './lib/achievementBadges.js';
import { getDailyChallenge } from './lib/dailyChallenge.js';
import { getResultFollowUpPreset } from './lib/resultFollowUp.js';
import { calculateTrainingStats } from './lib/trainingStats.js';
import useQuizNavigation from './hooks/useQuizNavigation.js';
import useQuizSession from './hooks/useQuizSession.js';

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
  const [recentRuns, setRecentRuns] = useState(() => loadRecentRuns());
  const [favoriteSetups, setFavoriteSetups] = useState(() => loadFavoriteSetups());
  const {
    confirmPendingNavigation,
    pendingNavigationPhase,
    phase,
    phaseLabel,
    navigateToPhase,
    requestNavigation,
    resetNavigationPrompt,
    showExitPrompt
  } = useQuizNavigation();
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
  const {
    activeQuestionIndex,
    answers,
    currentQuestion,
    discardSavedDraft,
    flaggedQuestions,
    isLoadingQuestions,
    isSubmitting,
    jumpToNextMatchingQuestion,
    questionError,
    questions,
    restartSession,
    result,
    resumeSavedDraft,
    savedDraft,
    sessionStartedAt,
    setActiveQuestionIndex,
    startSession,
    startSessionWithSettings,
    submitError,
    submitSession,
    toggleQuestionFlag,
    handleSelectAnswer
  } = useQuizSession({
    navigateToPhase,
    normalizeSessionSettings,
    onRecentRunsChange: setRecentRuns,
    phase,
    questionLimit,
    resetNavigationPrompt,
    selectedCategory,
    setQuestionLimit,
    setSelectedCategory,
    setShuffleQuestions,
    shuffleQuestions
  });
  const resultFollowUpPreset = getResultFollowUpPreset(result, getQuestionCountForCategory);
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

  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = activeQuestionIndex === questions.length - 1;

  function handleClearRecentRuns() {
    clearRecentRuns();
    setRecentRuns([]);
  }

  function handleRemoveFavorite(favoriteKey) {
    setFavoriteSetups(removeFavoriteSetup(favoriteKey));
  }

  function handleReplayRun(run) {
    startSessionWithSettings({
      category: run.category,
      questionLimit: run.questionCount,
      shuffleQuestions: run.shuffleQuestions
    });
  }

  function handleSaveCurrentSetup() {
    toggleFavoriteSetupEntry({
      category: selectedCategory,
      label: selectedCategory === 'all' ? 'Saved mixed setup' : `${selectedCategory} saved setup`,
      questionLimit,
      shuffleQuestions,
      summary: `${questionLimit} question${questionLimit === 1 ? '' : 's'} / ${shuffleQuestions ? 'shuffled' : 'fixed order'}`
    });
  }

  function handleStartFollowUp() {
    if (!resultFollowUpPreset) {
      return;
    }

    startSessionWithSettings(resultFollowUpPreset);
  }

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
      submitSession();
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
            <p className="top-bar-copy">{phaseLabel}</p>
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
          <SetupPage
            achievementBadges={achievementBadges}
            applyQuickStartPreset={applyQuickStartPreset}
            categories={categories}
            categoryCards={categoryCards}
            challengePresets={challengePresets}
            dailyChallenge={dailyChallenge}
            favoriteSetups={favoriteSetups}
            featuredQuizPacks={featuredQuizPacks.map((pack) => ({
              ...pack,
              artwork: getCategoryTheme(pack.category).artwork
            }))}
            isCurrentSetupFavorite={isCurrentSetupFavorite}
            isLoadingMeta={isLoadingMeta}
            isLoadingQuestions={isLoadingQuestions}
            maxQuestions={maxQuestions}
            metaError={metaError}
            onClearRecentRuns={handleClearRecentRuns}
            onDiscardDraft={discardSavedDraft}
            onQuestionLimitChange={setQuestionLimit}
            onRemoveFavorite={handleRemoveFavorite}
            onReplayRun={handleReplayRun}
            onResumeDraft={resumeSavedDraft}
            onSaveCurrentSetup={handleSaveCurrentSetup}
            onSelectCategory={setSelectedCategory}
            onShuffleQuestionsChange={setShuffleQuestions}
            onStartChallenge={startSessionWithSettings}
            onStartFavorite={startSessionWithSettings}
            onStartRecommendedRun={startSessionWithSettings}
            onStartSession={startSession}
            onToggleFavoriteSetup={toggleFavoriteSetupEntry}
            questionError={questionError}
            questionLimit={questionLimit}
            quickStartPresets={quickStartPresets}
            recentRuns={recentRuns}
            recommendedMode={recommendedMode}
            savedDraft={savedDraft}
            selectedCategory={selectedCategory}
            selectedCategoryTheme={selectedCategoryTheme}
            selectedQuizActions={selectedQuizActions}
            selectedQuizGuidance={selectedQuizGuidance}
            selectedQuizMetrics={selectedQuizMetrics}
            shuffleQuestions={shuffleQuestions}
            stats={stats}
            steps={steps}
            trainingStats={trainingStats}
          />
        )}

        {phase === 'taking' && (
          <SessionPage
            activeQuestionIndex={activeQuestionIndex}
            answers={answers}
            currentQuestion={currentQuestion}
            flaggedQuestions={flaggedQuestions}
            isSubmitting={isSubmitting}
            onBackToSetup={() => requestNavigation('setup')}
            onJumpToNextFlagged={() => jumpToNextMatchingQuestion((item) => Boolean(flaggedQuestions[item.id]))}
            onJumpToNextUnanswered={() => jumpToNextMatchingQuestion((item) => answers[item.id] === undefined)}
            onJumpToQuestion={setActiveQuestionIndex}
            onMoveNext={() => setActiveQuestionIndex((current) => current + 1)}
            onMovePrevious={() => setActiveQuestionIndex((current) => current - 1)}
            onSelectAnswer={handleSelectAnswer}
            onSubmit={submitSession}
            onToggleFlag={toggleQuestionFlag}
            questions={questions}
            selectedCategory={selectedCategory}
            sessionStartedAt={sessionStartedAt}
            shuffleQuestions={shuffleQuestions}
            submitError={submitError}
          />
        )}

        {phase === 'result' && (
          <ResultPage
            followUpPreset={resultFollowUpPreset}
            isStartingFollowUp={isLoadingQuestions}
            onRestart={restartSession}
            onStartFollowUp={handleStartFollowUp}
            result={result}
          />
        )}

        {showExitPrompt && (
          <LeaveSessionPrompt
            pendingNavigationPhase={pendingNavigationPhase}
            onCancel={resetNavigationPrompt}
            onConfirm={confirmPendingNavigation}
          />
        )}
      </section>
    </main>
  );
}
