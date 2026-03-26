const storageKey = 'quizletty.quiz-preferences';

const defaultPreferences = {
  questionLimit: 5,
  selectedCategory: 'all',
  shuffleQuestions: true
};

export function loadQuizPreferences() {
  try {
    const storedValue = window.localStorage.getItem(storageKey);

    if (!storedValue) {
      return defaultPreferences;
    }

    const parsedValue = JSON.parse(storedValue);
    return {
      questionLimit: Number(parsedValue.questionLimit) || defaultPreferences.questionLimit,
      selectedCategory: parsedValue.selectedCategory || defaultPreferences.selectedCategory,
      shuffleQuestions: typeof parsedValue.shuffleQuestions === 'boolean'
        ? parsedValue.shuffleQuestions
        : defaultPreferences.shuffleQuestions
    };
  } catch {
    return defaultPreferences;
  }
}

export function saveQuizPreferences(preferences) {
  window.localStorage.setItem(storageKey, JSON.stringify(preferences));
}
