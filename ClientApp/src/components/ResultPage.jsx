import ResultStage from './ResultStage.jsx';

export default function ResultPage({
  followUpPreset,
  isStartingFollowUp,
  onRestart,
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
      onStartFollowUp={onStartFollowUp}
      result={result}
    />
  );
}
