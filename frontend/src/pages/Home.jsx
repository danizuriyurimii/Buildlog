import { Link } from 'react-router-dom';
import { useAuth } from '../App.jsx';

export default function Home() {
  const { user } = useAuth();
  return (
    <section className="home-view">
      <p className="eyebrow">내 기록 홈</p>
      <h1>{user.nickname}님,<br />오늘도 한 걸음 쌓아볼까요?</h1>
      <p className="intro">회원가입과 로그인이 준비되었습니다. 공부 기록, 할 일, 오류 기록은 다음 개발 단계에서 이곳에 연결됩니다.</p>
      <div className="home-grid" aria-label="준비 중인 기록 기능">
        <article><span>01</span><h2>공부 기록</h2><p>오늘 배운 내용을 남기는 공간</p></article>
        <article><span>02</span><h2>할 일</h2><p>앞으로 할 공부와 작업을 정리하는 공간</p></article>
        <article><span>03</span><h2>오류 기록</h2><p>오류와 해결 과정을 모으는 공간</p></article>
      </div>
      <Link className="secondary-button" to="/settings">닉네임 변경하기</Link>
    </section>
  );
}
