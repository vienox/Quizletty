export default function FavoriteSetupsCard({
  favoriteSetups,
  isLaunchingRun,
  onRemoveFavorite,
  onStartFavorite
}) {
  return (
    <article className="steps-card favorite-setups-card">
      <div className="card-header">
        <p className="eyebrow">Favorite setups</p>
        <h2>Your pinned quiz shortcuts.</h2>
      </div>

      {favoriteSetups.length === 0 && (
        <p className="helper-copy">
          Save a setup from the main quiz builder or a featured pack and it will stay here for quick access.
        </p>
      )}

      {favoriteSetups.length > 0 && (
        <div className="favorite-setup-list">
          {favoriteSetups.map((setup) => (
            <article className="favorite-setup-item" key={setup.key}>
              <p className="highlight-label">{setup.label}</p>
              <p className="highlight-value">
                {setup.category === 'all' ? 'Mixed run' : setup.category}
              </p>
              <p className="history-copy">{setup.summary}</p>

              <div className="favorite-setup-actions">
                <button
                  className="secondary-button"
                  disabled={isLaunchingRun}
                  onClick={() => onStartFavorite(setup)}
                  type="button"
                >
                  {isLaunchingRun ? 'Loading run...' : 'Start favorite'}
                </button>

                <button
                  className="ghost-button"
                  onClick={() => onRemoveFavorite(setup.key)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </article>
  );
}
