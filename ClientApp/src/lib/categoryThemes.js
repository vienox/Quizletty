function buildArtwork(background, foreground, accent) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 200">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${background}" />
          <stop offset="100%" stop-color="${foreground}" />
        </linearGradient>
      </defs>
      <rect width="320" height="200" rx="28" fill="url(#g)" />
      <circle cx="255" cy="58" r="42" fill="${accent}" fill-opacity="0.32" />
      <circle cx="75" cy="150" r="56" fill="#fff" fill-opacity="0.12" />
      <path d="M60 150 C110 90 175 75 250 110" stroke="#fff" stroke-opacity="0.44" stroke-width="16" stroke-linecap="round" fill="none" />
      <path d="M90 58 C120 30 168 26 212 44" stroke="#fff" stroke-opacity="0.28" stroke-width="10" stroke-linecap="round" fill="none" />
      <path d="M112 136 C132 118 164 106 202 112" stroke="#fff" stroke-opacity="0.22" stroke-width="8" stroke-linecap="round" fill="none" />
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const categoryThemes = {
  all: {
    artwork: buildArtwork('#0f766e', '#fb923c', '#fef3c7'),
    eyebrow: 'Mixed run',
    summary: 'A broad pass across the question bank when you want variety instead of one narrow topic.'
  },
  Art: {
    artwork: buildArtwork('#7c3aed', '#fb7185', '#fde68a'),
    eyebrow: 'Visual culture',
    summary: 'Paintings, movements and artists that reward memory for style, names and periods.'
  },
  Geography: {
    artwork: buildArtwork('#0284c7', '#10b981', '#fef08a'),
    eyebrow: 'Places and maps',
    summary: 'Capitals, countries and global orientation for quick spatial recall.'
  },
  History: {
    artwork: buildArtwork('#7c2d12', '#b45309', '#fde68a'),
    eyebrow: 'Timelines and turning points',
    summary: 'Major events, leaders and civilizations for players who like context and sequence.'
  },
  Literature: {
    artwork: buildArtwork('#7c2d12', '#c084fc', '#fde68a'),
    eyebrow: 'Stories and authors',
    summary: 'Books, opening lines and writers with a more classic knowledge feel.'
  },
  Math: {
    artwork: buildArtwork('#1d4ed8', '#6366f1', '#dbeafe'),
    eyebrow: 'Fast accuracy',
    summary: 'Short numerical checks built for quick confidence and instant correction.'
  },
  Music: {
    artwork: buildArtwork('#db2777', '#7c3aed', '#fbcfe8'),
    eyebrow: 'Sound and notation',
    summary: 'Instruments, theory and music-reading basics for rhythm-minded runs.'
  },
  Programming: {
    artwork: buildArtwork('#111827', '#0f766e', '#93c5fd'),
    eyebrow: 'Logic and code',
    summary: 'Concepts, syntax and structures for people who like technical trivia.'
  },
  Science: {
    artwork: buildArtwork('#0f766e', '#06b6d4', '#ccfbf1'),
    eyebrow: 'Systems and facts',
    summary: 'Chemistry, planets and natural rules that reward precise recall.'
  },
  Sports: {
    artwork: buildArtwork('#166534', '#0ea5e9', '#fef08a'),
    eyebrow: 'Rules and results',
    summary: 'Team sports, iconic tournaments and quick-fire facts built for competitive runs.'
  }
};

export function getCategoryTheme(category) {
  return categoryThemes[category] ?? {
    artwork: buildArtwork('#334155', '#0f766e', '#fde68a'),
    eyebrow: 'Topic focus',
    summary: 'A dedicated set of questions built around one consistent category.'
  };
}
