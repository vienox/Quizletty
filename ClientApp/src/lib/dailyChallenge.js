const weekdayModes = [
  { label: 'Sunday reset', questionLimit: 6, shuffleQuestions: false },
  { label: 'Monday starter', questionLimit: 5, shuffleQuestions: true },
  { label: 'Tuesday build', questionLimit: 6, shuffleQuestions: false },
  { label: 'Wednesday push', questionLimit: 7, shuffleQuestions: true },
  { label: 'Thursday lock-in', questionLimit: 8, shuffleQuestions: false },
  { label: 'Friday sprint', questionLimit: 6, shuffleQuestions: true },
  { label: 'Saturday long run', questionLimit: 9, shuffleQuestions: false }
];

const dateFormatter = new Intl.DateTimeFormat('en', {
  weekday: 'long',
  month: 'short',
  day: 'numeric'
});

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.floor(diff / millisecondsPerDay);
}

export function getDailyChallenge({ categoryItems, referenceDate = new Date(), totalQuestions }) {
  const availableCategories = categoryItems
    .filter((item) => item.questionCount > 0)
    .map((item) => item.category)
    .sort();

  const weekdayMode = weekdayModes[referenceDate.getDay()];
  const dayOfYear = getDayOfYear(referenceDate);
  const useMixedRun = availableCategories.length === 0 || dayOfYear % 5 === 0;
  const selectedCategory = useMixedRun
    ? 'all'
    : availableCategories[dayOfYear % availableCategories.length];
  const availableQuestions = selectedCategory === 'all'
    ? totalQuestions
    : categoryItems.find((item) => item.category === selectedCategory)?.questionCount ?? 1;
  const questionLimit = Math.min(weekdayMode.questionLimit, Math.max(availableQuestions, 1));

  return {
    category: selectedCategory,
    dateLabel: dateFormatter.format(referenceDate),
    label: weekdayMode.label,
    questionLimit,
    shuffleQuestions: weekdayMode.shuffleQuestions,
    summary: selectedCategory === 'all'
      ? 'A mixed challenge built to check range across the full bank.'
      : `A daily spotlight run inside ${selectedCategory} for a tighter repetition loop.`
  };
}
