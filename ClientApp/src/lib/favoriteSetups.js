const storageKey = 'quizletty.favorite-setups';
const maxFavoriteSetups = 8;

function createSetupKey(setup) {
  return [
    setup.category ?? 'all',
    Number(setup.questionLimit) || 1,
    Boolean(setup.shuffleQuestions) ? 'shuffle' : 'fixed'
  ].join('|');
}

function createDefaultLabel(setup) {
  if (setup.category === 'all') {
    return 'Mixed setup';
  }

  return `${setup.category} setup`;
}

function createDefaultSummary(setup) {
  return `${setup.questionLimit} question${setup.questionLimit === 1 ? '' : 's'} / ${setup.shuffleQuestions ? 'shuffled' : 'fixed order'}`;
}

function normalizeFavoriteSetup(setup) {
  const normalizedSetup = {
    category: setup.category ?? 'all',
    label: setup.label?.trim() || createDefaultLabel(setup),
    questionLimit: Math.max(Number(setup.questionLimit) || 1, 1),
    savedAt: setup.savedAt ?? new Date().toISOString(),
    shuffleQuestions: Boolean(setup.shuffleQuestions),
    summary: setup.summary?.trim() || createDefaultSummary(setup)
  };

  return {
    ...normalizedSetup,
    key: createSetupKey(normalizedSetup)
  };
}

export function getFavoriteSetupKey(setup) {
  return createSetupKey({
    category: setup.category ?? 'all',
    questionLimit: Math.max(Number(setup.questionLimit) || 1, 1),
    shuffleQuestions: Boolean(setup.shuffleQuestions)
  });
}

export function loadFavoriteSetups() {
  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);
    return Array.isArray(parsedValue) ? parsedValue.map(normalizeFavoriteSetup) : [];
  } catch {
    return [];
  }
}

export function saveFavoriteSetup(setup) {
  const normalizedSetup = normalizeFavoriteSetup(setup);
  const nextSetups = [
    normalizedSetup,
    ...loadFavoriteSetups().filter((item) => item.key !== normalizedSetup.key)
  ].slice(0, maxFavoriteSetups);

  window.localStorage.setItem(storageKey, JSON.stringify(nextSetups));
  return nextSetups;
}

export function removeFavoriteSetup(setup) {
  const favoriteKey = typeof setup === 'string' ? setup : getFavoriteSetupKey(setup);
  const nextSetups = loadFavoriteSetups().filter((item) => item.key !== favoriteKey);

  window.localStorage.setItem(storageKey, JSON.stringify(nextSetups));
  return nextSetups;
}

export function hasFavoriteSetup(setups, candidateSetup) {
  const favoriteKey = getFavoriteSetupKey(candidateSetup);
  return setups.some((item) => item.key === favoriteKey);
}
