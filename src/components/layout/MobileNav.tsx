// ===================================
// 모바일 하단 네비게이션
// 왜: 모바일에서 사이드바 대신 하단 탭으로 네비게이션
// ===================================

import { Sun, Calendar, Plus, List, CheckCircle2 } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export default function MobileNav() {
  const { activeView, setActiveView, setAddFormOpen } = useUIStore();

  const navItems = [
    { type: 'today' as const, label: '오늘', Icon: Sun },
    { type: 'upcoming' as const, label: '예정', Icon: Calendar },
    { type: 'all' as const, label: '전체', Icon: List },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 mobile-nav
      bg-[var(--color-bg-secondary)] border-t border-[var(--color-border)]
      flex items-center justify-around px-2 py-2">
      {navItems.map(({ type, label, Icon }) => (
        <button
          key={type}
          onClick={() => setActiveView({ type })}
          className={`
            flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors
            ${activeView.type === type
              ? 'text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)]'
            }
          `}
        >
          <Icon size={20} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}

      {/* 할 일 추가 버튼 (중앙 강조) */}
      <button
        id="mobile-add-btn"
        onClick={() => setAddFormOpen(true)}
        className="p-3 -mt-6 rounded-full bg-[var(--color-accent)] text-white
          shadow-lg shadow-[var(--color-accent)]/30 hover:bg-[var(--color-accent-hover)]
          transition-all active:scale-95"
      >
        <Plus size={24} />
      </button>

      <button
        onClick={() => setActiveView({ type: 'completed' })}
        className={`
          flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors
          ${activeView.type === 'completed'
            ? 'text-[var(--color-accent)]'
            : 'text-[var(--color-text-muted)]'
          }
        `}
      >
        <CheckCircle2 size={20} />
        <span className="text-[10px] font-medium">완료</span>
      </button>
    </nav>
  );
}
