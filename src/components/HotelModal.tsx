import React, { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import { HotelBooking } from '../types';
import { 
  X, 
  Hotel, 
  Calendar, 
  MapPin, 
  Navigation, 
  Phone, 
  Clock, 
  Coins, 
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { PayerSelectGrid, SplitMembersSelectGrid } from './MemberSelector';
import { detectMapProvider, getAlternateMapLinks } from '../utils/mapHelper';
import { getDateForDayIndex, formatShortDate, getHotelTripDaysInfo } from '../utils/hotelLinkHelper';

interface HotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: HotelBooking | null; // null for add mode
  initialCheckInDate?: string;
  initialCheckOutDate?: string;
}

export const HotelModal: React.FC<HotelModalProps> = ({
  isOpen,
  onClose,
  hotel,
  initialCheckInDate,
  initialCheckOutDate
}) => {
  const { 
    members, 
    tripSettings, 
    addHotelBooking, 
    updateHotelBooking, 
    syncHotelToSchedule,
    totalDays 
  } = useTrip();

  const [hotelForm, setHotelForm] = useState<Omit<HotelBooking, 'id'>>({
    name: '',
    photoUrl: '',
    address: '',
    mapUrl: '',
    checkInDate: initialCheckInDate || tripSettings.startDate,
    checkInTime: '15:00',
    checkOutDate: initialCheckOutDate || tripSettings.endDate,
    checkOutTime: '11:00',
    totalPrice: 0,
    currency: tripSettings.foreignCurrency,
    paidByMemberId: members[0]?.id || '',
    splitMemberIds: members.map(m => m.id),
    bookingRef: '',
    phone: '',
    notes: ''
  });

  const [autoSyncCheckIn, setAutoSyncCheckIn] = useState<boolean>(true);
  const [autoSyncCheckOut, setAutoSyncCheckOut] = useState<boolean>(false);

  useEffect(() => {
    if (hotel) {
      setHotelForm({
        name: hotel.name,
        photoUrl: hotel.photoUrl || '',
        address: hotel.address,
        mapUrl: hotel.mapUrl || '',
        checkInDate: hotel.checkInDate,
        checkInTime: hotel.checkInTime || '15:00',
        checkOutDate: hotel.checkOutDate,
        checkOutTime: hotel.checkOutTime || '11:00',
        totalPrice: hotel.totalPrice,
        currency: hotel.currency || tripSettings.foreignCurrency,
        paidByMemberId: hotel.paidByMemberId || members[0]?.id || '',
        splitMemberIds: hotel.splitMemberIds || members.map(m => m.id),
        bookingRef: hotel.bookingRef || '',
        phone: hotel.phone || '',
        notes: hotel.notes || ''
      });
    } else {
      setHotelForm({
        name: '',
        photoUrl: '',
        address: '',
        mapUrl: '',
        checkInDate: initialCheckInDate || tripSettings.startDate,
        checkInTime: '15:00',
        checkOutDate: initialCheckOutDate || tripSettings.endDate,
        checkOutTime: '11:00',
        totalPrice: 0,
        currency: tripSettings.foreignCurrency,
        paidByMemberId: members[0]?.id || '',
        splitMemberIds: members.map(m => m.id),
        bookingRef: '',
        phone: '',
        notes: ''
      });
    }
  }, [hotel, initialCheckInDate, initialCheckOutDate, tripSettings.startDate, tripSettings.endDate, tripSettings.foreignCurrency, members]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelForm.name.trim()) return;

    if (hotel) {
      updateHotelBooking(hotel.id, hotelForm);
      if (autoSyncCheckIn) {
        syncHotelToSchedule({ ...hotelForm, id: hotel.id }, autoSyncCheckOut);
      }
    } else {
      addHotelBooking(hotelForm, autoSyncCheckIn);
    }
    onClose();
  };

  const tripDaysList = Array.from({ length: totalDays }).map((_, idx) => {
    const dateStr = getDateForDayIndex(tripSettings.startDate, idx);
    return {
      dayIndex: idx,
      dateStr,
      label: `Day ${idx + 1} (${formatShortDate(dateStr)})`
    };
  });

  return (
    <div 
      id="hotel-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white rounded-3xl p-5 border-2 border-[#E8E5D8] shadow-[8px_8px_0px_#E0E5D5] relative my-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EBE0]">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-[#FBF2EE] text-[#8A523F] rounded-xl border border-[#ECCDC2] inline-flex items-center justify-center">
              <Hotel className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[#4A4036]">
              {hotel ? '編輯住宿預訂' : '新增住宿預訂'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#F4F1EA] text-[#786C5E] hover:bg-[#EAE5D8] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Photo Uploader */}
          <div>
            <label className="block font-bold text-[#6D6257] mb-1">飯店照片 (選填)</label>
            <ImageUploader
              initialImage={hotelForm.photoUrl}
              onImageChange={(url) => setHotelForm({ ...hotelForm, photoUrl: url })}
              label="上傳飯店外觀或房型照片"
            />
          </div>

          {/* Hotel Name */}
          <div>
            <label className="block font-bold text-[#6D6257] mb-1">飯店名稱 *</label>
            <input
              type="text"
              value={hotelForm.name}
              onChange={(e) => setHotelForm({ ...hotelForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] text-sm font-bold text-[#5D574F]"
              placeholder="例如：京都四條河原町 溫泉町屋風飯店"
              required
            />
          </div>

          {/* Check-in and Check-out Date & Time Section */}
          <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border border-[#E8E5D8] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#6D6257] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#8BBF9F]" />
                入住與退房時間 *
              </span>
              {(() => {
                const d1 = new Date(hotelForm.checkInDate);
                const d2 = new Date(hotelForm.checkOutDate);
                const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
                const nights = diff > 0 ? diff : 1;
                return (
                  <span className="bg-[#E5F2D5] text-[#447A5C] font-bold px-2 py-0.5 rounded-lg border border-[#D0E5BC] text-[10px]">
                    🌙 共 {nights} 晚住宿
                  </span>
                );
              })()}
            </div>

            {/* Quick Trip Day selector buttons */}
            <div>
              <span className="text-[10px] text-[#8E8A81] block mb-1 font-medium">行程天數快速對應：</span>
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
                {tripDaysList.map((td) => {
                  const isCheckIn = hotelForm.checkInDate === td.dateStr;
                  const isCheckOut = hotelForm.checkOutDate === td.dateStr;
                  return (
                    <button
                      key={td.dayIndex}
                      type="button"
                      onClick={() => {
                        if (!hotelForm.checkInDate || hotelForm.checkInDate > td.dateStr) {
                          setHotelForm({ ...hotelForm, checkInDate: td.dateStr });
                        } else {
                          setHotelForm({ ...hotelForm, checkOutDate: td.dateStr });
                        }
                      }}
                      className={`text-[10px] px-2 py-1 rounded-lg shrink-0 font-bold border transition-all ${
                        isCheckIn
                          ? 'bg-[#8BBF9F] text-white border-[#7AA88C]'
                          : isCheckOut
                          ? 'bg-[#E8A598] text-white border-[#D98A7D]'
                          : 'bg-white text-[#5D574F] border-[#E8E5D8] hover:bg-[#F2ECE0]'
                      }`}
                    >
                      {isCheckIn ? `🧳 ${td.label}` : isCheckOut ? `🚪 ${td.label}` : td.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Check-In */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-[#447A5C] mb-1">
                  入住日期 (Check-in)
                </label>
                <input
                  type="date"
                  value={hotelForm.checkInDate}
                  onChange={(e) => setHotelForm({ ...hotelForm, checkInDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#DDD7C8] font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#447A5C] mb-1">
                  入住時間
                </label>
                <input
                  type="time"
                  value={hotelForm.checkInTime}
                  onChange={(e) => setHotelForm({ ...hotelForm, checkInTime: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#DDD7C8] font-medium"
                  required
                />
              </div>
            </div>

            {/* Check-Out */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E8E5D8]">
              <div>
                <label className="block text-[11px] font-bold text-[#C87568] mb-1">
                  退房日期 (Check-out)
                </label>
                <input
                  type="date"
                  value={hotelForm.checkOutDate}
                  onChange={(e) => setHotelForm({ ...hotelForm, checkOutDate: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#DDD7C8] font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#C87568] mb-1">
                  退房時間
                </label>
                <input
                  type="time"
                  value={hotelForm.checkOutTime}
                  onChange={(e) => setHotelForm({ ...hotelForm, checkOutTime: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-white border border-[#DDD7C8] font-medium"
                  required
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block font-bold text-[#6D6257] mb-1">地址 / 交通位置 *</label>
            <input
              type="text"
              value={hotelForm.address}
              onChange={(e) => setHotelForm({ ...hotelForm, address: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
              placeholder="例如：京都府京都市下京區河原町通四條下ル"
              required
            />
          </div>

          {/* Map URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-[#6D6257]">
                地圖 / 導航連結 <span className="text-[10px] font-normal text-[#8E8A81]">(支援 Google / Naver Maps)</span>
              </label>
              {hotelForm.mapUrl && (() => {
                const provider = detectMapProvider(hotelForm.mapUrl);
                if (provider === 'naver') {
                  return (
                    <span className="text-[10px] font-bold text-[#03C75A] bg-[#E8F7ED] border border-[#B6E8C8] px-2 py-0.5 rounded-full flex items-center gap-1">
                      Naver Map
                    </span>
                  );
                }
                if (provider === 'google') {
                  return (
                    <span className="text-[10px] font-bold text-[#1A73E8] bg-[#E8F0FE] border border-[#C2D7FA] px-2 py-0.5 rounded-full flex items-center gap-1">
                      Google Maps
                    </span>
                  );
                }
                return (
                  <span className="text-[10px] font-bold text-[#0284C7] bg-[#F0F9FF] border border-[#BAE6FD] px-2 py-0.5 rounded-full">
                    地圖連結
                  </span>
                );
              })()}
            </div>
            <input
              type="url"
              placeholder="可貼上 Google Maps 或 Naver Map 網址"
              value={hotelForm.mapUrl}
              onChange={(e) => setHotelForm({ ...hotelForm, mapUrl: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] text-[11px]"
            />
            {(hotelForm.name || hotelForm.address) && (
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[10px] text-[#8E8A81]">快速產生：</span>
                <button
                  type="button"
                  onClick={() => {
                    const links = getAlternateMapLinks(`${hotelForm.name} ${hotelForm.address}`);
                    setHotelForm({ ...hotelForm, mapUrl: links.naverMap });
                  }}
                  className="text-[10px] font-bold text-[#03C75A] bg-[#E8F7ED] hover:bg-[#D5F0DC] border border-[#B6E8C8] px-2 py-0.5 rounded-lg active:scale-95 transition-all"
                >
                  🟢 Naver Map
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const links = getAlternateMapLinks(`${hotelForm.name} ${hotelForm.address}`);
                    setHotelForm({ ...hotelForm, mapUrl: links.googleMaps });
                  }}
                  className="text-[10px] font-bold text-[#1A73E8] bg-[#E8F0FE] hover:bg-[#D8E6FD] border border-[#C2D7FA] px-2 py-0.5 rounded-lg active:scale-95 transition-all"
                >
                  🔵 Google Maps
                </button>
              </div>
            )}
          </div>

          {/* Booking Ref & Phone */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">訂房確認號 / 預約代號</label>
              <input
                type="text"
                placeholder="如：AGODA-882910"
                value={hotelForm.bookingRef}
                onChange={(e) => setHotelForm({ ...hotelForm, bookingRef: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">飯店電話</label>
              <input
                type="text"
                placeholder="如：+81 75-123-4567"
                value={hotelForm.phone}
                onChange={(e) => setHotelForm({ ...hotelForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
              />
            </div>
          </div>

          {/* Price & Currency */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">總金額</label>
              <input
                type="number"
                value={hotelForm.totalPrice}
                onChange={(e) => setHotelForm({ ...hotelForm, totalPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">幣別</label>
              <input
                type="text"
                value={hotelForm.currency}
                onChange={(e) => setHotelForm({ ...hotelForm, currency: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-bold text-center"
              />
            </div>
          </div>

          {/* Payer and Split Members */}
          <div className="bg-[#FAF8F3] p-3.5 rounded-2xl border border-[#E8E5D8] space-y-3">
            <PayerSelectGrid
              members={members}
              selectedPayerId={hotelForm.paidByMemberId}
              onSelectPayer={(paidByMemberId) => setHotelForm({ ...hotelForm, paidByMemberId })}
              label="先付款成員 (由誰代付)"
            />

            <div className="pt-2 border-t border-[#E8E5D8]">
              <SplitMembersSelectGrid
                members={members}
                selectedMemberIds={hotelForm.splitMemberIds}
                onChangeSelectedIds={(splitMemberIds) => setHotelForm({ ...hotelForm, splitMemberIds })}
                label="分攤成員"
                totalAmount={hotelForm.totalPrice}
                currency={hotelForm.currency}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-[#6D6257] mb-1">備註事項 (選填)</label>
            <textarea
              rows={2}
              placeholder="例如：頂樓附設溫泉、提供和服體驗、已全額線上刷卡付清..."
              value={hotelForm.notes}
              onChange={(e) => setHotelForm({ ...hotelForm, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] resize-none"
            />
          </div>

          {/* Itinerary Synchronization Settings */}
          <div className="bg-[#EAF5EE] p-3 rounded-2xl border border-[#C2E2D0] space-y-2">
            <div className="flex items-center gap-1.5 text-[#447A5C] font-bold text-xs">
              <LinkIcon className="w-3.5 h-3.5" />
              <span>行程時間軸即時連動設定</span>
            </div>
            
            <label className="flex items-center gap-2 text-[11px] text-[#5D574F] font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={autoSyncCheckIn}
                onChange={(e) => setAutoSyncCheckIn(e.target.checked)}
                className="rounded border-[#C2E2D0] text-[#5C8984] focus:ring-[#5C8984] w-3.5 h-3.5"
              />
              <span>自動在入住日 (Check-in) 建立行程時間軸項目</span>
            </label>

            <label className="flex items-center gap-2 text-[11px] text-[#5D574F] font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={autoSyncCheckOut}
                onChange={(e) => setAutoSyncCheckOut(e.target.checked)}
                className="rounded border-[#C2E2D0] text-[#5C8984] focus:ring-[#5C8984] w-3.5 h-3.5"
              />
              <span>自動在退房日 (Check-out) 建立退房行程項目</span>
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F0EBE0]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#DDD7C8] font-bold text-[#786C5E] hover:bg-[#FAF8F3]"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#8BBF9F] hover:bg-[#7AA88C] text-white font-bold shadow-[2px_2px_0px_#7AA88C] active:scale-95 transition-all"
            >
              {hotel ? '儲存變更' : '新增住宿'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
