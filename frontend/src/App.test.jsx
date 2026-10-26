import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import App from './App.jsx';

afterEach(() => vi.unstubAllGlobals());

test('shows successful API connection', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({status: 'ok', service: 'BuildLog API'}) });
  vi.stubGlobal('fetch', fetchMock);
  render(<App />);
  expect(await screen.findByText('FastAPI 서버 연결 완료')).toBeInTheDocument();
  expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:8000/api/health');
});

test('can retry after network failure', async () => {
  const fetchMock = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ok: true, json: async () => ({status:'ok', service:'BuildLog API'})});
  vi.stubGlobal('fetch', fetchMock);
  render(<App />);
  expect(await screen.findByText('서버에 연결할 수 없습니다')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', {name: '다시 확인'}));
  await waitFor(() => expect(screen.getByText('FastAPI 서버 연결 완료')).toBeInTheDocument());
});

test('rejects an unexpected API payload', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ok: true, json: async () => ({status:'broken'})}));
  render(<App />);
  expect(await screen.findByText('서버에 연결할 수 없습니다')).toBeInTheDocument();
});
