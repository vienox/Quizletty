import { useEffect, useState } from 'react';
import { getQuestions, getQuestionsByIds, submitQuiz } from '../api/quizApi.js';
import { updateMistakeBankEntries } from '../lib/mistakeBank.js';
import { saveRecentRun } from '../lib/recentRuns.js';
import { clearSessionDraft, loadSessionDraft, saveSessionDraft } from '../lib/sessionDraft.js';

function sanitizeQuestionIds(questionIds) {
  return [...new Set((questionIds ?? [])
    .map((questionId) => Number(questionId))
    .filter((questionId) => Number.isInteger(questionId) && questionId > 0))];
}

export default function useQuizSession({
  navigateToPhase,
  onMistakeBankChange,
  normalizeSessionSettings,
  onRecentRunsChange,
  phase,
  questionLimit,
  resetNavigationPrompt,
  selectedCategory,
  setQuestionLimit,
  setSelectedCategory,
  setShuffleQuestions,
  shuffleQuestions
}) {
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flaggedQuestions, setFlaggedQuestions] = useState({});
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [result, setResult] = useState(null);
  const [savedDraft, setSavedDraft] = useState(() => loadSessionDraft());
  const [sessionStartedAt, setSessionStartedAt] = useState(null);
  const [activeSessionSettings, setActiveSessionSettings] = useState(null);

  function getDefaultSessionSettings() {
    return {
      questionIds: [],
      questionLimit,
      runLabel: selectedCategory === 'all' ? 'Mixed run' : selectedCategory,
      runType: 'standard',
      selectedCategory,
      shuffleQuestions
    };
  }

  useEffect(() => {
    if (phase !== 'taking' || questions.length === 0) {
      return;
    }

    saveSessionDraft({
      activeQuestionIndex,
      answers,
      flaggedQuestions,
      questions,
      savedAt: new Date().toISOString(),
      startedAt: sessionStartedAt,
      settings: activeSessionSettings ?? getDefaultSessionSettings()
    });
    setSavedDraft(loadSessionDraft());
  }, [
    activeQuestionIndex,
    activeSessionSettings,
    answers,
    flaggedQuestions,
    phase,
    questionLimit,
    questions,
    selectedCategory,
    sessionStartedAt,
    shuffleQuestions
  ]);

  useEffect(() => {
    if (phase === 'taking' && questions.length === 0 && !isLoadingQuestions) {
      if (savedDraft?.questions?.length) {
        resumeSavedDraft({ navigate: false });
        return;
      }

      navigateToPhase('setup', { replace: true });
    }

    if (phase === 'result' && !result) {
      navigateToPhase('setup', { replace: true });
    }
  }, [isLoadingQuestions, navigateToPhase, phase, questions.length, result, savedDraft]);

  async function startSessionWithSettings(settings) {
    const questionIds = sanitizeQuestionIds(settings.questionIds);
    const isCustomQuestionSet = questionIds.length > 0;
    const nextSessionSettings = isCustomQuestionSet
      ? {
          questionIds,
          questionLimit: questionIds.length,
          runLabel: settings.runLabel ?? 'Mistake bank',
          runType: settings.runType ?? 'mistake-bank',
          selectedCategory: 'all',
          shuffleQuestions: Boolean(settings.shuffleQuestions)
        }
      : (() => {
          const normalizedSettings = normalizeSessionSettings(settings);

          return {
            questionIds: [],
            questionLimit: normalizedSettings.questionLimit,
            runLabel: normalizedSettings.category === 'all' ? 'Mixed run' : normalizedSettings.category,
            runType: 'standard',
            selectedCategory: normalizedSettings.category,
            shuffleQuestions: normalizedSettings.shuffleQuestions
          };
        })();

    if (!isCustomQuestionSet) {
      setSelectedCategory(nextSessionSettings.selectedCategory);
      setQuestionLimit(nextSessionSettings.questionLimit);
      setShuffleQuestions(nextSessionSettings.shuffleQuestions);
    }

    setIsLoadingQuestions(true);
    setQuestionError('');

    try {
      const questionItems = isCustomQuestionSet
        ? await getQuestionsByIds({
            questionIds: nextSessionSettings.questionIds,
            shuffle: nextSessionSettings.shuffleQuestions
          })
        : await getQuestions({
            category: nextSessionSettings.selectedCategory,
            limit: nextSessionSettings.questionLimit,
            shuffle: nextSessionSettings.shuffleQuestions
          });

      if (questionItems.length === 0) {
        setQuestionError(isCustomQuestionSet
          ? 'The mistake bank does not have any available questions right now.'
          : 'Could not load questions for the selected setup.');
        return;
      }

      const startedAt = new Date().toISOString();

      setQuestions(questionItems);
      setAnswers({});
      setFlaggedQuestions({});
      setActiveQuestionIndex(0);
      setSessionStartedAt(startedAt);
      setActiveSessionSettings({
        ...nextSessionSettings,
        questionIds: isCustomQuestionSet ? questionItems.map((item) => item.id) : [],
        questionLimit: questionItems.length
      });
      setResult(null);
      setSubmitError('');
      resetNavigationPrompt();
      navigateToPhase('taking');
    } catch {
      setQuestionError(isCustomQuestionSet
        ? 'Could not load questions from the mistake bank.'
        : 'Could not load questions for the selected setup.');
    } finally {
      setIsLoadingQuestions(false);
    }
  }

  async function startSession() {
    await startSessionWithSettings({
      category: selectedCategory,
      questionLimit,
      shuffleQuestions
    });
  }

  function handleSelectAnswer(questionId, answerId) {
    setAnswers((current) => ({
      ...current,
      [questionId]: answerId
    }));
  }

  function toggleQuestionFlag(questionId) {
    setFlaggedQuestions((current) => {
      const nextFlags = { ...current };

      if (nextFlags[questionId]) {
        delete nextFlags[questionId];
      } else {
        nextFlags[questionId] = true;
      }

      return nextFlags;
    });
  }

  function jumpToNextMatchingQuestion(predicate) {
    if (questions.length === 0) {
      return;
    }

    for (let offset = 1; offset <= questions.length; offset += 1) {
      const candidateIndex = (activeQuestionIndex + offset) % questions.length;

      if (predicate(questions[candidateIndex])) {
        setActiveQuestionIndex(candidateIndex);
        return;
      }
    }
  }

  function resumeSavedDraft({ navigate = true } = {}) {
    if (!savedDraft) {
      return;
    }

    const restoredQuestionIds = sanitizeQuestionIds(savedDraft.settings?.questionIds);
    const restoredSessionSettings = {
      questionIds: restoredQuestionIds,
      questionLimit: savedDraft.settings?.questionLimit ?? savedDraft.questions.length,
      runLabel: savedDraft.settings?.runLabel ?? (
        savedDraft.settings?.selectedCategory === 'all'
          ? 'Mixed run'
          : savedDraft.settings?.selectedCategory ?? 'Mixed run'
      ),
      runType: savedDraft.settings?.runType === 'mistake-bank' ? 'mistake-bank' : 'standard',
      selectedCategory: savedDraft.settings?.selectedCategory ?? 'all',
      shuffleQuestions: savedDraft.settings?.shuffleQuestions ?? true
    };

    setSelectedCategory(restoredSessionSettings.selectedCategory);
    setQuestionLimit(restoredSessionSettings.questionLimit);
    setShuffleQuestions(restoredSessionSettings.shuffleQuestions);
    setQuestions(savedDraft.questions);
    setAnswers(savedDraft.answers ?? {});
    setFlaggedQuestions(savedDraft.flaggedQuestions ?? {});
    setActiveQuestionIndex(savedDraft.activeQuestionIndex ?? 0);
    setSessionStartedAt(savedDraft.startedAt ?? savedDraft.savedAt ?? new Date().toISOString());
    setActiveSessionSettings(restoredSessionSettings);
    setResult(null);
    setSubmitError('');
    resetNavigationPrompt();

    if (navigate) {
      navigateToPhase('taking');
    }
  }

  function discardSavedDraft() {
    clearSessionDraft();
    setSavedDraft(null);
  }

  async function submitSession() {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const completedAt = new Date().toISOString();
      const payload = {
        answers: questions.map((question) => ({
          questionId: question.id,
          answerId: answers[question.id]
        }))
      };

      const submissionResult = await submitQuiz(payload);
      const sessionSettings = activeSessionSettings ?? getDefaultSessionSettings();
      const nextResult = {
        ...submissionResult,
        sessionSettings
      };
      const historyEntry = {
        categories: submissionResult.categories,
        id: `${Date.now()}`,
        category: sessionSettings.runType === 'mistake-bank'
          ? 'mistake-bank'
          : sessionSettings.selectedCategory,
        completedAt,
        correctAnswers: submissionResult.correctAnswers,
        incorrectAnswers: submissionResult.incorrectAnswers,
        percentage: submissionResult.percentage,
        questionCount: questions.length,
        questionIds: sessionSettings.questionIds,
        runLabel: sessionSettings.runLabel,
        runType: sessionSettings.runType,
        score: submissionResult.score,
        shuffleQuestions: sessionSettings.shuffleQuestions
      };

      onMistakeBankChange(updateMistakeBankEntries(submissionResult.review, {
        completedAt,
        resolveCorrectEntries: sessionSettings.runType === 'mistake-bank'
      }));
      onRecentRunsChange(saveRecentRun(historyEntry));
      clearSessionDraft();
      setSavedDraft(null);
      setSessionStartedAt(null);
      setActiveSessionSettings(null);
      setResult(nextResult);
      navigateToPhase('result');
    } catch {
      setSubmitError('Could not score the quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function restartSession() {
    navigateToPhase('setup');
    setQuestions([]);
    setAnswers({});
    setFlaggedQuestions({});
    setSessionStartedAt(null);
    setActiveSessionSettings(null);
    setResult(null);
    setActiveQuestionIndex(0);
  }

  return {
    activeSessionSettings,
    activeQuestionIndex,
    answers,
    currentQuestion: questions[activeQuestionIndex],
    discardSavedDraft,
    flaggedQuestions,
    isLoadingQuestions,
    isSubmitting,
    jumpToNextMatchingQuestion,
    questionError,
    questions,
    resetResult: () => setResult(null),
    restartSession,
    result,
    resumeSavedDraft,
    savedDraft,
    sessionStartedAt,
    setActiveQuestionIndex,
    setResult,
    startSession,
    startSessionWithSettings,
    submitError,
    submitSession,
    toggleQuestionFlag,
    handleSelectAnswer
  };
}
