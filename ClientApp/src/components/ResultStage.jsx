import { useState } from 'react';

export default function ResultStage({
  followUpPreset,
  isStartingFollowUp,
  onRestart,
  onStartRetryMissed,
  onStartFollowUp,
  result
}) {
  const [reviewFilter, setReviewFilter] = useState('all');
  const [copyState, setCopyState] = useState('idle');
  const isMistakeBankRun = result.sessionSettings?.runType === 'mistake-bank';
  const missedItems = result.review.filter((item) => !item.isCorrect);
  const recoveredItems = result.review.filter((item) => item.isCorrect);
  const metrics = [
    { label: 'Correct', value: result.correctAnswers },
    { label: 'Incorrect', value: result.incorrectAnswers },
    { label: 'Accuracy', value: `${result.percentage}%` }
  ];
  const reviewCounts = {
    all: result.review.length,
    correct: result.review.filter((item) => item.isCorrect).length,
    missed: result.review.filter((item) => !item.isCorrect).length
  };
  const visibleReview = result.review.filter((item) => {
    if (reviewFilter === 'correct') {
      return item.isCorrect;
    }

    if (reviewFilter === 'missed') {
      return !item.isCorrect;
    }

    return true;
  });

  async function copySummary() {
    const lines = [
      `Quizletty result: ${result.score} (${result.percentage}%)`,
      `Correct: ${result.correctAnswers}`,
      `Incorrect: ${result.incorrectAnswers}`,
      'Category split:',
      ...result.categories.map((category) => (
        `- ${category.category}: ${category.correctAnswers}/${category.totalQuestions}`
      ))
    ];

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
  }

  const heroCopy = isMistakeBankRun
    ? missedItems.length === 0
      ? 'Everything in this retry pass was recovered. The bank marked those questions as mastered for cleanup on the setup screen.'
      : 'Recovered questions were marked as mastered. Anything missed again stays queued for the next corrective pass.'
    : 'The run is scored and ready for a full review, a clearer category read and a smart follow-up.';
  const retryTitle = isMistakeBankRun ? 'Retry the remaining misses' : 'Retry only the missed answers';
  const retrySummary = isMistakeBankRun
    ? `Launch another short pass with the ${missedItems.length} question${missedItems.length === 1 ? '' : 's'} that are still not stable.`
    : `Start a focused correction pass with the ${missedItems.length} answer${missedItems.length === 1 ? '' : 's'} missed in this run.`;

  return (
    <section className="result-stage">
      <article className="result-hero">
        <p className="eyebrow">Session complete</p>
        <h2>{result.score} on the board.</h2>
        <p className="helper-copy">{heroCopy}</p>
      </article>

      <section className="result-metrics">
        {metrics.map((metric) => (
          <article className="highlight-card" key={metric.label}>
            <p className="highlight-label">{metric.label}</p>
            <p className="highlight-value">{metric.value}</p>
          </article>
        ))}
      </section>

      {isMistakeBankRun && (
        <article className="detail-card result-follow-up-card">
          <div className="card-header">
            <p className="eyebrow">Mistake bank sync</p>
            <h2>See what changed in the retry queue.</h2>
          </div>

          <p className="helper-copy">
            Correct answers from this retry run are marked as mastered, while repeated misses stay in the active queue.
          </p>

          <div className="result-follow-up-meta">
            <span className="review-status review-status-correct">
              {recoveredItems.length} mastered
            </span>
            <span className="review-status review-status-correct">
              {missedItems.length} still queued
            </span>
            <span className="review-status review-status-correct">Setup screen cleanup</span>
          </div>
        </article>
      )}

      {missedItems.length > 0 && (
        <article className="detail-card result-follow-up-card">
          <div className="card-header">
            <p className="eyebrow">Correction pass</p>
            <h2>{retryTitle}</h2>
          </div>

          <p className="helper-copy">{retrySummary}</p>

          <div className="result-follow-up-meta">
            <span className="review-status review-status-wrong">
              {missedItems.length} missed
            </span>
            <span className="review-status review-status-correct">Fixed order</span>
            <span className="review-status review-status-correct">Focused retry</span>
          </div>

          <button
            className="secondary-button result-button"
            disabled={isStartingFollowUp}
            onClick={onStartRetryMissed}
            type="button"
          >
            {isStartingFollowUp
              ? 'Loading correction pass...'
              : isMistakeBankRun
                ? 'Retry remaining misses'
                : 'Retry missed answers'}
          </button>
        </article>
      )}

      {followUpPreset && (
        <article className="detail-card result-follow-up-card">
          <div className="card-header">
            <p className="eyebrow">Next move</p>
            <h2>{followUpPreset.label}</h2>
          </div>

          <p className="helper-copy">{followUpPreset.summary}</p>

          <div className="result-follow-up-meta">
            <span className="review-status review-status-correct">
              {followUpPreset.category === 'all' ? 'Mixed run' : followUpPreset.category}
            </span>
            <span className="review-status review-status-correct">
              {followUpPreset.questionLimit} question{followUpPreset.questionLimit === 1 ? '' : 's'}
            </span>
            <span className="review-status review-status-correct">
              {followUpPreset.shuffleQuestions ? 'Shuffled' : 'Fixed order'}
            </span>
          </div>

          <button
            className="secondary-button result-button"
            disabled={isStartingFollowUp}
            onClick={onStartFollowUp}
            type="button"
          >
            {isStartingFollowUp ? 'Loading follow-up run...' : 'Start recommended follow-up'}
          </button>
        </article>
      )}

      <section className="result-detail-grid">
        <article className="detail-card">
          <div className="card-header">
            <p className="eyebrow">Category split</p>
            <h2>See where the score came from.</h2>
          </div>

          <div className="category-results">
            {result.categories.map((category) => (
              <article className="category-result-card" key={category.category}>
                <p className="highlight-label">{category.category}</p>
                <p className="highlight-value">
                  {category.correctAnswers}/{category.totalQuestions}
                </p>
              </article>
            ))}
          </div>
        </article>

        <article className="detail-card">
          <div className="card-header">
            <p className="eyebrow">Answer review</p>
            <h2>Every choice, checked against the key.</h2>
          </div>

          <div className="filter-pills">
            {[
              ['all', 'All'],
              ['correct', 'Correct'],
              ['missed', 'Missed']
            ].map(([value, label]) => (
              <button
                className={`category-pill${reviewFilter === value ? ' category-pill-active' : ''}`}
                key={value}
                onClick={() => setReviewFilter(value)}
                type="button"
              >
                {label} ({reviewCounts[value]})
              </button>
            ))}
          </div>

          <div className="review-list">
            {visibleReview.map((item) => (
              <article className="review-item" key={item.questionId}>
                <div className="review-topline">
                  <p className="highlight-label">{item.category}</p>
                  <span className={`review-status${item.isCorrect ? ' review-status-correct' : ' review-status-wrong'}`}>
                    {item.isCorrect ? 'Correct' : 'Missed'}
                  </span>
                </div>

                <h3>{item.questionContent}</h3>
                <p className="review-copy">
                  Your answer: <strong>{item.selectedAnswerContent}</strong>
                </p>
                <p className="review-copy">
                  Correct answer: <strong>{item.correctAnswerContent}</strong>
                </p>
              </article>
            ))}
          </div>

          {visibleReview.length === 0 && (
            <p className="helper-copy">No answers match the active review filter.</p>
          )}
        </article>
      </section>

      <div className="result-actions">
        <button className="primary-button result-button" onClick={onRestart} type="button">
          Start another run
        </button>

        <button className="ghost-button result-button" onClick={copySummary} type="button">
          {copyState === 'copied'
            ? 'Summary copied'
            : copyState === 'failed'
              ? 'Copy failed'
              : 'Copy score summary'}
        </button>
      </div>
    </section>
  );
}
