import React, { useState, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { CarRentalBooking } from '../../types';
import { X, Car, Users, CreditCard, DollarSign, Calendar, Globe, Clock, MapPin, Sparkles } from 'lucide-react';
import { ImageUploader } from '../ImageUploader';
import { PayerSelectGrid, SplitMembersSelectGrid } from '../MemberSelector';

interface CarRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
  car: CarRentalBooking | null;
}

export const CarRentalModal: React.FC<CarRentalModalProps> = ({ isOpen, onClose, car }) => {
  const { 
    addCarRentalBooking, 
    updateCarRentalBooking, 
    members, 
    tripSettings 
  } = useTrip();

  const [formData, setFormData] = useState<Omit<CarRentalBooking, 'id'>>({
    company: 'Toyota Rent a Car',
    carModel: 'Toyota Sienta 7人座油電',
    pickupDate: tripSettings.startDate,
    pickupTime: `${tripSettings.startDate} 09:00`,
    pickupLocation: '京都站前店',
    returnDate: tripSettings.startDate,
    returnTime: `${tripSettings.startDate} 20:00`,
    returnLocation: '京都站前店',
    url: 'https://rent.toyota.co.jp/',
    confirmationNumber: 'TOYOTA-7712',
    totalPrice: 16500,
    currency: tripSettings.foreignCurrency || 'JPY',
    paidByMemberId: members[0]?.id || 'm1',
    splitMemberIds: members.map(m => m.id),
    driverName: members[0]?.name || '',
    photoUrl: '',
    notes: '含免責補償險 NOC、ETC 卡租借'
  });

  useEffect(() => {
    if (car) {
      setFormData({
        company: car.company,
        carModel: car.carModel,
        pickupDate: car.pickupDate || car.pickupTime?.split(' ')[0] || tripSettings.startDate,
        pickupTime: car.pickupTime || `${tripSettings.startDate} 09:00`,
        pickupLocation: car.pickupLocation || '',
        returnDate: car.returnDate || car.returnTime?.split(' ')[0] || tripSettings.startDate,
        returnTime: car.returnTime || `${tripSettings.startDate} 20:00`,
        returnLocation: car.returnLocation || '',
        url: car.url || '',
        confirmationNumber: car.confirmationNumber || '',
        totalPrice: car.totalPrice !== undefined ? car.totalPrice : 15000,
        currency: car.currency || tripSettings.foreignCurrency || 'JPY',
        paidByMemberId: car.paidByMemberId || members[0]?.id || 'm1',
        splitMemberIds: car.splitMemberIds && car.splitMemberIds.length > 0 ? car.splitMemberIds : members.map(m => m.id),
        driverName: car.driverName || members[0]?.name || '',
        photoUrl: car.photoUrl || '',
        notes: car.notes || ''
      });
    } else {
      setFormData({
        company: 'Toyota Rent a Car',
        carModel: 'Toyota Sienta 7人座油電',
        pickupDate: tripSettings.startDate,
        pickupTime: `${tripSettings.startDate} 09:00`,
        pickupLocation: '京都站前店',
        returnDate: tripSettings.startDate,
        returnTime: `${tripSettings.startDate} 20:00`,
        returnLocation: '京都站前店',
        url: 'https://rent.toyota.co.jp/',
        confirmationNumber: '',
        totalPrice: 16500,
        currency: tripSettings.foreignCurrency || 'JPY',
        paidByMemberId: members[0]?.id || 'm1',
        splitMemberIds: members.map(m => m.id),
        driverName: members[0]?.name || '',
        photoUrl: '',
        notes: '含全險 NOC'
      });
    }
  }, [car, isOpen, members, tripSettings]);

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
    if (!formData.company.trim() || !formData.carModel.trim()) return;

    if (car) {
      updateCarRentalBooking(car.id, formData);
    } else {
      addCarRentalBooking(formData);
    }
    onClose();
  };

  return (
    <div 
      id="car-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-[28px] p-5 sm:p-6 border-2 border-[#E8E5D8] shadow-[6px_6px_0px_#E0E5D5] relative my-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EBE0]">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#EDF5FA] text-[#3A6B88] rounded-xl border border-[#C5DFEF]">
              <Car className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[#5D574F]">
              {car ? '編輯租車預約' : '新增租車預約'}
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
          {/* 1. 金額與付款人區塊 (連動記帳) */}
          <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border-2 border-[#E8E5D8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#5D574F] flex items-center gap-1.5 text-xs">
                <DollarSign className="w-3.5 h-3.5 text-[#8BBF9F]" />
                <span>租車金額與付款人設定</span>
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
              label="付款人 (由誰先支付租車費用)"
            />

            {/* 金額與幣別 */}
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className="block font-bold text-[#6D6257] mb-1">租車總金額</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.totalPrice || 0}
                  onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD7C8] font-bold text-xs text-[#5C8984]"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#6D6257] mb-1">幣別</label>
                <input
                  type="text"
                  value={formData.currency || 'JPY'}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                  className="w-full px-2 py-2 rounded-xl bg-white border border-[#DDD7C8] font-bold text-center text-xs"
                  required
                />
              </div>
            </div>

            {/* 分攤成員 */}
            <SplitMembersSelectGrid
              members={members}
              selectedMemberIds={formData.splitMemberIds || []}
              onChangeSelectedIds={(splitMemberIds) => setFormData({ ...formData, splitMemberIds })}
              label="分攤成員"
              totalAmount={formData.totalPrice}
              currency={formData.currency}
            />
          </div>

          {/* 2. 租車公司與車型 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">租車公司 *</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-bold"
                placeholder="如 Toyota Rent a Car, Times, ORIX"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">車型車款 *</label>
              <input
                type="text"
                value={formData.carModel}
                onChange={(e) => setFormData({ ...formData, carModel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-bold"
                placeholder="如 Toyota Sienta 7人座"
                required
              />
            </div>
          </div>

          {/* 3. 取車設定：取車時間與取車地分開 */}
          <div className="p-3 bg-[#FAF8F3] rounded-2xl border border-[#DDD7C8] space-y-2">
            <span className="font-bold text-[#5D574F] flex items-center gap-1">
              <span className="w-2 h-3.5 bg-[#8BBF9F] rounded-full inline-block"></span>
              <span>取車資訊 (時間與地點分開設定)</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-[#6D6257] mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#8BBF9F]" />
                  <span>取車時間 *</span>
                </label>
                <input
                  type="text"
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD7C8] font-bold text-[#447A5C]"
                  placeholder="例如：2026-10-17 09:00"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-[#6D6257] mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#8BBF9F]" />
                  <span>取車地 *</span>
                </label>
                <input
                  type="text"
                  value={formData.pickupLocation}
                  onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD7C8] font-medium"
                  placeholder="例如：京都站前店、關西機場店"
                  required
                />
              </div>
            </div>
          </div>

          {/* 4. 還車設定：還車時間與還車地分開 */}
          <div className="p-3 bg-[#FAF8F3] rounded-2xl border border-[#DDD7C8] space-y-2">
            <span className="font-bold text-[#5D574F] flex items-center gap-1">
              <span className="w-2 h-3.5 bg-[#E8A598] rounded-full inline-block"></span>
              <span>還車資訊</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-[#6D6257] mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#E8A598]" />
                  <span>還車時間</span>
                </label>
                <input
                  type="text"
                  value={formData.returnTime}
                  onChange={(e) => setFormData({ ...formData, returnTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD7C8] font-bold text-[#8E8A81]"
                  placeholder="例如：2026-10-17 20:00"
                />
              </div>
              <div>
                <label className="block font-bold text-[#6D6257] mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#E8A598]" />
                  <span>還車地</span>
                </label>
                <input
                  type="text"
                  value={formData.returnLocation}
                  onChange={(e) => setFormData({ ...formData, returnLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD7C8] font-medium"
                  placeholder="例如：京都站前店 (同店還車)"
                />
              </div>
            </div>
          </div>

          {/* 5. 網址 (URL) */}
          <div>
            <label className="block font-bold text-[#6D6257] mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-[#8BBF9F]" />
                <span>租車網址 / 預訂連結</span>
              </span>
              <span className="text-[10px] text-[#8E8A81] font-normal">(選填，點擊可直接開啟預訂官網)</span>
            </label>
            <input
              type="url"
              value={formData.url || ''}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] text-xs font-medium"
              placeholder="https://rent.toyota.co.jp/... 或預訂管理連結"
            />
          </div>

          {/* 6. 預約號碼 & 主要駕駛人 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">預約號碼 / 確認號</label>
              <input
                type="text"
                value={formData.confirmationNumber}
                onChange={(e) => setFormData({ ...formData, confirmationNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-mono font-bold"
                placeholder="TOYOTA-7712"
              />
            </div>
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">主要駕駛人</label>
              <input
                type="text"
                value={formData.driverName || ''}
                onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                placeholder="駕駛人姓名"
              />
            </div>
          </div>

          {/* 7. 備註 */}
          <div>
            <label className="block font-bold text-[#6D6257] mb-1">備註 / 保險資訊</label>
            <input
              type="text"
              placeholder="例如：含全險 NOC、附中文導航、ETC 車載器"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
            />
          </div>

          {/* 8. 上傳明細照片 / 租車憑單 */}
          <ImageUploader
            label="上傳租車明細照片 / 預訂確認單截圖"
            currentImage={formData.photoUrl}
            onImageUploaded={(url) => setFormData({ ...formData, photoUrl: url })}
            onImageRemoved={() => setFormData({ ...formData, photoUrl: '' })}
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
