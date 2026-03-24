import { useEffect, useState } from 'react';
import { getCategories, getStats } from './api/quizApi.js';

export default function App() {
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [questionLimit, setQuestionLimit] = useState(5);
  const [metaError, setMetaError] = useState('');
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  const steps = [
    'Pick a category or keep the full mix.',
    'Start the session and answer one card at a time.',
    'Review the score, category split and every correction.'
  ];

  useEffect(() => {
    let isActive = true;

    async function loadMeta() {
      try {
        const [categoryItems, statsResponse] = await Promise.all([
          getCategories(),
          getStats()
        ]);

        if (!isActive) {
          return;
        }

        setCategories(categoryItems);
        setStats(statsResponse);
        setQuestionLimit(Math.min(statsResponse.totalQuestions || 5, 5));
      } catch (error) {
        if (!isActive) {
          return;
        }

        setMetaError('Could not load quiz metadata from the API.');
      } finally {
        if (isActive) {
          setIsLoadingMeta(false);
        }
      }
    }

    loadMeta();

    return () => {
      isActive = false;
    };
  }, []);

  const highlights = [
    {
      label: 'Question bank',
      value: isLoadingMeta ? 'Loading...' : `${stats?.totalQuestions ?? 0} live prompts`
    },
    {
      label: 'Categories',
      value: isLoadingMeta ? 'Loading...' : `${stats?.totalCategories ?? 0} focus tracks`
    },
    {
      label: 'Mode',
      value: metaError ? 'Offline' : 'Instant answer review'
    }
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
            A dedicated quiz page now reads live metadata from the ASP.NET API.
            Next up: loading questions, answering them and scoring the session
            end to end.
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
              <h2>Pick the shape of your run.</h2>
            </div>

            <p className="status-chip">
              {isLoadingMeta ? 'Loading metadata...' : metaError || 'Metadata ready'}
            </p>

            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                disabled={isLoadingMeta || metaError}
              >
                <option value="all">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="limit">Questions</label>
              <input
                id="limit"
                type="number"
                min="1"
                max={stats?.totalQuestions ?? 5}
                value={questionLimit}
                onChange={(event) => setQuestionLimit(Number(event.target.value))}
                disabled={isLoadingMeta || !!metaError}
              />
            </div>

            <button className="primary-button" type="button" disabled>
              Question loading comes in the next commit
            </button>

            <p className="helper-copy">
              Current choice: {selectedCategory === 'all' ? 'all categories' : selectedCategory}
              {' / '}
              {questionLimit} question{questionLimit === 1 ? '' : 's'}.
            </p>
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
