import { createContext, useContext, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { getCurrentUser } from './api/client.js';
import Home from './pages/Home.jsx';
import Login from './pages/accounts/Login.jsx';
import Settings from './pages/accounts/Settings.jsx';
import Signup from './pages/accounts/Signup.jsx';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((currentUser) => { if (active) setUser(currentUser); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  return <AuthContext.Provider value={{ user, setUser, loading }}>{children}</AuthContext.Provider>;
}

function PageShell({ children }) {
  const { user } = useAuth();
  return (
    <div className="shell">
      <header>
        <Link className="brand" to={user ? '/' : '/login'}>BuildLog<span className="brand-dot">.</span></Link>
        {user ? (
          <nav aria-label="주요 메뉴">
            <span className="user-name">{user.nickname}</span>
            <Link className="text-link" to="/settings">계정 설정</Link>
          </nav>
        ) : <span className="phase">회원 기능 · Phase 3</span>}
      </header>
      <main>{children}</main>
      <footer>BuildLog <span>한 걸음씩, 꾸준히.</span></footer>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageShell><p role="status" className="loading">로그인 상태를 확인하고 있습니다…</p></PageShell>;
  return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageShell><p role="status" className="loading">로그인 상태를 확인하고 있습니다…</p></PageShell>;
  return user ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/signup" element={<GuestRoute><PageShell><Signup /></PageShell></GuestRoute>} />
      <Route path="/login" element={<GuestRoute><PageShell><Login /></PageShell></GuestRoute>} />
      <Route path="/settings" element={<ProtectedRoute><PageShell><Settings /></PageShell></ProtectedRoute>} />
      <Route path="/" element={<ProtectedRoute><PageShell><Home /></PageShell></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AuthProvider><AppRoutes /></AuthProvider>;
}
