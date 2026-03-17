// ===================================
// 할 일 앱의 모든 타입 정의
// ===================================

/** 참고 기록 유형: 링크, 연락처, 또는 자유 메모 */
export type ReferenceType = 'link' | 'contact' | 'note';

/** 우선순위: 높음 > 중간 > 낮음 > 없음 */
export type Priority = 'high' | 'medium' | 'low' | 'none';

/** 반복 주기 유형 */
export type RecurringType = 'daily' | 'weekly' | 'monthly' | 'yearly';

/** 테마 모드 */
export type ThemeMode = 'light' | 'dark' | 'system';

/** 참고 기록 (링크, 연락처, 메모) */
export interface Reference {
  id: string;
  type: ReferenceType;
  title: string;
  /** URL, 전화번호, 또는 메모 텍스트 */
  value: string;
}

/** 반복 설정 */
export interface RecurringConfig {
  type: RecurringType;
  /** 반복 간격 (예: 2 = 매 2일/주/월) */
  interval: number;
  endDate?: string;
  /** weekly 전용: 반복할 요일 [0=일, 1=월, ... 6=토] */
  daysOfWeek?: number[];
}

/** 할 일 항목 */
export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  categoryId: string;
  tags: string[];

  // 날짜 관련 (ISO 문자열)
  dueDate?: string;
  reminder?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;

  // 반복 설정
  recurring?: RecurringConfig;

  // 참고 기록
  references: Reference[];

  // 정렬 순서 (드래그앤드롭)
  sortOrder: number;
}

/** 카테고리 */
export interface Category {
  id: string;
  name: string;
  /** hex 색상 코드 */
  color: string;
  /** Lucide 아이콘 이름 */
  icon?: string;
  sortOrder: number;
}

/** 사이드바에서 선택 가능한 뷰 타입 */
export type ViewType =
  | 'today'
  | 'tomorrow'
  | 'upcoming'
  | 'completed'
  | 'all'
  | 'category';

/** 현재 활성 뷰 (사이드바 선택 상태) */
export interface ActiveView {
  type: ViewType;
  /** category 뷰일 때만 사용 */
  categoryId?: string;
}

/** 필터 옵션 */
export interface FilterOptions {
  priority?: Priority;
  hasDate?: boolean;
  searchQuery?: string;
}
