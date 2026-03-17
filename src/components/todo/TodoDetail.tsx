// ===================================
// 할 일 상세 패널 (오른쪽)
// 왜: 선택한 할 일의 전체 정보를 보여주고 편집 가능
// ===================================

import { useState } from 'react';
import {
  X,
  Flag,
  Calendar,
  Repeat,
  Link as LinkIcon,
  Phone,
  StickyNote,
  Trash2,
  Edit3,
  ExternalLink,
} from 'lucide-react';
import { useTodoStore } from '../../store/todoStore';
import { useUIStore } from '../../store/uiStore';
import { useCategoryStore } from '../../store/categoryStore';
import { formatDate, formatDateTime, isOverdue } from '../../utils/dateUtils';
import type { Priority } from '../../types';
import TodoForm from './TodoForm';

/** 우선순위 레이블 */
const PRIORITY_LABELS: Record<Priority, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
  none: '없음',
};

const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'var(--color-priority-high)',
  medium: 'var(--color-priority-medium)',
  low: 'var(--color-priority-low)',
  none: 'var(--color-text-muted)',
};

export default function TodoDetail() {
  const { todos, deleteTodo } = useTodoStore();
  const { selectedTodoId, setSelectedTodoId } = useUIStore();
  const { categories } = useCategoryStore();
  const [editing, setEditing] = useState(false);

  const todo = todos.find((t) => t.id === selectedTodoId);
  if (!todo) return null;

  const category = categories.find((c) => c.id === todo.categoryId);
  const overdue = todo.dueDate && !todo.completed && isOverdue(todo.dueDate);

  /** 삭제 확인 후 삭제 */
  const handleDelete = () => {
    if (confirm('이 할 일을 삭제하시겠습니까?')) {
      deleteTodo(todo.id);
      setSelectedTodoId(null);
    }
  };

  if (editing) {
    return (
      <div className="h-full bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] p-4 overflow-y-auto">
        <TodoForm
          editTodo={todo}
          onClose={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="h-full bg-[var(--color-bg-secondary)] border-l border-[var(--color-border)] flex flex-col fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <span className="text-sm font-medium text-[var(--color-text-secondary)]">상세 보기</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setEditing(true)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]
              text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
            title="수정"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg hover:bg-[var(--color-danger)]/10
              text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
            title="삭제"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setSelectedTodoId(null)}
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)]
              text-[var(--color-text-muted)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 내용 */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* 제목 */}
        <h3
          className={`text-lg font-semibold ${
            todo.completed
              ? 'line-through text-[var(--color-text-muted)]'
              : 'text-[var(--color-text-primary)]'
          }`}
        >
          {todo.title}
        </h3>

        {/* 설명 */}
        {todo.description && (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap">
            {todo.description}
          </p>
        )}

        {/* 메타 정보 */}
        <div className="space-y-3">
          {/* 우선순위 */}
          <div className="flex items-center gap-3">
            <Flag size={16} color={PRIORITY_COLORS[todo.priority]} />
            <span className="text-sm text-[var(--color-text-secondary)]">
              우선순위: {PRIORITY_LABELS[todo.priority]}
            </span>
          </div>

          {/* 카테고리 */}
          {category && (
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-sm text-[var(--color-text-secondary)]">
                {category.name}
              </span>
            </div>
          )}

          {/* 마감일 */}
          {todo.dueDate && (
            <div className="flex items-center gap-3">
              <Calendar
                size={16}
                className={overdue ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-muted)]'}
              />
              <span
                className={`text-sm ${
                  overdue ? 'text-[var(--color-danger)] font-medium' : 'text-[var(--color-text-secondary)]'
                }`}
              >
                {formatDate(todo.dueDate)}
                {overdue && ' (기한 초과)'}
              </span>
            </div>
          )}

          {/* 반복 */}
          {todo.recurring && (
            <div className="flex items-center gap-3">
              <Repeat size={16} className="text-[var(--color-text-muted)]" />
              <span className="text-sm text-[var(--color-text-secondary)]">
                {todo.recurring.interval > 1 ? `${todo.recurring.interval}` : ''}
                {todo.recurring.type === 'daily' && '매일'}
                {todo.recurring.type === 'weekly' && '매주'}
                {todo.recurring.type === 'monthly' && '매월'}
                {todo.recurring.type === 'yearly' && '매년'}
                {' '}반복
              </span>
            </div>
          )}
        </div>

        {/* 태그 */}
        {todo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {todo.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-[var(--color-accent-light)] text-[var(--color-accent)] text-xs rounded-md"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* 참고 기록 */}
        {todo.references.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
              참고 기록
            </h4>
            <div className="space-y-2">
              {todo.references.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-start gap-2 p-2.5 bg-[var(--color-bg-tertiary)] rounded-lg"
                >
                  {ref.type === 'link' && <LinkIcon size={14} className="text-[var(--color-accent)] shrink-0 mt-0.5" />}
                  {ref.type === 'contact' && <Phone size={14} className="text-[var(--color-success)] shrink-0 mt-0.5" />}
                  {ref.type === 'note' && <StickyNote size={14} className="text-[var(--color-warning)] shrink-0 mt-0.5" />}
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-[var(--color-text-primary)] block">{ref.title}</span>
                    {ref.type === 'link' ? (
                      <a
                        href={ref.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--color-accent)] hover:underline flex items-center gap-1 truncate"
                      >
                        {ref.value}
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-xs text-[var(--color-text-muted)] block truncate">
                        {ref.value}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 생성/수정일 */}
        <div className="pt-3 border-t border-[var(--color-border)] space-y-1">
          <p className="text-xs text-[var(--color-text-muted)]">
            생성: {formatDateTime(todo.createdAt)}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            수정: {formatDateTime(todo.updatedAt)}
          </p>
          {todo.completedAt && (
            <p className="text-xs text-[var(--color-success)]">
              완료: {formatDateTime(todo.completedAt)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
