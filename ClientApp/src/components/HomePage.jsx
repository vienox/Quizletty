import DailyChallengeCard from './DailyChallengeCard.jsx';

export default function HomePage({
  dailyChallenge,
  highlights,
  isLoadingChallenge,
  isStartingRun,
  mistakeBankCount,
  onOpenSetup,
  onResumeDraft,
  onStartMistakeBank,
  onStartChallenge,
  savedDraft,
  trainingStats
}) {
  return (
    <>
      <header className="masthead home-masthead">
        <div>
          <p className="eyebrow">Start here</p>
          <h1>Choose a path and jump into the next run faster.</h1>
        </div>

        <p className="masthead-copy">
          Keep the home screen short: open the builder when you want full control,
          or launch a ready challenge right away.
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

      <section className="home-grid">
        <article className="setup-card home-actions-card">
          <div className="card-header">
            <p className="eyebrow">Quick start</p>
            <h2>Go straight to the part you need.</h2>
          </div>

          <p className="helper-copy">
            Open the full builder for custom runs, resume a saved session, or use today&apos;s challenge.
          </p>

          <div className="home-action-stack">
            <button className="primary-button" onClick={onOpenSetup} type="button">
              Open quiz builder
            </button>

            <button
              className="secondary-button"
              disabled={mistakeBankCount === 0 || isStartingRun}
              onClick={onStartMistakeBank}
              type="button"
            >
              {isStartingRun
                ? 'Loading mistake bank...'
                : mistakeBankCount === 0
                  ? 'Mistake bank empty'
                  : `Retry mistakes (${mistakeBankCount})`}
            </button>

            {savedDraft && (
              <button className="secondary-button" onClick={onResumeDraft} type="button">
                Resume saved session
              </button>
            )}
          </div>

          <p className="helper-copy">
            {mistakeBankCount === 0
              ? 'Miss a few questions and the mistake bank will queue them here for a focused retry run.'
              : 'Launch the saved misses directly when you want a tighter corrective run.'}
          </p>

          <div className="home-mini-stats">
            <article className="home-mini-stat">
              <p className="highlight-label">Current streak</p>
              <p className="highlight-value">
                {trainingStats.totalRuns === 0 ? '0 days' : `${trainingStats.currentStreak} days`}
              </p>
            </article>

            <article className="home-mini-stat">
              <p className="highlight-label">Runs logged</p>
              <p className="highlight-value">{trainingStats.totalRuns}</p>
            </article>

            <article className="home-mini-stat">
              <p className="highlight-label">Best accuracy</p>
              <p className="highlight-value">{trainingStats.bestPercentage}%</p>
            </article>
          </div>
        </article>

        <DailyChallengeCard
          challenge={dailyChallenge}
          isLoading={isLoadingChallenge}
          onStartChallenge={onStartChallenge}
        />
      </section>
    </>
  );
}
