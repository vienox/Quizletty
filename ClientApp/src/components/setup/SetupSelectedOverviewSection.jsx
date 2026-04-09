export default function SetupSelectedOverviewSection({
  applyQuickStartPreset,
  isCurrentSetupFavorite,
  onSaveCurrentSetup,
  recommendedMode,
  selectedCategory,
  selectedCategoryTheme,
  selectedQuizActions,
  selectedQuizGuidance,
  selectedQuizMetrics
}) {
  return (
    <article className="category-focus-card">
      <div
        className="category-focus-artwork"
        style={{ backgroundImage: `url("${selectedCategoryTheme.artwork}")` }}
      />

      <div className="category-focus-copy">
        <p className="eyebrow">{selectedCategoryTheme.eyebrow}</p>
        <h2>{selectedCategory === 'all' ? 'Mixed quiz selection' : selectedCategory}</h2>
        <p className="helper-copy">{selectedCategoryTheme.summary}</p>

        <div className="category-focus-metrics">
          {selectedQuizMetrics.map((item) => (
            <article className="category-focus-metric" key={item.label}>
              <p className="highlight-label">{item.label}</p>
              <p className="highlight-value">{item.value}</p>
              <p className="history-copy">{item.detail}</p>
            </article>
          ))}
        </div>

        <div className="category-focus-guidance">
          <p className="highlight-label">Best for</p>
          <p className="history-copy">{selectedQuizGuidance}</p>
          <p className="highlight-label">Recommended setup</p>
          <p className="history-copy">{recommendedMode.detail}</p>
        </div>

        <div className="category-focus-action-grid">
          {selectedQuizActions.map((preset) => (
            <button
              className="category-focus-action"
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

        <button className="ghost-button" onClick={onSaveCurrentSetup} type="button">
          {isCurrentSetupFavorite ? 'Remove from favorites' : 'Save current setup'}
        </button>
      </div>
    </article>
  );
}
