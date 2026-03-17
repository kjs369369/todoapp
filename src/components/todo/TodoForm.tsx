// ===================================
// 할 일 추가/수정 폼
// 왜: 제목, 설명, 우선순위, 마감일, 카테고리, 반복, 참고 입력
// ===================================

import { useState } from 'react';
import {
  Flag,
  Calendar,
  Repeat,
  Link as LinkIcon,
  Phone,
  StickyNote,
  Plus,
  X,
  ChevronDown,
} from 'lucide-react';
import { useTodoStore } from '../../store/todoStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useUIStore } from '../../store/uiStore';
import type { Priority, RecurringType, Reference, Todo } from '../../types';
import { generateId } from '../../utils/idUtils';

/** 우선순위 옵션 */
const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'high', label: '높음', color: 'var(--color-priority-high)' },
  { value: 'medium', label: '중간', color: 'var(--color-priority-medium)' },
  { value: 'low', label: '낮음', color: 'var(--color-priority-low)' },
  { value: 'none', label: '없음', color: 'var(--color-text-muted)' },
];

/** 반복 옵션 */
const RECURRING_OPTIONS: { value: RecurringType; label: string }[] = [
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
  { value: 'yearly', label: '매년' },
];

interface TodoFormProps {
  /** 수정 모드일 때 기존 할 일 데이터 */
  editTodo?: Todo;
  onClose: () => void;
}

export default function TodoForm({ editTodo, onClose }: TodoFormProps) {
  const { addTodo, updateTodo } = useTodoStore();
  const { categories } = useCategoryStore();
  const { activeView } = useUIStore();

  // 수정 모드이면 기존 데이터로 초기화
  const [title, setTitle] = useState(editTodo?.title || '');
  const [description, setDescription] = useState(editTodo?.description || '');
  const [priority, setPriority] = useState<Priority>(editTodo?.priority || 'none');
  const [categoryId, setCategoryId] = useState(
    editTodo?.categoryId ||
    (activeView.type === 'category' ? activeView.categoryId : 'inbox') ||
    'inbox'
  );
  const [dueDate, setDueDate] = useState(
    editTodo?.dueDate ? editTodo.dueDate.split('T')[0] : ''
  );
  const [recurringType, setRecurringType] = useState<RecurringType | ''>(
    editTodo?.recurring?.type || ''
  );
  const [recurringInterval, setRecurringInterval] = useState(
    editTodo?.recurring?.interval || 1
  );
  const [references, setReferences] = useState<Reference[]>(
    editTodo?.references || []
  );
  const [tags, setTags] = useState<string[]>(editTodo?.tags || []);
  const [tagInput, setTagInput] = useState('');

  // UI 토글 상태
  const [showDetails, setShowDetails] = useState(!!editTodo);
  const [showRefForm, setShowRefForm] = useState(false);
  const [newRefType, setNewRefType] = useState<'link' | 'contact' | 'note'>('link');
  const [newRefTitle, setNewRefTitle] = useState('');
  const [newRefValue, setNewRefValue] = useState('');

  /** 태그 추가 */
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput('');
  };

  /** 태그 삭제 */
  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  /** 참고 기록 추가 */
  const handleAddReference = () => {
    if (!newRefTitle.trim() || !newRefValue.trim()) return;
    setReferences([
      ...references,
      { id: generateId(), type: newRefType, title: newRefTitle.trim(), value: newRefValue.trim() },
    ]);
    setNewRefTitle('');
    setNewRefValue('');
    setShowRefForm(false);
  };

  /** 참고 기록 삭제 */
  const handleRemoveReference = (id: string) => {
    setReferences(references.filter((r) => r.id !== id));
  };

  /** 폼 제출 */
  const handleSubmit = () => {
    if (!title.trim()) return;

    const todoDueDate = dueDate
      ? new Date(dueDate + 'T00:00:00').toISOString()
      : undefined;

    const recurring = recurringType
      ? { type: recurringType, interval: recurringInterval }
      : undefined;

    if (editTodo) {
      // 수정 모드
      updateTodo(editTodo.id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        categoryId,
        tags,
        dueDate: todoDueDate,
        recurring,
        references,
      });
    } else {
      // 추가 모드
      addTodo({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        categoryId,
        tags,
        dueDate: todoDueDate,
        recurring,
        references,
      });
    }

    onClose();
  };

  return (
    <div className="glass-card p-4 slide-in">
      {/* 제목 입력 */}
      <input
        id="todo-title-input"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
          if (e.key === 'Escape') onClose();
        }}
        placeholder="할 일을 입력하세요..."
        className="w-full bg-transparent text-[var(--color-text-primary)] text-sm
          placeholder-[var(--color-text-muted)] outline-none py-1"
        autoFocus
      />

      {/* 설명 입력 (상세 모드) */}
      {showDetails && (
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="설명 (선택사항)"
          rows={2}
          className="w-full bg-[var(--color-bg-tertiary)] rounded-lg px-3 py-2 mt-2
            text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
            border border-[var(--color-border)] outline-none resize-none"
        />
      )}

      {/* 빠른 설정 바 */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {/* 마감일 */}
        <div className="flex items-center gap-1">
          <Calendar size={14} className="text-[var(--color-text-muted)]" />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="bg-[var(--color-bg-tertiary)] rounded-md px-2 py-1 text-xs
              text-[var(--color-text-primary)] border border-[var(--color-border)]
              outline-none"
          />
        </div>

        {/* 우선순위 */}
        <div className="relative">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="appearance-none bg-[var(--color-bg-tertiary)] rounded-md pl-7 pr-6 py-1 text-xs
              text-[var(--color-text-primary)] border border-[var(--color-border)]
              outline-none cursor-pointer"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
          <Flag size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
        </div>

        {/* 카테고리 */}
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="appearance-none bg-[var(--color-bg-tertiary)] rounded-md px-2 pr-6 py-1 text-xs
            text-[var(--color-text-primary)] border border-[var(--color-border)]
            outline-none cursor-pointer"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>

        {/* 반복 */}
        <div className="flex items-center gap-1">
          <Repeat size={14} className="text-[var(--color-text-muted)]" />
          <select
            value={recurringType}
            onChange={(e) => setRecurringType(e.target.value as RecurringType | '')}
            className="appearance-none bg-[var(--color-bg-tertiary)] rounded-md px-2 pr-5 py-1 text-xs
              text-[var(--color-text-primary)] border border-[var(--color-border)]
              outline-none cursor-pointer"
          >
            <option value="">반복 없음</option>
            {RECURRING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {recurringType && (
            <input
              type="number"
              min={1}
              max={99}
              value={recurringInterval}
              onChange={(e) => setRecurringInterval(Math.max(1, Number(e.target.value)))}
              className="w-12 bg-[var(--color-bg-tertiary)] rounded-md px-1.5 py-1 text-xs text-center
                text-[var(--color-text-primary)] border border-[var(--color-border)] outline-none"
            />
          )}
        </div>

        {/* 상세 토글 */}
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
        >
          {showDetails ? '접기' : '상세'}
        </button>
      </div>

      {/* 태그 */}
      {showDetails && (
        <div className="mt-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-0.5 bg-[var(--color-accent-light)]
                  text-[var(--color-accent)] text-xs rounded-md"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-[var(--color-danger)] transition-colors"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="태그 추가..."
              className="bg-transparent text-xs text-[var(--color-text-primary)]
                placeholder-[var(--color-text-muted)] outline-none w-20 py-0.5"
            />
          </div>
        </div>
      )}

      {/* 참고 기록 */}
      {showDetails && (
        <div className="mt-3">
          {/* 기존 참고 기록 목록 */}
          {references.length > 0 && (
            <div className="space-y-1 mb-2">
              {references.map((ref) => (
                <div
                  key={ref.id}
                  className="flex items-center gap-2 px-2 py-1 bg-[var(--color-bg-tertiary)] rounded-lg text-xs"
                >
                  {ref.type === 'link' && <LinkIcon size={12} className="text-[var(--color-accent)]" />}
                  {ref.type === 'contact' && <Phone size={12} className="text-[var(--color-success)]" />}
                  {ref.type === 'note' && <StickyNote size={12} className="text-[var(--color-warning)]" />}
                  <span className="text-[var(--color-text-secondary)] truncate flex-1">{ref.title}</span>
                  <button
                    onClick={() => handleRemoveReference(ref.id)}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 참고 기록 추가 */}
          {showRefForm ? (
            <div className="space-y-2 p-2 bg-[var(--color-bg-tertiary)] rounded-lg">
              <div className="flex gap-2">
                {(['link', 'contact', 'note'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewRefType(type)}
                    className={`text-xs px-2 py-1 rounded-md transition-colors ${
                      newRefType === type
                        ? 'bg-[var(--color-accent)] text-white'
                        : 'bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {type === 'link' ? '🔗 링크' : type === 'contact' ? '📞 연락처' : '📝 메모'}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={newRefTitle}
                onChange={(e) => setNewRefTitle(e.target.value)}
                placeholder="제목"
                className="w-full bg-[var(--color-bg-secondary)] rounded-md px-2 py-1.5 text-xs
                  text-[var(--color-text-primary)] outline-none border border-[var(--color-border)]"
              />
              <input
                type="text"
                value={newRefValue}
                onChange={(e) => setNewRefValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddReference()}
                placeholder={
                  newRefType === 'link' ? 'https://...' :
                  newRefType === 'contact' ? '010-0000-0000' : '메모 내용'
                }
                className="w-full bg-[var(--color-bg-secondary)] rounded-md px-2 py-1.5 text-xs
                  text-[var(--color-text-primary)] outline-none border border-[var(--color-border)]"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddReference}
                  className="text-xs px-3 py-1 bg-[var(--color-accent)] text-white rounded-md"
                >
                  추가
                </button>
                <button
                  onClick={() => setShowRefForm(false)}
                  className="text-xs px-3 py-1 text-[var(--color-text-muted)]"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowRefForm(true)}
              className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]
                hover:text-[var(--color-accent)] transition-colors"
            >
              <Plus size={12} />
              참고 기록 추가
            </button>
          )}
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-[var(--color-border)]">
        <button
          onClick={onClose}
          className="px-4 py-1.5 text-sm text-[var(--color-text-secondary)]
            hover:text-[var(--color-text-primary)] rounded-lg transition-colors"
        >
          취소
        </button>
        <button
          id="todo-submit-btn"
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="px-4 py-1.5 text-sm font-medium bg-[var(--color-accent)] text-white
            rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {editTodo ? '수정' : '추가'}
        </button>
      </div>
    </div>
  );
}
