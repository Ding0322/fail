export type TabType = 'schedule' | 'bookings' | 'expense' | 'journal' | 'planning' | 'members';

export type EventCategory = 'spot' | 'food' | 'transport' | 'lodging' | 'shopping' | 'other';

export interface Member {
  id: string;
  name: string;
  avatar: string; // URL or emoji/icon ID
  role: string; // e.g. 團長, 總務大臣, 美食嚮導, 攝影師
  color: string; // Hex color code for badges
  email?: string;
}

export interface ScheduleItem {
  id: string;
  dayIndex: number; // 0, 1, 2...
  time: string; // "09:30"
  title: string;
  category: EventCategory;
  location: string;
  mapUrl?: string;
  notes?: string;
  estimatedCost?: number;
  currency?: string;
  photos?: string[];
  isCompleted?: boolean;
  linkedHotelId?: string; // Optional ID of linked HotelBooking
  linkedFlightId?: string; // Optional ID of linked FlightBooking
}

export interface DayWeather {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  tempHigh: number;
  tempLow: number;
  desc: string;
  icon: string;
  locationName?: string;
  rainfallProb?: number;
  humidity?: number;
  clothingTip?: string;
  isLive?: boolean;
  lastUpdated?: string;
}

export interface FlightBooking {
  id: string;
  airline: string;
  flightNumber: string;
  departureCity: string;
  departureCode: string;
  departureTime: string;
  arrivalCity: string;
  arrivalCode: string;
  arrivalTime: string;
  date: string;
  seat?: string;
  gate?: string;
  terminal?: string;
  bookingRef: string;
  passengerNames: string[];
  quantity?: number; // 數量
  unitPrice?: number; // 單張票金額
  totalPrice?: number; // 總金額
  currency?: string; // 幣別
  paidByMemberId?: string; // 付款人 (參與旅行成員)
  splitMemberIds?: string[]; // 分攤成員
  notes?: string;
}

export interface HotelBooking {
  id: string;
  name: string;
  photoUrl?: string;
  address: string;
  mapUrl?: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  totalPrice: number;
  currency: string;
  paidByMemberId: string;
  splitMemberIds: string[];
  bookingRef: string;
  phone?: string;
  notes?: string;
}

export interface CarRentalBooking {
  id: string;
  company: string;
  carModel: string;
  pickupLocation: string; // 取車地
  pickupTime: string; // 取車時間
  pickupDate?: string; // 取車日期
  returnLocation: string; // 還車地
  returnTime: string; // 還車時間
  returnDate?: string; // 還車日期
  url?: string; // 網址
  confirmationNumber: string;
  totalPrice?: number; // 金額 / 總金額
  currency?: string; // 幣別
  paidByMemberId?: string; // 付款人 (參與旅行成員)
  splitMemberIds?: string[]; // 分攤成員
  photoUrl?: string; // 明細照片 / 合約收據
  driverName?: string;
  notes?: string;
}

export interface VoucherBooking {
  id: string;
  title: string;
  category: 'ticket' | 'pass' | 'activity' | 'coupon' | 'other';
  provider: string;
  validDate: string;
  code?: string;
  fileUrl?: string; // photo or base64 or uploaded voucher / 明細照片
  notes?: string;
  url?: string; // 網址
  paidByMemberId?: string; // 付款人
  splitMemberIds?: string[]; // 分攤成員
  quantity?: number; // 票券數量
  amount?: number; // 金額
  currency?: string; // 幣別
}

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  currency: string; // TWD, JPY, USD, EUR, etc.
  exchangeRate: number; // to base currency (TWD)
  category: 'food' | 'transport' | 'spot' | 'shopping' | 'lodging' | 'other';
  date: string;
  time?: string;
  payerId: string;
  splitMemberIds: string[];
  receiptUrl?: string;
  notes?: string;
  linkedBookingId?: string; // 連動的預訂項目 ID
  linkedBookingType?: 'flight' | 'hotel' | 'car' | 'voucher'; // 連動的預訂類型
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  authorId: string;
  photos: string[];
  location?: string;
  mood?: 'happy' | 'excited' | 'relax' | 'tired' | 'food' | 'nature';
  weather?: string;
  tags?: string[];
  likes?: number;
}

export type PlanningCategory = 'todo' | 'packing' | 'shopping';

export interface PlanningItem {
  id: string;
  type: PlanningCategory;
  title: string;
  isCompleted: boolean;
  assignedTo: string; // 'all' or memberId
  notes?: string;
  categoryTag?: string; // e.g. 證件, 衣物, 電器, 藥品, 必買名產
}

export interface TripSettings {
  id: string;
  title: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  baseCurrency: string; // TWD
  foreignCurrency: string; // JPY
  exchangeRate: number; // e.g. 0.215 for JPY -> TWD
  autoUpdateRate?: boolean; // automatically sync daily live rate
  lastRateUpdate?: string; // e.g. "2026-08-26 14:30"
  coverPhoto: string;
  pinCode: string; // default "007"
  firestoreConnected?: boolean;
}
