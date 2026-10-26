import { useState } from 'react';
import { changeNickname } from '../../api/client.js';
import { useAuth } from '../../App.jsx';

export default function Settings() {
  const { user, setUser } = useAuth();
  const [nickname, setNickname] = useState(user.nickname);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const updatedUser = await changeNickname(nickname);
      setUser(updatedUser);
      setNickname(updatedUser.nickname);
      setMessage('닉네임을 변경했습니다.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="account-view settings-view">
      <div className="account-heading"><p className="eyebrow">계정 설정</p><h1>닉네임 변경</h1><p className="intro">공개 기록과 댓글에는 현재 닉네임이 표시됩니다.</p></div>
      <form className="account-card" onSubmit={submit} noValidate>
        <p className="account-email">가입 이메일 <strong>{user.email}</strong></p>
        <label>새 닉네임<span>한글·영문·숫자·밑줄, 2~20자</span><input value={nickname} onChange={(event) => setNickname(event.target.value)} minLength="2" maxLength="20" required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p className="form-success" role="status">{message}</p>}
        <button className="primary-button" type="submit" disabled={submitting}>{submitting ? '변경 중…' : '변경'}</button>
      </form>
    </section>
  );
}
