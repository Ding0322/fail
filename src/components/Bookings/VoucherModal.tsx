import React, { useState, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { VoucherBooking } from '../../types';
import { X, Ticket, Users, CreditCard, DollarSign, Calendar, Globe, FileText, Sparkles } from 'lucide-react';
import { ImageUploader } from '../ImageUploader';
import { PayerSelectGrid, SplitMembersSelectGrid } from '../MemberSelector';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: VoucherBooking | null;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ isOpen, onClose, voucher }) => {
  const { 
    addVoucherBooking, 
    updateVoucherBooking, 
    members, 
    tripSettings 
  } = useTrip();

  const [formData, setFormData] = useState<Omit<VoucherBooking, 'id'>>({
    title: '',
    category: 'ticket',
    provider: 'Klook',
    validDate: tripSettings.startDate,
    code: '',
    url: '',
    paidByMemberId: members[0]?.id || 'm1',
    splitMemberIds: members.map(m => m.id),
    quantity: 1,
    amount: 0,
    currency: tripSettings.foreignCurrency || 'JPY',
    fileUrl: '',
    notes: ''
  });

  useEffect(() => {
    if (voucher) {
      setFormData({
        title: voucher.title,
        category: voucher.category,
        provider: voucher.provider,
        validDate: voucher.validDate,
        code: voucher.code || '',
        url: voucher.url || '',
        paidByMemberId: voucher.paidByMemberId || members[0]?.id || 'm1',
        splitMemberIds: voucher.splitMemberIds && voucher.splitMemberIds.length > 0 ? voucher.splitMemberIds : members.map(m => m.id),
        quantity: voucher.quantity !== undefined ? voucher.quantity : 1,
        amount: voucher.amount !== undefined ? voucher.amount : 0,
        currency: voucher.currency || tripSettings.foreignCurrency || 'JPY',
        fileUrl: voucher.fileUrl || '',
        notes: voucher.notes || ''
      });
    } else {
      setFormData({
        title: '',
        category: 'ticket',
        provider: 'Klook',
        validDate: tripSettings.startDate,
        code: '',
        url: '',
        paidByMemberId: members[0]?.id || 'm1',
        splitMemberIds: members.map(m => m.id),
        quantity: 1,
        amount: 0,
        currency: tripSettings.foreignCurrency || 'JPY',
        fileUrl: '',
        notes: ''
      });
    }
  }, [voucher, isOpen, members, tripSettings]);

  if (!isOpen) return null;

  const toggleSplitMember = (memberId: string) => {
    setFormData(prev => {
      const exists = (prev.splitMemberIds || []).includes(memberId);
      if (exists) {
        if ((prev.splitMemberIds || []).length <= 1) return prev;
        return {
          ...prev,
          splitMemberIds: (prev.splitMemberIds || []).filter(id => id !== memberId)
        };
      } else {
        return {
          ...prev,
          splitMemberIds: [...(prev.splitMemberIds || []), memberId]
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (voucher) {
      updateVoucherBooking(voucher.id, formData);
    } else {
      addVoucherBooking(formData);
    }
    onClose();
  };

  return (
    <div 
      id="voucher-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-[28px] p-5 sm:p-6 border-2 border-[#E8E5D8] shadow-[6px_6px_0px_#E0E5D5] relative my-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EBE0]">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#FBF2EE] text-[#8A523F] rounded-xl border border-[#ECCDC2]">
              <Ticket className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[#5D574F]">
              {voucher ? '編輯票券憑證' : '新增票券憑證'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#FAF8F3] text-[#8E8A81] hover:bg-[#EFECE2] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* 1. 票券名稱 */}
          <div>
            <label className="block font-bold text-[#6D6257] mb-1">票券名稱 *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] text-sm font-bold text-[#5D574F]"
              placeholder="例如：HARUKA 特快車票、環球影城門票、景點入場券"
              required
            />
          </div>

          {/* 2. 票券分類 & 有效日期 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">票券分類</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-bold text-xs"
              >
                <option value="ticket">🎟️ 門票 / 入場券</option>
                <option value="pass">🚄 交通票 / 周遊券</option>
                <option value="activity">👘 體驗活動 / 導覽</option>
                <option value="coupon">🏷️ 折價券 / 優惠券</option>
                <option value="other">📄 其他憑證</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#6D6257] mb-1">使用 / 有效日期</label>
              <input
                type="date"
                value={formData.validDate}
                onChange={(e) => setFormData({ ...formData, validDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-medium"
                required
              />
            </div>
          </div>

          {/* 3. 購買管道 & 兌換代碼 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">購買管道 / 平台</label>
              <input
                type="text"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                placeholder="如：Klook, KKday, 官網"
              />
            </div>
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">兌換代碼 / 序號</label>
              <input
                type="text"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-mono font-bold text-[#5C8984]"
                placeholder="如：KLK-882910"
              />
            </div>
          </div>

          {/* 4. 網址 (URL) */}
          <div>
            <label className="block font-bold text-[#6D6257] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#8BBF9F]" />
                <span>網址 / 預訂連結</span>
              </span>
              <span className="text-[10px] text-[#8E8A81] font-normal">(選填，點擊可直接開啟網頁)</span>
            </label>
            <input
              type="url"
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-medium text-xs"
              placeholder="https://www.klook.com/... 或官方票券連結"
            />
          </div>

          {/* 5. 金額、付款人與數量 (連動記帳) */}
          <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border-2 border-[#E8E5D8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5D574F] flex items-center gap-1.5 text-xs">
                <DollarSign className="w-3.5 h-3.5 text-[#8BBF9F]" />
                <span>費用與付款設定</span>
              </span>
              <span className="text-[10px] text-[#447A5C] bg-[#E5F2D5] px-2 py-0.5 rounded-md font-bold border border-[#D0E5BC]">
                ✨ 自動連動記帳頁面
              </span>
            </div>

            {/* 付款人 */}
            <PayerSelectGrid
              members={members}
              selectedPayerId={formData.paidByMemberId}
              onSelectPayer={(paidByMemberId) => setFormData({ ...formData, paidByMemberId })}
              label="付款人 (由誰先支付票券費用)"
            />

            {/* 數量、金額、幣別 */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-[#6D6257] mb-1 flex items-center gap-1">
                  <Ticket className="w-3 h-3 text-[#8BBF9F]" />
                  <span>票券數量</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity || 1}
                  onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD7C8] font-bold text-xs"
                  placeholder="1"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#6D6257] mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-[#8BBF9F]" />
                  <span>總金額</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.amount ?? 0}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD7C8] font-bold text-xs text-[#5C8984]"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block font-bold text-[#6D6257] mb-1">幣別</label>
                <input
                  type="text"
                  value={formData.currency || tripSettings.foreignCurrency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                  className="w-full px-2 py-2 rounded-xl bg-white border border-[#DDD7C8] font-bold text-center text-xs"
                  placeholder="JPY / TWD"
                />
              </div>
            </div>

            {/* 分攤成員 */}
            <SplitMembersSelectGrid
              members={members}
              selectedMemberIds={formData.splitMemberIds || []}
              onChangeSelectedIds={(splitMemberIds) => setFormData({ ...formData, splitMemberIds })}
              label="分攤成員"
              totalAmount={formData.amount}
              currency={formData.currency || tripSettings.foreignCurrency}
            />
          </div>

          {/* 6. 備註 */}
          <div>
            <label className="block font-bold text-[#6D6257] mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#8BBF9F]" />
              <span>備註 / 使用說明</span>
            </label>
            <textarea
              rows={2}
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] text-xs resize-none"
              placeholder="例如：兌換方式、集合地點、使用限制與注意事項等"
            />
          </div>

          {/* 7. 上傳電子憑證 / 票券照片 */}
          <ImageUploader
            label="上傳電子憑證 / QR Code 截圖"
            currentImage={formData.fileUrl}
            onImageUploaded={(url) => setFormData({ ...formData, fileUrl: url })}
            onImageRemoved={() => setFormData({ ...formData, fileUrl: '' })}
          />

          <button
            type="submit"
            className="w-full py-2.5 bg-[#8BBF9F] hover:bg-[#7AA88C] text-white font-bold rounded-xl active:scale-95 transition-all text-sm mt-2 shadow-[2px_2px_0px_#7AA88C]"
          >
            確認儲存並同步記帳
          </button>
        </form>
      </div>
    </div>
  );
};
