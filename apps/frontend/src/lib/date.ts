import dayjs from 'dayjs';

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
