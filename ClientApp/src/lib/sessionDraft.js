const storageKey = 'quizletty.session-draft';

export function loadSessionDraft() {
  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return null;
    }

    const parsedValue = JSON.parse(storedValue);

    if (!Array.isArray(parsedValue.questions) || typeof parsedValue.activeQuestionIndex !== 'number') {
      return null;
    }

    return {
      activeQuestionIndex: parsedValue.activeQuestionIndex,
      answers: parsedValue.answers ?? {},
      flaggedQuestions: parsedValue.flaggedQuestions ?? {},
      questions: parsedValue.questions,
      savedAt: parsedValue.savedAt ?? null,
      startedAt: parsedValue.startedAt ?? null,
      settings: parsedValue.settings ?? null
    };
  } catch {
    return null;
  }
}

export function saveSessionDraft(draft) {
  window.localStorage.setItem(storageKey, JSON.stringify(draft));
}

export function clearSessionDraft() {
  window.localStorage.removeItem(storageKey);
}
