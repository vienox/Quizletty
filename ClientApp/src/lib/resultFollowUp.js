function rankResultCategories(categories) {
  return [...categories]
    .map((item) => ({
      ...item,
      accuracy: item.totalQuestions === 0 ? 0 : item.correctAnswers / item.totalQuestions
    }))
    .sort((left, right) => {
      if (left.accuracy !== right.accuracy) {
        return left.accuracy - right.accuracy;
      }

      return right.totalQuestions - left.totalQuestions;
    });
}

export function getResultFollowUpPreset(result, getQuestionCountForCategory) {
  if (!result) {
    return null;
  }

  const weakestCategory = rankResultCategories(result.categories)[0];

  if (!weakestCategory) {
    return {
      category: 'all',
      label: 'Run another mixed check',
      questionLimit: Math.min(6, getQuestionCountForCategory('all')),
      shuffleQuestions: true,
      summary: 'Start another broad pass across the quiz bank.'
    };
  }

  return {
    category: weakestCategory.category,
    label: `Drill ${weakestCategory.category}`,
    questionLimit: Math.min(
      Math.max(weakestCategory.totalQuestions, 4),
      getQuestionCountForCategory(weakestCategory.category)
    ),
    shuffleQuestions: false,
    summary: `${Math.round(weakestCategory.accuracy * 100)}% accuracy in ${weakestCategory.category} makes it the clearest next follow-up.`
  };
}
