const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium'
});

export default function TrainingSummaryCard({ trainingStats }) {
  const summaryItems = [
    {
      label: 'Current streak',
      value: trainingStats.totalRuns === 0 ? '0 days' : `${trainingStats.currentStreak} day${trainingStats.currentStreak === 1 ? '' : 's'}`
    },
    {
      label: 'Runs logged',
      value: `${trainingStats.totalRuns}`
    },
    {
      label: 'Recent average',
      value: `${trainingStats.recentAverage}%`
    },
    {
      label: 'Best accuracy',
      value: `${trainingStats.bestPercentage}%`
    }
  ];

  return (
    <article className="steps-card training-summary-card">
      <div className="card-header">
        <p className="eyebrow">Training summary</p>
        <h2>Your progress at a glance.</h2>
      </div>

      {trainingStats.totalRuns === 0 ? (
        <p className="helper-copy">
          Start the first run and this space will track your streak, averages and recent activity.
        </p>
      ) : (
        <>
          <div className="training-summary-grid">
            {summaryItems.map((item) => (
              <article className="training-summary-item" key={item.label}>
                <p className="highlight-label">{item.label}</p>
                <p className="highlight-value">{item.value}</p>
              </article>
            ))}
          </div>

          <div className="training-summary-footer">
            <span className="review-status review-status-correct">
              {trainingStats.completedToday ? 'Completed today' : 'No run today yet'}
            </span>
            <p className="history-copy">
              Last activity:{' '}
              <strong>
                {trainingStats.lastActivityAt
                  ? dateFormatter.format(new Date(trainingStats.lastActivityAt))
                  : 'No activity yet'}
              </strong>
            </p>
            <p className="history-copy">
              Active on {trainingStats.activeDays} day{trainingStats.activeDays === 1 ? '' : 's'} so far.
            </p>
          </div>
        </>
      )}
    </article>
  );
}
