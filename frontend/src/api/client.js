const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, field = null) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

function getErrorDetail(data) {
  if (typeof data?.detail === 'string') return { message: data.detail, field: null };
  if (data?.detail?.message) return data.detail;
  if (Array.isArray(data?.detail) && data.detail[0]) {
    const issue = data.detail[0];
    const field = issue.loc?.at(-1) || null;
    if (field === 'password' && issue.ctx?.min_length === 1) return { message: '비밀번호를 입력해주세요.', field };
    if (field === 'password') return { message: '비밀번호는 8~64자로 입력해주세요.', field };
    if (field === 'email') return { message: '올바른 이메일을 입력해주세요.', field };
    return { message: issue.msg?.replace(/^Value error, /, '') || '입력 내용을 확인해주세요.', field };
  }
  return { message: '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.', field: null };
}

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = getErrorDetail(data);
    throw new ApiError(detail.message, response.status, detail.field);
  }
  return data;
}

export async function getHealth(signal) {
  const response = await fetch(`${baseUrl}/api/health`, { signal, credentials: 'include' });
  if (!response.ok) throw new Error('API request failed');
  const data = await response.json();
  if (data.status !== 'ok' || data.service !== 'BuildLog API') throw new Error('Unexpected API response');
  return data;
}

export function signupAccount(values) {
  return request('/api/accounts/signup', { method: 'POST', body: JSON.stringify(values) });
}

export function loginAccount(values) {
  return request('/api/accounts/login', { method: 'POST', body: JSON.stringify(values) });
}

export function getCurrentUser() {
  return request('/api/accounts/me');
}

export function changeNickname(nickname) {
  return request('/api/accounts/me/nickname', {
    method: 'PATCH',
    body: JSON.stringify({ nickname }),
  });
}
