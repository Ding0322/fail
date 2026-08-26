import React, { useState, useEffect } from 'react';
import { useTrip } from '../../context/TripContext';
import { FlightBooking } from '../../types';
import { X, Plane, Users, CreditCard, DollarSign, Calendar, Sparkles, Tag } from 'lucide-react';
import { PayerSelectGrid, SplitMembersSelectGrid } from '../MemberSelector';

interface FlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  flight: FlightBooking | null;
}

export const FlightModal: React.FC<FlightModalProps> = ({ isOpen, onClose, flight }) => {
  const { 
    addFlightBooking, 
    updateFlightBooking, 
    members, 
    tripSettings 
  } = useTrip();

  const [formData, setFormData] = useState<Omit<FlightBooking, 'id'>>({
    airline: '長榮航空 EVA AIR',
    flightNumber: 'BR132',
    departureCity: '台北 (桃園)',
    departureCode: 'TPE',
    departureTime: '08:30',
    arrivalCity: '大阪 (關西)',
    arrivalCode: 'KIX',
    arrivalTime: '12:10',
    date: tripSettings.startDate,
    seat: '24A, 24B',
    gate: 'C7',
    terminal: 'T1',
    bookingRef: 'EVA-8899JP',
    passengerNames: members.map(m => m.name),
    quantity: members.length || 4,
    unitPrice: 14500,
    totalPrice: (members.length || 4) * 14500,
    currency: tripSettings.baseCurrency || 'TWD',
    paidByMemberId: members[0]?.id || 'm1',
    splitMemberIds: members.map(m => m.id),
    notes: '含託運行李 23kg * 2'
  });

  useEffect(() => {
    if (flight) {
      setFormData({
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        departureCity: flight.departureCity,
        departureCode: flight.departureCode,
        departureTime: flight.departureTime,
        arrivalCity: flight.arrivalCity,
        arrivalCode: flight.arrivalCode,
        arrivalTime: flight.arrivalTime,
        date: flight.date,
        seat: flight.seat || '',
        gate: flight.gate || '',
        terminal: flight.terminal || '',
        bookingRef: flight.bookingRef,
        passengerNames: flight.passengerNames || members.map(m => m.name),
        quantity: flight.quantity !== undefined ? flight.quantity : (members.length || 1),
        unitPrice: flight.unitPrice !== undefined ? flight.unitPrice : 0,
        totalPrice: flight.totalPrice !== undefined ? flight.totalPrice : (flight.unitPrice && flight.quantity ? flight.unitPrice * flight.quantity : 0),
        currency: flight.currency || tripSettings.baseCurrency || 'TWD',
        paidByMemberId: flight.paidByMemberId || members[0]?.id || 'm1',
        splitMemberIds: flight.splitMemberIds && flight.splitMemberIds.length > 0 ? flight.splitMemberIds : members.map(m => m.id),
        notes: flight.notes || ''
      });
    } else {
      const defaultQty = members.length || 4;
      const defaultUnit = 14500;
      setFormData({
        airline: '長榮航空 EVA AIR',
        flightNumber: 'BR132',
        departureCity: '台北 (桃園)',
        departureCode: 'TPE',
        departureTime: '08:30',
        arrivalCity: '大阪 (關西)',
        arrivalCode: 'KIX',
        arrivalTime: '12:10',
        date: tripSettings.startDate,
        seat: '24A, 24B',
        gate: 'C7',
        terminal: 'T1',
        bookingRef: 'EVA-8899JP',
        passengerNames: members.map(m => m.name),
        quantity: defaultQty,
        unitPrice: defaultUnit,
        totalPrice: defaultQty * defaultUnit,
        currency: tripSettings.baseCurrency || 'TWD',
        paidByMemberId: members[0]?.id || 'm1',
        splitMemberIds: members.map(m => m.id),
        notes: '含託運行李 23kg * 2'
      });
    }
  }, [flight, isOpen, members, tripSettings]);

  if (!isOpen) return null;

  const handleQuantityChange = (qty: number) => {
    const validQty = Math.max(1, qty);
    setFormData(prev => {
      const newTotal = prev.unitPrice ? validQty * prev.unitPrice : prev.totalPrice;
      return {
        ...prev,
        quantity: validQty,
        totalPrice: newTotal
      };
    });
  };

  const handleUnitPriceChange = (unit: number) => {
    setFormData(prev => ({
      ...prev,
      unitPrice: unit,
      totalPrice: (prev.quantity || 1) * unit
    }));
  };

  const handleTotalPriceChange = (total: number) => {
    setFormData(prev => {
      const qty = prev.quantity && prev.quantity > 0 ? prev.quantity : 1;
      return {
        ...prev,
        totalPrice: total,
        unitPrice: Math.round(total / qty)
      };
    });
  };

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
    if (!formData.airline.trim() || !formData.flightNumber.trim()) return;

    if (flight) {
      updateFlightBooking(flight.id, formData);
    } else {
      addFlightBooking(formData);
    }
    onClose();
  };

  return (
    <div 
      id="flight-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-white rounded-[28px] p-5 sm:p-6 border-2 border-[#E8E5D8] shadow-[6px_6px_0px_#E0E5D5] relative my-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EBE0]">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#EAF5EE] text-[#447A5C] rounded-xl border border-[#C2E2D0]">
              <Plane className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[#5D574F]">
              {flight ? '編輯機票預訂' : '新增機票預訂'}
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
                <span>機票費用與付款設定</span>
              </span>
              <span className="text-[10px] text-[#447A5C] bg-[#E5F2D5] px-2 py-0.5 rounded-md font-bold border border-[#D0E5BC]">
                ✨ 自動連動記帳頁面
              </span>
            </div>

            {/* 付款人選擇 */}
            <PayerSelectGrid
              members={members}
              selectedPayerId={formData.paidByMemberId}
              onSelectPayer={(paidByMemberId) => setFormData({ ...formData, paidByMemberId })}
              label="付款人 (由誰先支付機票款)"
            />

            {/* 數量、單張票金額、總金額、幣別 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">機票數量</label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity || 1}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                  className="w-full px-2.5 py-2 rounded-xl bg-white border border-[#DDD7C8] font-bold text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#6D6257] mb-1">單張票金額</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.unitPrice || 0}
                  onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-2 rounded-xl bg-white border border-[#DDD7C8] font-bold text-xs text-[#5C8984]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#6D6257] mb-1">總金額</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={formData.totalPrice || 0}
                  onChange={(e) => handleTotalPriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-2.5 py-2 rounded-xl bg-white border border-[#DDD7C8] font-bold text-xs text-[#E8A598]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#6D6257] mb-1">幣別</label>
                <input
                  type="text"
                  value={formData.currency || 'TWD'}
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

          {/* 2. 航空公司與航班號碼 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">航空公司 *</label>
              <input
                type="text"
                value={formData.airline}
                onChange={(e) => setFormData({ ...formData, airline: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">航班號碼 *</label>
              <input
                type="text"
                value={formData.flightNumber}
                onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-bold font-mono"
                required
              />
            </div>
          </div>

          {/* 3. 出發與抵達 */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">出發城市 (代碼) *</label>
              <input
                type="text"
                value={formData.departureCity}
                onChange={(e) => setFormData({ ...formData, departureCity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                placeholder="台北 (桃園) 或 TPE"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">抵達城市 (代碼) *</label>
              <input
                type="text"
                value={formData.arrivalCity}
                onChange={(e) => setFormData({ ...formData, arrivalCity: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                placeholder="大阪 (關西) 或 KIX"
                required
              />
            </div>
          </div>

          {/* 4. 時間與日期 */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">出發時間</label>
              <input
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                className="w-full px-2 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">抵達時間</label>
              <input
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                className="w-full px-2 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-bold"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">飛行日期</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-2 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-bold text-[#5C8984]"
                required
              />
            </div>
          </div>

          {/* 5. 訂位代號、航廈、登機門、座位 */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">訂位代號</label>
              <input
                type="text"
                value={formData.bookingRef}
                onChange={(e) => setFormData({ ...formData, bookingRef: e.target.value })}
                className="w-full px-2 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-mono font-bold text-[#E8A598]"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">航廈</label>
              <input
                type="text"
                placeholder="T1 / T2"
                value={formData.terminal || ''}
                onChange={(e) => setFormData({ ...formData, terminal: e.target.value })}
                className="w-full px-2 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">登機門</label>
              <input
                type="text"
                placeholder="如 C7"
                value={formData.gate || ''}
                onChange={(e) => setFormData({ ...formData, gate: e.target.value })}
                className="w-full px-2 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#6D6257] mb-1">座位</label>
              <input
                type="text"
                placeholder="24A, 24B"
                value={formData.seat || ''}
                onChange={(e) => setFormData({ ...formData, seat: e.target.value })}
                className="w-full px-2 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
              />
            </div>
          </div>

          {/* 6. 備註 */}
          <div>
            <label className="block font-bold text-[#6D6257] mb-1">備註 / 行李額度</label>
            <input
              type="text"
              placeholder="例如：含託運行李 23kg * 2、提早 2.5 小時抵達"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[#8BBF9F] hover:bg-[#7AA88C] text-white font-bold rounded-xl active:scale-95 transition-all text-sm mt-2 shadow-[2px_2px_0px_#7AA88C]"
          >
            確認儲存並同步記帳與行程
          </button>
        </form>
      </div>
    </div>
  );
};
