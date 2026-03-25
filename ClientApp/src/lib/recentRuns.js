const storageKey = 'quizletty.recent-runs';
const maxRuns = 6;

export function loadRecentRuns() {
  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

export function saveRecentRun(run) {
  const nextRuns = [run, ...loadRecentRuns()].slice(0, maxRuns);
  window.localStorage.setItem(storageKey, JSON.stringify(nextRuns));
  return nextRuns;
}
