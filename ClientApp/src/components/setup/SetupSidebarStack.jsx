import AchievementBadgesCard from '../AchievementBadgesCard.jsx';
import DailyChallengeCard from '../DailyChallengeCard.jsx';
import FavoriteSetupsCard from '../FavoriteSetupsCard.jsx';
import RecentRunsPanel from '../RecentRunsPanel.jsx';
import ResumeDraftCard from '../ResumeDraftCard.jsx';
import TrainingSummaryCard from '../TrainingSummaryCard.jsx';

export default function SetupSidebarStack({
  achievementBadges,
  dailyChallenge,
  favoriteSetups,
  isLoadingChallenge,
  isLoadingQuestions,
  onClearRecentRuns,
  onDiscardDraft,
  onRemoveFavorite,
  onReplayRun,
  onResumeDraft,
  onStartChallenge,
  onStartFavorite,
  onStartRecommendedRun,
  recentRuns,
  savedDraft,
  steps,
  trainingStats
}) {
  return (
    <div className="setup-side-column">
      <DailyChallengeCard
        challenge={dailyChallenge}
        isLoading={isLoadingChallenge}
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
  );
}
