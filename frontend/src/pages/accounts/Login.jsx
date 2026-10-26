import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginAccount } from '../../api/client.js';
import { useAuth } from '../../App.jsx';
import AccountForm from './AccountForm.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const user = await loginAccount(form);
      setUser(user);
      navigate('/', { replace: true });
    } catch (requestError) {
      setForm((current) => ({ ...current, password: '' }));
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AccountForm title="로그인" description="내 기록을 이어서 관리하세요." onSubmit={submit} submitting={submitting} error={error} footer={<p className="form-footer">처음 사용하시나요? <Link to="/signup">회원가입</Link></p>}>
      {location.state?.message && <p className="form-success" role="status">{location.state.message}</p>}
      <label>이메일<input name="email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} autoComplete="email" required /></label>
      <label>비밀번호<input name="password" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} autoComplete="current-password" maxLength="64" required /></label>
    </AccountForm>
  );
}
