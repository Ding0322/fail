import React, { useState } from 'react';
import { useTrip } from '../../context/TripContext';
import { ScheduleItem, EventCategory, HotelBooking, FlightBooking } from '../../types';
import { 
  Plus, 
  MapPin, 
  Navigation, 
  Clock, 
  Sun, 
  Cloud, 
  CloudRain, 
  Wind, 
  CheckCircle2, 
  Circle, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Camera, 
  Coins, 
  X, 
  ChevronRight, 
  Info,
  RefreshCw,
  Droplets,
  Shirt,
  Sparkles,
  Hotel,
  Key,
  DoorOpen,
  Phone,
  Plane,
  Link as LinkIcon
} from 'lucide-react';
import { ImageUploader } from '../ImageUploader';
import { getMapInfo, detectMapProvider, formatMapUrl, getAlternateMapLinks } from '../../utils/mapHelper';
import { getDateForDayIndex, formatShortDate, getDayIndexForDate } from '../../utils/hotelLinkHelper';

const CATEGORY_CONFIG: Record<EventCategory, { label: string; color: string; bg: string; border: string; accent: string; emoji: string }> = {
  spot: { label: '景點', color: '#447A5C', bg: '#EAF5EE', border: '#C2E2D0', accent: '#8BBF9F', emoji: '⛩️' },
  food: { label: '美食', color: '#B55A49', bg: '#FDF0ED', border: '#F7CEC5', accent: '#E8A598', emoji: '🍜' },
  transport: { label: '交通', color: '#3A6B88', bg: '#EDF5FA', border: '#C5DFEF', accent: '#A1C1D6', emoji: '🚅' },
  lodging: { label: '住宿', color: '#8A523F', bg: '#FBF2EE', border: '#ECCDC2', accent: '#D98A7D', emoji: '🏨' },
  shopping: { label: '購物', color: '#7D4E72', bg: '#F9F0F6', border: '#E7C8DE', accent: '#C492B1', emoji: '🛍️' },
  other: { label: '其他', color: '#5D574F', bg: '#F2EFEA', border: '#DCD6CB', accent: '#A8A294', emoji: '✨' }
};

export const ScheduleTab: React.FC = () => {
  const { 
    tripSettings, 
    selectedDayIndex, 
    setSelectedDayIndex, 
    totalDays, 
    scheduleItems, 
    weatherForecast, 
    addScheduleItem, 
    updateScheduleItem, 
    deleteScheduleItem, 
    toggleScheduleCompleted, 
    daysRemaining,
    isUpdatingWeather,
    weatherStatus,
    refreshWeatherForDay,
    refreshAllDaysWeather,
    showConfirmDialog,
    hotelBookings,
    flightBookings,
    setActiveTab
  } = useTrip();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const [viewDetailItem, setViewDetailItem] = useState<ScheduleItem | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    dayIndex: number;
    time: string;
    title: string;
    category: EventCategory;
    location: string;
    mapUrl: string;
    notes: string;
    estimatedCost: number;
    currency: string;
    photos: string[];
    linkedHotelId?: string;
    linkedFlightId?: string;
  }>({
    dayIndex: 0,
    time: '10:00',
    title: '',
    category: 'spot',
    location: '',
    mapUrl: '',
    notes: '',
    estimatedCost: 0,
    currency: 'JPY',
    photos: []
  });

  const startDate = new Date(tripSettings.startDate);

  // Filter items for current selected day
  const currentDayItems = scheduleItems.filter(item => item.dayIndex === selectedDayIndex);
  
  // Extract distinct locations for the current day
  const dayLocations: string[] = Array.from(
    new Set<string>(
      currentDayItems
        .map(item => item.location?.trim())
        .filter((loc): loc is string => typeof loc === 'string' && loc.length > 0)
    )
  );

  const currentWeather = weatherForecast[selectedDayIndex] || {
    condition: 'sunny',
    tempHigh: 22,
    tempLow: 15,
    desc: '涼爽宜人，適合漫遊',
    icon: 'Sun',
    locationName: tripSettings.destination || '京都'
  };

  const openAddModal = (presetCategory?: EventCategory) => {
    setEditingItem(null);
    setFormData({
      dayIndex: selectedDayIndex,
      time: '10:00',
      title: '',
      category: presetCategory || 'spot',
      location: '',
      mapUrl: '',
      notes: '',
      estimatedCost: 0,
      currency: tripSettings.foreignCurrency,
      photos: [],
      linkedHotelId: undefined,
      linkedFlightId: undefined
    });
    setModalOpen(true);
  };

  const openEditModal = (item: ScheduleItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setFormData({
      dayIndex: item.dayIndex,
      time: item.time,
      title: item.title,
      category: item.category,
      location: item.location,
      mapUrl: item.mapUrl || '',
      notes: item.notes || '',
      estimatedCost: item.estimatedCost || 0,
      currency: item.currency || tripSettings.foreignCurrency,
      photos: item.photos || [],
      linkedHotelId: item.linkedHotelId,
      linkedFlightId: item.linkedFlightId
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingItem) {
      updateScheduleItem(editingItem.id, formData);
    } else {
      addScheduleItem(formData);
    }
    setModalOpen(false);
  };

  const getDayLabel = (index: number) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + index);
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const weekDays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    const dayOfWeek = weekDays[d.getDay()];
    return { month, date, dayOfWeek, fullDate: `${month}/${date}` };
  };

  return (
    <div id="schedule-tab-content" className="space-y-4 pb-12">
      {/* 1. Horizontal Scrollable Date Selector (Bento Card) */}
      <div className="bg-white rounded-[24px] p-3 border-2 border-[#E8E5D8] shadow-[4px_4px_0px_#E0E5D5]">
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-0.5">
          {Array.from({ length: totalDays }).map((_, index) => {
            const dateInfo = getDayLabel(index);
            const isSelected = selectedDayIndex === index;
            const dayItemCount = scheduleItems.filter(s => s.dayIndex === index).length;

            return (
              <button
                key={index}
                id={`date-pill-${index}`}
                onClick={() => setSelectedDayIndex(index)}
                className={`flex flex-col items-center justify-center shrink-0 min-w-[70px] py-2.5 px-3 rounded-2xl border-2 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#8BBF9F] border-[#7AA88C] text-white shadow-[3px_3px_0px_#7AA88C] font-bold scale-[1.02]'
                    : 'bg-[#FAF8F3] border-[#E8E5D8] text-[#5D574F] hover:bg-[#F2ECE0]'
                }`}
              >
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#E5F2D5]' : 'text-[#8E8A81]'}`}>
                  Day {index + 1}
                </span>
                <span className="text-sm font-black my-0.5">
                  {dateInfo.fullDate}
                </span>
                <span className={`text-[10px] ${isSelected ? 'text-white font-medium' : 'text-[#8E8A81]'}`}>
                  {dateInfo.dayOfWeek}
                </span>
                {dayItemCount > 0 && (
                  <span className={`mt-1 text-[9px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white/25 text-white' : 'bg-[#EAE5D8] text-[#5D574F]'
                  }`}>
                    {dayItemCount} 個行程
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Weather Status Banner if updating */}
      {weatherStatus && (
        <div className="bg-[#E5F2D5] border-2 border-[#D0E5BC] text-[#447A5C] text-xs font-bold px-4 py-2 rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdatingWeather ? 'animate-spin' : ''}`} />
            <span>{weatherStatus}</span>
          </div>
        </div>
      )}

      {/* 2. Daily Summary & Weather Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Main Bento Day Overview Tile */}
        <div className="sm:col-span-2 bg-white rounded-[28px] p-5 border-2 border-[#E8E5D8] shadow-[6px_6px_0px_#E0E5D5] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="w-2 h-5 bg-[#8BBF9F] rounded-full inline-block"></span>
                <span className="text-xs font-black text-[#8BBF9F] bg-[#E5F2D5] px-2.5 py-0.5 rounded-full">
                  DAY {selectedDayIndex + 1}・{getDayLabel(selectedDayIndex).fullDate} ({getDayLabel(selectedDayIndex).dayOfWeek})
                </span>
              </div>

              {/* Location Badge for Day */}
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#5D574F] bg-[#FAF8F3] px-2.5 py-1 rounded-xl border border-[#E8E5D8]">
                <MapPin className="w-3.5 h-3.5 text-[#8BBF9F]" />
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{currentWeather.locationName || tripSettings.destination}</span>
              </div>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-[#5D574F] leading-snug">
              {selectedDayIndex === 0 ? '出發日！抵達與初探' : 
               selectedDayIndex === 1 ? '京都古都慢行 & 和服巡禮' : 
               selectedDayIndex === 2 ? '嵐山竹林小火車與景觀自駕' : 
               selectedDayIndex === 3 ? '宇治抹茶 & 大阪心齋橋購物' : '伴手禮掃貨 & 滿載歸賦'}
            </h2>

            {/* Quick spot switcher if day has multiple itinerary spots */}
            {dayLocations.length > 0 && (
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold text-[#8E8A81]">本日行程景點氣象：</span>
                {dayLocations.map((loc) => {
                  const currentLocStr = currentWeather.locationName || '';
                  const isActiveLoc = Boolean(currentLocStr && (currentLocStr.includes(loc) || loc.includes(currentLocStr)));
                  return (
                    <button
                      key={loc}
                      onClick={() => refreshWeatherForDay(selectedDayIndex, loc)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-xl border transition-all active:scale-95 flex items-center gap-1 ${
                        isActiveLoc 
                          ? 'bg-[#8BBF9F] text-white border-[#7AA88C] shadow-xs' 
                          : 'bg-[#FAF8F3] hover:bg-[#F2ECE0] text-[#5D574F] border-[#E8E5D8]'
                      }`}
                      title={`點擊查看 ${loc} 即時天氣`}
                    >
                      <MapPin className="w-2.5 h-2.5" />
                      <span>{loc}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#F4F1EA] flex items-center justify-between text-xs text-[#8E8A81]">
            <p className="flex items-center gap-1.5 font-medium text-[#5D574F] text-[11px] truncate">
              <span>💡 {currentWeather.clothingTip || currentWeather.desc}</span>
            </p>
          </div>
        </div>

        {/* Weather Bento Tile (Dynamic by Location) */}
        <div className="bg-[#E5F2D5] rounded-[28px] p-4 border-2 border-[#D0E5BC] shadow-[6px_6px_0px_#D0E0B8] flex flex-col justify-between text-center relative overflow-hidden">
          {/* Header row in Weather Card */}
          <div className="flex items-center justify-between w-full pb-1 border-b border-[#D0E5BC]/60">
            <span className="text-[10px] font-black text-[#5C8972] flex items-center gap-1 truncate max-w-[120px]">
              <MapPin className="w-3 h-3 text-[#5C8972]" />
              {currentWeather.locationName || '京都'}
            </span>
            <button
              onClick={() => refreshWeatherForDay(selectedDayIndex)}
              disabled={isUpdatingWeather}
              title="點擊同步最新即時天氣"
              className="p-1 rounded-lg bg-white/70 hover:bg-white text-[#5C8972] border border-[#D0E5BC] active:scale-90 transition-all text-[10px] font-bold flex items-center gap-1"
            >
              <RefreshCw className={`w-2.5 h-2.5 ${isUpdatingWeather ? 'animate-spin' : ''}`} />
              <span className="text-[9px]">同步</span>
            </button>
          </div>

          <div className="my-2 flex flex-col items-center justify-center">
            <div className="w-11 h-11 rounded-2xl bg-white/80 shadow-xs flex items-center justify-center mb-1 transition-transform hover:scale-105">
              {currentWeather.condition === 'sunny' && <Sun className="w-6 h-6 text-[#E8A598]" />}
              {currentWeather.condition === 'cloudy' && <Cloud className="w-6 h-6 text-[#70A9A1]" />}
              {currentWeather.condition === 'rainy' && <CloudRain className="w-6 h-6 text-[#5C8984]" />}
              {currentWeather.condition === 'snowy' && <CloudRain className="w-6 h-6 text-[#8BBF9F]" />}
              {currentWeather.condition === 'windy' && <Wind className="w-6 h-6 text-[#5C8984]" />}
            </div>

            <div className="text-base font-black text-[#5D574F]">
              {currentWeather.tempLow}° ~ {currentWeather.tempHigh}°C
            </div>
            <div className="text-xs font-bold text-[#5C8972] mt-0.5">
              {currentWeather.condition === 'sunny' ? '☀️ 晴朗' : currentWeather.condition === 'rainy' ? '🌧️ 局部降雨' : currentWeather.condition === 'snowy' ? '❄️ 飄雪' : '⛅ 多雲'}
            </div>
          </div>

          {/* Sub-metrics: Rain probability & Clothing Advice */}
          <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#D0E5BC]/60 text-[10px] font-bold text-[#5D574F]">
            <div className="bg-white/60 py-1 px-1.5 rounded-xl flex items-center justify-center gap-1">
              <Droplets className="w-3 h-3 text-[#5C8984]" />
              <span>{currentWeather.rainfallProb ?? 15}% 降雨</span>
            </div>
            <div className="bg-white/60 py-1 px-1.5 rounded-xl flex items-center justify-center gap-1">
              <Shirt className="w-3 h-3 text-[#8E8A81]" />
              <span>{currentWeather.tempHigh > 22 ? '舒適' : '早晚偏涼'}</span>
            </div>
          </div>

          {currentWeather.lastUpdated && (
            <span className="text-[8px] text-[#7AA88C] mt-1 block">
              {currentWeather.lastUpdated}
            </span>
          )}
        </div>
      </div>

      {/* 3. Schedule Timeline Bento List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-[#5D574F] uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-4 bg-[#8BBF9F] rounded-full inline-block"></span>
            <span>每日時間軸行程</span>
            <span className="text-[10px] text-[#8E8A81] font-normal">({currentDayItems.length} 項)</span>
          </h3>

          <button
            id="add-schedule-item-btn"
            onClick={() => openAddModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#8BBF9F] hover:bg-[#7AA88C] text-white text-xs font-bold rounded-2xl shadow-[3px_3px_0px_#7AA88C] active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增行程</span>
          </button>
        </div>

        {currentDayItems.length === 0 ? (
          <div className="bg-white rounded-[28px] p-8 border-2 border-dashed border-[#DDD7C8] text-center space-y-3 shadow-[4px_4px_0px_#E0E5D5]">
            <div className="text-3xl">☕</div>
            <p className="text-sm font-bold text-[#5D574F]">這天尚未安排行程</p>
            <p className="text-xs text-[#8E8A81]">點擊上方按鈕新增景點、美食、機票或住宿安排吧！</p>
            <button
              onClick={() => openAddModal()}
              className="px-4 py-2 bg-[#FAF8F3] hover:bg-[#F2EFE6] text-[#8BBF9F] font-bold text-xs rounded-xl border border-[#D5CFBF] inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> 新增第一筆行程
            </button>
          </div>
        ) : (
          <div className="relative pl-6 space-y-3">
            {/* Timeline dashed connector */}
            <div className="absolute left-2.5 top-3 bottom-3 border-l-2 border-dashed border-[#E0E5D5]" />

            {currentDayItems.map((item) => {
              const cat = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.other;

              return (
                <div
                  key={item.id}
                  id={`schedule-card-${item.id}`}
                  onClick={() => setViewDetailItem(item)}
                  className={`relative bg-white rounded-[26px] p-4 border-2 transition-all cursor-pointer hover:border-[#8BBF9F] shadow-[4px_4px_0px_#E0E5D5] group ${
                    item.isCompleted ? 'border-[#D9E3D8] bg-[#FAFBF9] opacity-80' : 'border-[#E8E5D8]'
                  }`}
                  style={{ borderLeftWidth: '5px', borderLeftColor: cat.accent }}
                >
                  {/* Timeline dot */}
                  <div 
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleScheduleCompleted(item.id);
                    }}
                    className={`absolute -left-[27px] top-4.5 w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                      item.isCompleted 
                        ? 'bg-[#8BBF9F] border-[#8BBF9F] text-white' 
                        : 'bg-white border-[#B8B09F] hover:border-[#8BBF9F]'
                    }`}
                  >
                    {item.isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                  </div>

                  <div className="space-y-2.5">
                    {/* Time & Category Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-xs font-black text-[#5D574F] bg-[#F7F4EB] px-2.5 py-0.5 rounded-lg border border-[#E8E5D8]">
                          <Clock className="w-3 h-3 text-[#8BBF9F]" />
                          {item.time}
                        </span>
                        <span 
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1"
                          style={{ color: cat.color, backgroundColor: cat.bg, borderColor: cat.border }}
                        >
                          <span>{cat.emoji}</span>
                          <span>{cat.label}</span>
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          id={`edit-schedule-${item.id}`}
                          onClick={(e) => openEditModal(item, e)}
                          className="p-1.5 text-[#8E8A81] hover:text-[#8BBF9F] hover:bg-[#F4F1EA] rounded-xl transition-colors"
                          title="編輯"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          id={`delete-schedule-${item.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            showConfirmDialog({
                              title: '刪除行程項目',
                              message: `確定要刪除「${item.title}」嗎？`,
                              onConfirm: () => deleteScheduleItem(item.id)
                            });
                          }}
                          className="p-1.5 text-[#8E8A81] hover:text-[#E8A598] hover:bg-[#FDF0ED] rounded-xl transition-colors"
                          title="刪除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className={`text-sm sm:text-base font-bold text-[#5D574F] leading-snug ${item.isCompleted ? 'line-through text-[#8E8A81]' : ''}`}>
                      {item.title}
                    </h4>

                    {/* Location & Navigation */}
                    {item.location && (() => {
                      const mapInfo = getMapInfo(item.location, item.mapUrl);
                      return (
                        <div className="flex items-center justify-between text-xs text-[#5D574F]">
                          <span className="flex items-center gap-1 truncate font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#8BBF9F] shrink-0" />
                            <span className="truncate">{item.location}</span>
                          </span>

                          <a
                            href={mapInfo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              backgroundColor: mapInfo.badgeBg,
                              color: mapInfo.badgeColor,
                              borderColor: mapInfo.borderColor
                            }}
                            className="flex items-center gap-1.5 text-[11px] font-bold border hover:opacity-90 px-2.5 py-1 rounded-xl shrink-0 transition-all active:scale-95 shadow-2xs"
                            title={`以 ${mapInfo.label} 開啟導航`}
                          >
                            <Navigation className="w-3 h-3 shrink-0" />
                            <span>{mapInfo.isNaver ? 'Naver Map' : mapInfo.isGoogle ? 'Google Maps' : mapInfo.label}</span>
                          </a>
                        </div>
                      );
                    })()}

                    {/* Linked Flight Badge */}
                    {item.linkedFlightId && (() => {
                      const linkedFlight = flightBookings.find(f => f.id === item.linkedFlightId);
                      return (
                        <div className="flex items-center justify-between bg-[#EDF5FA] px-3 py-2 rounded-2xl border border-[#C5DFEF] text-xs text-[#2B5570] font-bold">
                          <div className="flex items-center gap-1.5 truncate">
                            <Plane className="w-3.5 h-3.5 text-[#3A6B88] shrink-0" />
                            <span className="truncate">
                              ✈️ 已連動機票：{linkedFlight ? `${linkedFlight.airline} ${linkedFlight.flightNumber} (${linkedFlight.departureCode} 🛫 ${linkedFlight.arrivalCode})` : '航班預訂'}
                            </span>
                            {linkedFlight?.bookingRef && (
                              <span className="font-mono bg-white px-1.5 py-0.5 rounded-md border border-[#C5DFEF] text-[#3A6B88] text-[10px] shrink-0">
                                {linkedFlight.bookingRef}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab('bookings');
                            }}
                            className="text-[#3A6B88] hover:underline flex items-center gap-0.5 shrink-0 ml-2 text-[11px]"
                          >
                            <span>查看機票</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })()}

                    {/* Linked Hotel Badge */}
                    {item.linkedHotelId && (() => {
                      const linkedHotel = hotelBookings.find(h => h.id === item.linkedHotelId);
                      return (
                        <div className="flex items-center justify-between bg-[#FBF2EE] px-3 py-2 rounded-2xl border border-[#ECCDC2] text-xs text-[#8A523F] font-bold">
                          <div className="flex items-center gap-1.5 truncate">
                            <Hotel className="w-3.5 h-3.5 text-[#8A523F] shrink-0" />
                            <span className="truncate">🏨 已連動住宿：{linkedHotel?.name || '飯店住宿'}</span>
                            {linkedHotel?.bookingRef && (
                              <span className="font-mono bg-white px-1.5 py-0.5 rounded-md border border-[#ECCDC2] text-[#5C8984] text-[10px] shrink-0">
                                {linkedHotel.bookingRef}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveTab('bookings');
                            }}
                            className="text-[#8A523F] hover:underline flex items-center gap-0.5 shrink-0 ml-2 text-[11px]"
                          >
                            <span>查看住宿</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })()}

                    {/* Notes preview */}
                    {item.notes && (
                      <p className="text-xs text-[#8E8A81] line-clamp-2 bg-[#FAF8F3] p-2.5 rounded-2xl border border-[#F0ECE1]">
                        📝 {item.notes}
                      </p>
                    )}

                    {/* Photos Preview */}
                    {item.photos && item.photos.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
                        {item.photos.map((photo, idx) => (
                          <img
                            key={idx}
                            src={photo}
                            alt="Travel spot"
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-2xl object-cover border border-[#E0DACB] shrink-0"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Add / Edit Schedule Item Modal */}
      {modalOpen && (
        <div 
          id="schedule-modal-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl p-5 ac-shadow border-2 border-[#E2DEC9] relative my-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EBE0]">
              <h3 className="text-base font-bold text-[#4A4036]">
                {editingItem ? '編輯行程項目' : '新增每日行程'}
              </h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full bg-[#F4F1EA] text-[#786C5E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Day & Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#6D6257] mb-1">第幾天</label>
                  <select
                    value={formData.dayIndex}
                    onChange={(e) => setFormData({ ...formData, dayIndex: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-medium"
                  >
                    {Array.from({ length: totalDays }).map((_, idx) => (
                      <option key={idx} value={idx}>
                        Day {idx + 1} ({getDayLabel(idx).fullDate})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#6D6257] mb-1">時間</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-medium"
                    required
                  />
                </div>
              </div>

              {/* Quick link to Flight booking selector */}
              {flightBookings.length > 0 && (
                <div className="bg-[#EDF5FA] p-2.5 rounded-2xl border border-[#C5DFEF] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#3A6B88] flex items-center gap-1">
                      <Plane className="w-3.5 h-3.5" />
                      快速連動已預訂機票 (航班)
                    </span>
                    {formData.linkedFlightId && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, linkedFlightId: undefined })}
                        className="text-[10px] text-[#C87568] hover:underline font-bold"
                      >
                        解除連動
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {flightBookings.map((f) => {
                      const isSelected = formData.linkedFlightId === f.id;
                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            const flightDayIdx = getDayIndexForDate(tripSettings.startDate, f.date);
                            setFormData({
                              ...formData,
                              dayIndex: flightDayIdx >= 0 && flightDayIdx < totalDays ? flightDayIdx : formData.dayIndex,
                              title: `✈️ 航班：${f.airline} ${f.flightNumber} (${f.departureCode} 🛫 ${f.arrivalCode})`,
                              category: 'transport',
                              time: f.departureTime || '09:00',
                              location: `${f.departureCity}機場 (${f.departureCode}) ${f.terminal ? '・' + f.terminal : ''}`,
                              mapUrl: '',
                              notes: `訂位代號：${f.bookingRef}，座位：${f.seat || '未定'}，登機門：${f.gate || '未定'}${f.notes ? ' | ' + f.notes : ''}`,
                              linkedFlightId: f.id,
                              linkedHotelId: undefined
                            });
                          }}
                          className={`text-[11px] px-2.5 py-1 rounded-xl font-bold border transition-all ${
                            isSelected
                              ? 'bg-[#3A6B88] text-white border-[#3A6B88]'
                              : 'bg-white text-[#2B5570] border-[#C5DFEF] hover:bg-[#E2EFF7]'
                          }`}
                        >
                          ✈️ {f.flightNumber} ({f.departureCode} 🛫 {f.arrivalCode})
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick link to Hotel booking selector */}
              {hotelBookings.length > 0 && (
                <div className="bg-[#FBF2EE] p-2.5 rounded-2xl border border-[#ECCDC2] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#8A523F] flex items-center gap-1">
                      <Hotel className="w-3.5 h-3.5" />
                      快速連動已預訂飯店 (住宿)
                    </span>
                    {formData.linkedHotelId && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, linkedHotelId: undefined })}
                        className="text-[10px] text-[#C87568] hover:underline font-bold"
                      >
                        解除連動
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {hotelBookings.map((h) => {
                      const isSelected = formData.linkedHotelId === h.id;
                      return (
                        <div key={h.id} className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const checkInDayIdx = getDayIndexForDate(tripSettings.startDate, h.checkInDate);
                              setFormData({
                                ...formData,
                                dayIndex: checkInDayIdx >= 0 && checkInDayIdx < totalDays ? checkInDayIdx : formData.dayIndex,
                                title: `🏨 飯店入住 Check-in：${h.name}`,
                                category: 'lodging',
                                time: h.checkInTime || '15:00',
                                location: h.address || h.name,
                                mapUrl: h.mapUrl || '',
                                notes: `訂房確認號：${h.bookingRef || '已確認'}，電話：${h.phone || '無'}${h.notes ? ' | ' + h.notes : ''}`,
                                photos: h.photoUrl ? [h.photoUrl] : formData.photos,
                                linkedHotelId: h.id,
                                linkedFlightId: undefined
                              });
                            }}
                            className={`text-[11px] px-2 py-1 rounded-xl font-bold border transition-all ${
                              isSelected
                                ? 'bg-[#8A523F] text-white border-[#8A523F]'
                                : 'bg-white text-[#6D6257] border-[#ECCDC2] hover:bg-[#F8EAE4]'
                            }`}
                          >
                            🏨 入住：{h.name}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const checkOutDayIdx = getDayIndexForDate(tripSettings.startDate, h.checkOutDate);
                              setFormData({
                                ...formData,
                                dayIndex: checkOutDayIdx >= 0 && checkOutDayIdx < totalDays ? checkOutDayIdx : formData.dayIndex,
                                title: `🚪 飯店退房 Check-out：${h.name}`,
                                category: 'lodging',
                                time: h.checkOutTime || '11:00',
                                location: h.address || h.name,
                                mapUrl: h.mapUrl || '',
                                notes: `退房並確認行李寄放/出發下一站。飯店：${h.name}，電話：${h.phone || '無'}`,
                                photos: h.photoUrl ? [h.photoUrl] : formData.photos,
                                linkedHotelId: h.id,
                                linkedFlightId: undefined
                              });
                            }}
                            className="text-[11px] px-2 py-1 rounded-xl font-bold border border-[#ECCDC2] bg-white text-[#6D6257] hover:bg-[#F8EAE4] transition-all"
                          >
                            🚪 退房
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">行程名稱</label>
                <input
                  type="text"
                  placeholder="例如：清水寺、錦市場午餐、HARUKA 列車"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-medium text-sm"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">類別標籤</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.keys(CATEGORY_CONFIG) as EventCategory[]).map((catKey) => {
                    const cfg = CATEGORY_CONFIG[catKey];
                    const isSelected = formData.category === catKey;
                    return (
                      <button
                        type="button"
                        key={catKey}
                        onClick={() => setFormData({ ...formData, category: catKey })}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl border font-bold text-xs transition-all ${
                          isSelected
                            ? 'ring-2 ring-[#5C8984] scale-[1.02]'
                            : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}
                      >
                        <span>{cfg.emoji}</span>
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location & Map URL */}
              <div className="space-y-2">
                <div>
                  <label className="block font-bold text-[#6D6257] mb-1">地點名稱 / 地址</label>
                  <input
                    type="text"
                    placeholder="例如：京都府京都市東山區清水1丁目294 或 首爾明洞"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-[#6D6257]">
                      地圖 / 導航連結 <span className="text-[10px] font-normal text-[#8E8A81]">(支援 Google Maps / Naver Map 等)</span>
                    </label>
                    {formData.mapUrl && (() => {
                      const provider = detectMapProvider(formData.mapUrl);
                      if (provider === 'naver') {
                        return (
                          <span className="text-[10px] font-bold text-[#03C75A] bg-[#E8F7ED] border border-[#B6E8C8] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#03C75A] inline-block animate-pulse"></span>
                            Naver Map 連結
                          </span>
                        );
                      }
                      if (provider === 'google') {
                        return (
                          <span className="text-[10px] font-bold text-[#1A73E8] bg-[#E8F0FE] border border-[#C2D7FA] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#1A73E8] inline-block animate-pulse"></span>
                            Google Maps 連結
                          </span>
                        );
                      }
                      if (provider === 'kakao') {
                        return (
                          <span className="text-[10px] font-bold text-[#3A1D1D] bg-[#FFFDE6] border border-[#FEE500] px-2 py-0.5 rounded-full">
                            Kakao Map 連結
                          </span>
                        );
                      }
                      return (
                        <span className="text-[10px] font-bold text-[#0284C7] bg-[#F0F9FF] border border-[#BAE6FD] px-2 py-0.5 rounded-full">
                          自訂地圖連結
                        </span>
                      );
                    })()}
                  </div>

                  <input
                    type="url"
                    placeholder="可貼上 Google Maps、Naver Map 網址 (如 https://naver.me/...)"
                    value={formData.mapUrl}
                    onChange={(e) => setFormData({ ...formData, mapUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] text-[11px]"
                  />

                  {/* Quick-fill helper for location */}
                  {formData.location && (
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[10px] text-[#8E8A81]">快速帶入：</span>
                      <button
                        type="button"
                        onClick={() => {
                          const links = getAlternateMapLinks(formData.location);
                          setFormData({ ...formData, mapUrl: links.naverMap });
                        }}
                        className="text-[10px] font-bold text-[#03C75A] bg-[#E8F7ED] hover:bg-[#D5F0DC] border border-[#B6E8C8] px-2 py-0.5 rounded-lg active:scale-95 transition-all"
                      >
                        🟢 Naver Map 搜尋連結
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const links = getAlternateMapLinks(formData.location);
                          setFormData({ ...formData, mapUrl: links.googleMaps });
                        }}
                        className="text-[10px] font-bold text-[#1A73E8] bg-[#E8F0FE] hover:bg-[#D8E6FD] border border-[#C2D7FA] px-2 py-0.5 rounded-lg active:scale-95 transition-all"
                      >
                        🔵 Google Maps 搜尋連結
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Estimated cost */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#6D6257] mb-1">預估花費</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estimatedCost}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#6D6257] mb-1">幣別</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8] font-bold text-center"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-[#6D6257] mb-1">備註 / 必吃推薦 / 注意事項</label>
                <textarea
                  rows={2}
                  placeholder="例如：記得帶和服預約單、需提早15分鐘抵達現場..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F3] border border-[#DDD7C8]"
                />
              </div>

              {/* Photos upload */}
              <div>
                <ImageUploader
                  label="景點 / 美食照片 (選填)"
                  currentImage={formData.photos[0]}
                  onImageUploaded={(url) => setFormData({ ...formData, photos: [url] })}
                  onImageRemoved={() => setFormData({ ...formData, photos: [] })}
                  aspect="video"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#5C8984] hover:bg-[#4E7672] text-white font-bold rounded-xl ac-shadow-sm active:scale-95 transition-all text-sm"
                >
                  {editingItem ? '儲存修改' : '確認新增行程'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Item Detail Viewer Modal */}
      {viewDetailItem && (
        <div 
          id="view-schedule-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
          onClick={() => setViewDetailItem(null)}
        >
          <div 
            className="w-full max-w-sm bg-white rounded-3xl p-5 ac-shadow border-2 border-[#E2DEC9] relative space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setViewDetailItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#F4F1EA] text-[#786C5E]"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Photo header if available */}
            {viewDetailItem.photos && viewDetailItem.photos[0] && (
              <div className="aspect-[16/9] rounded-2xl overflow-hidden border border-[#E2DEC9] ac-shadow-sm -mt-1">
                <img 
                  src={viewDetailItem.photos[0]} 
                  alt={viewDetailItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover" 
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#5C8984] bg-[#F2F7F6] px-2 py-0.5 rounded-md">
                  Day {viewDetailItem.dayIndex + 1}・{viewDetailItem.time}
                </span>
                <span 
                  className="text-[11px] font-bold px-2 py-0.5 rounded-md border"
                  style={{
                    backgroundColor: CATEGORY_CONFIG[viewDetailItem.category]?.bg,
                    color: CATEGORY_CONFIG[viewDetailItem.category]?.color,
                    borderColor: CATEGORY_CONFIG[viewDetailItem.category]?.border
                  }}
                >
                  {CATEGORY_CONFIG[viewDetailItem.category]?.emoji} {CATEGORY_CONFIG[viewDetailItem.category]?.label}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#4A4036]">
                {viewDetailItem.title}
              </h3>

              {viewDetailItem.location && (() => {
                const mapInfo = getMapInfo(viewDetailItem.location, viewDetailItem.mapUrl);
                const altLinks = getAlternateMapLinks(viewDetailItem.location);
                return (
                  <div className="space-y-2">
                    <div className="p-3 bg-[#FAF8F3] rounded-2xl border border-[#EDE7D8] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-[#5A5046] truncate mr-2">
                        <MapPin className="w-4 h-4 text-[#8BBF9F] shrink-0" />
                        <span className="truncate font-medium">{viewDetailItem.location}</span>
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
                        className="flex items-center gap-1.5 text-xs font-bold border px-3 py-1.5 rounded-xl shrink-0 active:scale-95 shadow-2xs hover:opacity-90 transition-all"
                      >
                        <Navigation className="w-3.5 h-3.5 shrink-0" />
                        <span>{mapInfo.isNaver ? 'Naver Map 導航' : mapInfo.isGoogle ? 'Google Maps 導航' : mapInfo.label}</span>
                      </a>
                    </div>

                    {/* Alternate map search shortcuts */}
                    <div className="flex items-center justify-end gap-2 text-[10px] text-[#8E8A81] px-1">
                      <span>其他地圖：</span>
                      {!mapInfo.isNaver && (
                        <a
                          href={altLinks.naverMap}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#03C75A] font-bold hover:underline bg-[#E8F7ED] px-2 py-0.5 rounded-md border border-[#B6E8C8]"
                        >
                          🟢 Naver Map 開啟
                        </a>
                      )}
                      {!mapInfo.isGoogle && (
                        <a
                          href={altLinks.googleMaps}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#1A73E8] font-bold hover:underline bg-[#E8F0FE] px-2 py-0.5 rounded-md border border-[#C2D7FA]"
                        >
                          🔵 Google Maps 開啟
                        </a>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Linked Flight Details in Modal */}
              {viewDetailItem.linkedFlightId && (() => {
                const flight = flightBookings.find(f => f.id === viewDetailItem.linkedFlightId);
                return (
                  <div className="bg-[#EDF5FA] p-3 rounded-2xl border border-[#C5DFEF] space-y-1.5 text-xs text-[#2B5570]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5 text-[#3A6B88]">
                        <Plane className="w-4 h-4" />
                        已連動預訂機票
                      </span>
                      {flight?.bookingRef && (
                        <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-[#C5DFEF] text-[#3A6B88] text-[11px]">
                          {flight.bookingRef}
                        </span>
                      )}
                    </div>
                    {flight && (
                      <div className="text-[11px] text-[#426982] space-y-0.5">
                        <p className="font-bold">{flight.airline} {flight.flightNumber} ({flight.departureCode} 🛫 {flight.arrivalCode})</p>
                        <p>時間：{flight.departureTime} ~ {flight.arrivalTime} ｜ 座位：{flight.seat || '未定'} ｜ 登機門：{flight.gate || '未定'}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Linked Hotel Details in Modal */}
              {viewDetailItem.linkedHotelId && (() => {
                const hotel = hotelBookings.find(h => h.id === viewDetailItem.linkedHotelId);
                return (
                  <div className="bg-[#FBF2EE] p-3 rounded-2xl border border-[#ECCDC2] space-y-1.5 text-xs text-[#8A523F]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <Hotel className="w-4 h-4" />
                        已連動預訂住宿
                      </span>
                      {hotel?.bookingRef && (
                        <span className="font-mono font-bold bg-white px-2 py-0.5 rounded-md border border-[#ECCDC2] text-[#5C8984] text-[11px]">
                          {hotel.bookingRef}
                        </span>
                      )}
                    </div>
                    {hotel && (
                      <div className="text-[11px] text-[#7A4938] space-y-0.5">
                        <p className="font-bold">{hotel.name}</p>
                        <p>地址：{hotel.address} ｜ 電話：{hotel.phone || '無'}</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {viewDetailItem.notes && (
                <div className="text-xs text-[#5D5246] bg-[#FFFBF0] p-3 rounded-2xl border border-[#F2E8CE] space-y-1">
                  <span className="font-bold text-[#B7791F] block text-[11px]">📝 備忘與攻略筆記：</span>
                  <p className="leading-relaxed whitespace-pre-wrap">{viewDetailItem.notes}</p>
                </div>
              )}

              {viewDetailItem.estimatedCost ? (
                <div className="flex items-center justify-between text-xs text-[#706456] px-1">
                  <span>預估人均費用</span>
                  <span className="font-bold text-[#D35400]">
                    {viewDetailItem.estimatedCost.toLocaleString()} {viewDetailItem.currency || 'JPY'}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={(e) => {
                  setViewDetailItem(null);
                  openEditModal(viewDetailItem, e);
                }}
                className="flex-1 py-2 bg-[#FAF8F3] hover:bg-[#F2EFE6] text-[#4A4036] font-bold text-xs rounded-xl border border-[#DDD7C8]"
              >
                編輯此行程
              </button>
              <button
                onClick={() => setViewDetailItem(null)}
                className="flex-1 py-2 bg-[#5C8984] text-white font-bold text-xs rounded-xl"
              >
                完成關閉
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
