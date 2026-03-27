import { useEffect, useState } from 'react';

const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

export default function RecentRunsPanel({ onClear, runs }) {
  const availableFilters = [
    { label: 'All runs', value: 'all-runs' },
    ...(runs.some((run) => run.category === 'all')
      ? [{ label: 'Mixed only', value: 'mixed-runs' }]
      : []),
    ...[...new Set(runs
      .filter((run) => run.category !== 'all')
      .map((run) => run.category))]
      .sort()
      .map((category) => ({
        label: category,
        value: `category:${category}`
      }))
  ];
  const [historyFilter, setHistoryFilter] = useState('all-runs');

  useEffect(() => {
    if (!availableFilters.some((item) => item.value === historyFilter)) {
      setHistoryFilter('all-runs');
    }
  }, [availableFilters, historyFilter]);

  const filteredRuns = runs.filter((run) => {
    if (historyFilter === 'all-runs') {
      return true;
    }

    if (historyFilter === 'mixed-runs') {
      return run.category === 'all';
    }

    return run.category === historyFilter.replace('category:', '');
  });

  const averageAccuracy = filteredRuns.length > 0
    ? Math.round(filteredRuns.reduce((sum, run) => sum + run.percentage, 0) / filteredRuns.length)
    : 0;

  const bestRun = filteredRuns.reduce((best, run) => {
    if (!best || run.percentage > best.percentage) {
      return run;
    }

    return best;
  }, null);

  const categoryTotals = filteredRuns
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

  const categoryLeaderboard = [...categoryTotals.entries()]
    .map(([category, totals]) => ({
      accuracy: totals.totalQuestions === 0
        ? 0
        : Math.round((totals.correctAnswers / totals.totalQuestions) * 100),
      category,
      correctAnswers: totals.correctAnswers,
      totalQuestions: totals.totalQuestions
    }))
    .sort((left, right) => {
      if (right.accuracy !== left.accuracy) {
        return right.accuracy - left.accuracy;
      }

      return right.totalQuestions - left.totalQuestions;
    });

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
          <div className="history-filter-row">
            {availableFilters.map((item) => (
              <button
                className={`category-pill${historyFilter === item.value ? ' category-pill-active' : ''}`}
                key={item.value}
                onClick={() => setHistoryFilter(item.value)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          {filteredRuns.length === 0 && (
            <p className="helper-copy">
              No stored quiz sessions match the current history filter.
            </p>
          )}

          {filteredRuns.length > 0 && (
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

          {categoryLeaderboard.length > 0 && (
            <div className="history-breakdown-card">
              <div className="card-header">
                <p className="eyebrow">Category form</p>
                <h2>How the recent training history breaks down.</h2>
              </div>

              <div className="history-breakdown-list">
                {categoryLeaderboard.map((item) => (
                  <article className="history-breakdown-row" key={item.category}>
                    <div className="history-breakdown-copy">
                      <p className="highlight-value">{item.category}</p>
                      <p className="history-copy">
                        {item.correctAnswers}/{item.totalQuestions} correct
                      </p>
                    </div>

                    <div className="history-breakdown-metric">
                      <div className="mini-progress" aria-hidden="true">
                        <span
                          className="mini-progress-fill"
                          style={{ width: `${item.accuracy}%` }}
                        />
                      </div>
                      <span className="review-status review-status-correct">{item.accuracy}%</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          <div className="history-list">
            {filteredRuns.map((run) => (
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
            </>
          )}

          <button className="ghost-button history-clear-button" onClick={onClear} type="button">
            Clear recent runs
          </button>
        </>
      )}
    </article>
  );
}
