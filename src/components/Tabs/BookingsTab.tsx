import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { 
  FlightBooking, 
  HotelBooking, 
  CarRentalBooking, 
  VoucherBooking 
} from '../../types';
import { 
  Plane, 
  Hotel, 
  Car, 
  Ticket, 
  Lock, 
  Unlock, 
  Plus, 
  Edit3, 
  Trash2, 
  MapPin, 
  Users, 
  Clock, 
  Phone, 
  ExternalLink,
  Sparkles, 
  Navigation, 
  Calendar, 
  ChevronRight, 
  RefreshCw, 
  CheckCircle2, 
  Globe, 
  CreditCard, 
  DollarSign,
  Receipt,
  Image as ImageIcon
} from 'lucide-react';
import { FlightModal } from '../Bookings/FlightModal';
import { CarRentalModal } from '../Bookings/CarRentalModal';
import { VoucherModal } from '../Bookings/VoucherModal';
import { HotelModal } from '../HotelModal';
import { getMapInfo } from '../../utils/mapHelper';
import { getDayIndexForDate } from '../../utils/hotelLinkHelper';

type BookingCategory = 'flights' | 'hotels' | 'cars' | 'vouchers';

export const BookingsTab: React.FC = () => {
  const {
    flightBookings,
    deleteFlightBooking,
    syncFlightToSchedule,
    hotelBookings,
    deleteHotelBooking,
    carRentalBookings,
    deleteCarRentalBooking,
    voucherBookings,
    deleteVoucherBooking,
    members,
    showConfirmDialog,
    isPinUnlocked,
    lockPin,
    requestPinUnlock,
    tripSettings,
    totalDays,
    setSelectedDayIndex,
    setActiveTab
  } = useTrip();

  const [activeCategory, setActiveCategory] = useState<BookingCategory>('flights');
  
  // Modals state
  const [flightModalOpen, setFlightModalOpen] = useState<boolean>(false);
  const [editingFlight, setEditingFlight] = useState<FlightBooking | null>(null);

  const [hotelModalOpen, setHotelModalOpen] = useState<boolean>(false);
  const [editingHotel, setEditingHotel] = useState<HotelBooking | null>(null);

  const [carModalOpen, setCarModalOpen] = useState<boolean>(false);
  const [editingCar, setEditingCar] = useState<CarRentalBooking | null>(null);

  const [voucherModalOpen, setVoucherModalOpen] = useState<boolean>(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherBooking | null>(null);

  return (
    <div id="bookings-tab-content" className="space-y-4 pb-12">
      {/* Category Pills & PIN Lock Status */}
      <div className="bg-white rounded-[24px] p-2.5 border-2 border-[#E8E5D8] shadow-[4px_4px_0px_#E0E5D5] flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'flights', label: '機票', icon: Plane, count: flightBookings.length },
            { id: 'hotels', label: '住宿', icon: Hotel, count: hotelBookings.length },
            { id: 'cars', label: '租車', icon: Car, count: carRentalBookings.length },
            { id: 'vouchers', label: '票券', icon: Ticket, count: voucherBookings.length }
          ].map(cat => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`booking-subtab-${cat.id}`}
                onClick={() => setActiveCategory(cat.id as BookingCategory)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 shrink-0 ${
                  isSelected
                    ? 'bg-[#8BBF9F] text-white shadow-[2px_2px_0px_#7AA88C]'
                    : 'bg-[#FAF8F3] text-[#5D574F] hover:bg-[#F0EBE0]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-white/30 text-white' : 'bg-[#E5E0D2] text-[#5D574F]'}`}>
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* PIN lock status toggle */}
        <button
          id="pin-status-toggle"
          onClick={() => {
            if (isPinUnlocked) {
              lockPin();
            } else {
              requestPinUnlock(() => {});
            }
          }}
          className={`p-2 rounded-2xl border-2 flex items-center gap-1 text-[11px] font-bold shrink-0 transition-colors ${
            isPinUnlocked 
              ? 'bg-[#E5F2D5] border-[#8BBF9F] text-[#447A5C]' 
              : 'bg-[#FAF8F3] border-[#E8E5D8] text-[#8E8A81] hover:text-[#5D574F]'
          }`}
          title={isPinUnlocked ? 'PIN 安全已解鎖 (點擊鎖定)' : '點擊輸入 PIN 解鎖編輯權限'}
        >
          {isPinUnlocked ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-[#8BBF9F]" />
              <span className="hidden sm:inline">已解鎖</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PIN: 007</span>
            </>
          )}
        </button>
      </div>

      {/* 1. FLIGHTS SECTION (Boarding Pass Design) */}
      {activeCategory === 'flights' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#5D574F] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 bg-[#8BBF9F] rounded-full inline-block"></span>
              <span>✈️ 機票與登機證</span>
            </span>
            <button
              id="add-flight-btn"
              onClick={() => {
                setEditingFlight(null);
                setFlightModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8BBF9F] hover:bg-[#7AA88C] text-white text-xs font-bold rounded-2xl shadow-[3px_3px_0px_#7AA88C] active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增機票</span>
            </button>
          </div>

          {flightBookings.length === 0 ? (
            <div className="bg-white rounded-[28px] p-8 border-2 border-dashed border-[#E8E5D8] text-center space-y-2">
              <p className="text-sm font-bold text-[#5D574F]">目前尚無機票資訊</p>
              <p className="text-xs text-[#8E8A81]">點擊「新增機票」輸入航班與金額，將自動同步至記帳與行程！</p>
            </div>
          ) : (
            flightBookings.map((flight) => {
              const payer = members.find(m => m.id === flight.paidByMemberId);
              const qty = flight.quantity && flight.quantity > 0 ? flight.quantity : 1;
              const totalPrice = flight.totalPrice !== undefined ? flight.totalPrice : (flight.unitPrice ? flight.unitPrice * qty : 0);
              const currencyStr = flight.currency || tripSettings.baseCurrency || 'TWD';
              const splitMembers = (flight.splitMemberIds && flight.splitMemberIds.length > 0)
                ? flight.splitMemberIds
                : members.map(m => m.id);
              const perPersonShare = splitMembers.length > 0 ? Math.round(totalPrice / splitMembers.length) : totalPrice;

              return (
                <div
                  key={flight.id}
                  id={`flight-card-${flight.id}`}
                  className="bg-white rounded-[28px] border-2 border-[#E8E5D8] shadow-[6px_6px_0px_#E0E5D5] overflow-hidden relative group"
                >
                  {/* Boarding Pass Header */}
                  <div className="bg-[#8BBF9F] text-white px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Plane className="w-4 h-4" />
                      <span className="text-xs font-bold tracking-wider">{flight.airline}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black bg-white/20 px-2.5 py-0.5 rounded-lg">
                        {flight.flightNumber}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingFlight(flight);
                            setFlightModalOpen(true);
                          }}
                          className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"
                          title="編輯機票"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            showConfirmDialog({
                              title: '刪除機票記錄',
                              message: `確定要刪除「${flight.airline} ${flight.flightNumber}」機票嗎？`,
                              onConfirm: () => deleteFlightBooking(flight.id)
                            });
                          }}
                          className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white"
                          title="刪除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Main Flight Route Body */}
                  <div className="p-5 bg-white space-y-4">
                    <div className="flex items-center justify-between text-center">
                      {/* Departure */}
                      <div className="text-left">
                        <span className="text-2xl sm:text-3xl font-black text-[#5D574F] tracking-tight">{flight.departureCode}</span>
                        <p className="text-xs text-[#8E8A81] font-medium">{flight.departureCity}</p>
                        <p className="text-sm font-bold text-[#8BBF9F] mt-0.5">{flight.departureTime}</p>
                      </div>

                      {/* Flight Icon & Duration Visual */}
                      <div className="flex flex-col items-center px-3 flex-1 max-w-[140px]">
                        <span className="text-[10px] text-[#A8A294] font-mono mb-1">{flight.date}</span>
                        <div className="w-full flex items-center relative">
                          <div className="w-full h-0.5 bg-[#E0E5D5]" />
                          <Plane className="w-4 h-4 text-[#8BBF9F] absolute left-1/2 -translate-x-1/2 bg-white px-0.5" />
                        </div>
                        <span className="text-[9px] text-[#A8A294] mt-1 font-bold">直飛航班</span>
                      </div>

                      {/* Arrival */}
                      <div className="text-right">
                        <span className="text-2xl sm:text-3xl font-black text-[#5D574F] tracking-tight">{flight.arrivalCode}</span>
                        <p className="text-xs text-[#8E8A81] font-medium">{flight.arrivalCity}</p>
                        <p className="text-sm font-bold text-[#8BBF9F] mt-0.5">{flight.arrivalTime}</p>
                      </div>
                    </div>

                    {/* Perforation dashed divider */}
                    <div className="relative -mx-5 my-2">
                      <div className="border-t-2 border-dashed border-[#E0E5D5]" />
                      <div className="absolute -left-2.5 -top-2.5 w-5 h-5 bg-[#F7F4EB] rounded-full border-r-2 border-[#E8E5D8]" />
                      <div className="absolute -right-2.5 -top-2.5 w-5 h-5 bg-[#F7F4EB] rounded-full border-l-2 border-[#E8E5D8]" />
                    </div>

                    {/* Boarding details stub */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-[#FAF8F3] p-2.5 rounded-2xl border border-[#E8E5D8]">
                        <span className="text-[10px] text-[#8E8A81] block font-medium">航廈</span>
                        <span className="font-bold text-[#5D574F]">{flight.terminal || 'T1'}</span>
                      </div>
                      <div className="bg-[#FAF8F3] p-2.5 rounded-2xl border border-[#E8E5D8]">
                        <span className="text-[10px] text-[#8E8A81] block font-medium">登機門</span>
                        <span className="font-bold text-[#8BBF9F]">{flight.gate || '--'}</span>
                      </div>
                      <div className="bg-[#FAF8F3] p-2.5 rounded-2xl border border-[#E8E5D8]">
                        <span className="text-[10px] text-[#8E8A81] block font-medium">座位</span>
                        <span className="font-bold text-[#5D574F] text-[11px] truncate">{flight.seat || '--'}</span>
                      </div>
                      <div className="bg-[#FAF8F3] p-2.5 rounded-2xl border border-[#E8E5D8]">
                        <span className="text-[10px] text-[#8E8A81] block font-medium">訂位代號</span>
                        <span className="font-mono font-bold text-[#E8A598] text-[11px] truncate">{flight.bookingRef}</span>
                      </div>
                    </div>

                    {/* Financial Summary Bento Box */}
                    <div className="p-3.5 bg-[#FAF8F3] rounded-2xl border border-[#E8E5D8] space-y-2 text-xs">
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="text-[10px] text-[#8E8A81] block font-medium">機票數量</span>
                          <span className="font-bold text-[#5D574F] block mt-0.5">{qty} 張</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8E8A81] block font-medium">單張票價</span>
                          <span className="font-bold text-[#5D574F] block mt-0.5">
                            {flight.unitPrice ? `${flight.unitPrice.toLocaleString()} ${currencyStr}` : '--'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#8E8A81] block font-medium">總金額</span>
                          <span className="font-bold text-[#5C8984] block mt-0.5">
                            {totalPrice > 0 ? `${totalPrice.toLocaleString()} ${currencyStr}` : '免費'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#EDE7D8] flex items-center justify-between text-[11px]">
                        <span className="text-[#8E8A81]">
                          平攤人數：<strong className="text-[#5D574F] font-bold">{splitMembers.length} 人</strong>
                        </span>

                        <div className="text-[#8E8A81]">
                          每人平攤：約 <strong className="text-[#E8A598] font-bold">{perPersonShare.toLocaleString()} {currencyStr}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Expense Linkage Badge */}
                    <div className="flex items-center justify-between bg-[#F0F7F4] px-3.5 py-2.5 rounded-2xl border border-[#C2E2D0] text-xs">
                      <div className="flex items-center gap-1.5 text-[#447A5C] font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-[#8BBF9F] shrink-0" />
                        <span>已自動同步至記帳：{totalPrice > 0 ? `${totalPrice.toLocaleString()} ${currencyStr}` : '0'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('expenses')}
                        className="px-2.5 py-1 rounded-xl bg-[#8BBF9F] hover:bg-[#7AA88C] text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>查看記帳</span>
                      </button>
                    </div>

                    {/* Flight Schedule Linkage Bar */}
                    {(() => {
                      const flightDayIdx = getDayIndexForDate(tripSettings.startDate, flight.date);
                      const isWithinTrip = flightDayIdx >= 0 && flightDayIdx < totalDays;
                      return (
                        <div className="flex items-center justify-between bg-[#FAF8F3] px-3.5 py-2 rounded-2xl border border-[#E8E5D8] text-xs">
                          <div className="flex items-center gap-2 text-[#5D574F] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#8BBF9F] shrink-0" />
                            <span className="text-[11px]">
                              {isWithinTrip 
                                ? `已連動至 Day ${flightDayIdx + 1} (${flight.date}) 行程表` 
                                : `航班日期：${flight.date}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => syncFlightToSchedule(flight)}
                              className="px-2 py-0.5 rounded-lg bg-white hover:bg-[#EAF5EE] text-[#447A5C] border border-[#C2E2D0] text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                              title="重新同步至行程表"
                            >
                              <RefreshCw className="w-2.5 h-2.5" />
                              <span>重整</span>
                            </button>
                            {isWithinTrip && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDayIndex(flightDayIdx);
                                  setActiveTab('schedule');
                                }}
                                className="px-2.5 py-1 rounded-xl bg-[#8BBF9F] hover:bg-[#7AA88C] text-white text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all"
                              >
                                <span>前往行程</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Passengers */}
                    {flight.passengerNames && flight.passengerNames.length > 0 && (
                      <div className="text-xs text-[#5D574F] flex items-center gap-1.5 flex-wrap pt-1">
                        <Users className="w-3.5 h-3.5 text-[#8BBF9F]" />
                        <span className="font-bold">乘客：</span>
                        {flight.passengerNames.map((name, i) => (
                          <span key={i} className="bg-[#FAF8F3] px-2.5 py-0.5 rounded-lg border border-[#E8E5D8] font-bold text-[11px]">
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. HOTELS SECTION */}
      {activeCategory === 'hotels' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#5D574F] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 bg-[#8BBF9F] rounded-full inline-block"></span>
              <span>🏨 飯店與住宿預訂</span>
            </span>
            <button
              id="add-hotel-btn"
              onClick={() => {
                setEditingHotel(null);
                setHotelModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8BBF9F] hover:bg-[#7AA88C] text-white text-xs font-bold rounded-2xl shadow-[3px_3px_0px_#7AA88C] active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增住宿</span>
            </button>
          </div>

          {hotelBookings.length === 0 ? (
            <div className="bg-white rounded-[28px] p-8 border-2 border-dashed border-[#E8E5D8] text-center space-y-2">
              <p className="text-sm font-bold text-[#5D574F]">目前尚無住宿資料</p>
              <p className="text-xs text-[#8E8A81]">點擊「新增住宿」記錄旅館房型與費用，自動同步記帳！</p>
            </div>
          ) : (
            hotelBookings.map((hotel) => {
              const splitCount = hotel.splitMemberIds.length || members.length || 1;
              const perPersonCost = Math.round(hotel.totalPrice / splitCount);
              const payer = members.find(m => m.id === hotel.paidByMemberId);

              return (
                <div
                  key={hotel.id}
                  id={`hotel-card-${hotel.id}`}
                  className="bg-white rounded-[28px] border-2 border-[#E8E5D8] shadow-[6px_6px_0px_#E0E5D5] overflow-hidden relative space-y-3 p-5"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="p-1.5 bg-[#FBF2EE] text-[#8A523F] rounded-xl border border-[#ECCDC2] inline-flex items-center justify-center">
                          <Hotel className="w-4 h-4" />
                        </span>
                        {hotel.bookingRef && (
                          <span className="text-[11px] font-bold text-[#447A5C] bg-[#E5F2D5] px-2.5 py-0.5 rounded-lg border border-[#D0E5BC]">
                            預約號：{hotel.bookingRef}
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[#5D574F] leading-snug">
                        {hotel.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        id={`edit-hotel-btn-${hotel.id}`}
                        onClick={() => {
                          setEditingHotel(hotel);
                          setHotelModalOpen(true);
                        }}
                        className="p-2 text-[#8E8A81] hover:text-[#8BBF9F] hover:bg-[#FAF8F3] rounded-xl border border-transparent hover:border-[#E8E5D8] transition-all active:scale-95"
                        title="編輯住宿"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        id={`delete-hotel-btn-${hotel.id}`}
                        onClick={() => {
                          showConfirmDialog({
                            title: '刪除住宿記錄',
                            message: `確定要刪除「${hotel.name}」住宿資料嗎？`,
                            onConfirm: () => deleteHotelBooking(hotel.id)
                          });
                        }}
                        className="p-2 text-[#8E8A81] hover:text-[#E8A598] hover:bg-[#FDF0ED] rounded-xl border border-transparent hover:border-[#F7CEC5] transition-all active:scale-95"
                        title="刪除住宿"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Photo */}
                  {hotel.photoUrl && (
                    <div className="h-44 w-full rounded-2xl overflow-hidden border border-[#E8E5D8] relative">
                      <img
                        src={hotel.photoUrl}
                        alt={hotel.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Dates & Times */}
                  <div className="bg-[#FAF8F3] p-3 rounded-2xl border border-[#E8E5D8] space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <span className="text-[10px] text-[#8E8A81] block font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#8BBF9F]" />
                          入住 Check-in
                        </span>
                        <span className="font-bold text-[#5D574F] text-xs">{hotel.checkInDate}</span>
                        <span className="text-[11px] text-[#8BBF9F] block font-bold">{hotel.checkInTime}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8E8A81] block font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#E8A598]" />
                          退房 Check-out
                        </span>
                        <span className="font-bold text-[#5D574F] text-xs">{hotel.checkOutDate}</span>
                        <span className="text-[11px] text-[#8E8A81] block font-medium">{hotel.checkOutTime}</span>
                      </div>
                    </div>

                    {/* Summary row */}
                    <div className="pt-2 border-t border-[#E8E5D8] flex items-center justify-between text-[11px]">
                      {(() => {
                        const d1 = new Date(hotel.checkInDate);
                        const d2 = new Date(hotel.checkOutDate);
                        const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
                        const nights = diff > 0 ? diff : 1;
                        return (
                          <span className="bg-[#E5F2D5] text-[#447A5C] font-bold px-2 py-0.5 rounded-lg border border-[#D0E5BC] text-[10px]">
                            🌙 共 {nights} 晚住宿
                          </span>
                        );
                      })()}

                      {hotel.phone && (
                        <a
                          href={`tel:${hotel.phone}`}
                          className="flex items-center gap-1 text-[10px] font-bold text-[#5C8984] hover:underline bg-[#EAF5EE] px-2 py-0.5 rounded-lg border border-[#C2E2D0]"
                        >
                          <Phone className="w-2.5 h-2.5" />
                          <span>{hotel.phone}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Address & Navigation */}
                  {(() => {
                    const mapInfo = getMapInfo(hotel.name + ' ' + hotel.address, hotel.mapUrl);
                    return (
                      <div className="flex items-center justify-between text-xs text-[#5D574F]">
                        <div className="flex items-center gap-1 truncate mr-2 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#8BBF9F] shrink-0" />
                          <span className="truncate">{hotel.address}</span>
                        </div>
                        <a
                          href={mapInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            backgroundColor: mapInfo.badgeBg,
                            color: mapInfo.badgeColor,
                            borderColor: mapInfo.borderColor
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold border hover:opacity-90 px-2.5 py-1 rounded-xl shrink-0 transition-all active:scale-95 shadow-2xs"
                        >
                          <Navigation className="w-3 h-3 shrink-0" />
                          <span>{mapInfo.isNaver ? 'Naver Map' : mapInfo.isGoogle ? 'Google Maps' : '開啟地圖'}</span>
                        </a>
                      </div>
                    );
                  })()}

                  {/* Split Calculation */}
                  <div className="p-3.5 bg-[#F9F7F2] rounded-2xl border border-[#E8E5D8] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#8E8A81]">總房費 (由 {payer?.name.split(' ')[0] || '團員'} 先付)：</span>
                      <span className="font-bold text-[#5D574F]">
                        {hotel.totalPrice.toLocaleString()} {hotel.currency}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[#E8E5D8]">
                      <span className="font-bold text-[#8BBF9F]">每人分攤金額 ({splitCount} 人平攤)：</span>
                      <span className="font-black text-sm text-[#E8A598]">
                        {perPersonCost.toLocaleString()} {hotel.currency}
                      </span>
                    </div>
                  </div>

                  {/* Expense Linkage Badge */}
                  <div className="flex items-center justify-between bg-[#F0F7F4] px-3.5 py-2 rounded-2xl border border-[#C2E2D0] text-xs">
                    <div className="flex items-center gap-1.5 text-[#447A5C] font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-[#8BBF9F] shrink-0" />
                      <span>已自動連動至記帳：{hotel.totalPrice.toLocaleString()} {hotel.currency}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('expenses')}
                      className="px-2.5 py-1 rounded-xl bg-[#8BBF9F] hover:bg-[#7AA88C] text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>查看記帳</span>
                    </button>
                  </div>

                  {hotel.notes && (
                    <p className="text-xs text-[#8E8A81] bg-[#FAF8F3] p-2.5 rounded-2xl border border-[#F0ECE1]">
                      📝 {hotel.notes}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 3. CAR RENTALS SECTION */}
      {activeCategory === 'cars' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#5D574F] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 bg-[#8BBF9F] rounded-full inline-block"></span>
              <span>🚗 自駕與租車預約</span>
            </span>
            <button
              id="add-car-btn"
              onClick={() => {
                setEditingCar(null);
                setCarModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8BBF9F] hover:bg-[#7AA88C] text-white text-xs font-bold rounded-2xl shadow-[3px_3px_0px_#7AA88C] active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增租車</span>
            </button>
          </div>

          {carRentalBookings.length === 0 ? (
            <div className="bg-white rounded-[28px] p-8 border-2 border-dashed border-[#E8E5D8] text-center space-y-2">
              <p className="text-sm font-bold text-[#5D574F]">目前尚無租車預約</p>
              <p className="text-xs text-[#8E8A81]">點擊「新增租車」設定取還車時間、地點與費用，自動同步記帳！</p>
            </div>
          ) : (
            carRentalBookings.map((car) => {
              const payer = members.find(m => m.id === car.paidByMemberId);
              const splitMembers = (car.splitMemberIds && car.splitMemberIds.length > 0)
                ? car.splitMemberIds
                : members.map(m => m.id);
              const cost = car.totalPrice || 0;
              const currencyStr = car.currency || tripSettings.foreignCurrency || 'JPY';
              const perPersonCost = splitMembers.length > 0 ? Math.round(cost / splitMembers.length) : cost;

              return (
                <div
                  key={car.id}
                  id={`car-card-${car.id}`}
                  className="bg-white rounded-[28px] p-5 border-2 border-[#E8E5D8] shadow-[6px_6px_0px_#E0E5D5] space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-[#EDF5FA] border border-[#C5DFEF] rounded-2xl text-[#3A6B88]">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-[#5D574F]">{car.company}</h3>
                        <p className="text-xs font-bold text-[#8BBF9F]">{car.carModel}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCar(car);
                          setCarModalOpen(true);
                        }}
                        className="p-1.5 text-[#8E8A81] hover:text-[#8BBF9F] rounded-lg"
                        title="編輯租車"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          showConfirmDialog({
                            title: '刪除租車記錄',
                            message: `確定要刪除「${car.company} (${car.carModel})」的預約記錄嗎？`,
                            onConfirm: () => deleteCarRentalBooking(car.id)
                          });
                        }}
                        className="p-1.5 text-[#8E8A81] hover:text-[#E8A598] rounded-lg"
                        title="刪除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Separate Pick-up and Return Times & Locations */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-[#FAF8F3] p-3 rounded-2xl border border-[#E8E5D8] text-xs">
                    {/* Pick-up */}
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#8E8A81] font-bold block flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#8BBF9F]" />
                        取車時間與地點
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#447A5C]">{car.pickupTime}</span>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(car.company + ' ' + car.pickupLocation)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-[#447A5C] font-bold hover:underline shrink-0 bg-[#E5F2D5] px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
                        >
                          <Navigation className="w-2.5 h-2.5" />
                          <span>取車導航</span>
                        </a>
                      </div>
                      <p className="text-[#5D574F] font-medium truncate flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-[#8BBF9F] shrink-0" />
                        <span>{car.pickupLocation}</span>
                      </p>
                    </div>

                    {/* Return */}
                    <div className="space-y-1 pt-2 sm:pt-0 border-t sm:border-t-0 sm:border-l border-[#EDE7D8] sm:pl-2.5">
                      <span className="text-[10px] text-[#8E8A81] font-bold block flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#E8A598]" />
                        還車時間與地點
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#5D574F]">{car.returnTime || '--'}</span>
                        {car.returnLocation && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(car.company + ' ' + car.returnLocation)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#8E8A81] font-bold hover:underline shrink-0 bg-[#F2ECE0] px-1.5 py-0.5 rounded-md flex items-center gap-0.5"
                          >
                            <Navigation className="w-2.5 h-2.5" />
                            <span>還車導航</span>
                          </a>
                        )}
                      </div>
                      <p className="text-[#5D574F] font-medium truncate flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-[#E8A598] shrink-0" />
                        <span>{car.returnLocation || car.pickupLocation}</span>
                      </p>
                    </div>
                  </div>

                  {/* Official Website URL */}
                  {car.url && (
                    <div className="flex items-center justify-between bg-[#F0F7F4] px-3 py-2 rounded-xl border border-[#C2E2D0] text-xs">
                      <div className="flex items-center gap-1.5 text-[#447A5C] font-bold truncate">
                        <Globe className="w-3.5 h-3.5 shrink-0 text-[#8BBF9F]" />
                        <span className="truncate">租車官網 / 預約管理連結</span>
                      </div>
                      <a
                        href={car.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#447A5C] hover:underline flex items-center gap-1 text-[11px] font-bold shrink-0 ml-2"
                      >
                        <span>開啟網址</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Financial Information */}
                  <div className="p-3 bg-[#FAF8F3] rounded-2xl border border-[#E8E5D8] space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#8E8A81] flex items-center gap-1">
                        <Car className="w-3.5 h-3.5 text-[#8BBF9F]" />
                        <span>租車總費用</span>
                      </span>
                      <span className="font-bold text-[#5C8984]">
                        {cost > 0 ? `${cost.toLocaleString()} ${currencyStr}` : '免費'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#EDE7D8] text-[11px]">
                      <span className="text-[#8E8A81]">分攤人數 ({splitMembers.length} 人)：</span>
                      <span className="font-bold text-[#E8A598]">
                        每人約 {perPersonCost.toLocaleString()} {currencyStr}
                      </span>
                    </div>
                  </div>

                  {/* Photo Preview if uploaded */}
                  {car.photoUrl && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#8E8A81] flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-[#8BBF9F]" />
                        租車明細單 / 憑證照片
                      </span>
                      <div className="h-40 rounded-2xl overflow-hidden border border-[#E0DACB]">
                        <img 
                          src={car.photoUrl} 
                          alt="租車明細照片" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </div>
                  )}

                  {/* Expense Linkage Badge */}
                  <div className="flex items-center justify-between bg-[#F0F7F4] px-3.5 py-2 rounded-2xl border border-[#C2E2D0] text-xs">
                    <div className="flex items-center gap-1.5 text-[#447A5C] font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-[#8BBF9F] shrink-0" />
                      <span>已自動連動至記帳：{cost.toLocaleString()} {currencyStr}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('expenses')}
                      className="px-2.5 py-1 rounded-xl bg-[#8BBF9F] hover:bg-[#7AA88C] text-white text-[11px] font-bold flex items-center gap-1 active:scale-95 transition-all shadow-2xs"
                    >
                      <Receipt className="w-3 h-3" />
                      <span>查看記帳</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#5D574F] px-1 font-medium">
                    <span>預約號：<strong className="text-[#5D574F] font-mono">{car.confirmationNumber || '--'}</strong></span>
                    {car.driverName && <span>駕駛：<strong className="text-[#8BBF9F]">{car.driverName}</strong></span>}
                  </div>

                  {car.notes && (
                    <p className="text-xs text-[#8E8A81] bg-[#FAF8F3] p-2.5 rounded-2xl border border-[#F0ECE1]">
                      💡 {car.notes}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 4. VOUCHERS & TICKETS SECTION */}
      {activeCategory === 'vouchers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[#5D574F] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-4 bg-[#8BBF9F] rounded-full inline-block"></span>
              <span>🎟️ 票券與電子憑證</span>
            </span>
            <button
              id="add-voucher-btn"
              onClick={() => {
                setEditingVoucher(null);
                setVoucherModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8BBF9F] hover:bg-[#7AA88C] text-white text-xs font-bold rounded-2xl shadow-[3px_3px_0px_#7AA88C] active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增票券</span>
            </button>
          </div>

          {voucherBookings.length === 0 ? (
            <div className="bg-white rounded-[28px] p-8 border-2 border-dashed border-[#E8E5D8] text-center space-y-2">
              <p className="text-sm font-bold text-[#5D574F]">目前尚無票券憑證</p>
              <p className="text-xs text-[#8E8A81]">點擊「新增票券」記錄門票、車票與兌換序號，自動同步記帳！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {voucherBookings.map((voucher) => {
                const payer = members.find(m => m.id === voucher.paidByMemberId);
                const qty = voucher.quantity && voucher.quantity > 0 ? voucher.quantity : 1;
                const currencyStr = voucher.currency || tripSettings.foreignCurrency;
                const hasAmount = voucher.amount !== undefined && voucher.amount !== null;

                return (
                  <div
                    key={voucher.id}
                    id={`voucher-card-${voucher.id}`}
                    className="bg-white rounded-[28px] p-4 sm:p-5 border-2 border-[#E8E5D8] shadow-[6px_6px_0px_#E0E5D5] space-y-3 relative flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="text-2xl p-1.5 bg-[#FAF8F3] rounded-2xl border border-[#EDE7D8] shrink-0">
                            {voucher.category === 'pass' ? '🚄' : voucher.category === 'activity' ? '👘' : voucher.category === 'coupon' ? '🏷️' : '🎟️'}
                          </span>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-[#5D574F] truncate">{voucher.title}</h4>
                            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-[#8E8A81] mt-0.5">
                              <span className="font-bold text-[#6D6257]">{voucher.provider || '憑證'}</span>
                              <span>・</span>
                              <span>有效至 {voucher.validDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingVoucher(voucher);
                              setVoucherModalOpen(true);
                            }}
                            className="p-1.5 text-[#8E8A81] hover:text-[#8BBF9F] rounded-lg transition-colors"
                            title="編輯票券"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              showConfirmDialog({
                                title: '刪除票券憑證',
                                message: `確定要刪除「${voucher.title}」憑證嗎？`,
                                onConfirm: () => deleteVoucherBooking(voucher.id)
                              });
                            }}
                            className="p-1.5 text-[#8E8A81] hover:text-[#E8A598] rounded-lg transition-colors"
                            title="刪除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Voucher Meta Grid: 數量, 金額 */}
                      <div className="grid grid-cols-2 gap-2 bg-[#FAF8F3] p-2.5 rounded-2xl border border-[#EDE7D8] text-xs">
                        <div>
                          <span className="text-[10px] text-[#8E8A81] block font-medium">票券數量</span>
                          <span className="font-bold text-[#5D574F] block mt-0.5">
                            {qty} 張
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-[#8E8A81] block font-medium">總金額</span>
                          <span className="font-bold text-[#5C8984] block mt-0.5 truncate">
                            {hasAmount && voucher.amount! > 0 ? (
                              <span>
                                {voucher.amount!.toLocaleString()} <span className="text-[10px]">{currencyStr}</span>
                              </span>
                            ) : (
                              <span className="text-[#A8A294]">免費 / 0</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Website / Booking URL */}
                      {voucher.url && (
                        <div className="flex items-center justify-between bg-[#F0F7F4] px-3 py-2 rounded-xl border border-[#C2E2D0] text-xs">
                          <div className="flex items-center gap-1.5 text-[#447A5C] font-bold truncate">
                            <Globe className="w-3.5 h-3.5 shrink-0 text-[#8BBF9F]" />
                            <span className="truncate">官方 / 預訂連結</span>
                          </div>
                          <a
                            href={voucher.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#447A5C] hover:underline flex items-center gap-1 text-[11px] font-bold shrink-0 ml-2"
                          >
                            <span>開啟網址</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Voucher code box */}
                      {voucher.code && (
                        <div className="p-2 bg-[#FAF8F3] rounded-xl border border-[#EDE7D8] flex items-center justify-between text-xs font-mono">
                          <span className="text-[#8A7E72] text-[10px]">兌換序號：</span>
                          <strong className="text-[#5C8984] tracking-wider text-sm">{voucher.code}</strong>
                        </div>
                      )}

                      {/* File / photo preview */}
                      {voucher.fileUrl && (
                        <div className="aspect-video rounded-xl overflow-hidden border border-[#E0DACB]">
                          <img 
                            src={voucher.fileUrl} 
                            alt={voucher.title} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}

                      {/* Notes */}
                      {voucher.notes && (
                        <p className="text-xs text-[#8A7E72] bg-[#FAF8F3] p-2.5 rounded-xl border border-[#F0ECE1] leading-relaxed">
                          📝 {voucher.notes}
                        </p>
                      )}
                    </div>

                    {/* Expense Linkage Badge */}
                    <div className="flex items-center justify-between bg-[#F0F7F4] px-3 py-2 rounded-2xl border border-[#C2E2D0] text-xs mt-2">
                      <div className="flex items-center gap-1.5 text-[#447A5C] font-bold">
                        <Sparkles className="w-3.5 h-3.5 text-[#8BBF9F] shrink-0" />
                        <span className="truncate">已連動記帳：{hasAmount && voucher.amount! > 0 ? `${voucher.amount!.toLocaleString()} ${currencyStr}` : '0'}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveTab('expenses')}
                        className="px-2 py-0.5 rounded-xl bg-[#8BBF9F] hover:bg-[#7AA88C] text-white text-[10px] font-bold flex items-center gap-1 active:scale-95 transition-all shrink-0 shadow-2xs"
                      >
                        <Receipt className="w-2.5 h-2.5" />
                        <span>記帳</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Flight Modal */}
      <FlightModal
        isOpen={flightModalOpen}
        onClose={() => {
          setFlightModalOpen(false);
          setEditingFlight(null);
        }}
        flight={editingFlight}
      />

      {/* Car Rental Modal */}
      <CarRentalModal
        isOpen={carModalOpen}
        onClose={() => {
          setCarModalOpen(false);
          setEditingCar(null);
        }}
        car={editingCar}
      />

      {/* Voucher Modal */}
      <VoucherModal
        isOpen={voucherModalOpen}
        onClose={() => {
          setVoucherModalOpen(false);
          setEditingVoucher(null);
        }}
        voucher={editingVoucher}
      />

      {/* Hotel Modal */}
      <HotelModal
        isOpen={hotelModalOpen}
        onClose={() => {
          setHotelModalOpen(false);
          setEditingHotel(null);
        }}
        hotel={editingHotel}
      />
    </div>
  );
};
