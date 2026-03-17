// ===================================
// 메인 앱 컴포넌트
// 왜: 인증 상태에 따라 로그인/메인 화면 분기
//     로그인 시 Firestore 동기화, 비로그인 시 LocalStorage
// ===================================

import { useEffect } from 'react';
import { useTodoStore } from './store/todoStore';
import { useCategoryStore } from './store/categoryStore';
import { useUIStore } from './store/uiStore';
import { useAuthStore } from './store/authStore';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import TodoList from './components/todo/TodoList';
import TodoDetail from './components/todo/TodoDetail';

export default function App() {
  const { loadFromStorage: loadTodos, startFirestoreSync: startTodoSync, stopFirestoreSync: stopTodoSync } = useTodoStore();
  const { loadFromStorage: loadCategories, startFirestoreSync: startCatSync, stopFirestoreSync: stopCatSync } = useCategoryStore();
  const { theme, selectedTodoId } = useUIStore();
  const { user, loading, initAuth } = useAuthStore();

  // Firebase Auth 상태 구독 시작
  useEffect(() => {
    const unsubscribe = initAuth();
    return () => unsubscribe();
  }, [initAuth]);

  // 인증 상태에 따라 데이터 소스 전환
  useEffect(() => {
    if (loading) return; // 인증 로딩 중에는 대기

    if (user) {
      // 로그인 → Firestore 실시간 동기화 시작
      startTodoSync(user.uid);
      startCatSync(user.uid);
    } else {
      // 비로그인 → LocalStorage에서 로드
      stopTodoSync();
      stopCatSync();
      loadTodos();
      loadCategories();
    }
  }, [user, loading]);

  // 테마 적용
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
  }, [theme]);

  // 인증 로딩 중 스플래시 화면
  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[var(--color-bg-primary)]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[var(--color-accent)] mb-3">✅ TodoFlow</h1>
          <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--color-bg-primary)]">
      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 영역 */}
      <main className="flex-1 flex flex-col min-w-0">
        <Header />

        <div className="flex-1 flex overflow-hidden">
          {/* 할 일 목록 */}
          <TodoList />

          {/* 할 일 상세 패널 (데스크톱에서만, 선택 시 표시) */}
          {selectedTodoId && (
            <div className="hidden lg:block w-[var(--width-detail)] shrink-0">
              <TodoDetail />
            </div>
          )}
        </div>
      </main>

      {/* 모바일 하단 네비게이션 */}
      <MobileNav />

      {/* 모바일에서 상세 패널 (모달) */}
      {selectedTodoId && (
        <div className="lg:hidden fixed inset-0 z-50 bg-[var(--color-bg-primary)]">
          <TodoDetail />
        </div>
      )}
    </div>
  );
}
