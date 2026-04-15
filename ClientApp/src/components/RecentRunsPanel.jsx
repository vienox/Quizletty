import { useEffect, useState } from 'react';

const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

export default function RecentRunsPanel({
  isLaunchingRun,
  onClear,
  onReplayRun,
  onStartRecommendedRun,
  runs
}) {
  function isMistakeBankRun(run) {
    return run.runType === 'mistake-bank';
  }

  function isMixedRun(run) {
    return run.category === 'all' && !isMistakeBankRun(run);
  }

  const availableFilters = [
    { label: 'All runs', value: 'all-runs' },
    ...(runs.some((run) => isMistakeBankRun(run))
      ? [{ label: 'Mistake bank', value: 'mistake-bank' }]
      : []),
    ...(runs.some((run) => isMixedRun(run))
      ? [{ label: 'Mixed only', value: 'mixed-runs' }]
      : []),
    ...[...new Set(runs
      .filter((run) => run.category !== 'all' && !isMistakeBankRun(run))
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

    if (historyFilter === 'mistake-bank') {
      return isMistakeBankRun(run);
    }

    if (historyFilter === 'mixed-runs') {
      return isMixedRun(run);
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

  const weakestCategory = [...categoryLeaderboard]
    .sort((left, right) => {
      if (left.accuracy !== right.accuracy) {
        return left.accuracy - right.accuracy;
      }

      return right.totalQuestions - left.totalQuestions;
    })[0] ?? null;

  const trendRuns = [...filteredRuns]
    .slice(0, 6)
    .reverse();

  const trendDelta = trendRuns.length >= 2
    ? trendRuns[trendRuns.length - 1].percentage - trendRuns[0].percentage
    : 0;

  const trendLabel = trendDelta > 0
    ? `Up ${trendDelta}%`
    : trendDelta < 0
      ? `Down ${Math.abs(trendDelta)}%`
      : 'Flat trend';

  const trainingFocus = weakestCategory
    ? weakestCategory.category
    : strongestCategory?.category ?? 'mixed review';

  const recommendationTitle = weakestCategory
    ? `Focus next on ${weakestCategory.category}.`
    : strongestCategory
      ? `Keep reinforcing ${strongestCategory.category}.`
      : 'Build a baseline with a few more quiz runs.';

  const recommendationCopy = weakestCategory
    ? `${weakestCategory.accuracy}% accuracy across ${weakestCategory.totalQuestions} questions suggests this is the best place to improve next.`
    : strongestCategory
      ? `${strongestCategory.accuracy}% accuracy shows a strong area. Use a mixed run to confirm it stays consistent.`
      : 'Once you complete a few more runs, the dashboard will start suggesting a concrete training focus.';

  const recommendationSteps = [
    filteredRuns.some((run) => isMixedRun(run))
      ? 'Run one focused category session next to tighten weak spots faster.'
      : 'Run one mixed session next to test retention outside a single category.',
    trendDelta < 0
      ? 'Your recent momentum is slipping, so aim for a shorter corrective run now.'
      : trendDelta > 0
        ? 'Momentum is positive, so keep the same pace and raise question count slightly.'
        : 'Momentum is flat, so switch either the category or the question count for a stronger signal.'
  ];

  const recommendedRunPreset = weakestCategory
    ? {
        category: weakestCategory.category,
        questionLimit: Math.min(Math.max(weakestCategory.totalQuestions, 4), 8),
        shuffleQuestions: false
      }
    : {
        category: 'all',
        questionLimit: 6,
        shuffleQuestions: true
      };

  return (
    <article className="steps-card">
      <div className="card-header">
        <p className="eyebrow">Recent runs</p>
        <h2>Your latest saved runs.</h2>
      </div>

      {runs.length === 0 && (
        <p className="helper-copy">
          Finish one run and the latest results will start appearing here.
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

          <div className="history-recommendation-card">
            <div className="card-header">
              <p className="eyebrow">Suggested focus</p>
              <h2>{recommendationTitle}</h2>
            </div>

            <p className="history-copy">{recommendationCopy}</p>

            <div className="history-recommendation-tags">
              <span className="review-status review-status-correct">{historyFilter === 'all-runs' ? 'All stored runs' : 'Filtered view'}</span>
              <span className="review-status review-status-correct">Target: {trainingFocus}</span>
              <span className="review-status review-status-correct">{trendLabel}</span>
            </div>

            <div className="history-recommendation-list">
              {recommendationSteps.map((step) => (
                <p className="history-copy" key={step}>
                  {step}
                </p>
              ))}
            </div>

            <div className="history-item-actions">
              <button
                className="secondary-button"
                disabled={isLaunchingRun}
                onClick={() => onStartRecommendedRun(recommendedRunPreset)}
                type="button"
              >
                {isLaunchingRun ? 'Loading run...' : 'Start recommended run'}
              </button>
            </div>
          </div>

          {trendRuns.length > 0 && (
            <div className="history-breakdown-card">
              <div className="card-header">
                <p className="eyebrow">Momentum</p>
                <h2>How your latest filtered runs are moving.</h2>
              </div>

              <div className="trend-topline">
                <p className="highlight-value">{trendLabel}</p>
                <p className="history-copy">
                  Based on the last {trendRuns.length} stored run{trendRuns.length === 1 ? '' : 's'}.
                </p>
              </div>

              <div className="trend-bars">
                {trendRuns.map((run, index) => (
                  <article className="trend-bar-card" key={run.id}>
                    <div className="trend-bar-shell" aria-hidden="true">
                      <span
                        className="trend-bar-fill"
                        style={{ height: `${Math.max(run.percentage, 6)}%` }}
                      />
                    </div>

                    <p className="highlight-label">Run {index + 1}</p>
                    <p className="history-copy">{run.percentage}%</p>
                  </article>
                ))}
              </div>
            </div>
          )}

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
                  {isMistakeBankRun(run)
                    ? run.runLabel
                    : run.category === 'all'
                      ? 'All categories'
                      : run.category}
                  {' / '}
                  {run.questionCount} question{run.questionCount === 1 ? '' : 's'}
                  {' / '}
                  {run.shuffleQuestions ? 'shuffled' : 'fixed order'}
                </p>
                <p className="history-copy">{dateFormatter.format(new Date(run.completedAt))}</p>

                <div className="history-item-actions">
                  <button
                    className="ghost-button"
                    disabled={isLaunchingRun}
                    onClick={() => onReplayRun(run)}
                    type="button"
                  >
                    {isLaunchingRun ? 'Loading run...' : 'Run this setup again'}
                  </button>
                </div>
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
