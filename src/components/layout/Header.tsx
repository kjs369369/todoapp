// ===================================
// 상단 헤더 컴포넌트
// 왜: 검색바, 테마 토글, 사용자 메뉴, 모바일 메뉴 버튼 제공
// ===================================

import { Search, Menu, Moon, Sun, Flag } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useState } from 'react';
import UserMenu from '../auth/UserMenu';
import type { Priority } from '../../types';

export default function Header() {
  const { theme, toggleTheme, toggleSidebar, filters, setFilters, activeView } =
    useUIStore();
  const [searchFocused, setSearchFocused] = useState(false);

  /** 현재 뷰의 제목 */
  const getTitle = (): string => {
    switch (activeView.type) {
      case 'today': return '오늘';
      case 'tomorrow': return '내일';
      case 'upcoming': return '예정';
      case 'completed': return '완료됨';
      case 'all': return '전체';
      case 'category': return '';
      default: return '';
    }
  };

  return (
    <header className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      {/* 모바일 메뉴 버튼 */}
      <button
        id="menu-toggle"
        onClick={toggleSidebar}
        className="lg:hidden p-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]"
      >
        <Menu size={20} />
      </button>

      {/* 페이지 제목 */}
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] min-w-0 truncate">
        {getTitle()}
      </h2>

      <div className="flex-1" />

      {/* 검색바 */}
      <div
        className={`
          relative flex items-center transition-all duration-200
          ${searchFocused ? 'w-64' : 'w-48'}
        `}
      >
        <Search
          size={16}
          className="absolute left-3 text-[var(--color-text-muted)] pointer-events-none"
        />
        <input
          id="search-input"
          type="text"
          value={filters.searchQuery || ''}
          onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          placeholder="검색..."
          className="w-full bg-[var(--color-bg-tertiary)] rounded-lg pl-9 pr-3 py-2
            text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
            border border-[var(--color-border)] focus:border-[var(--color-accent)]
            outline-none transition-colors"
        />
      </div>

      {/* 우선순위 필터 */}
      <div className="relative">
        <select
          value={filters.priority || ''}
          onChange={(e) =>
            setFilters({
              ...filters,
              priority: (e.target.value || undefined) as Priority | undefined,
            })
          }
          className="appearance-none bg-[var(--color-bg-tertiary)] rounded-lg pl-7 pr-6 py-2
            text-xs text-[var(--color-text-primary)] border border-[var(--color-border)]
            outline-none cursor-pointer hover:border-[var(--color-accent)] transition-colors"
        >
          <option value="">전체 우선순위</option>
          <option value="high">높음</option>
          <option value="medium">중간</option>
          <option value="low">낮음</option>
          <option value="none">없음</option>
        </select>
        <Flag size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
      </div>

      {/* 테마 토글 */}
      <button
        id="theme-toggle"
        onClick={toggleTheme}
        className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]
          hover:text-[var(--color-text-primary)] transition-colors"
        title={theme === 'dark' ? '라이트 모드' : '다크 모드'}
      >
        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* 사용자 메뉴 (로그인/프로필) */}
      <UserMenu />
    </header>
  );
}
