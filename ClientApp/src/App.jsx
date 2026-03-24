export default function App() {
  const highlights = [
    { label: 'Question bank', value: '5 seeded prompts' },
    { label: 'Difficulty', value: 'Instant answer review' },
    { label: 'Mode', value: 'One focused run' }
  ];

  const steps = [
    'Pick a category or keep the full mix.',
    'Start the session and answer one card at a time.',
    'Review the score, category split and every correction.'
  ];

  return (
    <main className="app-shell">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <section className="page-frame">
        <header className="masthead">
          <div>
            <p className="eyebrow">Quizletty / React Client</p>
            <h1>Run the quiz in one calm, focused flow.</h1>
          </div>

          <p className="masthead-copy">
            A dedicated quiz page is landing here. The next commits will wire
            this interface to the ASP.NET API and make the whole run playable.
          </p>
        </header>

        <section className="highlight-grid">
          {highlights.map((item) => (
            <article className="highlight-card" key={item.label}>
              <p className="highlight-label">{item.label}</p>
              <p className="highlight-value">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="workspace-grid">
          <article className="setup-card">
            <div className="card-header">
              <p className="eyebrow">Session setup</p>
              <h2>Quiz controls are being prepared.</h2>
            </div>

            <div className="field">
              <label htmlFor="category">Category</label>
              <select id="category" defaultValue="all" disabled>
                <option value="all">All categories</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="limit">Questions</label>
              <input id="limit" type="number" value="5" disabled readOnly />
            </div>

            <button className="primary-button" type="button" disabled>
              Quiz flow coming next
            </button>
          </article>

          <article className="steps-card">
            <div className="card-header">
              <p className="eyebrow">Roadmap</p>
              <h2>The full user path is already mapped.</h2>
            </div>

            <ol className="steps-list">
              {steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </article>
        </section>
      </section>
    </main>
  );
}
