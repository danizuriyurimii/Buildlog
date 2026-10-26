import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import App from './App.jsx';

function response(status, data) {
  return Promise.resolve({ ok: status >= 200 && status < 300, status, json: async () => data });
}

function renderPath(path) {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);
}

afterEach(() => vi.unstubAllGlobals());

test('redirects an anonymous user from the private home to login', async () => {
  vi.stubGlobal('fetch', vi.fn().mockImplementation(() => response(401, { detail: '로그인이 필요합니다.' })));
  renderPath('/');
  expect(await screen.findByRole('heading', { name: '로그인' })).toBeInTheDocument();
});

test('signup failure keeps email and nickname but clears password', async () => {
  const fetchMock = vi.fn()
    .mockImplementationOnce(() => response(401, { detail: '로그인이 필요합니다.' }))
    .mockImplementationOnce(() => response(409, { detail: { field: 'email', message: '이미 사용 중인 이메일입니다.' } }));
  vi.stubGlobal('fetch', fetchMock);
  renderPath('/signup');

  fireEvent.change(await screen.findByLabelText('이메일'), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByLabelText(/비밀번호/), { target: { value: 'a'.repeat(12) } });
  fireEvent.change(screen.getByLabelText(/닉네임/), { target: { value: '학습자' } });
  fireEvent.click(screen.getByRole('button', { name: '회원가입' }));

  expect(await screen.findByRole('alert')).toHaveTextContent('이미 사용 중인 이메일입니다.');
  expect(screen.getByLabelText('이메일')).toHaveValue('user@example.com');
  expect(screen.getByLabelText(/닉네임/)).toHaveValue('학습자');
  expect(screen.getByLabelText(/비밀번호/)).toHaveValue('');
});

test('successful login opens the private home', async () => {
  const user = { id: 1, email: 'user@example.com', nickname: '학습자' };
  const fetchMock = vi.fn()
    .mockImplementationOnce(() => response(401, { detail: '로그인이 필요합니다.' }))
    .mockImplementationOnce(() => response(200, user));
  vi.stubGlobal('fetch', fetchMock);
  renderPath('/login');

  fireEvent.change(await screen.findByLabelText('이메일'), { target: { value: 'user@example.com' } });
  fireEvent.change(screen.getByLabelText('비밀번호'), { target: { value: 'a'.repeat(12) } });
  fireEvent.click(screen.getByRole('button', { name: '로그인' }));

  expect(await screen.findByText(/학습자님/)).toBeInTheDocument();
  expect(fetchMock.mock.calls[1][1].credentials).toBe('include');
});

test('logged-in user can change their nickname', async () => {
  const user = { id: 1, email: 'user@example.com', nickname: '기존닉네임' };
  const changed = { ...user, nickname: '새닉네임' };
  const fetchMock = vi.fn()
    .mockImplementationOnce(() => response(200, user))
    .mockImplementationOnce(() => response(200, changed));
  vi.stubGlobal('fetch', fetchMock);
  renderPath('/settings');

  const nicknameInput = await screen.findByLabelText(/새 닉네임/);
  fireEvent.change(nicknameInput, { target: { value: '새닉네임' } });
  fireEvent.click(screen.getByRole('button', { name: '변경' }));

  expect(await screen.findByRole('status')).toHaveTextContent('닉네임을 변경했습니다.');
  await waitFor(() => expect(screen.getByText('새닉네임')).toBeInTheDocument());
});
