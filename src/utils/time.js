// src/utils/time.js
// Helper utilities for working with Vietnam time (Asia/Ho_Chi_Minh) and check-in windows

const VN_OFFSET_MINUTES = -7 * 60; // UTC+7

const toDateInstance = (value) => {
  if (value instanceof Date) return new Date(value.getTime());
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') return new Date(value);
  return null;
};

const shiftToTimezone = (date, targetOffsetMinutes = VN_OFFSET_MINUTES) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utcTime - targetOffsetMinutes * 60000);
};

export const getVNNow = () => shiftToTimezone(new Date());

export const toVNDate = (value) => {
  const date = toDateInstance(value);
  return shiftToTimezone(date);
};

export const startOfDay = (value) => {
  const date = toVNDate(value);
  if (!date) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

export const addMinutes = (date, minutes) => {
  if (!(date instanceof Date)) return null;
  return new Date(date.getTime() + minutes * 60000);
};

export const addDays = (date, days) => {
  if (!(date instanceof Date)) return null;
  return addMinutes(date, days * 24 * 60);
};

export const isSameYMD = (dateA, dateB) => {
  if (!(dateA instanceof Date) || !(dateB instanceof Date)) return false;
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

export const formatDateYMD = (value) => {
  const date = startOfDay(value);
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateFromYMD = (value) => {
  if (!value) return null;
  return startOfDay(new Date(`${value}T00:00:00`));
};

const humanDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'Asia/Ho_Chi_Minh',
});

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Ho_Chi_Minh',
});

export const formatHumanDate = (value) => {
  // FIX: Don't shift timezone for date strings (YYYY-MM-DD)
  // They should be treated as local dates, not UTC
  let date;
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    // For date strings like "2025-11-14", parse as local date
    date = new Date(value + 'T00:00:00');
  } else {
    date = toVNDate(value);
  }
  if (!date || isNaN(date.getTime())) return '';
  return humanDateFormatter.format(date);
};

export const formatTime = (value) => {
  const date = toVNDate(value);
  if (!date) return '';
  return timeFormatter.format(date);
};

export const formatTimeRange = (start, end) => {
  if (!(start instanceof Date) || !(end instanceof Date)) return '';
  return `${formatTime(start)}–${formatTime(end)}`;
};

export const buildCheckInWindow = (
  slotValue,
  estimatedMinutes = 60,
  earlyMinutes = 15,
  lateMinutes = 30,
) => {
  const slotStart = toVNDate(slotValue);
  if (!slotStart || Number.isNaN(slotStart.getTime())) return null;

  const slotEnd = addMinutes(slotStart, estimatedMinutes || 0);
  const windowStart = addMinutes(slotStart, -(earlyMinutes || 0));
  const windowEnd = addMinutes(slotEnd, lateMinutes || 0);

  return {
    slotStart,
    slotEnd,
    windowStart,
    windowEnd,
  };
};

export const canCheckInWindow = (
  window,
  referenceDate = getVNNow(),
) => {
  if (!window || !(referenceDate instanceof Date)) return false;
  return (
    isSameYMD(referenceDate, window.slotStart) &&
    referenceDate >= window.windowStart &&
    referenceDate <= window.windowEnd
  );
};
