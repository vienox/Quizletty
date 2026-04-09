import { useEffect, useState } from 'react';
import { getCategories, getStats } from '../api/quizApi.js';
import { loadQuizPreferences, saveQuizPreferences } from '../lib/quizPreferences.js';

export default function useQuizMeta() {
  const [storedPreferences] = useState(() => loadQuizPreferences());
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(storedPreferences.selectedCategory);
  const [questionLimit, setQuestionLimit] = useState(storedPreferences.questionLimit);
  const [shuffleQuestions, setShuffleQuestions] = useState(storedPreferences.shuffleQuestions);
  const [metaError, setMetaError] = useState('');
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadMeta() {
      try {
        const [categoryItems, statsResponse] = await Promise.all([
          getCategories(),
          getStats()
        ]);

        if (!isActive) {
          return;
        }

        setCategories(categoryItems);
        setStats(statsResponse);

        const hasStoredCategory = storedPreferences.selectedCategory === 'all'
          || categoryItems.includes(storedPreferences.selectedCategory);

        if (!hasStoredCategory) {
          setSelectedCategory('all');
        }
      } catch {
        if (!isActive) {
          return;
        }

        setMetaError('Could not load the quiz setup right now.');
      } finally {
        if (isActive) {
          setIsLoadingMeta(false);
        }
      }
    }

    loadMeta();

    return () => {
      isActive = false;
    };
  }, [storedPreferences.selectedCategory]);

  const categoryQuestionCounts = new Map(
    (stats?.categories ?? []).map((item) => [item.category, item.questionCount])
  );

  function getQuestionCountForCategory(category) {
    if (category === 'all') {
      return stats?.totalQuestions ?? 1;
    }

    return categoryQuestionCounts.get(category) ?? 1;
  }

  function getAvailableCategory(preferredCategories) {
    return preferredCategories.find((category) => categoryQuestionCounts.has(category)) ?? 'all';
  }

  function normalizeSessionSettings(settings) {
    const normalizedCategory = settings.category && settings.category !== 'all' && categoryQuestionCounts.has(settings.category)
      ? settings.category
      : 'all';
    const availableQuestions = getQuestionCountForCategory(normalizedCategory);

    return {
      category: normalizedCategory,
      questionLimit: Math.min(Math.max(settings.questionLimit ?? 1, 1), availableQuestions),
      shuffleQuestions: Boolean(settings.shuffleQuestions)
    };
  }

  const maxQuestions = selectedCategory === 'all'
    ? stats?.totalQuestions ?? 1
    : stats?.categories?.find((item) => item.category === selectedCategory)?.questionCount ?? 1;

  useEffect(() => {
    setQuestionLimit((current) => {
      if (!maxQuestions) {
        return current;
      }

      return Math.min(Math.max(current, 1), maxQuestions);
    });
  }, [maxQuestions]);

  useEffect(() => {
    saveQuizPreferences({
      questionLimit,
      selectedCategory,
      shuffleQuestions
    });
  }, [questionLimit, selectedCategory, shuffleQuestions]);

  return {
    categories,
    getAvailableCategory,
    getQuestionCountForCategory,
    isLoadingMeta,
    maxQuestions,
    metaError,
    normalizeSessionSettings,
    questionLimit,
    selectedCategory,
    setQuestionLimit,
    setSelectedCategory,
    setShuffleQuestions,
    shuffleQuestions,
    stats
  };
}
