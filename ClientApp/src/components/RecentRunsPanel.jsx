const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

export default function RecentRunsPanel({ onClear, runs }) {
  const averageAccuracy = runs.length > 0
    ? Math.round(runs.reduce((sum, run) => sum + run.percentage, 0) / runs.length)
    : 0;

  const bestRun = runs.reduce((best, run) => {
    if (!best || run.percentage > best.percentage) {
      return run;
    }

    return best;
  }, null);

  const categoryTotals = runs
    .flatMap((run) => run.categories ?? [])
    .reduce((totals, category) => {
      const current = totals.get(category.category) ?? {
        correctAnswers: 0,
        totalQuestions: 0
      };

      current.correctAnswers += category.correctAnswers;
      current.totalQuestions += category.totalQuestions;
      totals.set(category.category, current);
      return totals;
    }, new Map());

  const strongestCategory = [...categoryTotals.entries()]
    .map(([category, totals]) => ({
      accuracy: totals.totalQuestions === 0
        ? 0
        : Math.round((totals.correctAnswers / totals.totalQuestions) * 100),
      category
    }))
    .sort((left, right) => right.accuracy - left.accuracy)[0] ?? null;

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
          <div className="history-summary-grid">
            <article className="history-summary-card">
              <p className="highlight-label">Average accuracy</p>
              <p className="highlight-value">{averageAccuracy}%</p>
            </article>

            <article className="history-summary-card">
              <p className="highlight-label">Best run</p>
              <p className="highlight-value">{bestRun?.score ?? '0/0'}</p>
              <p className="history-copy">{bestRun?.percentage ?? 0}% accuracy</p>
            </article>

            <article className="history-summary-card">
              <p className="highlight-label">Strongest category</p>
              <p className="highlight-value">
                {strongestCategory?.category ?? 'No data'}
              </p>
              <p className="history-copy">
                {strongestCategory ? `${strongestCategory.accuracy}% accuracy` : 'Finish more runs'}
              </p>
            </article>
          </div>

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
