import { useEffect, useState } from 'react';

const phaseToPath = {
  home: '/',
  result: '/result',
  setup: '/setup',
  taking: '/session'
};

const phaseLabels = {
  result: 'Results',
  setup: 'Quiz builder',
  taking: 'Quiz session'
};

function normalizePathname(pathname) {
  const normalizedPath = pathname !== '/' && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;

  return Object.values(phaseToPath).includes(normalizedPath)
    ? normalizedPath
    : '/';
}

function getPhaseFromPathname(pathname) {
  const normalizedPath = normalizePathname(pathname);

  return Object.entries(phaseToPath).find(([, value]) => value === normalizedPath)?.[0] ?? 'home';
}

export default function useQuizNavigation() {
  const [phase, setPhase] = useState(() => getPhaseFromPathname(window.location.pathname));
  const [showExitPrompt, setShowExitPrompt] = useState(false);
  const [pendingNavigationPhase, setPendingNavigationPhase] = useState(null);

  useEffect(() => {
    const normalizedPath = normalizePathname(window.location.pathname);

    if (window.location.pathname !== normalizedPath) {
      window.history.replaceState({}, '', normalizedPath);
      setPhase(getPhaseFromPathname(normalizedPath));
    }

    function handlePopState() {
      setPhase(getPhaseFromPathname(window.location.pathname));
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  function navigateToPhase(nextPhase, { replace = false } = {}) {
    const nextPath = phaseToPath[nextPhase] ?? '/';

    if (replace) {
      window.history.replaceState({}, '', nextPath);
    } else if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }

    setPhase(nextPhase);
  }

  function resetNavigationPrompt() {
    setPendingNavigationPhase(null);
    setShowExitPrompt(false);
  }

  function requestNavigation(nextPhase) {
    if (phase === 'taking') {
      setPendingNavigationPhase(nextPhase);
      setShowExitPrompt(true);
      return;
    }

    navigateToPhase(nextPhase);
  }

  function confirmPendingNavigation() {
    const nextPhase = pendingNavigationPhase ?? 'setup';

    resetNavigationPrompt();
    navigateToPhase(nextPhase);
  }

  return {
    confirmPendingNavigation,
    pendingNavigationPhase,
    phase,
    phaseLabel: phaseLabels[phase] ?? '',
    navigateToPhase,
    requestNavigation,
    resetNavigationPrompt,
    showExitPrompt
  };
}
