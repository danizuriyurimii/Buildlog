import { useEffect, useState } from 'react';
import { getHealth } from './api/client.js';

export default function App() {
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setStatus('loading');
    const timer = setTimeout(() => controller.abort(), 8000);
    getHealth(controller.signal)
      .then(() => { if (!controller.signal.aborted) setStatus('connected'); })
      .catch(() => { if (active) setStatus('error'); })
      .finally(() => clearTimeout(timer));
    return () => { active = false; controller.abort(); clearTimeout(timer); };
  }, [attempt]);

  return (
    <div className="shell">
      <header><a className="brand" href="/">BuildLog<span className="brand-dot">.</span></a><span className="phase">개발 준비 · Phase 1</span></header>
      <main>
        <p className="eyebrow">배움이 쌓이는 곳</p>
        <h1>오늘의 배움이,<br />내일의 발판이 되도록.</h1>
        <p className="intro">공부한 내용과 해결한 오류를 한곳에.<br />BuildLog의 첫 화면을 준비하고 있습니다.</p>
        <section className="connection" aria-labelledby="connection-title">
          <div><p className="label">개발 환경 확인</p><h2 id="connection-title">서버 연결 상태</h2></div>
          <div role="status" aria-live="polite" className={`status ${status}`}>
            <span className="indicator" aria-hidden="true" />
            {status === 'loading' ? '서버 연결 확인 중…' : status === 'connected' ? 'FastAPI 서버 연결 완료' : '서버에 연결할 수 없습니다'}
          </div>
          {status === 'error' && <div className="error-help"><p>백엔드 서버가 실행 중인지 확인한 뒤 다시 시도해주세요.</p><button onClick={() => setAttempt(value => value + 1)}>다시 확인</button></div>}
        </section>
        <p className="note">현재는 화면과 서버의 연결을 확인하는 단계입니다.<br />회원 기능과 기록 저장은 다음 단계에서 추가됩니다.</p>
      </main>
      <footer>BuildLog <span>한 걸음씩, 꾸준히.</span></footer>
    </div>
  );
}
