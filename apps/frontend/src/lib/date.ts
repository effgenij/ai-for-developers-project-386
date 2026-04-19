import dayjs from 'dayjs';
import type { Booking } from './api-types';

export function formatLongDate(value: string) {
  return dayjs(value).format('D MMMM YYYY');
}

export function formatTimeRange(start: string, end: string) {
  return `${dayjs(start).format('HH:mm')} - ${dayjs(end).format('HH:mm')}`;
}

export function formatApiDate(value: Date) {
  return dayjs(value).format('YYYY-MM-DD');
}

export function getBookingWindow(start = new Date()) {
  return Array.from({ length: 14 }, (_, index) => dayjs(start).add(index, 'day').toDate());
}

export function formatDayLabel(value: Date) {
  return dayjs(value).format('D MMM');
}

export function groupBookingsByDate(bookings: Booking[]) {
  return bookings.reduce<Record<string, Booking[]>>((groups, booking) => {
    const key = dayjs(booking.startTime).format('YYYY-MM-DD');
    groups[key] = groups[key] ? [...groups[key], booking] : [booking];
    return groups;
  }, {});
}
