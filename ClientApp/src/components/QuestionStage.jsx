export default function QuestionStage({
  activeIndex,
  answers,
  isSubmitting,
  onBackToSetup,
  onMoveNext,
  onMovePrevious,
  onSelectAnswer,
  onSubmit,
  question,
  shortcutsEnabled,
  submitError,
  totalQuestions
}) {
  const selectedAnswerId = answers[question.id] ?? null;
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = activeIndex === totalQuestions - 1;
  const isReadyToSubmit = answeredCount === totalQuestions;

  return (
    <section className="question-stage">
      <article className="question-card">
        <div className="question-topline">
          <p className="eyebrow">Question {activeIndex + 1}</p>
          <p className="question-progress">
            {answeredCount}/{totalQuestions} answered
          </p>
        </div>

        <div className="card-header">
          <h2>{question.content}</h2>
          <p className="helper-copy">
            Category: <strong>{question.category}</strong>
          </p>
        </div>

        <div className="answers-grid">
          {question.answers.map((answer) => {
            const isSelected = selectedAnswerId === answer.id;

            return (
              <button
                className={`answer-option${isSelected ? ' answer-option-selected' : ''}`}
                key={answer.id}
                onClick={() => onSelectAnswer(question.id, answer.id)}
                type="button"
              >
                <span className="answer-badge">{isSelected ? 'Chosen' : 'Pick'}</span>
                <span>{answer.content}</span>
              </button>
            );
          })}
        </div>
      </article>

      <aside className="question-sidebar">
        <article className="steps-card">
          <div className="card-header">
            <p className="eyebrow">Session status</p>
            <h2>Move through the full run at your own pace.</h2>
          </div>

          <div className="progress-bar" aria-hidden="true">
            <span
              className="progress-bar-fill"
              style={{ width: `${((activeIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          <div className="question-actions">
            <button
              className="secondary-button"
              disabled={activeIndex === 0}
              onClick={onMovePrevious}
              type="button"
            >
              Previous question
            </button>

            <button
              className="primary-button"
              disabled={isLastQuestion ? !isReadyToSubmit || isSubmitting : false}
              onClick={isLastQuestion ? onSubmit : onMoveNext}
              type="button"
            >
              {isLastQuestion
                ? isSubmitting
                  ? 'Scoring quiz...'
                  : 'Finish and score quiz'
                : 'Next question'}
            </button>
          </div>

          {!isReadyToSubmit && (
            <p className="helper-copy">Answer every question to unlock the final score.</p>
          )}

          {shortcutsEnabled && (
            <p className="helper-copy">
              Keyboard: use 1-9 to pick answers, arrows to move and Enter to submit on the final card.
            </p>
          )}

          {submitError && <p className="error-copy">{submitError}</p>}

          <button className="ghost-button" onClick={onBackToSetup} type="button">
            Back to setup
          </button>
        </article>
      </aside>
    </section>
  );
}
