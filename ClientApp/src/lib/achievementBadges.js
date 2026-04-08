export function getAchievementBadges(runs, trainingStats) {
  const mixedRunCount = runs.filter((run) => run.category === 'all').length;
  const focusedCategories = new Set(
    runs
      .filter((run) => run.category !== 'all')
      .map((run) => run.category)
  );

  return [
    {
      key: 'first-finish',
      label: 'First finish',
      detail: trainingStats.totalRuns === 0 ? 'Complete the first run.' : 'First completed session recorded.',
      progress: `${Math.min(trainingStats.totalRuns, 1)}/1 run`,
      unlocked: trainingStats.totalRuns >= 1
    },
    {
      key: 'streak-three',
      label: '3-day streak',
      detail: 'Stay active across three days in a row.',
      progress: `${Math.min(trainingStats.currentStreak, 3)}/3 days`,
      unlocked: trainingStats.currentStreak >= 3
    },
    {
      key: 'sharp-eye',
      label: 'Sharp eye',
      detail: 'Hit at least 80% accuracy in one run.',
      progress: `${Math.min(trainingStats.bestPercentage, 80)}/80%`,
      unlocked: trainingStats.bestPercentage >= 80
    },
    {
      key: 'mix-master',
      label: 'Mix master',
      detail: 'Finish two mixed runs.',
      progress: `${Math.min(mixedRunCount, 2)}/2 mixed runs`,
      unlocked: mixedRunCount >= 2
    },
    {
      key: 'category-hopper',
      label: 'Category hopper',
      detail: 'Train in three different focused categories.',
      progress: `${Math.min(focusedCategories.size, 3)}/3 categories`,
      unlocked: focusedCategories.size >= 3
    },
    {
      key: 'steady-hand',
      label: 'Steady hand',
      detail: 'Keep 70%+ recent average across at least three runs.',
      progress: trainingStats.totalRuns < 3
        ? `${trainingStats.totalRuns}/3 runs`
        : `${Math.min(trainingStats.recentAverage, 70)}/70%`,
      unlocked: trainingStats.totalRuns >= 3 && trainingStats.recentAverage >= 70
    }
  ];
}
