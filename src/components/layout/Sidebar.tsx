// ===================================
// 사이드바 컴포넌트
// 왜: TickTick 스타일의 왼쪽 네비게이션
//     뷰 전환(오늘/내일/예정/완료)과 카테고리 목록 표시
// ===================================

import { useState } from 'react';
import {
  Sun,
  Calendar,
  CalendarDays,
  CheckCircle2,
  List,
  Plus,
  X,
  Edit3,
  type LucideIcon,
  Inbox,
  Briefcase,
  User,
  ShoppingCart,
  FolderOpen,
  Tag,
  Heart,
  Star,
  Zap,
  BookOpen,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useTodoStore } from '../../store/todoStore';
import type { ActiveView, ViewType } from '../../types';

/** 아이콘 이름 → Lucide 컴포넌트 매핑 */
const ICON_MAP: Record<string, LucideIcon> = {
  Inbox,
  Briefcase,
  User,
  ShoppingCart,
  FolderOpen,
  Tag,
  Heart,
  Star,
  Zap,
  BookOpen,
};

/** 스마트 뷰 목록 (고정 네비게이션) */
const SMART_VIEWS: { type: ViewType; label: string; Icon: LucideIcon }[] = [
  { type: 'today', label: '오늘', Icon: Sun },
  { type: 'tomorrow', label: '내일', Icon: Calendar },
  { type: 'upcoming', label: '예정', Icon: CalendarDays },
  { type: 'all', label: '전체', Icon: List },
  { type: 'completed', label: '완료됨', Icon: CheckCircle2 },
];

/** 카테고리에 사용할 수 있는 색상 목록 */
const COLOR_OPTIONS = [
  '#7c5cfc', '#3b82f6', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#06b6d4',
];

/** 카테고리에 사용할 수 있는 아이콘 목록 */
const ICON_OPTIONS = [
  'Inbox', 'Briefcase', 'User', 'ShoppingCart',
  'FolderOpen', 'Tag', 'Heart', 'Star', 'Zap', 'BookOpen',
];

export default function Sidebar() {
  const { activeView, setActiveView, sidebarOpen, setSidebarOpen } = useUIStore();
  const { categories, addCategory, updateCategory, deleteCategory } = useCategoryStore();
  const { todos } = useTodoStore();

  // 카테고리 추가 폼 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(COLOR_OPTIONS[0]);
  const [newIcon, setNewIcon] = useState('FolderOpen');

  // 카테고리 편집 상태
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [editIcon, setEditIcon] = useState('');

  /** 각 뷰별 할 일 개수 계산 */
  const getCount = (viewType: ViewType): number => {
    const activeTodos = todos.filter((t) => !t.completed);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    switch (viewType) {
      case 'today':
        return activeTodos.filter(
          (t) => t.dueDate && new Date(t.dueDate) >= today && new Date(t.dueDate) < tomorrow
        ).length;
      case 'tomorrow':
        return activeTodos.filter(
          (t) => t.dueDate && new Date(t.dueDate) >= tomorrow && new Date(t.dueDate) < dayAfter
        ).length;
      case 'upcoming':
        return activeTodos.filter((t) => t.dueDate && new Date(t.dueDate) >= today).length;
      case 'completed':
        return todos.filter((t) => t.completed).length;
      case 'all':
        return activeTodos.length;
      default:
        return 0;
    }
  };

  /** 카테고리별 할 일 개수 */
  const getCategoryCount = (categoryId: string): number => {
    return todos.filter((t) => !t.completed && t.categoryId === categoryId).length;
  };

  const handleAddCategory = () => {
    if (!newName.trim()) return;
    addCategory(newName.trim(), newColor, newIcon);
    setNewName('');
    setShowAddForm(false);
  };

  const startEditCategory = (cat: { id: string; name: string; color: string; icon?: string }) => {
    setEditingCatId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
    setEditIcon(cat.icon || 'FolderOpen');
  };

  const handleSaveEdit = () => {
    if (!editingCatId || !editName.trim()) return;
    updateCategory(editingCatId, { name: editName.trim(), color: editColor, icon: editIcon });
    setEditingCatId(null);
  };

  const isActive = (view: ActiveView) => {
    if (view.type === 'category') {
      return activeView.type === 'category' && activeView.categoryId === view.categoryId;
    }
    return activeView.type === view.type;
  };

  return (
    <>
      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 lg:z-0
          w-[var(--width-sidebar)] bg-[var(--color-bg-secondary)]
          border-r border-[var(--color-border)]
          flex flex-col overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:relative
        `}
      >
        {/* 로고/앱 이름 */}
        <div className="flex items-center justify-between px-5 py-5">
          <h1 className="text-lg font-bold text-[var(--color-accent)] tracking-tight">
            ✅ TodoFlow
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* 스마트 뷰 목록 */}
        <nav className="px-3 mb-4">
          {SMART_VIEWS.map(({ type, label, Icon }) => (
            <button
              key={type}
              id={`nav-${type}`}
              onClick={() => setActiveView({ type })}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5
                text-sm font-medium transition-all duration-150
                ${isActive({ type })
                  ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
                }
              `}
            >
              <Icon size={18} />
              <span className="flex-1 text-left">{label}</span>
              <span className="text-xs opacity-60">{getCount(type) || ''}</span>
            </button>
          ))}
        </nav>

        {/* 구분선 */}
        <div className="h-px bg-[var(--color-border)] mx-4 mb-3" />

        {/* 카테고리 헤더 */}
        <div className="flex items-center justify-between px-5 mb-2">
          <span className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
            카테고리
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1 rounded hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* 카테고리 추가 폼 */}
        {showAddForm && (
          <div className="px-3 mb-3 slide-in">
            <div className="glass-card p-3 space-y-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                placeholder="카테고리 이름"
                className="w-full bg-[var(--color-bg-tertiary)] rounded-lg px-3 py-2 text-sm
                  text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
                  border border-[var(--color-border)] focus:border-[var(--color-accent)]
                  outline-none"
                autoFocus
              />
              {/* 색상 선택 */}
              <div className="flex gap-1.5">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      newColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {/* 아이콘 선택 */}
              <div className="flex gap-1 flex-wrap">
                {ICON_OPTIONS.map((iconName) => {
                  const IconComp = ICON_MAP[iconName];
                  return (
                    <button
                      key={iconName}
                      onClick={() => setNewIcon(iconName)}
                      className={`p-1.5 rounded-lg text-[var(--color-text-secondary)] transition-colors ${
                        newIcon === iconName
                          ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                          : 'hover:bg-[var(--color-bg-hover)]'
                      }`}
                    >
                      <IconComp size={16} />
                    </button>
                  );
                })}
              </div>
              {/* 버튼 */}
              <div className="flex gap-2">
                <button
                  onClick={handleAddCategory}
                  className="flex-1 bg-[var(--color-accent)] text-white rounded-lg py-1.5 text-sm font-medium
                    hover:bg-[var(--color-accent-hover)] transition-colors"
                >
                  추가
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-lg py-1.5 text-sm
                    hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 카테고리 목록 */}
        <nav className="px-3 flex-1">
          {categories
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((cat) => {
              const IconComp = ICON_MAP[cat.icon || 'FolderOpen'] || FolderOpen;
              const active = isActive({ type: 'category', categoryId: cat.id });

              // 편집 모드
              if (editingCatId === cat.id) {
                return (
                  <div key={cat.id} className="px-1 mb-1 slide-in">
                    <div className="glass-card p-3 space-y-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                        className="w-full bg-[var(--color-bg-tertiary)] rounded-lg px-3 py-1.5 text-sm
                          text-[var(--color-text-primary)] border border-[var(--color-border)]
                          focus:border-[var(--color-accent)] outline-none"
                        autoFocus
                      />
                      <div className="flex gap-1.5">
                        {COLOR_OPTIONS.map((color) => (
                          <button
                            key={color}
                            onClick={() => setEditColor(color)}
                            className={`w-5 h-5 rounded-full transition-transform ${
                              editColor === color ? 'ring-2 ring-white scale-110' : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {ICON_OPTIONS.map((iconName) => {
                          const IC = ICON_MAP[iconName];
                          return (
                            <button
                              key={iconName}
                              onClick={() => setEditIcon(iconName)}
                              className={`p-1 rounded-lg text-[var(--color-text-secondary)] transition-colors ${
                                editIcon === iconName
                                  ? 'bg-[var(--color-accent-light)] text-[var(--color-accent)]'
                                  : 'hover:bg-[var(--color-bg-hover)]'
                              }`}
                            >
                              <IC size={14} />
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 bg-[var(--color-accent)] text-white rounded-lg py-1 text-xs font-medium
                            hover:bg-[var(--color-accent-hover)] transition-colors"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingCatId(null)}
                          className="flex-1 bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] rounded-lg py-1 text-xs
                            hover:bg-[var(--color-bg-hover)] transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={cat.id} className="group relative">
                  <button
                    id={`category-${cat.id}`}
                    onClick={() => setActiveView({ type: 'category', categoryId: cat.id })}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5
                      text-sm font-medium transition-all duration-150
                      ${active
                        ? 'bg-[var(--color-accent-light)] text-[var(--color-text-primary)]'
                        : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
                      }
                    `}
                  >
                    <IconComp size={18} style={{ color: cat.color }} />
                    <span className="flex-1 text-left">{cat.name}</span>
                    <span className="text-xs opacity-60">
                      {getCategoryCount(cat.id) || ''}
                    </span>
                  </button>
                  {/* 편집/삭제 버튼 (inbox 제외, 호버 시 표시) */}
                  {cat.id !== 'inbox' && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5
                      opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditCategory(cat);
                        }}
                        className="p-1 rounded hover:bg-[var(--color-bg-hover)]
                          text-[var(--color-text-muted)] hover:text-[var(--color-accent)]"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`"${cat.name}" 카테고리를 삭제하시겠습니까?`)) {
                            deleteCategory(cat.id);
                          }
                        }}
                        className="p-1 rounded hover:bg-[var(--color-danger)]/20
                          text-[var(--color-text-muted)] hover:text-[var(--color-danger)]"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </nav>
      </aside>
    </>
  );
}
