// ===================================
// 로그인 페이지 컴포넌트
// 왜: Firebase 구글 로그인 UI 제공
//     로그인 없이도 로컬 모드로 사용 가능하도록 안내
// ===================================

import { MonitorSmartphone, Wifi } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const { login, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    clearError();
    await login();
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg-primary)] px-4">
      <div className="w-full max-w-md text-center">
        {/* 로고 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-accent)] mb-2 tracking-tight">
            ✅ TodoFlow
          </h1>
          <p className="text-[var(--color-text-secondary)] text-sm">
            스마트한 할 일 관리
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="glass-card p-8 space-y-6">
          {/* 기능 설명 */}
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <MonitorSmartphone size={18} className="text-[var(--color-accent)] shrink-0" />
              <span>다른 기기에서도 동일한 할 일 목록 접근</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <Wifi size={18} className="text-[var(--color-accent)] shrink-0" />
              <span>실시간 클라우드 동기화</span>
            </div>
          </div>

          {/* 구글 로그인 버튼 */}
          <button
            id="google-login-btn"
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4
              bg-white text-gray-800 rounded-xl font-medium text-sm
              hover:bg-gray-100 transition-colors shadow-lg
              active:scale-[0.98] transform"
          >
            {/* 구글 아이콘 */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google로 로그인
          </button>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-sm text-[var(--color-danger)] bg-[var(--color-danger)]/10 rounded-lg p-2">
              {error}
            </p>
          )}
        </div>

        {/* 로컬 모드 안내 */}
        <p className="mt-6 text-xs text-[var(--color-text-muted)]">
          로그인 없이도 로컬 모드로 사용할 수 있습니다.
          <br />
          단, 데이터가 이 브라우저에만 저장됩니다.
        </p>
      </div>
    </div>
  );
}
