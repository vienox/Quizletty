export default function SetupCategoryChooserSection({
  applyQuickStartPreset,
  categoryCards,
  challengePresets,
  onSelectCategory,
  quickStartPresets,
  selectedCategory,
  stats
}) {
  return (
    <>
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
