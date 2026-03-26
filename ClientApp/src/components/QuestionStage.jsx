import { useEffect, useState } from 'react';

export default function QuestionStage({
  activeIndex,
  answers,
  flaggedQuestions,
  isSubmitting,
  onJumpToQuestion,
  onBackToSetup,
  onMoveNext,
  onMovePrevious,
  onSelectAnswer,
  onSubmit,
  onToggleFlag,
  questions,
  question,
  sessionSettings,
  shortcutsEnabled,
  submitError,
  totalQuestions
}) {
  const selectedAnswerId = answers[question.id] ?? null;
  const answeredCount = Object.keys(answers).length;
  const isLastQuestion = activeIndex === totalQuestions - 1;
  const isReadyToSubmit = answeredCount === totalQuestions;
  const isFlagged = Boolean(flaggedQuestions[question.id]);
  const [elapsedLabel, setElapsedLabel] = useState('00:00');

  useEffect(() => {
    function updateElapsedLabel() {
      if (!sessionSettings.sessionStartedAt) {
        setElapsedLabel('00:00');
        return;
      }

      const elapsedMilliseconds = Date.now() - new Date(sessionSettings.sessionStartedAt).getTime();
      const totalSeconds = Math.max(0, Math.floor(elapsedMilliseconds / 1000));
      const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
      const seconds = String(totalSeconds % 60).padStart(2, '0');
      setElapsedLabel(`${minutes}:${seconds}`);
    }

    updateElapsedLabel();
    const intervalId = window.setInterval(updateElapsedLabel, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [sessionSettings.sessionStartedAt]);

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

          <div className="session-meta-grid">
            <article className="session-meta-card">
              <p className="highlight-label">Category</p>
              <p className="session-meta-value">
                {sessionSettings.selectedCategory === 'all'
                  ? 'Mixed run'
                  : sessionSettings.selectedCategory}
              </p>
            </article>

            <article className="session-meta-card">
              <p className="highlight-label">Order</p>
              <p className="session-meta-value">
                {sessionSettings.shuffleQuestions ? 'Shuffled' : 'Fixed'}
              </p>
            </article>

            <article className="session-meta-card">
              <p className="highlight-label">Remaining</p>
              <p className="session-meta-value">{totalQuestions - answeredCount}</p>
            </article>

            <article className="session-meta-card">
              <p className="highlight-label">Flagged</p>
              <p className="session-meta-value">{sessionSettings.flaggedCount}</p>
            </article>

            <article className="session-meta-card">
              <p className="highlight-label">Elapsed</p>
              <p className="session-meta-value">{elapsedLabel}</p>
            </article>
          </div>

          <div className="progress-bar" aria-hidden="true">
            <span
              className="progress-bar-fill"
              style={{ width: `${((activeIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>

          <div className="navigator-grid">
            {questions.map((item, index) => {
              const isAnswered = answers[item.id] !== undefined;
              const isActive = item.id === question.id;
              const isItemFlagged = Boolean(flaggedQuestions[item.id]);

              return (
                <button
                  className={`navigator-pill${isAnswered ? ' navigator-pill-answered' : ''}${isItemFlagged ? ' navigator-pill-flagged' : ''}${isActive ? ' navigator-pill-active' : ''}`}
                  key={item.id}
                  onClick={() => onJumpToQuestion(index)}
                  type="button"
                >
                  {index + 1}
                </button>
              );
            })}
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

          <button className="ghost-button" onClick={() => onToggleFlag(question.id)} type="button">
            {isFlagged ? 'Remove review flag' : 'Mark question for review'}
          </button>

          {!isReadyToSubmit && (
            <p className="helper-copy">Answer every question to unlock the final score.</p>
          )}

          {shortcutsEnabled && (
            <p className="helper-copy">
              Keyboard: use 1-9 to pick answers, arrows to move, F to flag and Enter to submit on the final card.
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
