// Israeli market specific configurations

export const ISRAELI_CONFIG = {
  // Currency settings
  currency: 'ILS' as const,
  currencySymbol: '₪',

  // Tax settings (Israeli VAT)
  vatRate: 0.17, // 17% VAT in Israel
  vatName: 'VAT',
  vatNameHebrew: 'מע"מ',

  // Shipping settings
  freeShippingThreshold: 200, // Free shipping over 200 ILS
  standardShippingCost: 25, // 25 ILS standard shipping
  expressShippingCost: 40, // 40 ILS express shipping

  // Address format
  postalCodeFormat: /^\d{7}$/, // Israeli postal codes are 7 digits
  phoneFormat: /^(\+972|972|0)([23489]|5[012345689]|77)[1-9]\d{6}$/, // Israeli phone format

  // Payment settings
  maxTransactionAmount: 50000, // Maximum transaction in ILS
  minTransactionAmount: 1, // Minimum transaction in ILS

  // Business settings
  businessName: 'VNTG Israel',
  supportEmail: 'support@vntg.co.il',
  supportPhone: '+972-3-123-4567',

  // Localization
  locale: 'he-IL',
  timeZone: 'Asia/Jerusalem',
  dateFormat: 'DD/MM/YYYY', // Israeli date format

  // Common Israeli cities for autocomplete
  majorCities: [
    'Jerusalem',
    'Tel Aviv',
    'Haifa',
    'Rishon LeZion',
    'Petah Tikva',
    'Ashdod',
    'Netanya',
    'Beer Sheva',
    'Holon',
    'Bnei Brak',
    'Ramat Gan',
    'Ashkelon',
    'Rehovot',
    'Bat Yam',
    'Beit Shemesh',
    'Kfar Saba',
    'Herzliya',
    'Hadera',
    "Modi'in-Maccabim-Re'ut",
    'Nazareth',
  ],

  // Israeli districts
  districts: [
    { value: 'jerusalem', label: 'Jerusalem District', labelHebrew: 'מחוז ירושלים' },
    { value: 'northern', label: 'Northern District', labelHebrew: 'מחוז הצפון' },
    { value: 'haifa', label: 'Haifa District', labelHebrew: 'מחוז חיפה' },
    { value: 'central', label: 'Central District', labelHebrew: 'המחוז המרכזי' },
    { value: 'tel-aviv', label: 'Tel Aviv District', labelHebrew: 'מחוז תל אביב' },
    { value: 'southern', label: 'Southern District', labelHebrew: 'מחוז הדרום' },
  ],
};

// Helper functions for Israeli market
export const israeliHelpers = {
  // Format Israeli phone number
  formatIsraeliPhone(phone: string): string {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');

    // Add country code if missing
    if (cleaned.startsWith('0')) {
      return '+972' + cleaned.substring(1);
    } else if (cleaned.startsWith('972')) {
      return '+' + cleaned;
    } else if (!cleaned.startsWith('+972')) {
      return '+972' + cleaned;
    }

    return cleaned;
  },

  // Validate Israeli postal code
  isValidIsraeliPostalCode(postalCode: string): boolean {
    return ISRAELI_CONFIG.postalCodeFormat.test(postalCode);
  },

  // Validate Israeli phone
  isValidIsraeliPhone(phone: string): boolean {
    return ISRAELI_CONFIG.phoneFormat.test(phone);
  },

  // Calculate VAT
  calculateVAT(amount: number): number {
    return Math.round(amount * ISRAELI_CONFIG.vatRate * 100) / 100;
  },

  // Get amount with VAT
  getAmountWithVAT(amount: number): number {
    return amount + israeliHelpers.calculateVAT(amount);
  },

  // Check if shipping is free
  isFreeShipping(amount: number): boolean {
    return amount >= ISRAELI_CONFIG.freeShippingThreshold;
  },

  // Get shipping cost
  getShippingCost(amount: number, method: 'standard' | 'express' = 'standard'): number {
    if (israeliHelpers.isFreeShipping(amount)) {
      return 0;
    }

    return method === 'express'
      ? ISRAELI_CONFIG.expressShippingCost
      : ISRAELI_CONFIG.standardShippingCost;
  },
};

export default ISRAELI_CONFIG;
