const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function getHealth(signal) {
  const response = await fetch(`${baseUrl}/api/health`, { signal });
  if (!response.ok) throw new Error('API request failed');
  const data = await response.json();
  if (data.status !== 'ok' || data.service !== 'BuildLog API') throw new Error('Unexpected API response');
  return data;
}
