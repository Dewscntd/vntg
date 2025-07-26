import { z } from 'zod';

// Supported currencies
export const SUPPORTED_CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD', precision: 2 },
  ILS: { symbol: '₪', name: 'Israeli Shekel', code: 'ILS', precision: 2 },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR', precision: 2 },
} as const;

export type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES;

// Default currency (can be changed based on user location/preference)
export const DEFAULT_CURRENCY: SupportedCurrency = 'USD';

// Israeli market specific currency
export const ISRAELI_CURRENCY: SupportedCurrency = 'ILS';

// Currency validation schema
export const currencySchema = z.enum(['USD', 'ILS', 'EUR']);

// Format currency amount
export function formatCurrency(
  amount: number,
  currency: SupportedCurrency = DEFAULT_CURRENCY
): string {
  const currencyInfo = SUPPORTED_CURRENCIES[currency];

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currencyInfo.precision,
    maximumFractionDigits: currencyInfo.precision,
  }).format(amount);
}

// Format currency for Israeli users (Hebrew locale)
export function formatCurrencyIL(
  amount: number,
  currency: SupportedCurrency = ISRAELI_CURRENCY
): string {
  const currencyInfo = SUPPORTED_CURRENCIES[currency];

  return new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: currencyInfo.precision,
    maximumFractionDigits: currencyInfo.precision,
  }).format(amount);
}

// Convert USD to ILS (you would typically get this from an API)
// For now, using a static rate - in production, you'd fetch from an exchange rate API
const USD_TO_ILS_RATE = 3.7; // Approximate rate, should be fetched from API

export function convertUSDToILS(usdAmount: number): number {
  return Math.round(usdAmount * USD_TO_ILS_RATE * 100) / 100;
}

export function convertILSToUSD(ilsAmount: number): number {
  return Math.round((ilsAmount / USD_TO_ILS_RATE) * 100) / 100;
}

// Get currency symbol
export function getCurrencySymbol(currency: SupportedCurrency): string {
  return SUPPORTED_CURRENCIES[currency].symbol;
}

// Get currency name
export function getCurrencyName(currency: SupportedCurrency): string {
  return SUPPORTED_CURRENCIES[currency].name;
}

// Detect user's preferred currency based on location or browser settings
export function detectUserCurrency(): SupportedCurrency {
  // Check if user is in Israel based on timezone or navigator language
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language.toLowerCase();

  if (timeZone === 'Asia/Jerusalem' || language.includes('he') || language.includes('il')) {
    return 'ILS';
  }

  return 'USD';
}

// Format amount for Stripe (Stripe expects amounts in cents/agorot)
export function formatAmountForStripe(amount: number, currency: SupportedCurrency): number {
  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  return Math.round(amount * Math.pow(10, currencyInfo.precision));
}

// Format amount from Stripe (convert from cents/agorot to regular amount)
export function formatAmountFromStripe(amount: number, currency: SupportedCurrency): number {
  const currencyInfo = SUPPORTED_CURRENCIES[currency];
  return amount / Math.pow(10, currencyInfo.precision);
}

// Validate currency code
export function isValidCurrency(currency: string): currency is SupportedCurrency {
  return currency in SUPPORTED_CURRENCIES;
}

export default {
  SUPPORTED_CURRENCIES,
  DEFAULT_CURRENCY,
  ISRAELI_CURRENCY,
  formatCurrency,
  formatCurrencyIL,
  convertUSDToILS,
  convertILSToUSD,
  getCurrencySymbol,
  getCurrencyName,
  detectUserCurrency,
  formatAmountForStripe,
  formatAmountFromStripe,
  isValidCurrency,
};
