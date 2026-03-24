export default function ResultStage({ onRestart, result }) {
  const metrics = [
    { label: 'Correct', value: result.correctAnswers },
    { label: 'Incorrect', value: result.incorrectAnswers },
    { label: 'Accuracy', value: `${result.percentage}%` }
  ];

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

      <button className="primary-button result-button" onClick={onRestart} type="button">
        Start another run
      </button>
    </section>
  );
}
