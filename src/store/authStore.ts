// ===================================
// 인증 상태 관리 (Zustand)
// 왜: 로그인 상태를 전역으로 관리하고
//     로그인 시 Firestore로 자동 전환
//     Firebase 미설정 시 비로그인 모드로 즉시 전환
// ===================================

import { create } from 'zustand';
import type { User } from 'firebase/auth';
import {
  signInWithGoogle,
  signOut as authSignOut,
  onAuthChange,
} from '../services/auth';
import { saveUserProfile } from '../services/firestoreService';
import { firebaseEnabled } from '../services/firebase';

interface AuthState {
  /** 현재 로그인 사용자 (null이면 비로그인) */
  user: User | null;
  /** 인증 상태 로딩 중 */
  loading: boolean;
  /** 에러 메시지 */
  error: string | null;

  /** 인증 상태 구독 시작 (앱 시작 시 호출) */
  initAuth: () => () => void;
  /** 구글 로그인 */
  login: () => Promise<void>;
  /** 로그아웃 */
  logout: () => Promise<void>;
  /** 에러 초기화 */
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  initAuth: () => {
    if (!firebaseEnabled) {
      // Firebase 미설정 → 즉시 비로그인 모드
      set({ user: null, loading: false });
      return () => {};
    }

    // Firebase Auth 상태 변화를 실시간 구독
    const unsubscribe = onAuthChange(async (user) => {
      if (user) {
        // 로그인 시 사용자 프로필 Firestore에 저장
        try {
          await saveUserProfile(user.uid, {
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
          });
        } catch (err) {
          console.error('프로필 저장 실패:', err);
        }
      }
      set({ user, loading: false });
    });
    return unsubscribe;
  },

  login: async () => {
    set({ error: null });
    try {
      await signInWithGoogle();
    } catch (error: unknown) {
      set({ error: (error as Error).message });
    }
  },

  logout: async () => {
    try {
      await authSignOut();
      set({ user: null });
    } catch (error: unknown) {
      set({ error: (error as Error).message });
    }
  },

  clearError: () => set({ error: null }),
}));
