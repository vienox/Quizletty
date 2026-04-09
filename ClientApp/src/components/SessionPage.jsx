import QuestionStage from './QuestionStage.jsx';

export default function SessionPage({
  activeQuestionIndex,
  answers,
  currentQuestion,
  flaggedQuestions,
  isSubmitting,
  onBackToSetup,
  onJumpToNextFlagged,
  onJumpToNextUnanswered,
  onJumpToQuestion,
  onMoveNext,
  onMovePrevious,
  onSelectAnswer,
  onSubmit,
  onToggleFlag,
  questions,
  selectedCategory,
  sessionStartedAt,
  shuffleQuestions,
  submitError
}) {
  if (!currentQuestion) {
    return null;
  }

  return (
    <QuestionStage
      activeIndex={activeQuestionIndex}
      answers={answers}
      flaggedQuestions={flaggedQuestions}
      hasFlaggedQuestions={questions.some((item) => Boolean(flaggedQuestions[item.id]))}
      hasUnansweredQuestions={questions.some((item) => answers[item.id] === undefined)}
      isSubmitting={isSubmitting}
      onJumpToQuestion={onJumpToQuestion}
      onJumpToNextFlagged={onJumpToNextFlagged}
      onJumpToNextUnanswered={onJumpToNextUnanswered}
      onBackToSetup={onBackToSetup}
      onMoveNext={onMoveNext}
      onMovePrevious={onMovePrevious}
      onSelectAnswer={onSelectAnswer}
      onSubmit={onSubmit}
      onToggleFlag={onToggleFlag}
      questions={questions}
      question={currentQuestion}
      sessionSettings={{
        flaggedCount: Object.keys(flaggedQuestions).length,
        selectedCategory,
        sessionStartedAt,
        shuffleQuestions
      }}
      shortcutsEnabled
      submitError={submitError}
      totalQuestions={questions.length}
    />
  );
}
