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

export async function getQuestions({ category, limit }) {
  const params = new URLSearchParams();

  if (category && category !== 'all') {
    params.set('category', category);
  }

  if (limit) {
    params.set('limit', String(limit));
  }

  const response = await fetch(`/api/quiz/questions?${params.toString()}`, {
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
