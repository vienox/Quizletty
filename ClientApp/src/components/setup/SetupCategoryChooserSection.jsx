export default function SetupCategoryChooserSection({
  applyQuickStartPreset,
  categoryCards,
  challengePresets,
  isLaunchingRun,
  mistakeBankCount,
  mistakeBankResolvedCount,
  onClearMistakeBank,
  onRemoveResolvedMistakes,
  onStartMistakeBank,
  onSelectCategory,
  quickStartPresets,
  selectedCategory,
  stats
}) {
  return (
    <>
      <article className="history-recommendation-card">
        <div className="card-header">
          <p className="eyebrow">Mistake bank</p>
          <h2>Retry the questions that already tripped you up.</h2>
        </div>

        <p className="history-copy">
          {mistakeBankCount === 0
            ? mistakeBankResolvedCount > 0
              ? `The active retry queue is empty. ${mistakeBankResolvedCount} mastered question${mistakeBankResolvedCount === 1 ? '' : 's'} are ready to clear.`
              : 'The retry queue is empty. Finish a run with a few missed answers and they will appear here.'
            : `${mistakeBankCount} question${mistakeBankCount === 1 ? '' : 's'} are queued in mistake priority order for a corrective pass.`}
        </p>

        <div className="history-recommendation-tags">
          <span className="review-status review-status-correct">
            {mistakeBankCount} queued
          </span>
          <span className="review-status review-status-correct">
            {mistakeBankResolvedCount} mastered
          </span>
          <span className="review-status review-status-correct">Fixed order</span>
          <span className="review-status review-status-correct">Manual cleanup</span>
        </div>

        <div className="history-item-actions">
          <button
            className="secondary-button"
            disabled={mistakeBankCount === 0 || isLaunchingRun}
            onClick={onStartMistakeBank}
            type="button"
          >
            {isLaunchingRun
              ? 'Loading mistake bank...'
              : mistakeBankCount === 0
                ? 'Mistake bank empty'
                : 'Start retry mistakes run'}
          </button>

          <button
            className="ghost-button"
            disabled={mistakeBankResolvedCount === 0}
            onClick={onRemoveResolvedMistakes}
            type="button"
          >
            {mistakeBankResolvedCount === 0 ? 'No mastered entries' : 'Remove mastered'}
          </button>

          <button
            className="ghost-button"
            disabled={mistakeBankCount + mistakeBankResolvedCount === 0}
            onClick={onClearMistakeBank}
            type="button"
          >
            Clear bank
          </button>
        </div>
      </article>

      <div className="quick-start-grid">
        {quickStartPresets.map((preset) => (
          <button
            className="quick-start-card"
            key={`${preset.label}-${preset.category}-${preset.questionLimit}`}
            onClick={() => applyQuickStartPreset(preset)}
            type="button"
          >
            <p className="highlight-label">{preset.label}</p>
            <p className="highlight-value">
              {preset.questionLimit} question{preset.questionLimit === 1 ? '' : 's'}
            </p>
            <p className="history-copy">{preset.summary}</p>
          </button>
        ))}
      </div>

      <div className="challenge-run-grid">
        {challengePresets.map((preset) => (
          <button
            className="challenge-run-card"
            key={`${preset.label}-${preset.category}-${preset.questionLimit}`}
            onClick={() => applyQuickStartPreset(preset)}
            type="button"
          >
            <p className="eyebrow">Challenge run</p>
            <h2>{preset.label}</h2>
            <p className="history-copy">{preset.summary}</p>
            <p className="history-copy">
              {preset.questionLimit} question{preset.questionLimit === 1 ? '' : 's'}
              {' / '}
              {preset.shuffleQuestions ? 'shuffled' : 'fixed order'}
            </p>
          </button>
        ))}
      </div>

      <div className="category-pills">
        <button
          className={`category-pill${selectedCategory === 'all' ? ' category-pill-active' : ''}`}
          onClick={() => onSelectCategory('all')}
          type="button"
        >
          All
        </button>

        {stats?.categories?.map((item) => (
          <button
            className={`category-pill${selectedCategory === item.category ? ' category-pill-active' : ''}`}
            key={item.category}
            onClick={() => onSelectCategory(item.category)}
            type="button"
          >
            {item.category}
          </button>
        ))}
      </div>

      <div className="category-card-grid">
        {categoryCards.map((item) => (
          <button
            className={`category-card-choice${selectedCategory === item.category ? ' category-card-choice-active' : ''}`}
            key={item.category}
            onClick={() => onSelectCategory(item.category)}
            type="button"
          >
            <div
              className="category-card-artwork"
              style={{ backgroundImage: `url("${item.artwork}")` }}
            />

            <div className="category-card-copy">
              <p className="eyebrow">{item.eyebrow}</p>
              <h2>{item.label}</h2>
              <p className="history-copy">{item.summary}</p>
              <p className="history-copy">
                {item.questionCount} question{item.questionCount === 1 ? '' : 's'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
