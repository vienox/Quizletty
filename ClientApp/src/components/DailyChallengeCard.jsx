import { getCategoryTheme } from '../lib/categoryThemes.js';

export default function DailyChallengeCard({
  challenge,
  isLoading,
  onStartChallenge
}) {
  if (!challenge) {
    return (
      <article className="steps-card daily-challenge-card">
        <div className="card-header">
          <p className="eyebrow">Daily challenge</p>
          <h2>Today's run is getting ready.</h2>
        </div>

        <p className="helper-copy">
          Load the quiz setup and the app will build a fresh challenge for today.
        </p>
      </article>
    );
  }

  const challengeTheme = getCategoryTheme(challenge.category);

  return (
    <article className="steps-card daily-challenge-card">
      <div
        className="daily-challenge-artwork"
        style={{ backgroundImage: `url("${challengeTheme.artwork}")` }}
      />

      <div className="card-header">
        <p className="eyebrow">Daily challenge</p>
        <h2>{challenge.label}</h2>
      </div>

      <p className="history-copy">{challenge.dateLabel}</p>
      <p className="helper-copy">{challenge.summary}</p>

      <div className="daily-challenge-meta">
        <span className="review-status review-status-correct">
          {challenge.category === 'all' ? 'Mixed run' : challenge.category}
        </span>
        <span className="review-status review-status-correct">
          {challenge.questionLimit} question{challenge.questionLimit === 1 ? '' : 's'}
        </span>
        <span className="review-status review-status-correct">
          {challenge.shuffleQuestions ? 'Shuffled' : 'Fixed order'}
        </span>
      </div>

      <button
        className="primary-button"
        disabled={isLoading}
        onClick={() => onStartChallenge(challenge)}
        type="button"
      >
        {isLoading ? 'Loading challenge...' : "Start today's challenge"}
      </button>
    </article>
  );
}
