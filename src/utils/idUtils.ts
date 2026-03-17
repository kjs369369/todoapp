// ===================================
// ID 생성 유틸리티
// 왜: 외부 의존성 없이 고유 ID를 생성하기 위함
// ===================================

/** 간단하고 고유한 ID 생성 (crypto API 활용) */
export function generateId(): string {
  return crypto.randomUUID();
}
