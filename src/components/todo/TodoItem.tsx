// ===================================
// 개별 할 일 항목 컴포넌트
// 왜: TodoList에서 각 할 일을 렌더링
//     체크, 우선순위 표시, 마감일 등 핵심 정보를 한 줄에 보여줌
// ===================================

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Flag, GripVertical, Calendar, Repeat } from 'lucide-react';
import { useTodoStore } from '../../store/todoStore';
import { useUIStore } from '../../store/uiStore';
import { useCategoryStore } from '../../store/categoryStore';
import { getDueDateLabel, isOverdue } from '../../utils/dateUtils';
import type { Todo, Priority } from '../../types';

/** 우선순위별 색상 */
const PRIORITY_COLORS: Record<Priority, string> = {
  high: 'var(--color-priority-high)',
  medium: 'var(--color-priority-medium)',
  low: 'var(--color-priority-low)',
  none: 'var(--color-text-muted)',
};

interface TodoItemProps {
  todo: Todo;
}

export default function TodoItem({ todo }: TodoItemProps) {
  const { toggleComplete } = useTodoStore();
  const { selectedTodoId, setSelectedTodoId } = useUIStore();
  const { categories } = useCategoryStore();

  const isSelected = selectedTodoId === todo.id;
  const category = categories.find((c) => c.id === todo.categoryId);
  const overdue = todo.dueDate && !todo.completed && isOverdue(todo.dueDate);

  // dnd-kit 드래그 가능 설정
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-3 px-3 py-3 rounded-xl mb-1
        cursor-pointer transition-all duration-150 slide-in
        ${isSelected
          ? 'bg-[var(--color-accent-light)] border border-[var(--color-accent)]/30'
          : 'hover:bg-[var(--color-bg-hover)] border border-transparent'
        }
        ${todo.completed ? 'opacity-60' : ''}
      `}
      onClick={() => setSelectedTodoId(isSelected ? null : todo.id)}
    >
      {/* 드래그 핸들 */}
      <button
        {...attributes}
        {...listeners}
        className="p-0.5 rounded opacity-0 group-hover:opacity-40 hover:!opacity-100 cursor-grab
          text-[var(--color-text-muted)] touch-none"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} />
      </button>

      {/* 완료 체크박스 */}
      <button
        id={`check-${todo.id}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleComplete(todo.id);
        }}
        className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center
          shrink-0 transition-all duration-200
          ${todo.completed
            ? 'bg-[var(--color-accent)] border-[var(--color-accent)] check-animate'
            : 'border-[var(--color-text-muted)] hover:border-[var(--color-accent)]'
          }
        `}
      >
        {todo.completed && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* 내용 영역 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium truncate ${
              todo.completed
                ? 'line-through text-[var(--color-text-muted)]'
                : 'text-[var(--color-text-primary)]'
            }`}
          >
            {todo.title}
          </span>
        </div>

        {/* 부가 정보 (마감일, 카테고리, 참고) */}
        <div className="flex items-center gap-2 mt-0.5">
          {/* 마감일 */}
          {todo.dueDate && (
            <span
              className={`flex items-center gap-1 text-xs ${
                overdue ? 'text-[var(--color-danger)] font-medium' : 'text-[var(--color-text-muted)]'
              }`}
            >
              <Calendar size={12} />
              {getDueDateLabel(todo.dueDate)}
            </span>
          )}

          {/* 반복 배지 */}
          {todo.recurring && (
            <span className="flex items-center gap-0.5 text-xs text-[var(--color-text-muted)]">
              <Repeat size={12} />
            </span>
          )}

          {/* 카테고리 태그 */}
          {category && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-md"
              style={{
                backgroundColor: category.color + '20',
                color: category.color,
              }}
            >
              {category.name}
            </span>
          )}

          {/* 태그 */}
          {todo.tags.length > 0 && (
            <span className="text-xs text-[var(--color-accent)] truncate max-w-24">
              #{todo.tags[0]}{todo.tags.length > 1 && ` +${todo.tags.length - 1}`}
            </span>
          )}

          {/* 참고 기록 개수 */}
          {todo.references.length > 0 && (
            <span className="text-xs text-[var(--color-text-muted)]">
              📎 {todo.references.length}
            </span>
          )}
        </div>
      </div>

      {/* 우선순위 깃발 */}
      {todo.priority !== 'none' && (
        <Flag
          size={16}
          fill={PRIORITY_COLORS[todo.priority]}
          color={PRIORITY_COLORS[todo.priority]}
          className="shrink-0"
        />
      )}
    </div>
  );
}
