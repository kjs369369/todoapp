// ===================================
// 카테고리 상태 관리 (Zustand)
// 왜: LocalStorage(비로그인) / Firestore(로그인) 이중 모드 지원
// ===================================

import { create } from 'zustand';
import type { Category } from '../types';
import {
  loadCategories,
  saveCategories,
} from '../services/localStorageService';
import {
  subscribeCategories,
  addCategoryToFirestore,
  updateCategoryInFirestore,
  deleteCategoryFromFirestore,
  migrateCategoriesToFirestore,
} from '../services/firestoreService';
import { generateId } from '../utils/idUtils';

interface CategoryState {
  categories: Category[];
  firestoreMode: boolean;
  _unsubscribe: (() => void) | null;

  loadFromStorage: () => void;
  startFirestoreSync: (uid: string) => void;
  stopFirestoreSync: () => void;
  addCategory: (name: string, color: string, icon?: string) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (reorderedIds: string[]) => void;
}

import { auth } from '../services/firebase';

function getUid(): string | null {
  return auth?.currentUser?.uid || null;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  firestoreMode: false,
  _unsubscribe: null,

  loadFromStorage: () => {
    const categories = loadCategories();
    set({ categories });
  },

  startFirestoreSync: (uid: string) => {
    const { _unsubscribe, categories: localCategories } = get();
    if (_unsubscribe) _unsubscribe();

    // LocalStorage → Firestore 마이그레이션
    if (localCategories.length > 0) {
      migrateCategoriesToFirestore(uid, localCategories)
        .then(() => {
          saveCategories([]);
          console.log('카테고리 마이그레이션 완료');
        })
        .catch((err) => console.error('카테고리 마이그레이션 실패:', err));
    }

    const unsubscribe = subscribeCategories(uid, (categories) => {
      set({ categories });
    });

    set({ firestoreMode: true, _unsubscribe: unsubscribe });
  },

  stopFirestoreSync: () => {
    const { _unsubscribe } = get();
    if (_unsubscribe) _unsubscribe();
    set({ firestoreMode: false, _unsubscribe: null, categories: [] });
    const categories = loadCategories();
    set({ categories });
  },

  addCategory: (name, color, icon) => {
    const { categories, firestoreMode } = get();
    const uid = getUid();

    const newCatData = {
      name,
      color,
      icon,
      sortOrder: categories.length,
    };

    if (firestoreMode && uid) {
      addCategoryToFirestore(uid, newCatData).catch((err) =>
        console.error('카테고리 추가 실패:', err)
      );
    } else {
      const newCategory: Category = { id: generateId(), ...newCatData };
      const updated = [...categories, newCategory];
      set({ categories: updated });
      saveCategories(updated);
    }
  },

  updateCategory: (id, updates) => {
    const { categories, firestoreMode } = get();
    const uid = getUid();

    if (firestoreMode && uid) {
      updateCategoryInFirestore(uid, id, updates).catch((err) =>
        console.error('카테고리 수정 실패:', err)
      );
    } else {
      const updated = categories.map((cat) =>
        cat.id === id ? { ...cat, ...updates } : cat
      );
      set({ categories: updated });
      saveCategories(updated);
    }
  },

  deleteCategory: (id) => {
    if (id === 'inbox') return;
    const { categories, firestoreMode } = get();
    const uid = getUid();

    if (firestoreMode && uid) {
      deleteCategoryFromFirestore(uid, id).catch((err) =>
        console.error('카테고리 삭제 실패:', err)
      );
    } else {
      const updated = categories.filter((cat) => cat.id !== id);
      set({ categories: updated });
      saveCategories(updated);
    }
  },

  reorderCategories: (reorderedIds) => {
    const { categories, firestoreMode } = get();
    const uid = getUid();
    const updated = reorderedIds
      .map((id, index) => {
        const cat = categories.find((c) => c.id === id);
        return cat ? { ...cat, sortOrder: index } : null;
      })
      .filter((c): c is Category => c !== null);

    // 로컬 state 즉시 반영 (Firestore 모드에서도 UI 튕김 방지)
    set({ categories: updated });

    if (firestoreMode && uid) {
      updated.forEach((cat) => {
        updateCategoryInFirestore(uid, cat.id, { sortOrder: cat.sortOrder }).catch(
          (err) => console.error('순서 변경 실패:', err)
        );
      });
    } else {
      saveCategories(updated);
    }
  },
}));
