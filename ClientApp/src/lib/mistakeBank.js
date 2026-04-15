const storageKey = 'quizletty.mistake-bank';

function isValidIsoDate(value) {
  return typeof value === 'string' && !Number.isNaN(new Date(value).getTime());
}

function normalizeMistakeEntry(entry) {
  const questionId = Number(entry.questionId);

  if (!Number.isInteger(questionId) || questionId <= 0) {
    return null;
  }

  const fallbackTimestamp = new Date().toISOString();

  return {
    category: typeof entry.category === 'string' && entry.category.trim()
      ? entry.category.trim()
      : 'Uncategorized',
    firstWrongAt: isValidIsoDate(entry.firstWrongAt) ? entry.firstWrongAt : fallbackTimestamp,
    lastWrongAt: isValidIsoDate(entry.lastWrongAt) ? entry.lastWrongAt : fallbackTimestamp,
    questionContent: typeof entry.questionContent === 'string' ? entry.questionContent : '',
    questionId,
    wrongCount: Math.max(1, Number(entry.wrongCount) || 1)
  };
}

function sortMistakeEntries(entries) {
  return [...entries].sort((left, right) => {
    if (right.wrongCount !== left.wrongCount) {
      return right.wrongCount - left.wrongCount;
    }

    return new Date(right.lastWrongAt) - new Date(left.lastWrongAt);
  });
}

export function loadMistakeBank() {
  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return sortMistakeEntries(parsedValue.map(normalizeMistakeEntry).filter(Boolean));
  } catch {
    return [];
  }
}

export function saveMistakeBankEntries(reviewItems, completedAt = new Date().toISOString()) {
  const nextEntriesById = new Map(
    loadMistakeBank().map((entry) => [entry.questionId, entry])
  );

  const incorrectItems = Array.isArray(reviewItems)
    ? reviewItems.filter((item) => !item.isCorrect)
    : [];

  incorrectItems.forEach((item) => {
    const currentEntry = nextEntriesById.get(item.questionId);

    if (currentEntry) {
      nextEntriesById.set(item.questionId, {
        ...currentEntry,
        category: item.category ?? currentEntry.category,
        lastWrongAt: completedAt,
        questionContent: item.questionContent ?? currentEntry.questionContent,
        wrongCount: currentEntry.wrongCount + 1
      });
      return;
    }

    const nextEntry = normalizeMistakeEntry({
      category: item.category,
      firstWrongAt: completedAt,
      lastWrongAt: completedAt,
      questionContent: item.questionContent,
      questionId: item.questionId,
      wrongCount: 1
    });

    if (nextEntry) {
      nextEntriesById.set(nextEntry.questionId, nextEntry);
    }
  });

  const nextEntries = sortMistakeEntries([...nextEntriesById.values()]);
  window.localStorage.setItem(storageKey, JSON.stringify(nextEntries));
  return nextEntries;
}

export function clearMistakeBank() {
  window.localStorage.removeItem(storageKey);
}
