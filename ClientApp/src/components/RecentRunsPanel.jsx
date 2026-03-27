const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

export default function RecentRunsPanel({ onClear, runs }) {
  return (
    <article className="steps-card">
      <div className="card-header">
        <p className="eyebrow">Recent runs</p>
        <h2>Your latest browser-side sessions.</h2>
      </div>

      {runs.length === 0 && (
        <p className="helper-copy">
          Finish a quiz once and the latest scores will start appearing here.
        </p>
      )}

      {runs.length > 0 && (
        <>
          <div className="history-list">
            {runs.map((run) => (
              <article className="history-item" key={run.id}>
                <div className="history-topline">
                  <p className="highlight-value">{run.score}</p>
                  <span className="review-status review-status-correct">{run.percentage}%</span>
                </div>

                <p className="history-copy">
                  {run.correctAnswers} correct / {run.incorrectAnswers} missed
                </p>

                <p className="history-copy">
                  {run.category === 'all' ? 'All categories' : run.category}
                  {' / '}
                  {run.questionCount} question{run.questionCount === 1 ? '' : 's'}
                  {' / '}
                  {run.shuffleQuestions ? 'shuffled' : 'fixed order'}
                </p>
                <p className="history-copy">{dateFormatter.format(new Date(run.completedAt))}</p>
              </article>
            ))}
          </div>

          <button className="ghost-button history-clear-button" onClick={onClear} type="button">
            Clear recent runs
          </button>
        </>
      )}
    </article>
  );
}
