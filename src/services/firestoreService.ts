// ===================================
// Firestore 기반 할 일 CRUD 서비스
// 왜: Phase 2에서 LocalStorage를 대체하여
//     실시간 다기기 동기화를 구현
//     Firebase 미설정 시 모든 함수가 에러를 던짐 (호출 전 체크 필요)
// ===================================

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  setDoc,
  type Unsubscribe,
  type Firestore,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Todo, Category } from '../types';

/**
 * Firestore 인스턴스를 안전하게 가져오는 헬퍼
 * 왜: firebase.ts에서 db가 null일 수 있으므로 (Firebase 미설정 시)
 *     null이면 명확한 에러를 던져서 디버깅 용이하게 함
 */
function getDb(): Firestore {
  if (!db) throw new Error('Firestore가 초기화되지 않았습니다.');
  return db;
}

// --- 유저 문서 ---

/** 사용자 프로필을 Firestore에 저장/업데이트 */
export async function saveUserProfile(uid: string, data: {
  email: string;
  displayName: string;
  photoURL: string;
}): Promise<void> {
  const firestore = getDb();
  const userRef = doc(firestore, 'users', uid);
  await setDoc(userRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}

// --- Todos ---

/** 할 일 컬렉션 참조 */
function todosCollection(uid: string) {
  return collection(getDb(), 'users', uid, 'todos');
}

/** 실시간 할 일 목록 구독 */
export function subscribeTodos(
  uid: string,
  callback: (todos: Todo[]) => void
): Unsubscribe {
  const q = query(todosCollection(uid), orderBy('sortOrder', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const todos: Todo[] = snapshot.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    })) as Todo[];
    callback(todos);
  });
}

/** 할 일 추가 (Firestore에 자동 ID 발급) */
export async function addTodoToFirestore(
  uid: string,
  todo: Omit<Todo, 'id'>
): Promise<string> {
  const docRef = await addDoc(todosCollection(uid), todo);
  return docRef.id;
}

/** 할 일 수정 */
export async function updateTodoInFirestore(
  uid: string,
  todoId: string,
  updates: Partial<Todo>
): Promise<void> {
  const todoRef = doc(getDb(), 'users', uid, 'todos', todoId);
  await updateDoc(todoRef, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

/** 할 일 삭제 */
export async function deleteTodoFromFirestore(
  uid: string,
  todoId: string
): Promise<void> {
  const todoRef = doc(getDb(), 'users', uid, 'todos', todoId);
  await deleteDoc(todoRef);
}

/** LocalStorage 데이터를 Firestore로 마이그레이션 */
export async function migrateTodosToFirestore(
  uid: string,
  todos: Todo[]
): Promise<void> {
  if (todos.length === 0) return;
  const firestore = getDb();
  const batch = writeBatch(firestore);
  for (const todo of todos) {
    const todoRef = doc(todosCollection(uid), todo.id);
    const { id: _id, ...data } = todo;
    batch.set(todoRef, data);
  }
  await batch.commit();
}

// --- Categories ---

/** 카테고리 컬렉션 참조 */
function categoriesCollection(uid: string) {
  return collection(getDb(), 'users', uid, 'categories');
}

/** 실시간 카테고리 목록 구독 */
export function subscribeCategories(
  uid: string,
  callback: (categories: Category[]) => void
): Unsubscribe {
  const q = query(categoriesCollection(uid), orderBy('sortOrder', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const categories: Category[] = snapshot.docs.map((d) => ({
      ...d.data(),
      id: d.id,
    })) as Category[];
    callback(categories);
  });
}

/** 카테고리 추가 */
export async function addCategoryToFirestore(
  uid: string,
  category: Omit<Category, 'id'>
): Promise<string> {
  const docRef = await addDoc(categoriesCollection(uid), category);
  return docRef.id;
}

/** 카테고리 수정 */
export async function updateCategoryInFirestore(
  uid: string,
  categoryId: string,
  updates: Partial<Category>
): Promise<void> {
  const catRef = doc(getDb(), 'users', uid, 'categories', categoryId);
  await updateDoc(catRef, updates);
}

/** 카테고리 삭제 */
export async function deleteCategoryFromFirestore(
  uid: string,
  categoryId: string
): Promise<void> {
  const catRef = doc(getDb(), 'users', uid, 'categories', categoryId);
  await deleteDoc(catRef);
}

/** LocalStorage 카테고리를 Firestore로 마이그레이션 */
export async function migrateCategoriesToFirestore(
  uid: string,
  categories: Category[]
): Promise<void> {
  if (categories.length === 0) return;
  const firestore = getDb();
  const batch = writeBatch(firestore);
  for (const category of categories) {
    const catRef = doc(categoriesCollection(uid), category.id);
    const { id: _id, ...data } = category;
    batch.set(catRef, data);
  }
  await batch.commit();
}
