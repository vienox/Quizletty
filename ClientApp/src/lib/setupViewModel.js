import { getCategoryTheme } from './categoryThemes.js';
import { getDailyChallenge } from './dailyChallenge.js';
import { hasFavoriteSetup } from './favoriteSetups.js';

export function buildSetupViewModel({
  favoriteSetups,
  getAvailableCategory,
  getQuestionCountForCategory,
  isLoadingMeta,
  metaError,
  mistakeBankCount,
  now,
  questionLimit,
  selectedCategory,
  shuffleQuestions,
  stats,
  trainingStats
}) {
  const highlights = [
    {
      label: 'Question bank',
      value: isLoadingMeta ? 'Loading...' : `${stats?.totalQuestions ?? 0} live prompts`
    },
    {
      label: 'Categories',
      value: isLoadingMeta ? 'Loading...' : `${stats?.totalCategories ?? 0} focus tracks`
    },
    {
      label: 'Mistake bank',
      value: mistakeBankCount === 0
        ? '0 queued'
        : `${mistakeBankCount} queued question${mistakeBankCount === 1 ? '' : 's'}`
    },
    {
      label: 'Streak',
      value: trainingStats.totalRuns === 0
        ? 'Start today'
        : `${trainingStats.currentStreak}-day streak`
    }
  ];

  const maxQuestions = getQuestionCountForCategory(selectedCategory);
  const selectedCategoryTheme = getCategoryTheme(selectedCategory);

  const featuredQuizPacks = [
    {
      category: 'all',
      eyebrow: 'Featured pack',
      label: 'Starter mix',
      questionLimit: Math.min(6, getQuestionCountForCategory('all')),
      shuffleQuestions: true,
      summary: 'A balanced pass across the full bank when you want a quick but varied session.',
      detail: 'Good first run when you want to sample the whole app.',
      artwork: getCategoryTheme('all').artwork
    },
    {
      category: getAvailableCategory(['Programming', 'Science', 'History']),
      eyebrow: 'Featured pack',
      label: 'Deep focus',
      questionLimit: Math.min(8, getQuestionCountForCategory(getAvailableCategory(['Programming', 'Science', 'History']))),
      shuffleQuestions: false,
      summary: 'A denser single-category run with fewer context switches and steadier pacing.',
      detail: 'Built for staying inside one lane and tightening recall.',
      artwork: getCategoryTheme(getAvailableCategory(['Programming', 'Science', 'History'])).artwork
    },
    {
      category: getAvailableCategory(['History', 'Literature', 'Art']),
      eyebrow: 'Featured pack',
      label: 'Storyline route',
      questionLimit: Math.min(7, getQuestionCountForCategory(getAvailableCategory(['History', 'Literature', 'Art']))),
      shuffleQuestions: false,
      summary: 'A themed run centered on narrative, context and recognition across richer prompts.',
      detail: 'Works well when you want a more classic knowledge run.',
      artwork: getCategoryTheme(getAvailableCategory(['History', 'Literature', 'Art'])).artwork
    },
    {
      category: getAvailableCategory(['Sports', 'Math', 'Music']),
      eyebrow: 'Featured pack',
      label: 'Fast reflex',
      questionLimit: Math.min(7, getQuestionCountForCategory(getAvailableCategory(['Sports', 'Math', 'Music']))),
      shuffleQuestions: true,
      summary: 'Shorter questions, quicker choices and a sharper pace with random order turned on.',
      detail: 'Best when you want a compact run with momentum.',
      artwork: getCategoryTheme(getAvailableCategory(['Sports', 'Math', 'Music'])).artwork
    }
  ];

  const quickStartPresets = [
    {
      category: 'all',
      label: 'Quick warm-up',
      questionLimit: 5,
      shuffleQuestions: true,
      summary: 'Short mixed run to get moving fast.'
    },
    {
      category: 'all',
      label: 'Deep mixed run',
      questionLimit: 10,
      shuffleQuestions: true,
      summary: 'Broader session across the full bank.'
    },
    {
      category: selectedCategory === 'all' ? 'all' : selectedCategory,
      label: 'Focused category drill',
      questionLimit: Math.min(6, maxQuestions),
      shuffleQuestions: false,
      summary: selectedCategory === 'all'
        ? 'Switch to one category first for a tighter practice run.'
        : `Stay inside ${selectedCategory} and review it in sequence.`
    }
  ];

  const challengePresets = [
    {
      category: 'all',
      label: 'Shuffle sprint',
      questionLimit: 8,
      shuffleQuestions: true,
      summary: 'Fast mixed pressure with no fixed order.'
    },
    {
      category: selectedCategory === 'all' ? 'Programming' : selectedCategory,
      label: 'Topic lock-in',
      questionLimit: Math.min(8, selectedCategory === 'all'
        ? stats?.categories?.find((item) => item.category === 'Programming')?.questionCount ?? 8
        : maxQuestions),
      shuffleQuestions: false,
      summary: selectedCategory === 'all'
        ? 'A denser focused run in one technical lane.'
        : `Push deeper inside ${selectedCategory} without randomization.`
    },
    {
      category: 'all',
      label: 'Long review',
      questionLimit: Math.min(12, stats?.totalQuestions ?? 12),
      shuffleQuestions: false,
      summary: 'A steadier full-bank run for a longer review block.'
    }
  ];

  const categoryCards = [
    {
      category: 'all',
      label: 'All categories',
      questionCount: stats?.totalQuestions ?? 0,
      ...getCategoryTheme('all')
    },
    ...(stats?.categories?.map((item) => ({
      category: item.category,
      label: item.category,
      questionCount: item.questionCount,
      ...getCategoryTheme(item.category)
    })) ?? [])
  ];

  const selectedRunCoverage = maxQuestions === 0
    ? 0
    : Math.round((questionLimit / maxQuestions) * 100);
  const selectedBankLabel = maxQuestions >= 10
    ? 'Deep bank'
    : maxQuestions >= 6
      ? 'Solid bank'
      : 'Compact bank';
  const selectedRunDepthLabel = selectedRunCoverage >= 80
    ? 'Deep pass'
    : selectedRunCoverage >= 50
      ? 'Balanced pass'
      : 'Compact pass';
  const recommendedMode = selectedCategory === 'all'
    ? {
        label: 'Shuffled mix',
        detail: 'Best for broad recall across multiple topics.'
      }
    : {
        label: 'Fixed category drill',
        detail: `Start ${selectedCategory} in sequence, then add shuffle once the lane feels stable.`
      };
  const selectedQuizGuidance = selectedCategory === 'all'
    ? 'Use the mixed track when you want a quick read on what is holding up well across the whole bank.'
    : `Stay inside ${selectedCategory} when you want fewer context switches and a cleaner repetition loop.`;
  const selectedQuizActions = selectedCategory === 'all'
    ? [
        {
          category: 'all',
          label: 'Balanced mix',
          questionLimit: Math.min(8, maxQuestions),
          shuffleQuestions: true,
          summary: 'Wider all-category run with random order for better spread.'
        },
        {
          category: 'all',
          label: 'Long review',
          questionLimit: Math.min(12, maxQuestions),
          shuffleQuestions: false,
          summary: 'Longer mixed pass when you want a steadier review block.'
        }
      ]
    : [
        {
          category: selectedCategory,
          label: 'Short drill',
          questionLimit: Math.min(5, maxQuestions),
          shuffleQuestions: false,
          summary: `Fast ${selectedCategory} run to tighten the core questions first.`
        },
        {
          category: selectedCategory,
          label: 'Full track pass',
          questionLimit: Math.min(8, maxQuestions),
          shuffleQuestions: false,
          summary: `Use more of ${selectedCategory} in sequence for a deeper review.`
        }
      ];

  const selectedQuizMetrics = [
    {
      label: 'Question bank',
      value: `${maxQuestions}`,
      detail: selectedBankLabel
    },
    {
      label: 'Current slice',
      value: `${selectedRunCoverage}%`,
      detail: selectedRunDepthLabel
    },
    {
      label: 'Recommended mode',
      value: recommendedMode.label,
      detail: selectedCategory === 'all' ? 'Across the full bank' : 'Inside one topic'
    }
  ];

  const isCurrentSetupFavorite = hasFavoriteSetup(favoriteSetups, {
    category: selectedCategory,
    questionLimit,
    shuffleQuestions
  });

  const dailyChallenge = stats
    ? getDailyChallenge({
        categoryItems: stats.categories,
        referenceDate: new Date(now),
        totalQuestions: stats.totalQuestions
      })
    : null;

  return {
    categoryCards,
    challengePresets,
    dailyChallenge,
    featuredQuizPacks,
    highlights,
    isCurrentSetupFavorite,
    quickStartPresets,
    recommendedMode,
    selectedCategoryTheme,
    selectedQuizActions,
    selectedQuizGuidance,
    selectedQuizMetrics
  };
}
