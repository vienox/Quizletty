import AchievementBadgesCard from './AchievementBadgesCard.jsx';
import DailyChallengeCard from './DailyChallengeCard.jsx';
import FavoriteSetupsCard from './FavoriteSetupsCard.jsx';
import RecentRunsPanel from './RecentRunsPanel.jsx';
import ResumeDraftCard from './ResumeDraftCard.jsx';
import TrainingSummaryCard from './TrainingSummaryCard.jsx';
import { hasFavoriteSetup } from '../lib/favoriteSetups.js';

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
  onClearRecentRuns,
  onDiscardDraft,
  onQuestionLimitChange,
  onRemoveFavorite,
  onReplayRun,
  onResumeDraft,
  onSaveCurrentSetup,
  onSelectCategory,
  onShuffleQuestionsChange,
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

          <div className="featured-pack-shell">
            <div className="card-header">
              <p className="eyebrow">Featured quiz packs</p>
              <h2>Start from a ready-made run instead of building one from scratch.</h2>
            </div>

            <div className="featured-pack-grid">
              {featuredQuizPacks.map((pack) => {
                const isPackFavorite = hasFavoriteSetup(favoriteSetups, pack);

                return (
                  <article
                    className="featured-pack-card"
                    key={`${pack.label}-${pack.category}-${pack.questionLimit}`}
                  >
                    <div
                      className="featured-pack-artwork"
                      style={{ backgroundImage: `url("${pack.artwork}")` }}
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
                          onClick={() => onToggleFavoriteSetup({
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
              onClick={() => onSelectCategory('all')}
              type="button"
            >
              All
            </button>

            {stats?.categories?.map((item) => (
              <button
                className={`category-pill${selectedCategory === item.category ? ' category-pill-active' : ''}`}
                key={item.category}
                onClick={() => onSelectCategory(item.category)}
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
                onClick={() => onSelectCategory(item.category)}
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

          <article className="category-focus-card">
            <div
              className="category-focus-artwork"
              style={{ backgroundImage: `url("${selectedCategoryTheme.artwork}")` }}
            />

            <div className="category-focus-copy">
              <p className="eyebrow">{selectedCategoryTheme.eyebrow}</p>
              <h2>{selectedCategory === 'all' ? 'Mixed quiz selection' : selectedCategory}</h2>
              <p className="helper-copy">{selectedCategoryTheme.summary}</p>

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

              <button className="ghost-button" onClick={onSaveCurrentSetup} type="button">
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
            onStartChallenge={onStartChallenge}
          />

          <FavoriteSetupsCard
            favoriteSetups={favoriteSetups}
            isLaunchingRun={isLoadingQuestions}
            onRemoveFavorite={onRemoveFavorite}
            onStartFavorite={onStartFavorite}
          />

          <TrainingSummaryCard trainingStats={trainingStats} />

          <AchievementBadgesCard badges={achievementBadges} />

          {savedDraft && (
            <ResumeDraftCard
              draft={savedDraft}
              onDiscard={onDiscardDraft}
              onResume={onResumeDraft}
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
            onClear={onClearRecentRuns}
            onReplayRun={onReplayRun}
            onStartRecommendedRun={onStartRecommendedRun}
            runs={recentRuns}
          />
        </div>
      </section>
    </>
  );
}
