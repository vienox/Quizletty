import SetupCategoryChooserSection from './setup/SetupCategoryChooserSection.jsx';
import SetupFeaturedPacksSection from './setup/SetupFeaturedPacksSection.jsx';
import SetupSelectedOverviewSection from './setup/SetupSelectedOverviewSection.jsx';
import SetupSidebarStack from './setup/SetupSidebarStack.jsx';

export default function SetupPage({
  achievementBadges,
  applyQuickStartPreset,
  categories,
  categoryCards,
  challengePresets,
  dailyChallenge,
  favoriteSetups,
  featuredQuizPacks,
  isCurrentSetupFavorite,
  isLoadingMeta,
  isLoadingQuestions,
  maxQuestions,
  metaError,
  mistakeBankCount,
  onClearRecentRuns,
  onDiscardDraft,
  onQuestionLimitChange,
  onRemoveFavorite,
  onReplayRun,
  onResumeDraft,
  onSaveCurrentSetup,
  onSelectCategory,
  onShuffleQuestionsChange,
  onStartMistakeBank,
  onStartChallenge,
  onStartFavorite,
  onStartRecommendedRun,
  onStartSession,
  onToggleFavoriteSetup,
  questionError,
  questionLimit,
  quickStartPresets,
  recentRuns,
  recommendedMode,
  savedDraft,
  selectedCategory,
  selectedCategoryTheme,
  selectedQuizActions,
  selectedQuizGuidance,
  selectedQuizMetrics,
  shuffleQuestions,
  stats,
  steps,
  trainingStats
}) {
  const setupDisabled = isLoadingMeta || Boolean(metaError) || isLoadingQuestions;

  return (
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
              onChange={(event) => onSelectCategory(event.target.value)}
              disabled={setupDisabled}
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
              onChange={(event) => onQuestionLimitChange(Number(event.target.value))}
              disabled={setupDisabled}
            />
          </div>

          <div className="toggle-row">
            <label className="toggle-copy" htmlFor="shuffle">
              Shuffle question order
            </label>
            <input
              checked={shuffleQuestions}
              disabled={setupDisabled}
              id="shuffle"
              onChange={(event) => onShuffleQuestionsChange(event.target.checked)}
              type="checkbox"
            />
          </div>

          <SetupFeaturedPacksSection
            favoriteSetups={favoriteSetups}
            featuredQuizPacks={featuredQuizPacks}
            onApplyPreset={applyQuickStartPreset}
            onToggleFavoriteSetup={onToggleFavoriteSetup}
          />

          <SetupCategoryChooserSection
            applyQuickStartPreset={applyQuickStartPreset}
            categoryCards={categoryCards}
            challengePresets={challengePresets}
            isLaunchingRun={isLoadingQuestions}
            mistakeBankCount={mistakeBankCount}
            onStartMistakeBank={onStartMistakeBank}
            onSelectCategory={onSelectCategory}
            quickStartPresets={quickStartPresets}
            selectedCategory={selectedCategory}
            stats={stats}
          />

          <button
            className="primary-button"
            disabled={setupDisabled}
            onClick={onStartSession}
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

          <SetupSelectedOverviewSection
            applyQuickStartPreset={applyQuickStartPreset}
            isCurrentSetupFavorite={isCurrentSetupFavorite}
            onSaveCurrentSetup={onSaveCurrentSetup}
            recommendedMode={recommendedMode}
            selectedCategory={selectedCategory}
            selectedCategoryTheme={selectedCategoryTheme}
            selectedQuizActions={selectedQuizActions}
            selectedQuizGuidance={selectedQuizGuidance}
            selectedQuizMetrics={selectedQuizMetrics}
          />

          {questionError && <p className="error-copy">{questionError}</p>}
        </article>

        <SetupSidebarStack
          achievementBadges={achievementBadges}
          dailyChallenge={dailyChallenge}
          favoriteSetups={favoriteSetups}
          isLoadingChallenge={isLoadingMeta || isLoadingQuestions}
          isLoadingQuestions={isLoadingQuestions}
          onClearRecentRuns={onClearRecentRuns}
          onDiscardDraft={onDiscardDraft}
          onRemoveFavorite={onRemoveFavorite}
          onReplayRun={onReplayRun}
          onResumeDraft={onResumeDraft}
          onStartChallenge={onStartChallenge}
          onStartFavorite={onStartFavorite}
          onStartRecommendedRun={onStartRecommendedRun}
          recentRuns={recentRuns}
          savedDraft={savedDraft}
          steps={steps}
          trainingStats={trainingStats}
        />
      </section>
    </>
  );
}
