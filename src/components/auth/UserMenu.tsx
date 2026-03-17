// ===================================
// 사용자 프로필 메뉴 (헤더에 표시)
// 왜: 로그인 상태 표시 + 로그아웃 기능
// ===================================

import { useState, useRef, useEffect } from 'react';
import { LogIn, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function UserMenu() {
  const { user, login, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 비로그인 상태
  if (!user) {
    return (
      <button
        onClick={() => login()}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg
          text-xs font-medium text-[var(--color-accent)]
          border border-[var(--color-accent)]/30 hover:bg-[var(--color-accent-light)]
          transition-colors"
      >
        <LogIn size={14} />
        로그인
      </button>
    );
  }

  return (
    <div ref={menuRef} className="relative">
      {/* 프로필 아바타 */}
      <button
        id="user-menu-btn"
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-8 h-8 rounded-full overflow-hidden border-2 border-transparent
          hover:border-[var(--color-accent)] transition-colors"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={user.displayName || '프로필'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[var(--color-accent)] flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
        )}
      </button>

      {/* 드롭다운 메뉴 */}
      {menuOpen && (
        <div className="absolute right-0 top-10 w-56 glass-card shadow-[var(--shadow-popup)] py-2 z-50 fade-in">
          {/* 사용자 정보 */}
          <div className="px-4 py-2 border-b border-[var(--color-border)]">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">
              {user.email}
            </p>
          </div>

          {/* 동기화 상태 */}
          <div className="px-4 py-2 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-success)] animate-pulse" />
              <span className="text-xs text-[var(--color-text-secondary)]">
                클라우드 동기화 중
              </span>
            </div>
          </div>

          {/* 로그아웃 */}
          <button
            onClick={() => {
              logout();
              setMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-secondary)]
              hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-danger)] transition-colors"
          >
            <LogOut size={16} />
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
