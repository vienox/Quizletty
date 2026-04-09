import { hasFavoriteSetup } from '../../lib/favoriteSetups.js';

export default function SetupFeaturedPacksSection({
  favoriteSetups,
  featuredQuizPacks,
  onApplyPreset,
  onToggleFavoriteSetup
}) {
  return (
    <div className="featured-pack-shell">
      <div className="card-header">
        <p className="eyebrow">Featured quiz packs</p>
        <h2>Start from a ready-made run instead of building one from scratch.</h2>
      </div>

      <div className="featured-pack-grid">
        {featuredQuizPacks.map((pack) => {
          const isPackFavorite = hasFavoriteSetup(favoriteSetups, pack);

          return (
            <article
              className="featured-pack-card"
              key={`${pack.label}-${pack.category}-${pack.questionLimit}`}
            >
              <div
                className="featured-pack-artwork"
                style={{ backgroundImage: `url("${pack.artwork}")` }}
              />

              <div className="featured-pack-copy">
                <p className="eyebrow">{pack.eyebrow}</p>
                <h2>{pack.label}</h2>
                <p className="history-copy">{pack.summary}</p>
                <p className="history-copy">{pack.detail}</p>

                <div className="featured-pack-meta">
                  <span className="review-status review-status-correct">
                    {pack.category === 'all' ? 'Mixed run' : pack.category}
                  </span>
                  <span className="review-status review-status-correct">
                    {pack.questionLimit} question{pack.questionLimit === 1 ? '' : 's'}
                  </span>
                  <span className="review-status review-status-correct">
                    {pack.shuffleQuestions ? 'Shuffled' : 'Fixed order'}
                  </span>
                </div>

                <div className="featured-pack-actions">
                  <button
                    className="secondary-button"
                    onClick={() => onApplyPreset(pack)}
                    type="button"
                  >
                    Use this pack
                  </button>

                  <button
                    className="ghost-button"
                    onClick={() => onToggleFavoriteSetup({
                      ...pack,
                      summary: `${pack.summary} ${pack.questionLimit} question${pack.questionLimit === 1 ? '' : 's'} / ${pack.shuffleQuestions ? 'shuffled' : 'fixed order'}.`
                    })}
                    type="button"
                  >
                    {isPackFavorite ? 'Remove favorite' : 'Save pack'}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
