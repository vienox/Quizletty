import { useEffect, useEffectEvent } from 'react';

export default function useSessionKeyboardShortcuts({
  activeQuestionIndex,
  answers,
  currentQuestion,
  isSubmitting,
  onMoveNext,
  onMovePrevious,
  onSelectAnswer,
  onSubmit,
  onToggleFlag,
  phase,
  questionsLength
}) {
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = activeQuestionIndex === questionsLength - 1;

  const handleKeyboardShortcuts = useEffectEvent((event) => {
    if (phase !== 'taking' || !currentQuestion) {
      return;
    }

    const targetTagName = event.target instanceof HTMLElement ? event.target.tagName : '';
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(targetTagName)) {
      return;
    }

    if (/^[1-9]$/.test(event.key)) {
      const answerIndex = Number(event.key) - 1;
      const answer = currentQuestion.answers[answerIndex];

      if (answer) {
        event.preventDefault();
        onSelectAnswer(currentQuestion.id, answer.id);
      }

      return;
    }

    if (event.key === 'ArrowLeft' && activeQuestionIndex > 0) {
      event.preventDefault();
      onMovePrevious();
      return;
    }

    if (event.key === 'ArrowRight' && activeQuestionIndex < questionsLength - 1) {
      event.preventDefault();
      onMoveNext();
      return;
    }

    if (event.key === 'Enter' && isLastQuestion && answeredCount === questionsLength && !isSubmitting) {
      event.preventDefault();
      onSubmit();
      return;
    }

    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      onToggleFlag(currentQuestion.id);
    }
  });

  useEffect(() => {
    if (phase !== 'taking') {
      return undefined;
    }

    function onKeyDown(event) {
      handleKeyboardShortcuts(event);
    }

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [handleKeyboardShortcuts, phase]);
}
