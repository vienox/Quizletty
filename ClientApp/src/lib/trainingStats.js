function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDayDifference(laterDate, earlierDate) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(laterDate) - startOfDay(earlierDate)) / millisecondsPerDay);
}

function getDistinctRunDays(runs) {
  return [...new Map(runs
    .map((run) => {
      const completedAt = new Date(run.completedAt);

      if (Number.isNaN(completedAt.getTime())) {
        return null;
      }

      return [startOfDay(completedAt).getTime(), completedAt];
    })
    .filter(Boolean))
    .values()]
    .sort((left, right) => right - left);
}

export function calculateTrainingStats(runs, referenceDate = new Date()) {
  const distinctRunDays = getDistinctRunDays(runs);
  const latestRunDate = distinctRunDays[0] ?? null;
  const latestRunGap = latestRunDate ? getDayDifference(referenceDate, latestRunDate) : Number.POSITIVE_INFINITY;
  let currentStreak = 0;

  if (latestRunGap === 0 || latestRunGap === 1) {
    currentStreak = 1;

    for (let index = 1; index < distinctRunDays.length; index += 1) {
      const gapBetweenDays = getDayDifference(distinctRunDays[index - 1], distinctRunDays[index]);

      if (gapBetweenDays !== 1) {
        break;
      }

      currentStreak += 1;
    }
  }

  const recentAverage = runs.length > 0
    ? Math.round(runs.reduce((sum, run) => sum + run.percentage, 0) / runs.length)
    : 0;
  const bestPercentage = runs.reduce((best, run) => Math.max(best, run.percentage), 0);

  return {
    activeDays: distinctRunDays.length,
    bestPercentage,
    completedToday: latestRunGap === 0,
    currentStreak,
    lastActivityAt: latestRunDate?.toISOString() ?? null,
    recentAverage,
    totalRuns: runs.length
  };
}
