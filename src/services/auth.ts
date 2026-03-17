// ===================================
// Firebase 인증 서비스
// 왜: 구글 간편 로그인으로 다기기 동기화 지원
//     Firebase 미설정 시 모든 함수가 안전하게 no-op 처리
// ===================================

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth, firebaseEnabled } from './firebase';

const googleProvider = new GoogleAuthProvider();

/** 구글 팝업 로그인 */
export async function signInWithGoogle(): Promise<User> {
  if (!firebaseEnabled || !auth) {
    throw new Error('Firebase가 설정되지 않았습니다.');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: unknown) {
    // 사용자가 팝업을 닫은 경우 조용히 처리
    const firebaseError = error as { code?: string; message?: string };
    if (firebaseError.code === 'auth/popup-closed-by-user') {
      throw new Error('로그인이 취소되었습니다.');
    }
    console.error('구글 로그인 실패:', error);
    throw new Error('로그인에 실패했습니다. 다시 시도해 주세요.');
  }
}

/** 로그아웃 */
export async function signOut(): Promise<void> {
  if (!firebaseEnabled || !auth) return;
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw new Error('로그아웃에 실패했습니다.');
  }
}

/** 인증 상태 변화 구독 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!firebaseEnabled || !auth) {
    // Firebase 미설정 시 즉시 null 콜백 후 빈 해제 함수 반환
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/** 현재 로그인된 사용자 반환 */
export function getCurrentUser(): User | null {
  if (!firebaseEnabled || !auth) return null;
  return auth.currentUser;
}
