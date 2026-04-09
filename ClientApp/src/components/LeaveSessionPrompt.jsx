export default function LeaveSessionPrompt({
  pendingNavigationPhase,
  onCancel,
  onConfirm
}) {
  return (
    <section className="overlay-shell" role="dialog" aria-modal="true" aria-labelledby="exit-quiz-title">
      <article className="overlay-card">
        <p className="eyebrow">Leave quiz</p>
        <h2 id="exit-quiz-title">
          {pendingNavigationPhase === 'home' ? 'Go back to the home page?' : 'Go back to setup?'}
        </h2>
        <p className="helper-copy">
          Your current progress stays saved as a draft, so you can come back later from the builder.
        </p>

        <div className="result-actions">
          <button className="ghost-button result-button" onClick={onCancel} type="button">
            Keep solving
          </button>

          <button className="primary-button result-button" onClick={onConfirm} type="button">
            {pendingNavigationPhase === 'home' ? 'Leave to home' : 'Leave to setup'}
          </button>
        </div>
      </article>
    </section>
  );
}
