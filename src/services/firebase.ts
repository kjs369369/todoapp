// ===================================
// Firebase 초기화
// 왜: Firebase Auth + Firestore를 앱 전체에서 사용
//     환경변수가 없으면 Firebase를 건너뛰고 LocalStorage 전용 모드로 동작
// ===================================

import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  type Firestore,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** Firebase 설정이 유효한지 확인 */
function isFirebaseConfigured(): boolean {
  const { apiKey, projectId } = firebaseConfig;
  return !!(
    apiKey && projectId &&
    !apiKey.startsWith('여기에') && !projectId.startsWith('여기에') &&
    apiKey !== 'your-api-key' && projectId !== 'your-project-id'
  );
}

export const firebaseEnabled = isFirebaseConfigured();

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (firebaseEnabled) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('오프라인 지원: 다른 탭이 이미 활성화됨');
      } else if (err.code === 'unimplemented') {
        console.warn('오프라인 지원: 이 브라우저에서 지원하지 않음');
      }
    });
  } catch (err) {
    console.warn('Firebase 초기화 실패, LocalStorage 모드로 동작합니다:', err);
  }
} else {
  console.info('Firebase 미설정 — LocalStorage 전용 모드로 동작합니다.');
}

export { auth, db };
export default app;
