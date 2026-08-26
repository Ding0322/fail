import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { JournalEntry } from '../../types';
import { 
  BookHeart, 
  Plus, 
  Heart, 
  MapPin, 
  Smile, 
  Trash2, 
  Edit3, 
  Camera, 
  Sparkles,
  Calendar,
  X,
  Share2
} from 'lucide-react';
import { ImageUploader } from '../ImageUploader';

const MOODS = [
  { id: 'happy', label: '開朗幸福', emoji: '🌸' },
  { id: 'excited', label: '熱血興奮', emoji: '✨' },
  { id: 'relax', label: '漫活放鬆', emoji: '🍵' },
  { id: 'food', label: '吃貨滿足', emoji: '🍱' },
  { id: 'nature', label: '沉浸自然', emoji: '🍃' },
  { id: 'tired', label: '腿軟充實', emoji: '💤' }
] as const;

export const JournalTab: React.FC = () => {
  const {
    journalEntries,
    addJournalEntry,
    updateJournalEntry,
    deleteJournalEntry,
    toggleJournalLike,
    members,
    currentMemberId,
    showConfirmDialog
  } = useTrip();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    authorId: string;
    date: string;
    location: string;
    mood: 'happy' | 'excited' | 'relax' | 'tired' | 'food' | 'nature';
    weather: string;
    photos: string[];
    tags: string;
  }>({
    title: '',
    content: '',
    authorId: currentMemberId,
    date: new Date().toISOString().split('T')[0],
    location: '',
    mood: 'happy',
    weather: '晴天 22°C',
    photos: [],
    tags: '京都漫步, 動森生活'
  });

  const openAddModal = () => {
    setEditingEntry(null);
    setFormData({
      title: '',
      content: '',
      authorId: currentMemberId,
      date: new Date().toISOString().split('T')[0],
      location: '',
      mood: 'happy',
      weather: '晴朗舒服 22°C',
      photos: [],
      tags: '手帳日記, 旅行回憶'
    });
    setModalOpen(true);
  };

  const openEditModal = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      authorId: entry.authorId,
      date: entry.date,
      location: entry.location || '',
      mood: entry.mood || 'happy',
      weather: entry.weather || '',
      photos: entry.photos || [],
      tags: entry.tags ? entry.tags.join(', ') : ''
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const tagsArray = formData.tags
      .split(/[,， ]+/)
      .map(t => t.trim())
      .filter(Boolean);

    const payload = {
      title: formData.title,
      content: formData.content,
      authorId: formData.authorId,
      date: formData.date,
      location: formData.location,
      mood: formData.mood,
      weather: formData.weather,
      photos: formData.photos,
      tags: tagsArray
    };

    if (editingEntry) {
      updateJournalEntry(editingEntry.id, payload);
    } else {
      addJournalEntry(payload);
    }
    setModalOpen(false);
  };

  return (
    <div id="journal-tab-content" className="space-y-4 pb-12">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-bold text-[#5D574F] flex items-center gap-2">
            <span className="w-2 h-4 bg-[#8BBF9F] rounded-full inline-block"></span>
            <span>📖 旅行手帳日誌</span>
          </h2>
          <p className="text-[11px] text-[#8E8A81] ml-4">像拍立得一樣紀錄當下的感動與日常</p>
        </div>

        <button
          id="add-journal-btn"
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8BBF9F] hover:bg-[#7AA88C] text-white text-xs font-bold rounded-2xl shadow-[3px_3px_0px_#7AA88C] active:scale-95 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>寫篇日記</span>
        </button>
      </div>

      {/* Journal Cards Feed */}
      {journalEntries.length === 0 ? (
        <div className="bg-white rounded-[28px] p-8 border-2 border-dashed border-[#E8E5D8] text-center space-y-2">
          <span className="text-3xl">📷</span>
          <p className="text-sm font-bold text-[#5D574F]">目前還沒有手帳日記</p>
          <p className="text-xs text-[#8E8A81]">記錄今天吃到的美食或拍下的風景照片吧！</p>
        </div>
      ) : (
        <div className="space-y-5">
          {journalEntries.map((entry) => {
            const author = members.find(m => m.id === entry.authorId);
            const mood = MOODS.find(m => m.id === entry.mood) || MOODS[0];

            return (
              <div
                key={entry.id}
                id={`journal-post-${entry.id}`}
                className="bg-white rounded-[28px] p-5 sm:p-6 border-2 border-[#E8E5D8] shadow-[6px_6px_0px_#E0E5D5] space-y-3.5 group relative"
              >
                {/* Author & Date Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={author?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=User'}
                      alt={author?.name}
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-2xl border-2 border-[#8BBF9F]/40 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#5D574F]">{author?.name}</span>
                        <span className="text-[10px] text-[#447A5C] bg-[#E5F2D5] px-2 py-0.2 rounded-lg font-bold">
                          {author?.role.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#8E8A81]">
                        <span>{entry.date}</span>
                        {entry.location && (
                          <span className="flex items-center gap-0.5 text-[#5D574F]">
                            <MapPin className="w-2.5 h-2.5 text-[#8BBF9F]" />
                            {entry.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mood & Actions */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs px-2.5 py-1 bg-[#FAF8F3] border border-[#E8E5D8] rounded-xl flex items-center gap-1 text-[#5D574F] font-bold">
                      <span>{mood.emoji}</span>
                      <span className="text-[10px]">{mood.label}</span>
                    </span>

                    <div className="flex items-center opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => openEditModal(entry)}
                        className="p-1.5 text-[#8E8A81] hover:text-[#8BBF9F] rounded-lg"
                        title="編輯"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`delete-journal-${entry.id}`}
                        onClick={() => {
                          showConfirmDialog({
                            title: '刪除手帳日誌',
                            message: `確定要刪除「${entry.title}」日誌嗎？`,
                            onConfirm: () => deleteJournalEntry(entry.id)
                          });
                        }}
                        className="p-1.5 text-[#8E8A81] hover:text-[#E8A598] rounded-lg"
                        title="刪除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-[#5D574F] leading-snug">
                  {entry.title}
                </h3>

                {/* Photo Gallery (Polaroid style with Bento rounded border) */}
                {entry.photos && entry.photos.length > 0 && (
                  <div className={`grid gap-2.5 ${entry.photos.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {entry.photos.map((photo, pIdx) => (
                      <div
                        key={pIdx}
                        className="aspect-[4/3] rounded-2xl overflow-hidden border-2 border-[#E8E5D8] bg-[#FAF8F3] relative"
                      >
                        <img
                          src={photo}
                          alt="Journal moment"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Content */}
                <p className="text-xs sm:text-sm text-[#5D574F] leading-relaxed whitespace-pre-wrap font-medium">
                  {entry.content}
                </p>

                {/* Tags & Likes Footer */}
                <div className="flex items-center justify-between pt-2.5 border-t border-[#F0ECE1] text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {entry.tags?.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="text-[10px] text-[#8BBF9F] bg-[#FAF8F3] border border-[#E8E5D8] px-2.5 py-0.5 rounded-lg font-bold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => toggleJournalLike(entry.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-[#FDF0ED] hover:bg-[#FCE6E2] text-[#E8A598] rounded-xl border border-[#F8D4CE] font-bold text-xs active:scale-95 transition-transform shrink-0"
                  >
                    <Heart className="w-3.5 h-3.5 fill-[#E8A598]" />
                    <span>{entry.likes || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Journal Modal */}
      {modalOpen && (
        <div 
          id="journal-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl p-5 ac-shadow border-2 border-[#E2DEC9] relative my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EBE0]">
              <h3 className="text-base font-bold text-[#4A4036]">
                {editingEntry ? '編輯手帳日記' : '撰寫新旅行手帳'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full bg-[#F4F1EA] text-[#786C5E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Title */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">手帳篇名</label>
                <input
                  type="text"
                  placeholder="例如：穿和服走在清水寺街道上 🍵"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-medium text-sm"
                  required
                />
              </div>

              {/* Author & Date */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#6D6257] mb-1">作者</label>
                  <select
                    value={formData.authorId}
                    onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#6D6257] mb-1">日期</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                  />
                </div>
              </div>

              {/* Location & Mood */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#6D6257] mb-1">地點打卡</label>
                  <input
                    type="text"
                    placeholder="例如：京都・嵐山渡月橋"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#6D6257] mb-1">心情氛圍</label>
                  <select
                    value={formData.mood}
                    onChange={(e) => setFormData({ ...formData, mood: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                  >
                    {MOODS.map(m => (
                      <option key={m.id} value={m.id}>{m.emoji} {m.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <ImageUploader
                  label="上傳旅行照片"
                  currentImage={formData.photos[0]}
                  onImageUploaded={(url) => setFormData({ ...formData, photos: [url, ...formData.photos.slice(1)] })}
                  onImageRemoved={() => setFormData({ ...formData, photos: [] })}
                  aspect="video"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">手帳內容紀錄</label>
                <textarea
                  rows={4}
                  placeholder="紀錄下今天的美味、趣事、感動時刻..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                  required
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">標籤 (以逗號分隔)</label>
                <input
                  type="text"
                  placeholder="例如：京都漫步, 和服體驗, 抹茶生茶凍"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#5C8984] hover:bg-[#4E7672] text-white font-bold rounded-xl active:scale-95 transition-all text-sm"
                >
                  {editingEntry ? '儲存修改' : '發佈手帳日誌 🌸'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
