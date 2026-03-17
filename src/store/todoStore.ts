// ===================================
// 할 일 상태 관리 (Zustand)
// 왜: LocalStorage(비로그인) / Firestore(로그인) 이중 모드 지원
//     로그인 시 실시간 동기화, 비로그인 시 로컬 저장
// ===================================

import { create } from 'zustand';
import type { Todo, Priority, Reference, RecurringConfig } from '../types';
import { loadTodos, saveTodos } from '../services/localStorageService';
import {
  subscribeTodos,
  addTodoToFirestore,
  updateTodoInFirestore,
  deleteTodoFromFirestore,
  migrateTodosToFirestore,
} from '../services/firestoreService';
import { generateId } from '../utils/idUtils';
import { getNextRecurringDate } from '../utils/dateUtils';

interface TodoState {
  todos: Todo[];
  /** 현재 Firestore 모드인지 여부 */
  firestoreMode: boolean;
  /** Firestore 구독 해제 함수 */
  _unsubscribe: (() => void) | null;

  /** 앱 시작 시 LocalStorage에서 데이터 로드 */
  loadFromStorage: () => void;
  /** Firestore 실시간 구독 시작 + LocalStorage 마이그레이션 */
  startFirestoreSync: (uid: string) => void;
  /** Firestore 구독 해제 → LocalStorage 모드로 복귀 */
  stopFirestoreSync: () => void;
  /** 새 할 일 추가 */
  addTodo: (params: {
    title: string;
    description?: string;
    priority?: Priority;
    categoryId?: string;
    tags?: string[];
    dueDate?: string;
    recurring?: RecurringConfig;
    references?: Reference[];
  }) => void;
  /** 할 일 수정 */
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  /** 할 일 삭제 */
  deleteTodo: (id: string) => void;
  /** 완료 토글 (반복 작업이면 다음 반복 자동 생성) */
  toggleComplete: (id: string) => void;
  /** 드래그앤드롭으로 순서 변경 */
  reorderTodos: (reorderedIds: string[]) => void;
}

import { auth } from '../services/firebase';

/** 현재 로그인한 사용자 UID를 가져오는 헬퍼 */
function getUid(): string | null {
  return auth?.currentUser?.uid || null;
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  firestoreMode: false,
  _unsubscribe: null,

  loadFromStorage: () => {
    const todos = loadTodos();
    set({ todos });
  },

  startFirestoreSync: (uid: string) => {
    // 기존 구독 해제
    const { _unsubscribe, todos: localTodos } = get();
    if (_unsubscribe) _unsubscribe();

    // LocalStorage에 데이터가 있으면 Firestore로 마이그레이션
    if (localTodos.length > 0) {
      migrateTodosToFirestore(uid, localTodos)
        .then(() => {
          // 마이그레이션 성공 후 LocalStorage 정리
          saveTodos([]);
          console.log('할 일 마이그레이션 완료');
        })
        .catch((err) => console.error('마이그레이션 실패:', err));
    }

    // Firestore 실시간 구독 시작
    const unsubscribe = subscribeTodos(uid, (todos) => {
      set({ todos });
    });

    set({ firestoreMode: true, _unsubscribe: unsubscribe });
  },

  stopFirestoreSync: () => {
    const { _unsubscribe } = get();
    if (_unsubscribe) _unsubscribe();
    set({ firestoreMode: false, _unsubscribe: null, todos: [] });
    // LocalStorage에서 다시 로드
    const todos = loadTodos();
    set({ todos });
  },

  addTodo: (params) => {
    const { todos, firestoreMode } = get();
    const now = new Date().toISOString();
    const uid = getUid();

    const newTodoData = {
      title: params.title,
      description: params.description || '',
      completed: false,
      priority: params.priority || 'none' as Priority,
      categoryId: params.categoryId || 'inbox',
      tags: params.tags || [],
      dueDate: params.dueDate,
      recurring: params.recurring,
      references: params.references || [],
      sortOrder: todos.length,
      createdAt: now,
      updatedAt: now,
    };

    if (firestoreMode && uid) {
      // Firestore 모드: Firestore에 추가 → onSnapshot이 자동 반영
      addTodoToFirestore(uid, newTodoData).catch((err) =>
        console.error('할 일 추가 실패:', err)
      );
    } else {
      // LocalStorage 모드
      const newTodo: Todo = { id: generateId(), ...newTodoData };
      const updated = [...todos, newTodo];
      set({ todos: updated });
      saveTodos(updated);
    }
  },

  updateTodo: (id, updates) => {
    const { todos, firestoreMode } = get();
    const uid = getUid();

    if (firestoreMode && uid) {
      updateTodoInFirestore(uid, id, updates).catch((err) =>
        console.error('할 일 수정 실패:', err)
      );
    } else {
      const updated = todos.map((todo) =>
        todo.id === id
          ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
          : todo
      );
      set({ todos: updated });
      saveTodos(updated);
    }
  },

  deleteTodo: (id) => {
    const { todos, firestoreMode } = get();
    const uid = getUid();

    if (firestoreMode && uid) {
      deleteTodoFromFirestore(uid, id).catch((err) =>
        console.error('할 일 삭제 실패:', err)
      );
    } else {
      const updated = todos.filter((todo) => todo.id !== id);
      set({ todos: updated });
      saveTodos(updated);
    }
  },

  toggleComplete: (id) => {
    const { todos, addTodo, firestoreMode } = get();
    const uid = getUid();
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;

    const now = new Date().toISOString();
    const newCompleted = !todo.completed;

    // 완료로 변경 + 반복 작업이면 다음 반복 자동 생성
    if (newCompleted && todo.recurring && todo.dueDate) {
      const nextDate = getNextRecurringDate(todo.dueDate, todo.recurring);
      if (nextDate) {
        addTodo({
          title: todo.title,
          description: todo.description,
          priority: todo.priority,
          categoryId: todo.categoryId,
          tags: todo.tags,
          dueDate: nextDate,
          recurring: todo.recurring,
          references: todo.references,
        });
      }
    }

    const updates = {
      completed: newCompleted,
      completedAt: newCompleted ? now : undefined,
      updatedAt: now,
    };

    if (firestoreMode && uid) {
      updateTodoInFirestore(uid, id, updates).catch((err) =>
        console.error('완료 토글 실패:', err)
      );
    } else {
      const updated = todos.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      set({ todos: updated });
      saveTodos(updated);
    }
  },

  reorderTodos: (reorderedIds) => {
    const { todos, firestoreMode } = get();
    const uid = getUid();

    const reordered = reorderedIds
      .map((id, index) => {
        const todo = todos.find((t) => t.id === id);
        return todo ? { ...todo, sortOrder: index } : null;
      })
      .filter((t): t is Todo => t !== null);

    const otherTodos = todos.filter((t) => !reorderedIds.includes(t.id));
    const allTodos = [...reordered, ...otherTodos];

    // 로컬 state 즉시 반영 (Firestore 모드에서도 UI 튕김 방지)
    set({ todos: allTodos });

    if (firestoreMode && uid) {
      reordered.forEach((todo) => {
        updateTodoInFirestore(uid, todo.id, { sortOrder: todo.sortOrder }).catch(
          (err) => console.error('순서 변경 실패:', err)
        );
      });
    } else {
      saveTodos(allTodos);
    }
  },
}));
