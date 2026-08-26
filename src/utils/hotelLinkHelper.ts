import { HotelBooking, ScheduleItem } from '../types';

/**
 * Parses YYYY-MM-DD cleanly without local timezone drift.
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/**
 * Formats a Date object to YYYY-MM-DD.
 */
export function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats YYYY-MM-DD to M/D (e.g. "10/15").
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parseInt(parts[1], 10)}/${parseInt(parts[2], 10)}`;
  }
  return dateStr;
}

/**
 * Computes the YYYY-MM-DD date string for a given dayIndex (0, 1, 2...)
 */
export function getDateForDayIndex(startDateStr: string, dayIndex: number): string {
  const base = parseDateString(startDateStr);
  base.setDate(base.getDate() + dayIndex);
  return formatDateString(base);
}

/**
 * Computes dayIndex (0-based) for a given YYYY-MM-DD date string relative to startDate.
 */
export function getDayIndexForDate(startDateStr: string, dateStr: string): number {
  const base = parseDateString(startDateStr);
  const target = parseDateString(dateStr);
  const diffMs = target.getTime() - base.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export interface HotelTripDaysInfo {
  checkInDayIndex: number;
  checkOutDayIndex: number;
  nights: number;
  stayDayIndices: number[]; // Day indices for which travelers sleep at this hotel
  dayLabel: string; // e.g. "Day 1 (10/15) ~ Day 4 (10/18)"
  isWithinTrip: boolean;
}

/**
 * Calculates which trip days (Day 1, Day 2...) a hotel booking covers.
 */
export function getHotelTripDaysInfo(
  hotel: HotelBooking,
  startDateStr: string,
  totalDays: number
): HotelTripDaysInfo {
  const checkInDayIndex = getDayIndexForDate(startDateStr, hotel.checkInDate);
  const checkOutDayIndex = getDayIndexForDate(startDateStr, hotel.checkOutDate);

  const d1 = parseDateString(hotel.checkInDate);
  const d2 = parseDateString(hotel.checkOutDate);
  const diffNights = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  const nights = diffNights > 0 ? diffNights : 1;

  const stayDayIndices: number[] = [];
  for (let i = 0; i < nights; i++) {
    const dayIdx = checkInDayIndex + i;
    if (dayIdx >= 0 && dayIdx < totalDays) {
      stayDayIndices.push(dayIdx);
    }
  }

  const isWithinTrip = checkInDayIndex < totalDays && checkOutDayIndex >= 0;
  const inLabel = checkInDayIndex >= 0 && checkInDayIndex < totalDays 
    ? `Day ${checkInDayIndex + 1}` 
    : formatShortDate(hotel.checkInDate);
  const outLabel = checkOutDayIndex >= 0 && checkOutDayIndex < totalDays 
    ? `Day ${checkOutDayIndex + 1}` 
    : formatShortDate(hotel.checkOutDate);

  const dayLabel = `${inLabel} (${formatShortDate(hotel.checkInDate)}) ~ ${outLabel} (${formatShortDate(hotel.checkOutDate)})`;

  return {
    checkInDayIndex,
    checkOutDayIndex,
    nights,
    stayDayIndices,
    dayLabel,
    isWithinTrip
  };
}

export interface DayStayInfo {
  dateStr: string;
  shortDate: string;
  stayingHotel?: HotelBooking; // The hotel travelers sleep at tonight
  checkInHotel?: HotelBooking; // Hotel checking into today
  checkOutHotel?: HotelBooking; // Hotel checking out of today
  nightNumber?: number; // 1-based (e.g. 1st night of 3)
  totalNights?: number; // total nights for the stay
  hasLinkedScheduleItem?: boolean; // Whether the schedule items for this day have a linked lodging item
  linkedScheduleItems: ScheduleItem[];
}

/**
 * Gets all lodging and hotel booking information for a specific day of the trip.
 */
export function getStayInfoForDay(
  dayIndex: number,
  hotels: HotelBooking[],
  startDateStr: string,
  scheduleItems: ScheduleItem[]
): DayStayInfo {
  const dateStr = getDateForDayIndex(startDateStr, dayIndex);
  const shortDate = formatShortDate(dateStr);

  const dayItems = scheduleItems.filter(s => s.dayIndex === dayIndex);

  let stayingHotel: HotelBooking | undefined;
  let checkInHotel: HotelBooking | undefined;
  let checkOutHotel: HotelBooking | undefined;
  let nightNumber: number | undefined;
  let totalNights: number | undefined;

  for (const hotel of hotels) {
    if (hotel.checkInDate === dateStr) {
      checkInHotel = hotel;
    }
    if (hotel.checkOutDate === dateStr) {
      checkOutHotel = hotel;
    }
    // Check if staying tonight: checkInDate <= dateStr < checkOutDate
    if (hotel.checkInDate <= dateStr && dateStr < hotel.checkOutDate) {
      stayingHotel = hotel;
      const dIn = parseDateString(hotel.checkInDate);
      const dCur = parseDateString(dateStr);
      const dOut = parseDateString(hotel.checkOutDate);
      nightNumber = Math.round((dCur.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      totalNights = Math.round((dOut.getTime() - dIn.getTime()) / (1000 * 60 * 60 * 24));
      if (totalNights <= 0) totalNights = 1;
    }
  }

  // Find linked schedule items for this day
  const linkedScheduleItems = dayItems.filter(item => {
    if (item.category === 'lodging') return true;
    if (item.linkedHotelId && hotels.some(h => h.id === item.linkedHotelId)) return true;
    if (stayingHotel && (item.title.includes(stayingHotel.name) || (stayingHotel.address && item.location?.includes(stayingHotel.address)))) {
      return true;
    }
    return false;
  });

  return {
    dateStr,
    shortDate,
    stayingHotel,
    checkInHotel,
    checkOutHotel,
    nightNumber,
    totalNights,
    hasLinkedScheduleItem: linkedScheduleItems.length > 0,
    linkedScheduleItems
  };
}
