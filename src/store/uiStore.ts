// ===================================
// UI 상태 관리 (Zustand)
// 왜: 사이드바 토글, 선택된 뷰, 선택된 할 일 등
//     컴포넌트 간 공유해야 하는 UI 상태를 관리
// ===================================

import { create } from 'zustand';
import type { ActiveView, FilterOptions, ThemeMode } from '../types';

interface UIState {
  /** 현재 선택된 뷰 (사이드바) */
  activeView: ActiveView;
  /** 현재 선택된 할 일 ID (상세 패널 표시) */
  selectedTodoId: string | null;
  /** 사이드바 열림/닫힘 (모바일) */
  sidebarOpen: boolean;
  /** 할 일 추가 폼 열림/닫힘 */
  addFormOpen: boolean;
  /** 필터 옵션 */
  filters: FilterOptions;
  /** 테마 */
  theme: ThemeMode;

  // 액션
  setActiveView: (view: ActiveView) => void;
  setSelectedTodoId: (id: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setAddFormOpen: (open: boolean) => void;
  setFilters: (filters: FilterOptions) => void;
  toggleTheme: () => void;
}

/** LocalStorage에서 테마 설정 로드 */
function loadTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem('todoapp_theme');
    return (saved as ThemeMode) || 'dark';
  } catch {
    return 'dark';
  }
}

export const useUIStore = create<UIState>((set, get) => ({
  activeView: { type: 'today' },
  selectedTodoId: null,
  sidebarOpen: false,
  addFormOpen: false,
  filters: {},
  theme: loadTheme(),

  setActiveView: (view) => {
    set({ activeView: view, selectedTodoId: null });
    // 모바일에서 뷰 변경 시 사이드바 닫기
    set({ sidebarOpen: false });
  },

  setSelectedTodoId: (id) => set({ selectedTodoId: id }),

  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setAddFormOpen: (open) => set({ addFormOpen: open }),

  setFilters: (filters) => set({ filters }),

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    set({ theme: next });
    localStorage.setItem('todoapp_theme', next);
  },
}));
