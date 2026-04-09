import { useEffect, useState } from 'react';
import { getQuestions, submitQuiz } from '../api/quizApi.js';
import { saveRecentRun } from '../lib/recentRuns.js';
import { clearSessionDraft, loadSessionDraft, saveSessionDraft } from '../lib/sessionDraft.js';

export default function useQuizSession({
  navigateToPhase,
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
      settings: {
        questionLimit,
        selectedCategory,
        shuffleQuestions
      }
    });
    setSavedDraft(loadSessionDraft());
  }, [
    activeQuestionIndex,
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
    const normalizedSettings = normalizeSessionSettings(settings);

    setSelectedCategory(normalizedSettings.category);
    setQuestionLimit(normalizedSettings.questionLimit);
    setShuffleQuestions(normalizedSettings.shuffleQuestions);
    setIsLoadingQuestions(true);
    setQuestionError('');

    try {
      const questionItems = await getQuestions({
        category: normalizedSettings.category,
        limit: normalizedSettings.questionLimit,
        shuffle: normalizedSettings.shuffleQuestions
      });

      setQuestions(questionItems);
      setAnswers({});
      setFlaggedQuestions({});
      setActiveQuestionIndex(0);
      setSessionStartedAt(new Date().toISOString());
      setResult(null);
      setSubmitError('');
      resetNavigationPrompt();
      navigateToPhase('taking');
    } catch {
      setQuestionError('Could not load questions for the selected setup.');
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

    setSelectedCategory(savedDraft.settings?.selectedCategory ?? 'all');
    setQuestionLimit(savedDraft.settings?.questionLimit ?? savedDraft.questions.length);
    setShuffleQuestions(savedDraft.settings?.shuffleQuestions ?? true);
    setQuestions(savedDraft.questions);
    setAnswers(savedDraft.answers ?? {});
    setFlaggedQuestions(savedDraft.flaggedQuestions ?? {});
    setActiveQuestionIndex(savedDraft.activeQuestionIndex ?? 0);
    setSessionStartedAt(savedDraft.startedAt ?? savedDraft.savedAt ?? new Date().toISOString());
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
      const payload = {
        answers: questions.map((question) => ({
          questionId: question.id,
          answerId: answers[question.id]
        }))
      };

      const submissionResult = await submitQuiz(payload);
      const historyEntry = {
        categories: submissionResult.categories,
        id: `${Date.now()}`,
        category: selectedCategory,
        completedAt: new Date().toISOString(),
        correctAnswers: submissionResult.correctAnswers,
        incorrectAnswers: submissionResult.incorrectAnswers,
        percentage: submissionResult.percentage,
        questionCount: questions.length,
        score: submissionResult.score,
        shuffleQuestions
      };

      onRecentRunsChange(saveRecentRun(historyEntry));
      clearSessionDraft();
      setSavedDraft(null);
      setSessionStartedAt(null);
      setResult(submissionResult);
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
    setResult(null);
    setActiveQuestionIndex(0);
  }

  return {
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
