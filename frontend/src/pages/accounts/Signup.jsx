import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupAccount } from '../../api/client.js';
import AccountForm from './AccountForm.jsx';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', nickname: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await signupAccount(form);
      navigate('/login', { replace: true, state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' } });
    } catch (requestError) {
      setForm((current) => ({ ...current, password: '' }));
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AccountForm title="회원가입" description="공부와 해결 과정을 안전하게 모아보세요." onSubmit={submit} submitting={submitting} error={error} footer={<p className="form-footer">이미 계정이 있나요? <Link to="/login">로그인</Link></p>}>
      <label>이메일<input name="email" type="email" value={form.email} onChange={update} autoComplete="email" required /></label>
      <label>비밀번호<span>8~64자</span><input name="password" type="password" value={form.password} onChange={update} autoComplete="new-password" minLength="8" maxLength="64" required /></label>
      <label>닉네임<span>한글·영문·숫자·밑줄, 2~20자</span><input name="nickname" value={form.nickname} onChange={update} autoComplete="nickname" minLength="2" maxLength="20" required /></label>
    </AccountForm>
  );
}
