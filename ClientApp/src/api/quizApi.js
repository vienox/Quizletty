const jsonHeaders = {
  Accept: 'application/json'
};

async function readJson(response) {
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}.`);
  }

  return response.json();
}

export async function getCategories() {
  const response = await fetch('/api/quiz/categories', {
    headers: jsonHeaders
  });

  return readJson(response);
}

export async function getStats() {
  const response = await fetch('/api/quiz/stats', {
    headers: jsonHeaders
  });

  return readJson(response);
}

export async function getQuestions({ category, limit, shuffle }) {
  const params = new URLSearchParams();

  if (category && category !== 'all') {
    params.set('category', category);
  }

  if (limit) {
    params.set('limit', String(limit));
  }

  if (shuffle) {
    params.set('shuffle', 'true');
  }

  const response = await fetch(`/api/quiz/questions?${params.toString()}`, {
    headers: jsonHeaders
  });

  return readJson(response);
}

export async function getQuestionsByIds({ questionIds, shuffle }) {
  const params = new URLSearchParams();

  questionIds.forEach((questionId) => {
    params.append('ids', String(questionId));
  });

  if (shuffle) {
    params.set('shuffle', 'true');
  }

  const response = await fetch(`/api/quiz/questions/by-ids?${params.toString()}`, {
    headers: jsonHeaders
  });

  return readJson(response);
}

export async function submitQuiz(payload) {
  const response = await fetch('/api/quiz/submit', {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return readJson(response);
}
