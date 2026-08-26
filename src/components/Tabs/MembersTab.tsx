import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { Member } from '../../types';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Camera, 
  QrCode, 
  Share2, 
  Crown, 
  Check, 
  X,
  Mail,
  UserCheck
} from 'lucide-react';
import { ImageUploader } from '../ImageUploader';

const ANIMAL_AVATAR_PRESETS = [
  { name: '狸克 (Tanuki)', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=AliceTanuki&backgroundColor=b6e3f4' },
  { name: '西惠 (Isabelle)', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=BobSecretary&backgroundColor=ffd5dc' },
  { name: '豆狸 (Timmy)', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=CindyGourmet&backgroundColor=d1d4f9' },
  { name: '阿波羅 (Apollo)', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=DavidCamera&backgroundColor=c0aede' },
  { name: '茶茶 (Chacha)', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=ChachaBear&backgroundColor=ffdfbf' },
  { name: '檸檬 (Lemon)', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=LemonCat&backgroundColor=d1f4d9' }
];

const MEMBER_COLORS = ['#5C8984', '#E59866', '#7FB069', '#70A9A1', '#884EA0', '#E88873', '#34495E'];

export const MembersTab: React.FC = () => {
  const { 
    members, 
    addMember, 
    updateMember, 
    deleteMember, 
    currentMemberId, 
    setCurrentMemberId, 
    expenses, 
    tripSettings,
    triggerConfetti,
    showConfirmDialog
  } = useTrip();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Member form state
  const [formData, setFormData] = useState<Omit<Member, 'id'>>({
    name: '',
    avatar: ANIMAL_AVATAR_PRESETS[0].url,
    role: '行程長 / 領航員',
    color: '#5C8984',
    email: ''
  });

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      avatar: ANIMAL_AVATAR_PRESETS[Math.floor(Math.random() * ANIMAL_AVATAR_PRESETS.length)].url,
      role: '吃貨擔當 / 導航員',
      color: MEMBER_COLORS[members.length % MEMBER_COLORS.length],
      email: ''
    });
    setModalOpen(true);
  };

  const openEditModal = (m: Member) => {
    setEditingMember(m);
    setFormData({
      name: m.name,
      avatar: m.avatar,
      role: m.role,
      color: m.color,
      email: m.email || ''
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingMember) {
      updateMember(editingMember.id, formData);
    } else {
      addMember(formData);
    }
    setModalOpen(false);
  };

  const handleCopyInvite = () => {
    const inviteText = `🍃 邀請你一起加入【${tripSettings.title}】的動森旅行手帳！\n目的地：${tripSettings.destination}\n時間：${tripSettings.startDate} ~ ${tripSettings.endDate}`;
    navigator.clipboard.writeText(inviteText);
    setCopied(true);
    triggerConfetti();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="members-tab-content" className="space-y-4 pb-12">
      {/* Header & Share actions */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-sm font-bold text-[#5D574F] flex items-center gap-2">
            <span className="w-2 h-4 bg-[#8BBF9F] rounded-full inline-block"></span>
            <span>👥 旅伴成員名單</span>
            <span className="text-[10px] text-[#8E8A81] font-normal">({members.length} 人)</span>
          </h2>
          <p className="text-[11px] text-[#8E8A81] ml-4">每位成員專屬角色、頭像與分帳身分</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="share-invite-btn"
            onClick={() => setShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#FAF8F3] text-[#5D574F] border-2 border-[#E8E5D8] shadow-[2px_2px_0px_#E0E5D5] text-xs font-bold rounded-2xl active:scale-95 transition-all"
          >
            <Share2 className="w-3.5 h-3.5 text-[#8BBF9F]" />
            <span>邀請旅伴</span>
          </button>

          <button
            id="add-member-btn"
            onClick={openAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8BBF9F] hover:bg-[#7AA88C] text-white text-xs font-bold rounded-2xl shadow-[3px_3px_0px_#7AA88C] active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增成員</span>
          </button>
        </div>
      </div>

      {/* Members Grid Cards (Bento Card Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {members.map((member, idx) => {
          const isCurrentUser = member.id === currentMemberId;
          const paidCount = expenses.filter(e => e.payerId === member.id).length;
          const totalPaid = expenses
            .filter(e => e.payerId === member.id)
            .reduce((acc, curr) => acc + (curr.currency === tripSettings.baseCurrency ? curr.amount : curr.amount * curr.exchangeRate), 0);

          return (
            <div
              key={member.id}
              id={`member-card-${member.id}`}
              className={`bg-white rounded-[28px] p-5 border-2 transition-all relative group ${
                isCurrentUser 
                  ? 'border-[#8BBF9F] shadow-[6px_6px_0px_#8BBF9F]' 
                  : 'border-[#E8E5D8] shadow-[5px_5px_0px_#E0E5D5]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-13 h-13 rounded-2xl border-2 border-[#E8E5D8] object-cover bg-[#FAF8F3]"
                    />
                    {idx === 0 && (
                      <div className="absolute -top-2 -left-1.5 p-1 bg-[#F4D06F] text-[#5D574F] rounded-full border-2 border-white shadow-xs">
                        <Crown className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm sm:text-base font-bold text-[#5D574F]">{member.name}</h3>
                      {isCurrentUser && (
                        <span className="text-[9px] font-bold bg-[#8BBF9F] text-white px-2 py-0.2 rounded-full">
                          目前操作
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#8BBF9F] mt-0.5">{member.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  <button
                    onClick={() => openEditModal(member)}
                    className="p-1.5 text-[#8E8A81] hover:text-[#8BBF9F] rounded-lg"
                    title="編輯"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {members.length > 1 && (
                    <button
                      id={`delete-member-${member.id}`}
                      onClick={() => {
                        showConfirmDialog({
                          title: '移除旅伴成員',
                          message: `確定要將成員「${member.name}」從旅程中移除嗎？此動作將無法復原。`,
                          onConfirm: () => deleteMember(member.id)
                        });
                      }}
                      className="p-1.5 text-[#8E8A81] hover:text-[#E8A598] rounded-lg"
                      title="刪除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Footer & Switch Button */}
              <div className="mt-3.5 pt-3 border-t border-[#F0ECE1] flex items-center justify-between text-xs">
                <div className="text-[#8E8A81] text-[11px] font-medium">
                  已先付代墊：<strong className="text-[#5D574F]">NT$ {Math.round(totalPaid).toLocaleString()}</strong> ({paidCount} 筆)
                </div>

                {!isCurrentUser && (
                  <button
                    onClick={() => setCurrentMemberId(member.id)}
                    className="text-[10px] font-bold text-[#8BBF9F] hover:bg-[#FAF8F3] px-2.5 py-1 rounded-xl border border-[#E8E5D8] active:scale-95 transition-all"
                  >
                    切換為此成員
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Share / Invite Modal */}
      {shareModalOpen && (
        <div 
          id="share-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setShareModalOpen(false)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-3xl p-5 ac-shadow border-2 border-[#E2DEC9] relative space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShareModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F4F1EA] text-[#786C5E]"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#E8F1EF] text-[#5C8984] mx-auto flex items-center justify-center border border-[#B4D3CD]">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-[#4A4036]">邀請旅伴加入手帳</h3>
              <p className="text-xs text-[#8A7E72] mt-1">
                發送連結或 QR Code 給朋友，即可共同查看行程、記帳分攤與旅行日誌！
              </p>
            </div>

            {/* QR Code mockup representation */}
            <div className="w-40 h-40 mx-auto p-3 bg-[#FAF8F3] rounded-2xl border-2 border-[#E2DEC9] flex flex-col items-center justify-center">
              <QrCode className="w-32 h-32 text-[#4A4036]" />
            </div>

            <div className="pt-2">
              <button
                onClick={handleCopyInvite}
                className="w-full py-2.5 bg-[#5C8984] hover:bg-[#4E7672] text-white font-bold text-xs rounded-xl ac-shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>已複製邀請訊息！</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>複製邀請文字與連結</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Member Modal */}
      {modalOpen && (
        <div 
          id="member-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl p-5 ac-shadow border-2 border-[#E2DEC9] relative my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EBE0]">
              <h3 className="text-base font-bold text-[#4A4036]">
                {editingMember ? '編輯成員資料' : '新增旅伴成員'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full bg-[#F4F1EA] text-[#786C5E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Avatar Presets Selection */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1.5">選擇動森風格頭像</label>
                <div className="grid grid-cols-6 gap-2">
                  {ANIMAL_AVATAR_PRESETS.map((preset, pIdx) => {
                    const isSelected = formData.avatar === preset.url;
                    return (
                      <button
                        type="button"
                        key={pIdx}
                        onClick={() => setFormData({ ...formData, avatar: preset.url })}
                        className={`aspect-square rounded-2xl p-1 border-2 transition-all ${
                          isSelected 
                            ? 'border-[#5C8984] scale-110 bg-[#E8F1EF] ring-2 ring-[#5C8984]/30' 
                            : 'border-[#DDD7C8] hover:border-[#5C8984]'
                        }`}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-xl" 
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Or custom avatar upload */}
              <div>
                <ImageUploader
                  label="或上傳自訂頭像照片"
                  currentImage={formData.avatar.startsWith('data:') || formData.avatar.startsWith('http') && !formData.avatar.includes('dicebear') ? formData.avatar : undefined}
                  onImageUploaded={(url) => setFormData({ ...formData, avatar: url })}
                  onImageRemoved={() => setFormData({ ...formData, avatar: ANIMAL_AVATAR_PRESETS[0].url })}
                  aspect="square"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">成員姓名 / 暱稱</label>
                <input
                  type="text"
                  placeholder="例如：Alice (狸克團長)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-medium text-sm"
                  required
                />
              </div>

              {/* Role */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">分工角色</label>
                <input
                  type="text"
                  placeholder="例如：行程長 / 總務大臣 / 美食嚮導 / 專屬司機"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                  required
                />
              </div>

              {/* Email / Contact */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">聯絡 Email (選填)</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#5C8984] hover:bg-[#4E7672] text-white font-bold rounded-xl active:scale-95 transition-all text-sm"
                >
                  {editingMember ? '儲存修改' : '確認新增成員'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
