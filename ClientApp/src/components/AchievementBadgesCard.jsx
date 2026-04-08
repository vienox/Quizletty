export default function AchievementBadgesCard({ badges }) {
  const unlockedCount = badges.filter((badge) => badge.unlocked).length;

  return (
    <article className="steps-card achievement-card">
      <div className="card-header">
        <p className="eyebrow">Achievements</p>
        <h2>Milestones from your recent training.</h2>
      </div>

      <p className="helper-copy">
        {unlockedCount} of {badges.length} badge{badges.length === 1 ? '' : 's'} unlocked.
      </p>

      <div className="achievement-grid">
        {badges.map((badge) => (
          <article
            className={`achievement-item${badge.unlocked ? ' achievement-item-unlocked' : ''}`}
            key={badge.key}
          >
            <div className="achievement-topline">
              <p className="highlight-label">{badge.label}</p>
              <span className={`review-status${badge.unlocked ? ' review-status-correct' : ''}`}>
                {badge.unlocked ? 'Unlocked' : 'Locked'}
              </span>
            </div>

            <p className="history-copy">{badge.detail}</p>
            <p className="history-copy">
              <strong>{badge.progress}</strong>
            </p>
          </article>
        ))}
      </div>
    </article>
  );
}
