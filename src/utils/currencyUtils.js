// src/utils/currencyUtils.js
export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
}

export function formatNumber(number) {
  return new Intl.NumberFormat('vi-VN').format(number);
}

export function parseCurrency(currencyString) {
  // Remove all non-digit characters except decimal point
  const numberString = currencyString.replace(/[^\d.]/g, '');
  return parseFloat(numberString);
}
