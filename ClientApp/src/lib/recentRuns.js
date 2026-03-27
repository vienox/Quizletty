const storageKey = 'quizletty.recent-runs';
const maxRuns = 6;

function normalizeRecentRun(run) {
  return {
    categories: Array.isArray(run.categories) ? run.categories : [],
    category: run.category ?? 'all',
    completedAt: run.completedAt ?? new Date().toISOString(),
    correctAnswers: Number(run.correctAnswers) || 0,
    id: run.id ?? `${Date.now()}`,
    incorrectAnswers: Number(run.incorrectAnswers) || 0,
    percentage: Number(run.percentage) || 0,
    questionCount: Number(run.questionCount) || 0,
    score: run.score ?? '0/0',
    shuffleQuestions: Boolean(run.shuffleQuestions)
  };
}

export function loadRecentRuns() {
  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue.map(normalizeRecentRun) : [];
  } catch {
    return [];
  }
}

export function saveRecentRun(run) {
  const nextRuns = [normalizeRecentRun(run), ...loadRecentRuns()].slice(0, maxRuns);
  window.localStorage.setItem(storageKey, JSON.stringify(nextRuns));
  return nextRuns;
}

export function clearRecentRuns() {
  window.localStorage.removeItem(storageKey);
}
