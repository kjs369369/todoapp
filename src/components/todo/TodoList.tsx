// ===================================
// 할 일 목록 컴포넌트
// 왜: 현재 뷰에 맞는 할 일만 필터링해서 표시
//     드래그앤드롭 정렬, 할 일 추가 폼 포함
// ===================================

import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Inbox } from 'lucide-react';
import { useTodoStore } from '../../store/todoStore';
import { useUIStore } from '../../store/uiStore';
import { useCategoryStore } from '../../store/categoryStore';
import { isDueToday, isDueTomorrow } from '../../utils/dateUtils';
import type { Todo } from '../../types';
import TodoItem from './TodoItem';
import TodoForm from './TodoForm';

export default function TodoList() {
  const { todos, reorderTodos } = useTodoStore();
  const { activeView, filters, addFormOpen, setAddFormOpen } = useUIStore();
  const { categories } = useCategoryStore();
  const [showAddForm, setShowAddForm] = useState(false);

  // 통합 추가 폼 상태 (인라인 + 모바일 FAB)
  const isFormOpen = showAddForm || addFormOpen;
  const closeForm = () => {
    setShowAddForm(false);
    setAddFormOpen(false);
  };

  // 드래그앤드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  /** 현재 뷰에 따라 할 일 필터링 */
  const filteredTodos = useMemo(() => {
    let filtered: Todo[] = [];

    switch (activeView.type) {
      case 'today':
        // 오늘 마감 + 마감일 없는 미완료
        filtered = todos.filter(
          (t) => !t.completed && (isDueToday(t.dueDate) || !t.dueDate)
        );
        break;
      case 'tomorrow':
        filtered = todos.filter(
          (t) => !t.completed && isDueTomorrow(t.dueDate)
        );
        break;
      case 'upcoming':
        // 마감일이 있는 미완료 할 일
        filtered = todos.filter((t) => !t.completed && t.dueDate);
        break;
      case 'completed':
        filtered = todos.filter((t) => t.completed);
        break;
      case 'all':
        filtered = todos.filter((t) => !t.completed);
        break;
      case 'category':
        filtered = todos.filter(
          (t) => !t.completed && t.categoryId === activeView.categoryId
        );
        break;
    }

    // 검색 필터
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // 우선순위 필터
    if (filters.priority) {
      filtered = filtered.filter((t) => t.priority === filters.priority);
    }

    // 정렬: sortOrder 기준
    return filtered.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [todos, activeView, filters]);

  /** 현재 뷰의 제목 (카테고리일 때) */
  const categoryTitle = useMemo(() => {
    if (activeView.type !== 'category') return '';
    return categories.find((c) => c.id === activeView.categoryId)?.name || '';
  }, [activeView, categories]);

  /** 드래그 종료 핸들러 */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredTodos.findIndex((t) => t.id === active.id);
    const newIndex = filteredTodos.findIndex((t) => t.id === over.id);

    // 새 순서 배열 생성
    const newOrder = [...filteredTodos];
    const [movedItem] = newOrder.splice(oldIndex, 1);
    newOrder.splice(newIndex, 0, movedItem);

    reorderTodos(newOrder.map((t) => t.id));
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* 카테고리 헤더 (카테고리 뷰일 때만) */}
      {activeView.type === 'category' && categoryTitle && (
        <div className="px-4 lg:px-6 pt-4">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {categoryTitle}
          </h2>
        </div>
      )}

      {/* 할 일 목록 */}
      <div className="flex-1 overflow-y-auto px-2 lg:px-4 py-3 pb-24 lg:pb-4">
        {filteredTodos.length === 0 && !isFormOpen ? (
          // 빈 상태
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Inbox size={48} className="text-[var(--color-text-muted)] mb-3 opacity-40" />
            <p className="text-sm text-[var(--color-text-muted)]">
              {filters.searchQuery
                ? '검색 결과가 없습니다'
                : activeView.type === 'completed'
                ? '완료된 할 일이 없습니다'
                : '할 일이 없습니다'}
            </p>
            {!filters.searchQuery && activeView.type !== 'completed' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-3 text-sm text-[var(--color-accent)] hover:underline"
              >
                + 할 일 추가하기
              </button>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTodos.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredTodos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {/* 할 일 추가 폼 */}
        {isFormOpen && (
          <div className="mt-2">
            <TodoForm onClose={closeForm} />
          </div>
        )}

        {/* 할 일 추가 버튼 (인라인) */}
        {!isFormOpen && activeView.type !== 'completed' && filteredTodos.length > 0 && (
          <button
            id="add-todo-btn"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 w-full px-3 py-3 mt-1 rounded-xl
              text-sm text-[var(--color-text-muted)]
              hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-accent)]
              transition-colors"
          >
            <Plus size={18} />
            할 일 추가
          </button>
        )}
      </div>
    </div>
  );
}
