import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { PlanningItem, PlanningCategory } from '../../types';
import { 
  CheckSquare, 
  Luggage, 
  ShoppingBag, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Users, 
  User, 
  Sparkles, 
  X,
  Filter
} from 'lucide-react';

const CATEGORIES: { id: PlanningCategory; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { id: 'todo', label: '待辦事項', icon: CheckSquare, color: '#5C8984', bg: '#E8F1EF' },
  { id: 'packing', label: '行李清單', icon: Luggage, color: '#E59866', bg: '#FAF0E6' },
  { id: 'shopping', label: '購物清單', icon: ShoppingBag, color: '#7FB069', bg: '#EDF5EA' }
];

export const PlanningTab: React.FC = () => {
  const {
    planningItems,
    addPlanningItem,
    togglePlanningItem,
    deletePlanningItem,
    members,
    currentMemberId,
    triggerConfetti,
    showConfirmDialog
  } = useTrip();

  const [activeCategory, setActiveCategory] = useState<PlanningCategory>('todo');
  const [filterAssignee, setFilterAssignee] = useState<string>('all_or_mine'); // 'all', 'all_or_mine', or memberId
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // New item form
  const [formData, setFormData] = useState<{
    type: PlanningCategory;
    title: string;
    assignedTo: string;
    categoryTag: string;
    notes: string;
  }>({
    type: 'todo',
    title: '',
    assignedTo: 'all',
    categoryTag: '必備清單',
    notes: ''
  });

  // Current category items
  const catItems = planningItems.filter(item => item.type === activeCategory);

  // Filtered by member
  const filteredItems = catItems.filter(item => {
    if (filterAssignee === 'all') return true;
    if (filterAssignee === 'all_or_mine') {
      return item.assignedTo === 'all' || item.assignedTo === currentMemberId;
    }
    return item.assignedTo === filterAssignee;
  });

  const completedCount = catItems.filter(i => i.isCompleted).length;
  const totalCount = catItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const openAddModal = () => {
    setFormData({
      type: activeCategory,
      title: '',
      assignedTo: 'all',
      categoryTag: activeCategory === 'todo' ? '行前準備' : activeCategory === 'packing' ? '隨身物品' : '伴手禮',
      notes: ''
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    addPlanningItem({
      type: formData.type,
      title: formData.title,
      isCompleted: false,
      assignedTo: formData.assignedTo,
      categoryTag: formData.categoryTag,
      notes: formData.notes
    });

    setModalOpen(false);
  };

  // Quick preset items
  const addQuickPreset = (title: string, tag: string) => {
    addPlanningItem({
      type: activeCategory,
      title,
      isCompleted: false,
      assignedTo: 'all',
      categoryTag: tag
    });
  };

  return (
    <div id="planning-tab-content" className="space-y-4 pb-12">
      {/* 1. Category Switcher (Bento Grid 3-col buttons) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;
          const count = planningItems.filter(i => i.type === cat.id && !i.isCompleted).length;

          return (
            <button
              key={cat.id}
              id={`planning-cat-${cat.id}`}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex flex-col items-center justify-center p-3.5 rounded-[22px] border-2 transition-all active:scale-95 ${
                isSelected
                  ? 'bg-white border-[#8BBF9F] shadow-[4px_4px_0px_#8BBF9F] text-[#5D574F] font-black'
                  : 'bg-[#FAF8F3] border-[#E8E5D8] text-[#8E8A81] hover:bg-white'
              }`}
            >
              <div 
                className="w-9 h-9 rounded-2xl flex items-center justify-center mb-1.5 transition-colors"
                style={{ backgroundColor: isSelected ? cat.bg : '#EFECE2', color: cat.color }}
              >
                <Icon className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold">{cat.label}</span>
              {count > 0 && (
                <span className="text-[9px] px-2 py-0.2 mt-1 rounded-full bg-[#E8A598] text-white font-bold">
                  剩餘 {count} 項
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. Progress Banner Card (Bento Card) */}
      <div className="bg-white rounded-[28px] p-5 border-2 border-[#E8E5D8] shadow-[6px_6px_0px_#E0E5D5] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 bg-[#8BBF9F] rounded-full inline-block"></span>
            <span className="text-base font-bold text-[#5D574F]">
              {CATEGORIES.find(c => c.id === activeCategory)?.label} 完成進度
            </span>
            {progressPercent === 100 && (
              <span className="text-[10px] bg-[#8BBF9F] text-white px-2.5 py-0.5 rounded-full font-bold animate-bounce">
                🎉 全部搞定！
              </span>
            )}
          </div>
          <span className="text-sm font-black text-[#8BBF9F]">
            {completedCount} / {totalCount} ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3.5 bg-[#FAF8F3] rounded-full overflow-hidden border border-[#E8E5D8] p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#A5D6A7] to-[#8BBF9F] rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick Assignee Filter Pills */}
        <div className="flex items-center justify-between pt-1.5 border-t border-[#F0ECE1] text-xs">
          <span className="text-[10px] text-[#8E8A81] flex items-center gap-1 font-medium">
            <Filter className="w-3 h-3 text-[#8BBF9F]" /> 篩選指派：
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterAssignee('all_or_mine')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                filterAssignee === 'all_or_mine' 
                  ? 'bg-[#8BBF9F] text-white shadow-[1px_1px_0px_#7AA88C]' 
                  : 'bg-[#FAF8F3] text-[#5D574F] border border-[#E8E5D8]'
              }`}
            >
              與我相關
            </button>
            <button
              onClick={() => setFilterAssignee('all')}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all ${
                filterAssignee === 'all' 
                  ? 'bg-[#8BBF9F] text-white shadow-[1px_1px_0px_#7AA88C]' 
                  : 'bg-[#FAF8F3] text-[#5D574F] border border-[#E8E5D8]'
              }`}
            >
              顯示全員
            </button>
          </div>
        </div>
      </div>

      {/* 3. Items List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-[#5D574F] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-4 bg-[#8BBF9F] rounded-full inline-block"></span>
            <span>📋 清單項目 ({filteredItems.length} 項)</span>
          </h3>

          <button
            id="add-planning-item-btn"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8BBF9F] hover:bg-[#7AA88C] text-white text-xs font-bold rounded-2xl shadow-[3px_3px_0px_#7AA88C] active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增項目</span>
          </button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-[28px] p-6 border-2 border-dashed border-[#E8E5D8] text-center space-y-2">
            <p className="text-sm font-bold text-[#5D574F]">此分類目前沒有未完成的項目</p>
            <p className="text-xs text-[#8E8A81]">點擊上方新增，或試試下方的快速預設項目！</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.map((item) => {
              const assignee = item.assignedTo === 'all'
                ? { name: '全體成員', color: '#8BBF9F' }
                : members.find(m => m.id === item.assignedTo) || { name: '成員', color: '#8E8A81' };

              return (
                <div
                  key={item.id}
                  id={`planning-item-${item.id}`}
                  onClick={() => togglePlanningItem(item.id)}
                  className={`bg-white rounded-[20px] p-3.5 border-2 transition-all cursor-pointer flex items-center justify-between gap-2.5 shadow-[3px_3px_0px_#E0E5D5] hover:border-[#8BBF9F] group ${
                    item.isCompleted ? 'border-[#E8E5D8] bg-[#FAF8F3] opacity-75' : 'border-[#E8E5D8]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox button */}
                    <div 
                      className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                        item.isCompleted 
                          ? 'bg-[#8BBF9F] border-[#8BBF9F] text-white' 
                          : 'bg-white border-[#D5CFBF] hover:border-[#8BBF9F]'
                      }`}
                    >
                      {item.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold text-[#5D574F] truncate ${item.isCompleted ? 'line-through text-[#8E8A81]' : ''}`}>
                          {item.title}
                        </span>
                        {item.categoryTag && (
                          <span className="text-[9px] bg-[#FAF8F3] border border-[#E8E5D8] px-2 py-0.2 rounded-lg text-[#5D574F] font-bold shrink-0">
                            {item.categoryTag}
                          </span>
                        )}
                      </div>
                      {item.notes && (
                        <p className="text-[10px] text-[#8E8A81] truncate mt-0.5">
                          💡 {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-xl bg-[#FAF8F3] border border-[#E8E5D8] text-[#8BBF9F]">
                      {item.assignedTo === 'all' ? '全員' : assignee.name.split(' ')[0]}
                    </span>

                    <button
                      id={`delete-plan-${item.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        showConfirmDialog({
                          title: '刪除清單項目',
                          message: `確定要刪除「${item.title}」嗎？`,
                          onConfirm: () => deletePlanningItem(item.id)
                        });
                      }}
                      className="p-1.5 text-[#8E8A81] hover:text-[#E8A598] hover:bg-[#FDF0ED] rounded-lg transition-all"
                      title="刪除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Quick presets section */}
        <div className="pt-2">
          <span className="text-[10px] font-bold text-[#8E8A81] block mb-2">⚡ 快速加入熱門必備：</span>
          <div className="flex flex-wrap gap-1.5">
            {activeCategory === 'todo' && [
              '確認護照效期大於半年',
              '開通日本雙向國際漫遊/eSIM',
              '投保海外不便險與旅平險',
              '兌換實體日幣現鈔',
              '備妥台灣駕照日文譯本'
            ].map(p => (
              <button
                key={p}
                onClick={() => addQuickPreset(p, '出國必備')}
                className="text-[11px] font-bold text-[#5D574F] bg-[#FAF8F3] hover:bg-white border border-[#E8E5D8] hover:border-[#8BBF9F] px-3 py-1 rounded-xl active:scale-95 transition-all"
              >
                + {p}
              </button>
            ))}

            {activeCategory === 'packing' && [
              '護照正本',
              '行動電源隨身帶',
              '雙電壓快充線',
              '日幣零錢包',
              '折疊晴雨傘',
              '休閒布鞋',
              '個人隨身常備藥'
            ].map(p => (
              <button
                key={p}
                onClick={() => addQuickPreset(p, '行李必帶')}
                className="text-[11px] font-bold text-[#5D574F] bg-[#FAF8F3] hover:bg-white border border-[#E8E5D8] hover:border-[#8BBF9F] px-3 py-1 rounded-xl active:scale-95 transition-all"
              >
                + {p}
              </button>
            ))}

            {activeCategory === 'shopping' && [
              '生八橋抹茶名產',
              '合利他命 EX Plus',
              'SOU・SOU 文創口金包',
              'SHIRO 香氛精油',
              '一蘭拉麵泡麵包'
            ].map(p => (
              <button
                key={p}
                onClick={() => addQuickPreset(p, '必買推薦')}
                className="text-[11px] font-bold text-[#5D574F] bg-[#FAF8F3] hover:bg-white border border-[#E8E5D8] hover:border-[#8BBF9F] px-3 py-1 rounded-xl active:scale-95 transition-all"
              >
                + {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {modalOpen && (
        <div 
          id="planning-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl p-5 ac-shadow border-2 border-[#E2DEC9] relative my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EBE0]">
              <h3 className="text-base font-bold text-[#4A4036]">
                新增{CATEGORIES.find(c => c.id === formData.type)?.label}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full bg-[#F4F1EA] text-[#786C5E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Category */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">清單類別</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, type: cat.id })}
                      className={`py-2 rounded-xl border font-bold text-xs ${
                        formData.type === cat.id 
                          ? 'bg-[#5C8984] text-white border-[#4A726E]' 
                          : 'bg-[#FAF8F3] text-[#6D6257] border-[#DDD7C8]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">項目名稱</label>
                <input
                  type="text"
                  placeholder="例如：辦妥日文駕照譯本、購買伴手禮..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-medium text-sm"
                  required
                  autoFocus
                />
              </div>

              {/* Assignee */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">指派成員</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-medium"
                >
                  <option value="all">全體成員 (所有人皆需準備)</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Category Tag */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">分類標籤 (選填)</label>
                <input
                  type="text"
                  placeholder="例如：重要證件、電子設備、藥妝"
                  value={formData.categoryTag}
                  onChange={(e) => setFormData({ ...formData, categoryTag: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">注意事項備忘 (選填)</label>
                <input
                  type="text"
                  placeholder="例如：需在出發前 3 天確認"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#5C8984] hover:bg-[#4E7672] text-white font-bold rounded-xl active:scale-95 transition-all text-sm"
                >
                  確認新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
