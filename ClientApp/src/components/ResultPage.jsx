import ResultStage from './ResultStage.jsx';

export default function ResultPage({
  followUpPreset,
  isStartingFollowUp,
  onRestart,
  onStartRetryMissed,
  onStartFollowUp,
  result
}) {
  if (!result) {
    return null;
  }

  return (
    <ResultStage
      followUpPreset={followUpPreset}
      isStartingFollowUp={isStartingFollowUp}
      onRestart={onRestart}
      onStartRetryMissed={onStartRetryMissed}
      onStartFollowUp={onStartFollowUp}
      result={result}
    />
  );
}
