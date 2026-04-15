import { useState } from 'react';
import HomePage from './components/HomePage.jsx';
import LeaveSessionPrompt from './components/LeaveSessionPrompt.jsx';
import ResultPage from './components/ResultPage.jsx';
import SessionPage from './components/SessionPage.jsx';
import SetupPage from './components/SetupPage.jsx';
import {
  hasFavoriteSetup,
  loadFavoriteSetups,
  removeFavoriteSetup,
  saveFavoriteSetup
} from './lib/favoriteSetups.js';
import { clearRecentRuns, loadRecentRuns } from './lib/recentRuns.js';
import { getAchievementBadges } from './lib/achievementBadges.js';
import { loadMistakeBank } from './lib/mistakeBank.js';
import { getResultFollowUpPreset } from './lib/resultFollowUp.js';
import { buildSetupViewModel } from './lib/setupViewModel.js';
import { calculateTrainingStats } from './lib/trainingStats.js';
import useQuizNavigation from './hooks/useQuizNavigation.js';
import useQuizMeta from './hooks/useQuizMeta.js';
import useQuizSession from './hooks/useQuizSession.js';
import useSessionKeyboardShortcuts from './hooks/useSessionKeyboardShortcuts.js';

export default function App() {
  const [now] = useState(() => new Date().toISOString());
  const [mistakeBank, setMistakeBank] = useState(() => loadMistakeBank());
  const [recentRuns, setRecentRuns] = useState(() => loadRecentRuns());
  const [favoriteSetups, setFavoriteSetups] = useState(() => loadFavoriteSetups());
  const {
    categories,
    getAvailableCategory,
    getQuestionCountForCategory,
    isLoadingMeta,
    maxQuestions,
    metaError,
    normalizeSessionSettings,
    questionLimit,
    selectedCategory,
    setQuestionLimit,
    setSelectedCategory,
    setShuffleQuestions,
    shuffleQuestions,
    stats
  } = useQuizMeta();
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
  const mistakeBankQuestionIds = mistakeBank.map((entry) => entry.questionId);

  const steps = [
    'Choose a featured pack or tune the setup yourself.',
    'Move through the questions, answer calmly and flag anything worth revisiting.',
    'Use the score, breakdown and follow-up suggestion to choose the next run.'
  ];
  const {
    categoryCards,
    challengePresets,
    dailyChallenge,
    featuredQuizPacks,
    highlights,
    isCurrentSetupFavorite,
    quickStartPresets,
    recommendedMode,
    selectedCategoryTheme,
    selectedQuizActions,
    selectedQuizGuidance,
    selectedQuizMetrics
  } = buildSetupViewModel({
    favoriteSetups,
    getAvailableCategory,
    getQuestionCountForCategory,
    isLoadingMeta,
    metaError,
    now,
    questionLimit,
    selectedCategory,
    shuffleQuestions,
    stats,
    mistakeBankCount: mistakeBank.length,
    trainingStats
  });
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
    activeSessionSettings,
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
    onMistakeBankChange: setMistakeBank,
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

  function handleClearRecentRuns() {
    clearRecentRuns();
    setRecentRuns([]);
  }

  function handleRemoveFavorite(favoriteKey) {
    setFavoriteSetups(removeFavoriteSetup(favoriteKey));
  }

  function handleReplayRun(run) {
    if (run.runType === 'mistake-bank' && run.questionIds.length > 0) {
      startSessionWithSettings({
        category: 'all',
        questionIds: run.questionIds,
        runLabel: run.runLabel ?? 'Mistake bank',
        runType: 'mistake-bank',
        shuffleQuestions: run.shuffleQuestions
      });
      return;
    }

    startSessionWithSettings({
      category: run.category,
      questionLimit: run.questionCount,
      shuffleQuestions: run.shuffleQuestions
    });
  }

  function handleStartMistakeBank() {
    if (mistakeBankQuestionIds.length === 0) {
      return;
    }

    startSessionWithSettings({
      category: 'all',
      questionIds: mistakeBankQuestionIds,
      runLabel: 'Mistake bank',
      runType: 'mistake-bank',
      shuffleQuestions: false
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

  useSessionKeyboardShortcuts({
    activeQuestionIndex,
    answers,
    currentQuestion,
    isSubmitting,
    onMoveNext: () => setActiveQuestionIndex((current) => current + 1),
    onMovePrevious: () => setActiveQuestionIndex((current) => current - 1),
    onSelectAnswer: handleSelectAnswer,
    onSubmit: submitSession,
    onToggleFlag: toggleQuestionFlag,
    phase,
    questionsLength: questions.length
  });

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
            isStartingRun={isLoadingQuestions}
            mistakeBankCount={mistakeBank.length}
            onOpenSetup={() => navigateToPhase('setup')}
            onResumeDraft={() => resumeSavedDraft()}
            onStartMistakeBank={handleStartMistakeBank}
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
            featuredQuizPacks={featuredQuizPacks}
            isCurrentSetupFavorite={isCurrentSetupFavorite}
            isLoadingMeta={isLoadingMeta}
            isLoadingQuestions={isLoadingQuestions}
            maxQuestions={maxQuestions}
            metaError={metaError}
            mistakeBankCount={mistakeBank.length}
            onClearRecentRuns={handleClearRecentRuns}
            onDiscardDraft={discardSavedDraft}
            onQuestionLimitChange={setQuestionLimit}
            onRemoveFavorite={handleRemoveFavorite}
            onReplayRun={handleReplayRun}
            onResumeDraft={resumeSavedDraft}
            onSaveCurrentSetup={handleSaveCurrentSetup}
            onSelectCategory={setSelectedCategory}
            onShuffleQuestionsChange={setShuffleQuestions}
            onStartMistakeBank={handleStartMistakeBank}
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
            sessionSettings={activeSessionSettings}
            sessionStartedAt={sessionStartedAt}
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
