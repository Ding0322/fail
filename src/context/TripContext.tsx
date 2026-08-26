import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  TripSettings, 
  Member, 
  ScheduleItem, 
  DayWeather, 
  FlightBooking, 
  HotelBooking, 
  CarRentalBooking, 
  VoucherBooking, 
  ExpenseItem, 
  JournalEntry, 
  PlanningItem, 
  TabType 
} from '../types';
import { 
  initialTripSettings, 
  initialMembers, 
  initialWeatherForecast, 
  initialScheduleItems, 
  initialFlightBookings, 
  initialHotelBookings, 
  initialCarRentalBookings, 
  initialVoucherBookings, 
  initialExpenses, 
  initialJournalEntries, 
  initialPlanningItems 
} from '../data/initialTripData';
import { fetchLiveExchangeRate } from '../services/currencyService';
import { fetchLiveWeatherForLocation } from '../services/weatherService';
import { getDayIndexForDate } from '../utils/hotelLinkHelper';
import confetti from 'canvas-confetti';

interface TripContextType {
  tripSettings: TripSettings;
  updateTripSettings: (settings: Partial<TripSettings>) => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  selectedDayIndex: number;
  setSelectedDayIndex: (index: number) => void;
  currentMemberId: string;
  setCurrentMemberId: (id: string) => void;
  
  // Members
  members: Member[];
  addMember: (member: Omit<Member, 'id'>) => void;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;

  // Schedule & Weather
  scheduleItems: ScheduleItem[];
  weatherForecast: Record<number, DayWeather>;
  isUpdatingWeather: boolean;
  weatherStatus: string | null;
  refreshWeatherForDay: (dayIndex: number, customLocation?: string) => Promise<void>;
  refreshAllDaysWeather: () => Promise<void>;
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, item: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;
  toggleScheduleCompleted: (id: string) => void;

  // Bookings
  flightBookings: FlightBooking[];
  addFlightBooking: (flight: Omit<FlightBooking, 'id'>, autoSyncSchedule?: boolean) => void;
  updateFlightBooking: (id: string, flight: Partial<FlightBooking>) => void;
  deleteFlightBooking: (id: string) => void;
  syncFlightToSchedule: (flight: FlightBooking) => void;

  hotelBookings: HotelBooking[];
  addHotelBooking: (hotel: Omit<HotelBooking, 'id'>, autoSyncSchedule?: boolean) => void;
  updateHotelBooking: (id: string, hotel: Partial<HotelBooking>) => void;
  deleteHotelBooking: (id: string) => void;
  syncHotelToSchedule: (hotel: HotelBooking, autoCheckOut?: boolean) => void;

  carRentalBookings: CarRentalBooking[];
  addCarRentalBooking: (car: Omit<CarRentalBooking, 'id'>) => void;
  updateCarRentalBooking: (id: string, car: Partial<CarRentalBooking>) => void;
  deleteCarRentalBooking: (id: string) => void;

  voucherBookings: VoucherBooking[];
  addVoucherBooking: (voucher: Omit<VoucherBooking, 'id'>) => void;
  updateVoucherBooking: (id: string, voucher: Partial<VoucherBooking>) => void;
  deleteVoucherBooking: (id: string) => void;
  syncBookingToExpense: (bookingId: string, type: 'flight' | 'hotel' | 'car' | 'voucher') => void;

  // Expenses
  expenses: ExpenseItem[];
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  updateExpense: (id: string, expense: Partial<ExpenseItem>) => void;
  deleteExpense: (id: string) => void;

  // Journal
  journalEntries: JournalEntry[];
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
  updateJournalEntry: (id: string, entry: Partial<JournalEntry>) => void;
  deleteJournalEntry: (id: string) => void;
  toggleJournalLike: (id: string) => void;

  // Planning
  planningItems: PlanningItem[];
  addPlanningItem: (item: Omit<PlanningItem, 'id'>) => void;
  updatePlanningItem: (id: string, item: Partial<PlanningItem>) => void;
  togglePlanningItem: (id: string) => void;
  deletePlanningItem: (id: string) => void;

  // PIN Protection
  isPinUnlocked: boolean;
  verifyPin: (pinInput: string) => boolean;
  lockPin: () => void;
  requestPinUnlock: (onSuccess: () => void) => void;
  pinModalOpen: boolean;
  setPinModalOpen: (open: boolean) => void;
  executePendingAction: () => void;

  // Quick stats
  daysRemaining: number;
  totalDays: number;
  totalExpensesBase: number;
  totalExpensesForeign: number;
  triggerConfetti: () => void;
  resetToDefaultData: () => void;

  // In-app Custom Confirmation Dialog
  confirmDialogState: ConfirmDialogState;
  showConfirmDialog: (options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void;
  }) => void;
  closeConfirmDialog: () => void;

  // Live Exchange Rate Sync
  isUpdatingRate: boolean;
  rateUpdateStatus: string | null;
  refreshExchangeRate: (overrideForeign?: string, overrideBase?: string) => Promise<boolean>;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
}

const STORAGE_PREFIX = 'ac_travel_techo_';

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or fall back to rich initial data
  const [tripSettings, setTripSettings] = useState<TripSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}settings`);
    return saved ? JSON.parse(saved) : initialTripSettings;
  });

  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [currentMemberId, setCurrentMemberId] = useState<string>('m1');

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}members`);
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}schedule`);
    return saved ? JSON.parse(saved) : initialScheduleItems;
  });

  const [weatherForecast, setWeatherForecast] = useState<Record<number, DayWeather>>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}weather`);
    return saved ? JSON.parse(saved) : initialWeatherForecast;
  });

  const [isUpdatingWeather, setIsUpdatingWeather] = useState<boolean>(false);
  const [weatherStatus, setWeatherStatus] = useState<string | null>(null);

  const [flightBookings, setFlightBookings] = useState<FlightBooking[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}flights`);
    return saved ? JSON.parse(saved) : initialFlightBookings;
  });

  const [hotelBookings, setHotelBookings] = useState<HotelBooking[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}hotels`);
    return saved ? JSON.parse(saved) : initialHotelBookings;
  });

  const [carRentalBookings, setCarRentalBookings] = useState<CarRentalBooking[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}cars`);
    return saved ? JSON.parse(saved) : initialCarRentalBookings;
  });

  const [voucherBookings, setVoucherBookings] = useState<VoucherBooking[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}vouchers`);
    return saved ? JSON.parse(saved) : initialVoucherBookings;
  });

  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}expenses`);
    return saved ? JSON.parse(saved) : initialExpenses;
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}journal`);
    return saved ? JSON.parse(saved) : initialJournalEntries;
  });

  const [planningItems, setPlanningItems] = useState<PlanningItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_PREFIX}planning`);
    return saved ? JSON.parse(saved) : initialPlanningItems;
  });

  // PIN security for editing important bookings
  const [isPinUnlocked, setIsPinUnlocked] = useState<boolean>(false);
  const [pinModalOpen, setPinModalOpen] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // In-app Custom Confirmation Dialog State
  const [confirmDialogState, setConfirmDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '確定刪除',
    cancelText: '取消',
    danger: true,
    onConfirm: () => {}
  });

  const showConfirmDialog = (options: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    onConfirm: () => void;
  }) => {
    setConfirmDialogState({
      isOpen: true,
      title: options.title || '確定要刪除嗎？',
      message: options.message,
      confirmText: options.confirmText || '確定刪除',
      cancelText: options.cancelText || '取消',
      danger: options.danger !== undefined ? options.danger : true,
      onConfirm: () => {
        try {
          options.onConfirm();
        } catch (e) {
          console.error('Error during confirmed action:', e);
        }
        setConfirmDialogState(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialogState(prev => ({ ...prev, isOpen: false }));
  };

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}settings`, JSON.stringify(tripSettings));
  }, [tripSettings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}members`, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}schedule`, JSON.stringify(scheduleItems));
  }, [scheduleItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}flights`, JSON.stringify(flightBookings));
  }, [flightBookings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}hotels`, JSON.stringify(hotelBookings));
  }, [hotelBookings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}cars`, JSON.stringify(carRentalBookings));
  }, [carRentalBookings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}vouchers`, JSON.stringify(voucherBookings));
  }, [voucherBookings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}journal`, JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}planning`, JSON.stringify(planningItems));
  }, [planningItems]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_PREFIX}weather`, JSON.stringify(weatherForecast));
  }, [weatherForecast]);

  // Helper to determine primary location for a day
  const getDayPrimaryLocation = (dayIdx: number): string => {
    const dayItems = scheduleItems.filter(s => s.dayIndex === dayIdx);
    if (dayItems.length > 0) {
      const preferred = dayItems.find(s => s.location && (s.category === 'spot' || s.category === 'food')) || 
                        dayItems.find(s => s.location) || 
                        dayItems[0];
      if (preferred.location && preferred.location.trim()) {
        return preferred.location.trim();
      }
      if (preferred.title && preferred.title.trim()) {
        return preferred.title.trim();
      }
    }
    return tripSettings.destination || '京都';
  };

  // Weather update handlers
  const refreshWeatherForDay = async (dayIndex: number, customLocation?: string): Promise<void> => {
    const targetLocation = customLocation || getDayPrimaryLocation(dayIndex);
    const targetDate = new Date(tripSettings.startDate);
    targetDate.setDate(targetDate.getDate() + dayIndex);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    setIsUpdatingWeather(true);
    setWeatherStatus(`正在更新 Day ${dayIndex + 1} (${targetLocation}) 即時氣象...`);
    try {
      const weather = await fetchLiveWeatherForLocation(targetLocation, targetDateStr);
      setWeatherForecast(prev => ({
        ...prev,
        [dayIndex]: weather
      }));
      setWeatherStatus(`已同步 ${targetLocation} 即時天氣！`);
      setTimeout(() => setWeatherStatus(null), 3500);
    } catch (err) {
      console.warn('Weather fetch error:', err);
      setWeatherStatus('氣象更新失敗，已保留預報');
      setTimeout(() => setWeatherStatus(null), 3000);
    } finally {
      setIsUpdatingWeather(false);
    }
  };

  const refreshAllDaysWeather = async (): Promise<void> => {
    setIsUpdatingWeather(true);
    setWeatherStatus('正在依每日行程地點全數更新天氣...');
    try {
      for (let i = 0; i < totalDays; i++) {
        const loc = getDayPrimaryLocation(i);
        const targetDate = new Date(tripSettings.startDate);
        targetDate.setDate(targetDate.getDate() + i);
        const targetDateStr = targetDate.toISOString().split('T')[0];
        const weather = await fetchLiveWeatherForLocation(loc, targetDateStr);
        setWeatherForecast(prev => ({
          ...prev,
          [i]: weather
        }));
      }
      setWeatherStatus('已全數完成每日行程天氣同步！');
      setTimeout(() => setWeatherStatus(null), 3500);
    } catch (err) {
      console.warn('All days weather update error:', err);
    } finally {
      setIsUpdatingWeather(false);
    }
  };

  // Auto-sync current day weather based on location
  useEffect(() => {
    const loc = getDayPrimaryLocation(selectedDayIndex);
    const targetDate = new Date(tripSettings.startDate);
    targetDate.setDate(targetDate.getDate() + selectedDayIndex);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Silent background fetch to keep current day accurate to its schedule location
    fetchLiveWeatherForLocation(loc, targetDateStr).then(weather => {
      setWeatherForecast(prev => ({
        ...prev,
        [selectedDayIndex]: weather
      }));
    }).catch(() => {});
  }, [selectedDayIndex, tripSettings.destination, tripSettings.startDate]);

  // PIN Helpers
  const verifyPin = (pinInput: string): boolean => {
    const isValid = pinInput === tripSettings.pinCode;
    if (isValid) {
      setIsPinUnlocked(true);
    }
    return isValid;
  };

  const lockPin = () => {
    setIsPinUnlocked(false);
  };

  const requestPinUnlock = (onSuccess: () => void) => {
    if (isPinUnlocked) {
      onSuccess();
    } else {
      setPendingAction(() => onSuccess);
      setPinModalOpen(true);
    }
  };

  const executePendingAction = () => {
    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#7FB069', '#5C8984', '#F4D06F', '#E59866', '#E88873']
      });
    } catch {
      // ignore
    }
  };

  // Live Exchange Rate sync state
  const [isUpdatingRate, setIsUpdatingRate] = useState<boolean>(false);
  const [rateUpdateStatus, setRateUpdateStatus] = useState<string | null>(null);

  const refreshExchangeRate = async (overrideForeign?: string, overrideBase?: string): Promise<boolean> => {
    const foreign = (overrideForeign || tripSettings.foreignCurrency || 'JPY').toUpperCase();
    const base = (overrideBase || tripSettings.baseCurrency || 'TWD').toUpperCase();
    
    setIsUpdatingRate(true);
    setRateUpdateStatus(`正在獲取 ${foreign} → ${base} 即時匯率...`);
    try {
      const res = await fetchLiveExchangeRate(foreign, base);
      if (res.success && res.rate > 0) {
        setTripSettings(prev => ({
          ...prev,
          exchangeRate: res.rate,
          lastRateUpdate: `${res.lastUpdated} (${res.source})`
        }));
        setRateUpdateStatus(`已更新即時匯率：1 ${foreign} ≈ ${res.rate} ${base}`);
        setTimeout(() => setRateUpdateStatus(null), 5000);
        return true;
      } else {
        setRateUpdateStatus(res.error || '匯率更新失敗，保留目前匯率');
        setTimeout(() => setRateUpdateStatus(null), 4000);
        return false;
      }
    } catch {
      setRateUpdateStatus('連線逾時，使用已儲存匯率');
      setTimeout(() => setRateUpdateStatus(null), 4000);
      return false;
    } finally {
      setIsUpdatingRate(false);
    }
  };

  // Auto-fetch daily rate if enabled
  useEffect(() => {
    if (tripSettings.autoUpdateRate !== false) {
      // Trigger a silent background update
      refreshExchangeRate(tripSettings.foreignCurrency, tripSettings.baseCurrency);
    }
  }, [tripSettings.foreignCurrency, tripSettings.baseCurrency, tripSettings.autoUpdateRate]);

  // Updaters
  const updateTripSettings = (settings: Partial<TripSettings>) => {
    setTripSettings(prev => ({ ...prev, ...settings }));
  };

  // Members
  const addMember = (member: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...member,
      id: `m_${Date.now()}`
    };
    setMembers(prev => [...prev, newMember]);
  };

  const updateMember = (id: string, updated: Partial<Member>) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updated } : m));
  };

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  // Schedule
  const addScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...item,
      id: `s_${Date.now()}`
    };
    setScheduleItems(prev => [...prev, newItem].sort((a, b) => a.time.localeCompare(b.time)));
  };

  const updateScheduleItem = (id: string, updated: Partial<ScheduleItem>) => {
    setScheduleItems(prev => prev.map(item => item.id === id ? { ...item, ...updated } : item).sort((a, b) => a.time.localeCompare(b.time)));
  };

  const deleteScheduleItem = (id: string) => {
    setScheduleItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleScheduleCompleted = (id: string) => {
    setScheduleItems(prev => prev.map(item => item.id === id ? { ...item, isCompleted: !item.isCompleted } : item));
  };

  // Bookings - Flights
  const syncFlightToSchedule = (flight: FlightBooking) => {
    const flightDayIdx = getDayIndexForDate(tripSettings.startDate, flight.date);
    if (flightDayIdx < 0 || flightDayIdx >= totalDays) return;

    const existingFlightItem = scheduleItems.find(s => s.linkedFlightId === flight.id);

    const flightTitle = `✈️ 航班：${flight.airline} ${flight.flightNumber} (${flight.departureCode} 🛫 ${flight.arrivalCode})`;
    const flightLocation = `${flight.departureCity} (${flight.departureCode})${flight.terminal ? ' ' + flight.terminal : ''}${flight.gate ? ' ' + flight.gate : ''}`.trim();
    const flightNotes = `訂位代號：${flight.bookingRef || '已確認'} | 起飛 ${flight.departureTime} ➜ 預計 ${flight.arrivalTime} 抵達 ${flight.arrivalCity} (${flight.arrivalCode})${flight.seat ? ' | 座位：' + flight.seat : ''}${flight.passengerNames?.length ? ' | 旅客：' + flight.passengerNames.join(', ') : ''}${flight.notes ? ' | ' + flight.notes : ''}`;

    if (existingFlightItem) {
      updateScheduleItem(existingFlightItem.id, {
        dayIndex: flightDayIdx,
        time: flight.departureTime || '08:00',
        title: flightTitle,
        category: 'transport',
        location: flightLocation,
        notes: flightNotes,
        linkedFlightId: flight.id
      });
    } else {
      addScheduleItem({
        dayIndex: flightDayIdx,
        time: flight.departureTime || '08:00',
        title: flightTitle,
        category: 'transport',
        location: flightLocation,
        mapUrl: '',
        notes: flightNotes,
        estimatedCost: 0,
        currency: tripSettings.baseCurrency,
        isCompleted: false,
        linkedFlightId: flight.id
      });
    }
  };

  // Helper to sync booking to expenses
  const syncFlightExpense = (flight: FlightBooking) => {
    const totalAmount = flight.totalPrice !== undefined 
      ? flight.totalPrice 
      : (flight.unitPrice && flight.quantity ? flight.unitPrice * flight.quantity : 0);
    const flightCurrency = flight.currency || tripSettings.baseCurrency;
    const rate = flightCurrency === tripSettings.baseCurrency ? 1.0 : tripSettings.exchangeRate;
    const payer = flight.paidByMemberId || members[0]?.id || 'm1';
    const splitMembers = flight.splitMemberIds && flight.splitMemberIds.length > 0 
      ? flight.splitMemberIds 
      : members.map(m => m.id);

    setExpenses(prev => {
      const existingIdx = prev.findIndex(e => e.linkedBookingId === flight.id);
      if (totalAmount > 0) {
        const itemData: ExpenseItem = {
          id: existingIdx >= 0 ? prev[existingIdx].id : `e_f_${flight.id}`,
          title: `機票：${flight.airline} ${flight.flightNumber} (${flight.departureCode} 🛫 ${flight.arrivalCode})`,
          amount: totalAmount,
          currency: flightCurrency,
          exchangeRate: rate,
          category: 'transport',
          date: flight.date || tripSettings.startDate,
          payerId: payer,
          splitMemberIds: splitMembers,
          notes: flight.notes ? `機票備註: ${flight.notes}` : '機票預訂費用',
          linkedBookingId: flight.id,
          linkedBookingType: 'flight'
        };
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = { ...prev[existingIdx], ...itemData };
          return next;
        } else {
          return [itemData, ...prev];
        }
      } else {
        // If 0 and had existing expense, remove or update
        if (existingIdx >= 0) {
          return prev.filter(e => e.linkedBookingId !== flight.id);
        }
        return prev;
      }
    });
  };

  const syncHotelExpense = (hotel: HotelBooking) => {
    const totalAmount = hotel.totalPrice || 0;
    const hotelCurrency = hotel.currency || tripSettings.foreignCurrency;
    const rate = hotelCurrency === tripSettings.baseCurrency ? 1.0 : tripSettings.exchangeRate;
    const payer = hotel.paidByMemberId || members[0]?.id || 'm1';
    const splitMembers = hotel.splitMemberIds && hotel.splitMemberIds.length > 0 
      ? hotel.splitMemberIds 
      : members.map(m => m.id);

    setExpenses(prev => {
      const existingIdx = prev.findIndex(e => e.linkedBookingId === hotel.id);
      if (totalAmount > 0) {
        const itemData: ExpenseItem = {
          id: existingIdx >= 0 ? prev[existingIdx].id : `e_h_${hotel.id}`,
          title: `住宿：${hotel.name}`,
          amount: totalAmount,
          currency: hotelCurrency,
          exchangeRate: rate,
          category: 'lodging',
          date: hotel.checkInDate || tripSettings.startDate,
          payerId: payer,
          splitMemberIds: splitMembers,
          receiptUrl: hotel.photoUrl,
          notes: hotel.notes ? `住宿備註: ${hotel.notes}` : '飯店預訂費用',
          linkedBookingId: hotel.id,
          linkedBookingType: 'hotel'
        };
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = { ...prev[existingIdx], ...itemData };
          return next;
        } else {
          return [itemData, ...prev];
        }
      } else if (existingIdx >= 0) {
        return prev.filter(e => e.linkedBookingId !== hotel.id);
      }
      return prev;
    });
  };

  const syncCarExpense = (car: CarRentalBooking) => {
    const totalAmount = car.totalPrice || 0;
    const carCurrency = car.currency || tripSettings.foreignCurrency;
    const rate = carCurrency === tripSettings.baseCurrency ? 1.0 : tripSettings.exchangeRate;
    const payer = car.paidByMemberId || members[0]?.id || 'm1';
    const splitMembers = car.splitMemberIds && car.splitMemberIds.length > 0 
      ? car.splitMemberIds 
      : members.map(m => m.id);

    setExpenses(prev => {
      const existingIdx = prev.findIndex(e => e.linkedBookingId === car.id);
      if (totalAmount > 0) {
        const itemData: ExpenseItem = {
          id: existingIdx >= 0 ? prev[existingIdx].id : `e_c_${car.id}`,
          title: `租車：${car.company} (${car.carModel})`,
          amount: totalAmount,
          currency: carCurrency,
          exchangeRate: rate,
          category: 'transport',
          date: car.pickupDate || car.pickupTime?.split(' ')[0] || tripSettings.startDate,
          payerId: payer,
          splitMemberIds: splitMembers,
          receiptUrl: car.photoUrl,
          notes: car.notes ? `租車備註: ${car.notes}` : '自駕租車費用',
          linkedBookingId: car.id,
          linkedBookingType: 'car'
        };
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = { ...prev[existingIdx], ...itemData };
          return next;
        } else {
          return [itemData, ...prev];
        }
      } else if (existingIdx >= 0) {
        return prev.filter(e => e.linkedBookingId !== car.id);
      }
      return prev;
    });
  };

  const syncVoucherExpense = (voucher: VoucherBooking) => {
    const totalAmount = voucher.amount || 0;
    const voucherCurrency = voucher.currency || tripSettings.foreignCurrency;
    const rate = voucherCurrency === tripSettings.baseCurrency ? 1.0 : tripSettings.exchangeRate;
    const payer = voucher.paidByMemberId || members[0]?.id || 'm1';
    const splitMembers = voucher.splitMemberIds && voucher.splitMemberIds.length > 0 
      ? voucher.splitMemberIds 
      : members.map(m => m.id);
    const cat: ExpenseItem['category'] = voucher.category === 'pass' 
      ? 'transport' 
      : voucher.category === 'coupon' 
      ? 'shopping' 
      : 'spot';

    setExpenses(prev => {
      const existingIdx = prev.findIndex(e => e.linkedBookingId === voucher.id);
      if (totalAmount > 0) {
        const itemData: ExpenseItem = {
          id: existingIdx >= 0 ? prev[existingIdx].id : `e_v_${voucher.id}`,
          title: `票券：${voucher.title} (${voucher.provider})`,
          amount: totalAmount,
          currency: voucherCurrency,
          exchangeRate: rate,
          category: cat,
          date: voucher.validDate || tripSettings.startDate,
          payerId: payer,
          splitMemberIds: splitMembers,
          receiptUrl: voucher.fileUrl,
          notes: voucher.notes ? `票券備註: ${voucher.notes}` : '票券憑證費用',
          linkedBookingId: voucher.id,
          linkedBookingType: 'voucher'
        };
        if (existingIdx >= 0) {
          const next = [...prev];
          next[existingIdx] = { ...prev[existingIdx], ...itemData };
          return next;
        } else {
          return [itemData, ...prev];
        }
      } else if (existingIdx >= 0) {
        return prev.filter(e => e.linkedBookingId !== voucher.id);
      }
      return prev;
    });
  };

  const syncBookingToExpense = (bookingId: string, type: 'flight' | 'hotel' | 'car' | 'voucher') => {
    if (type === 'flight') {
      const f = flightBookings.find(item => item.id === bookingId);
      if (f) syncFlightExpense(f);
    } else if (type === 'hotel') {
      const h = hotelBookings.find(item => item.id === bookingId);
      if (h) syncHotelExpense(h);
    } else if (type === 'car') {
      const c = carRentalBookings.find(item => item.id === bookingId);
      if (c) syncCarExpense(c);
    } else if (type === 'voucher') {
      const v = voucherBookings.find(item => item.id === bookingId);
      if (v) syncVoucherExpense(v);
    }
  };

  const addFlightBooking = (flight: Omit<FlightBooking, 'id'>, autoSyncSchedule: boolean = true) => {
    const newFlightId = `f_${Date.now()}`;
    const newFlight: FlightBooking = { ...flight, id: newFlightId };
    setFlightBookings(prev => [...prev, newFlight]);
    if (autoSyncSchedule) {
      syncFlightToSchedule(newFlight);
    }
    syncFlightExpense(newFlight);
  };

  const updateFlightBooking = (id: string, updated: Partial<FlightBooking>) => {
    setFlightBookings(prev => {
      const newFlights = prev.map(f => f.id === id ? { ...f, ...updated } : f);
      const targetFlight = newFlights.find(f => f.id === id);
      if (targetFlight) {
        // Automatically sync linked schedule items
        setScheduleItems(sPrev => sPrev.map(item => {
          if (item.linkedFlightId === id) {
            const nextDayIdx = targetFlight.date ? getDayIndexForDate(tripSettings.startDate, targetFlight.date) : item.dayIndex;
            return {
              ...item,
              dayIndex: nextDayIdx >= 0 && nextDayIdx < totalDays ? nextDayIdx : item.dayIndex,
              time: targetFlight.departureTime || item.time,
              title: `✈️ 航班：${targetFlight.airline} ${targetFlight.flightNumber} (${targetFlight.departureCode} 🛫 ${targetFlight.arrivalCode})`,
              location: `${targetFlight.departureCity} (${targetFlight.departureCode})${targetFlight.terminal ? ' ' + targetFlight.terminal : ''}${targetFlight.gate ? ' ' + targetFlight.gate : ''}`.trim(),
              notes: `訂位代號：${targetFlight.bookingRef || '已確認'} | 起飛 ${targetFlight.departureTime} ➜ 預計 ${targetFlight.arrivalTime} 抵達 ${targetFlight.arrivalCity} (${targetFlight.arrivalCode})${targetFlight.seat ? ' | 座位：' + targetFlight.seat : ''}${targetFlight.passengerNames?.length ? ' | 旅客：' + targetFlight.passengerNames.join(', ') : ''}${targetFlight.notes ? ' | ' + targetFlight.notes : ''}`
            };
          }
          return item;
        }));
        syncFlightExpense(targetFlight);
      }
      return newFlights;
    });
  };

  const deleteFlightBooking = (id: string) => {
    setFlightBookings(prev => prev.filter(f => f.id !== id));
    // Remove or clear linked schedule items
    setScheduleItems(prev => prev.filter(item => item.linkedFlightId !== id));
    // Remove linked expense
    setExpenses(prev => prev.filter(e => e.linkedBookingId !== id));
  };

  // Bookings - Hotels
  const syncHotelToSchedule = (hotel: HotelBooking, autoCheckOut: boolean = true) => {
    const checkInDayIdx = getDayIndexForDate(tripSettings.startDate, hotel.checkInDate);
    const checkOutDayIdx = getDayIndexForDate(tripSettings.startDate, hotel.checkOutDate);

    // 1. Check-in Item
    const existingCheckIn = scheduleItems.find(
      s => s.linkedHotelId === hotel.id && (s.title.includes('Check-in') || s.title.includes('入住'))
    );

    const checkInNotes = `訂房確認號：${hotel.bookingRef || '已確認'}，電話：${hotel.phone || '無'}${hotel.notes ? ' | ' + hotel.notes : ''}`;

    if (existingCheckIn) {
      updateScheduleItem(existingCheckIn.id, {
        dayIndex: checkInDayIdx >= 0 && checkInDayIdx < totalDays ? checkInDayIdx : existingCheckIn.dayIndex,
        time: hotel.checkInTime || '15:00',
        title: `🏨 飯店入住 Check-in：${hotel.name}`,
        category: 'lodging',
        location: hotel.address || hotel.name,
        mapUrl: hotel.mapUrl || '',
        notes: checkInNotes,
        photos: hotel.photoUrl ? [hotel.photoUrl] : existingCheckIn.photos,
        linkedHotelId: hotel.id
      });
    } else if (checkInDayIdx >= 0 && checkInDayIdx < totalDays) {
      addScheduleItem({
        dayIndex: checkInDayIdx,
        time: hotel.checkInTime || '15:00',
        title: `🏨 飯店入住 Check-in：${hotel.name}`,
        category: 'lodging',
        location: hotel.address || hotel.name,
        mapUrl: hotel.mapUrl || '',
        notes: checkInNotes,
        estimatedCost: 0,
        currency: hotel.currency || tripSettings.foreignCurrency,
        photos: hotel.photoUrl ? [hotel.photoUrl] : [],
        isCompleted: false,
        linkedHotelId: hotel.id
      });
    }

    // 2. Check-out Item (Always auto sync check-out by default)
    if (autoCheckOut && checkOutDayIdx >= 0 && checkOutDayIdx < totalDays) {
      const existingCheckOut = scheduleItems.find(
        s => s.linkedHotelId === hotel.id && (s.title.includes('Check-out') || s.title.includes('退房'))
      );
      const checkOutNotes = `辦理退房手續並寄放行李 | 訂房確認號：${hotel.bookingRef || '已確認'}，電話：${hotel.phone || '無'}${hotel.notes ? ' | ' + hotel.notes : ''}`;

      if (existingCheckOut) {
        updateScheduleItem(existingCheckOut.id, {
          dayIndex: checkOutDayIdx,
          time: hotel.checkOutTime || '11:00',
          title: `🚪 飯店退房 Check-out：${hotel.name}`,
          category: 'lodging',
          location: hotel.address || hotel.name,
          mapUrl: hotel.mapUrl || '',
          notes: checkOutNotes,
          linkedHotelId: hotel.id
        });
      } else {
        addScheduleItem({
          dayIndex: checkOutDayIdx,
          time: hotel.checkOutTime || '11:00',
          title: `🚪 飯店退房 Check-out：${hotel.name}`,
          category: 'lodging',
          location: hotel.address || hotel.name,
          mapUrl: hotel.mapUrl || '',
          notes: checkOutNotes,
          estimatedCost: 0,
          currency: hotel.currency || tripSettings.foreignCurrency,
          isCompleted: false,
          linkedHotelId: hotel.id
        });
      }
    }
  };

  const addHotelBooking = (hotel: Omit<HotelBooking, 'id'>, autoSyncSchedule: boolean = true) => {
    const newHotelId = `h_${Date.now()}`;
    const newHotel: HotelBooking = { ...hotel, id: newHotelId };
    setHotelBookings(prev => [...prev, newHotel]);
    if (autoSyncSchedule) {
      syncHotelToSchedule(newHotel, true);
    }
    syncHotelExpense(newHotel);
  };

  const updateHotelBooking = (id: string, updated: Partial<HotelBooking>) => {
    setHotelBookings(prev => {
      const newHotels = prev.map(h => h.id === id ? { ...h, ...updated } : h);
      const targetHotel = newHotels.find(h => h.id === id);
      if (targetHotel) {
        // Synchronize linked schedule items for both check-in and check-out
        setScheduleItems(sPrev => sPrev.map(item => {
          if (item.linkedHotelId === id) {
            const isCheckOut = item.title.includes('Check-out') || item.title.includes('退房');
            if (isCheckOut) {
              const nextDayIdx = targetHotel.checkOutDate ? getDayIndexForDate(tripSettings.startDate, targetHotel.checkOutDate) : item.dayIndex;
              return {
                ...item,
                dayIndex: nextDayIdx >= 0 && nextDayIdx < totalDays ? nextDayIdx : item.dayIndex,
                time: targetHotel.checkOutTime || item.time,
                title: `🚪 飯店退房 Check-out：${targetHotel.name}`,
                location: targetHotel.address || item.location,
                mapUrl: targetHotel.mapUrl || item.mapUrl,
                notes: `辦理退房手續並寄放行李 | 訂房確認號：${targetHotel.bookingRef || '已確認'}，電話：${targetHotel.phone || '無'}${targetHotel.notes ? ' | ' + targetHotel.notes : ''}`
              };
            } else {
              const nextDayIdx = targetHotel.checkInDate ? getDayIndexForDate(tripSettings.startDate, targetHotel.checkInDate) : item.dayIndex;
              return {
                ...item,
                dayIndex: nextDayIdx >= 0 && nextDayIdx < totalDays ? nextDayIdx : item.dayIndex,
                time: targetHotel.checkInTime || item.time,
                title: `🏨 飯店入住 Check-in：${targetHotel.name}`,
                location: targetHotel.address || item.location,
                mapUrl: targetHotel.mapUrl || item.mapUrl,
                notes: `訂房確認號：${targetHotel.bookingRef || '已確認'}，電話：${targetHotel.phone || '無'}${targetHotel.notes ? ' | ' + targetHotel.notes : ''}`
              };
            }
          }
          return item;
        }));
        syncHotelExpense(targetHotel);
      }
      return newHotels;
    });
  };

  const deleteHotelBooking = (id: string) => {
    setHotelBookings(prev => prev.filter(h => h.id !== id));
    // Remove linked check-in and check-out items
    setScheduleItems(prev => prev.filter(item => item.linkedHotelId !== id));
    // Remove linked expense
    setExpenses(prev => prev.filter(e => e.linkedBookingId !== id));
  };

  const addCarRentalBooking = (car: Omit<CarRentalBooking, 'id'>) => {
    const newCar: CarRentalBooking = { ...car, id: `c_${Date.now()}` };
    setCarRentalBookings(prev => [...prev, newCar]);
    syncCarExpense(newCar);
  };

  const updateCarRentalBooking = (id: string, updated: Partial<CarRentalBooking>) => {
    setCarRentalBookings(prev => {
      const newCars = prev.map(c => c.id === id ? { ...c, ...updated } : c);
      const targetCar = newCars.find(c => c.id === id);
      if (targetCar) {
        syncCarExpense(targetCar);
      }
      return newCars;
    });
  };

  const deleteCarRentalBooking = (id: string) => {
    setCarRentalBookings(prev => prev.filter(c => c.id !== id));
    setExpenses(prev => prev.filter(e => e.linkedBookingId !== id));
  };

  const addVoucherBooking = (voucher: Omit<VoucherBooking, 'id'>) => {
    const newVoucher: VoucherBooking = { ...voucher, id: `v_${Date.now()}` };
    setVoucherBookings(prev => [...prev, newVoucher]);
    syncVoucherExpense(newVoucher);
  };

  const updateVoucherBooking = (id: string, updated: Partial<VoucherBooking>) => {
    setVoucherBookings(prev => {
      const newVouchers = prev.map(v => v.id === id ? { ...v, ...updated } : v);
      const targetVoucher = newVouchers.find(v => v.id === id);
      if (targetVoucher) {
        syncVoucherExpense(targetVoucher);
      }
      return newVouchers;
    });
  };

  const deleteVoucherBooking = (id: string) => {
    setVoucherBookings(prev => prev.filter(v => v.id !== id));
    setExpenses(prev => prev.filter(e => e.linkedBookingId !== id));
  };

  // Expenses
  const addExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    const newExpense: ExpenseItem = { ...expense, id: `e_${Date.now()}` };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const updateExpense = (id: string, updated: Partial<ExpenseItem>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updated } : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  // Journal
  const addJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = { ...entry, id: `j_${Date.now()}`, likes: 0 };
    setJournalEntries(prev => [newEntry, ...prev]);
    triggerConfetti();
  };

  const updateJournalEntry = (id: string, updated: Partial<JournalEntry>) => {
    setJournalEntries(prev => prev.map(j => j.id === id ? { ...j, ...updated } : j));
  };

  const deleteJournalEntry = (id: string) => {
    setJournalEntries(prev => prev.filter(j => j.id !== id));
  };

  const toggleJournalLike = (id: string) => {
    setJournalEntries(prev => prev.map(j => j.id === id ? { ...j, likes: (j.likes || 0) + 1 } : j));
  };

  // Planning
  const addPlanningItem = (item: Omit<PlanningItem, 'id'>) => {
    const newItem: PlanningItem = { ...item, id: `p_${Date.now()}` };
    setPlanningItems(prev => [...prev, newItem]);
  };

  const updatePlanningItem = (id: string, updated: Partial<PlanningItem>) => {
    setPlanningItems(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
  };

  const togglePlanningItem = (id: string) => {
    setPlanningItems(prev => {
      const next = prev.map(p => p.id === id ? { ...p, isCompleted: !p.isCompleted } : p);
      const updatedItem = next.find(p => p.id === id);
      if (updatedItem?.isCompleted) {
        // check if all in category completed
        const catItems = next.filter(p => p.type === updatedItem.type);
        const allDone = catItems.every(i => i.isCompleted);
        if (allDone) {
          triggerConfetti();
        }
      }
      return next;
    });
  };

  const deletePlanningItem = (id: string) => {
    setPlanningItems(prev => prev.filter(p => p.id !== id));
  };

  const resetToDefaultData = () => {
    setTripSettings(initialTripSettings);
    setMembers(initialMembers);
    setScheduleItems(initialScheduleItems);
    setFlightBookings(initialFlightBookings);
    setHotelBookings(initialHotelBookings);
    setCarRentalBookings(initialCarRentalBookings);
    setVoucherBookings(initialVoucherBookings);
    setExpenses(initialExpenses);
    setJournalEntries(initialJournalEntries);
    setPlanningItems(initialPlanningItems);
    localStorage.clear();
    triggerConfetti();
  };

  // Calculations
  const start = new Date(tripSettings.startDate);
  const end = new Date(tripSettings.endDate);
  const now = new Date();
  const diffTime = start.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Expense calculations
  const totalExpensesBase = expenses.reduce((acc, curr) => {
    if (curr.currency === tripSettings.baseCurrency) {
      return acc + curr.amount;
    }
    return acc + (curr.amount * curr.exchangeRate);
  }, 0);

  const totalExpensesForeign = expenses.reduce((acc, curr) => {
    if (curr.currency === tripSettings.foreignCurrency) {
      return acc + curr.amount;
    }
    if (curr.currency === tripSettings.baseCurrency && tripSettings.exchangeRate > 0) {
      return acc + (curr.amount / tripSettings.exchangeRate);
    }
    return acc;
  }, 0);

  return (
    <TripContext.Provider
      value={{
        tripSettings,
        updateTripSettings,
        activeTab,
        setActiveTab,
        selectedDayIndex,
        setSelectedDayIndex,
        currentMemberId,
        setCurrentMemberId,
        members,
        addMember,
        updateMember,
        deleteMember,
        scheduleItems,
        weatherForecast,
        addScheduleItem,
        updateScheduleItem,
        deleteScheduleItem,
        toggleScheduleCompleted,
        flightBookings,
        addFlightBooking,
        updateFlightBooking,
        deleteFlightBooking,
        syncFlightToSchedule,
        hotelBookings,
        addHotelBooking,
        updateHotelBooking,
        deleteHotelBooking,
        syncHotelToSchedule,
        carRentalBookings,
        addCarRentalBooking,
        updateCarRentalBooking,
        deleteCarRentalBooking,
        voucherBookings,
        addVoucherBooking,
        updateVoucherBooking,
        deleteVoucherBooking,
        syncBookingToExpense,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        journalEntries,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        toggleJournalLike,
        planningItems,
        addPlanningItem,
        updatePlanningItem,
        togglePlanningItem,
        deletePlanningItem,
        isPinUnlocked,
        verifyPin,
        lockPin,
        requestPinUnlock,
        pinModalOpen,
        setPinModalOpen,
        executePendingAction,
        confirmDialogState,
        showConfirmDialog,
        closeConfirmDialog,
        daysRemaining,
        totalDays,
        totalExpensesBase,
        totalExpensesForeign,
        triggerConfetti,
        resetToDefaultData,
        isUpdatingRate,
        rateUpdateStatus,
        refreshExchangeRate,
        isUpdatingWeather,
        weatherStatus,
        refreshWeatherForDay,
        refreshAllDaysWeather
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
};
