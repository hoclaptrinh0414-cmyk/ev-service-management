import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
}

export function formatDateTime(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('vi-VN');
}

export function formatTime(time) {
  if (!time) return '';
  // Handle both full datetime and time-only strings
  if (time.includes('T')) {
    return new Date(time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }
  return time;
}

