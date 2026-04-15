const dateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

export default function ResumeDraftCard({ draft, onDiscard, onResume }) {
  const answeredCount = Object.keys(draft.answers ?? {}).length;
  const flaggedCount = Object.keys(draft.flaggedQuestions ?? {}).length;
  const draftLabel = draft.settings?.runLabel ?? (
    draft.settings?.selectedCategory === 'all'
      ? 'All categories'
      : draft.settings?.selectedCategory ?? 'Mixed run'
  );

  return (
    <article className="steps-card">
      <div className="card-header">
        <p className="eyebrow">Saved draft</p>
        <h2>There is an unfinished quiz ready to resume.</h2>
      </div>

      <p className="helper-copy">
        {draftLabel}
        {' / '}
        {draft.questions.length} question{draft.questions.length === 1 ? '' : 's'}
        {' / '}
        {draft.settings?.shuffleQuestions ? 'shuffled' : 'fixed order'}
      </p>

      <p className="helper-copy">
        {answeredCount} answered, {flaggedCount} flagged, saved{' '}
        {draft.savedAt ? dateFormatter.format(new Date(draft.savedAt)) : 'recently'}.
      </p>

      <p className="helper-copy">
        Resume keeps the previous answers, active question and review flags intact.
      </p>

      <div className="result-actions">
        <button className="primary-button result-button" onClick={onResume} type="button">
          Resume saved quiz
        </button>

        <button className="ghost-button result-button" onClick={onDiscard} type="button">
          Discard draft
        </button>
      </div>
    </article>
  );
}
