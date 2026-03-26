import { useState } from 'react';

export default function ResultStage({ onRestart, result }) {
  const [reviewFilter, setReviewFilter] = useState('all');
  const [copyState, setCopyState] = useState('idle');
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

  return (
    <section className="result-stage">
      <article className="result-hero">
        <p className="eyebrow">Session complete</p>
        <h2>{result.score} on the board.</h2>
        <p className="helper-copy">
          The quiz run is now scored live against the API. Next commit will add
          the detailed answer review and category breakdown.
        </p>
      </article>

      <section className="result-metrics">
        {metrics.map((metric) => (
          <article className="highlight-card" key={metric.label}>
            <p className="highlight-label">{metric.label}</p>
            <p className="highlight-value">{metric.value}</p>
          </article>
        ))}
      </section>

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
