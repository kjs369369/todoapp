// ===================================
// 날짜 관련 유틸리티 함수
// 왜: date-fns를 래핑해서 앱 전체에서 일관된 날짜 처리를 보장
// ===================================

import {
  format,
  isToday,
  isTomorrow,
  isPast,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import type { RecurringConfig } from '../types';

/** 날짜를 "3월 17일 (월)" 형식으로 포맷 */
export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'M월 d일 (EEE)', { locale: ko });
}

/** 날짜+시간을 "3월 17일 (월) 14:30" 형식으로 포맷 */
export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'M월 d일 (EEE) HH:mm', { locale: ko });
}

/** 날짜를 "2026-03-17" ISO 형식으로 포맷 */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** 마감일까지 남은 일수를 친화적 텍스트로 반환 */
export function getDueDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) return '오늘';
  if (isTomorrow(date)) return '내일';
  if (isPast(endOfDay(date))) return '지남';
  return formatDate(dateStr);
}

/** 마감일이 지났는지 확인 */
export function isOverdue(dateStr: string): boolean {
  return isPast(endOfDay(new Date(dateStr)));
}

/** 오늘 날짜에 해당하는 할 일인지 확인 */
export function isDueToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  return isToday(new Date(dateStr));
}

/** 내일 날짜에 해당하는 할 일인지 확인 */
export function isDueTomorrow(dateStr?: string): boolean {
  if (!dateStr) return false;
  return isTomorrow(new Date(dateStr));
}

/** 이번 주 내에 마감인지 확인 */
export function isDueThisWeek(dateStr?: string): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const weekStart = startOfWeek(new Date(), { locale: ko });
  const weekEnd = endOfWeek(new Date(), { locale: ko });
  return !isBefore(date, weekStart) && !isAfter(date, weekEnd);
}

/**
 * 반복 설정에 따라 다음 마감일을 계산
 * 왜: 할 일 완료 시 자동으로 다음 반복 생성에 사용
 */
export function getNextRecurringDate(
  currentDate: string,
  config: RecurringConfig
): string {
  const date = new Date(currentDate);
  const { type, interval } = config;

  let nextDate: Date;
  switch (type) {
    case 'daily':
      nextDate = addDays(date, interval);
      break;
    case 'weekly':
      nextDate = addWeeks(date, interval);
      break;
    case 'monthly':
      nextDate = addMonths(date, interval);
      break;
    case 'yearly':
      nextDate = addYears(date, interval);
      break;
    default:
      nextDate = addDays(date, 1);
  }

  // 종료일이 있으면 체크
  if (config.endDate && isAfter(nextDate, new Date(config.endDate))) {
    return ''; // 반복 종료
  }

  return nextDate.toISOString();
}

/** 오늘 날짜의 시작 시점 (00:00:00) ISO 문자열 반환 */
export function todayStart(): string {
  return startOfDay(new Date()).toISOString();
}

/** 오늘 날짜의 끝 시점 (23:59:59) ISO 문자열 반환 */
export function todayEnd(): string {
  return endOfDay(new Date()).toISOString();
}
