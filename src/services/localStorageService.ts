// ===================================
// LocalStorage 기반 데이터 저장 서비스
// 왜: Phase 1에서는 Firebase 없이 로컬에 저장
//     Phase 2에서 Firestore로 교체할 예정
// ===================================

import type { Todo, Category } from '../types';

const TODOS_KEY = 'todoapp_todos';
const CATEGORIES_KEY = 'todoapp_categories';

/** 기본 카테고리 목록 (앱 첫 실행 시 자동 생성) */
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'inbox', name: '받은 편지함', color: '#7c5cfc', icon: 'Inbox', sortOrder: 0 },
  { id: 'work', name: '업무', color: '#3b82f6', icon: 'Briefcase', sortOrder: 1 },
  { id: 'personal', name: '개인', color: '#10b981', icon: 'User', sortOrder: 2 },
  { id: 'shopping', name: '쇼핑', color: '#f59e0b', icon: 'ShoppingCart', sortOrder: 3 },
];

// --- Todos ---

export function loadTodos(): Todo[] {
  try {
    const data = localStorage.getItem(TODOS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('할 일 로드 실패:', error);
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  try {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  } catch (error) {
    console.error('할 일 저장 실패:', error);
  }
}

// --- Categories ---

export function loadCategories(): Category[] {
  try {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (data) return JSON.parse(data);
    // 첫 실행: 기본 카테고리 생성
    saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('카테고리 로드 실패:', error);
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  } catch (error) {
    console.error('카테고리 저장 실패:', error);
  }
}
