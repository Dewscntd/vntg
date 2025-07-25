// Hebrew translations for Israeli customers

export const hebrewTranslations = {
  // Checkout process
  checkout: {
    title: 'תהליך רכישה',
    shipping: 'פרטי משלוח',
    payment: 'פרטי תשלום',
    review: 'סקירת הזמנה',
    confirmation: 'אישור הזמנה',
  },
  
  // Shipping form
  shipping: {
    title: 'פרטי משלוח',
    subtitle: 'אנא מלא את פרטי המשלוח שלך',
    firstName: 'שם פרטי',
    lastName: 'שם משפחה',
    email: 'כתובת אימייל',
    phone: 'מספר טלפון',
    address: 'כתובת',
    address2: 'דירה, קומה וכו\' (אופציונלי)',
    city: 'עיר',
    district: 'מחוז',
    postalCode: 'מיקוד',
    country: 'מדינה',
    saveAddress: 'שמור כתובת זו לעתיד',
    continueToPayment: 'המשך לתשלום',
  },
  
  // Payment form
  payment: {
    title: 'פרטי תשלום',
    subtitle: 'פרטי התשלום שלך מאובטחים ומוצפנים',
    paymentMethod: 'אמצעי תשלום',
    creditCard: 'כרטיס אשראי או חיוב',
    savePaymentMethod: 'שמור אמצעי תשלום זה לעתיד',
    totalCharge: 'סה"כ לחיוב:',
    securityNotice: 'התשלום שלך מאובטח בהצפנת SSL 256-ביט',
    israeliCardsAccepted: 'כל כרטיסי האשראי והחיוב הישראליים מתקבלים • תשלום מאובטח באמצעות Stripe',
    processing: 'מעבד...',
    pay: 'שלם',
    backToShipping: 'חזור למשלוח',
  },
  
  // Order summary
  order: {
    summary: 'סיכום הזמנה',
    subtotal: 'סכום ביניים',
    shipping: 'משלוח',
    vat: 'מע"מ',
    total: 'סה"כ',
    freeShipping: 'משלוח חינם',
  },
  
  // Shipping methods
  shippingMethods: {
    standard: {
      name: 'משלוח רגיל',
      description: 'משלוח רגיל דרך שליח',
      days: 'ימי עסקים',
    },
    express: {
      name: 'משלוח מהיר',
      description: 'משלוח מהיר תוך 24 שעות',
      days: 'יום עסקים',
    },
  },
  
  // Common terms
  common: {
    required: 'שדה חובה',
    optional: 'אופציונלי',
    loading: 'טוען...',
    error: 'שגיאה',
    success: 'הצלחה',
    cancel: 'ביטול',
    continue: 'המשך',
    back: 'חזור',
    next: 'הבא',
    previous: 'קודם',
    save: 'שמור',
    edit: 'ערוך',
    delete: 'מחק',
    close: 'סגור',
    yes: 'כן',
    no: 'לא',
    free: 'חינם',
  },
  
  // Error messages
  errors: {
    required: 'שדה זה נדרש',
    invalidEmail: 'כתובת אימייל לא תקינה',
    invalidPhone: 'מספר טלפון לא תקין',
    invalidPostalCode: 'מיקוד לא תקין',
    paymentFailed: 'התשלום נכשל. אנא נסה שוב',
    networkError: 'שגיאת רשת. אנא בדוק את החיבור שלך',
    unknownError: 'אירעה שגיאה לא צפויה',
  },
  
  // Success messages
  success: {
    orderPlaced: 'ההזמנה נשלחה בהצלחה!',
    paymentCompleted: 'התשלום הושלם בהצלחה',
    addressSaved: 'הכתובת נשמרה בהצלחה',
  },
  
  // Security messages
  security: {
    ssl: 'התשלום שלך מאובטח בהצפנת SSL',
    stripeSecured: 'כל העסקאות מעובדות בצורה מאובטחת דרך Stripe',
    noStorage: 'פרטי התשלום שלך לא נשמרים על השרתים שלנו',
    emailConfirmation: 'תקבל אישור במייל לאחר התשלום',
  },
};

// Helper function to get translation
export function getHebrewTranslation(key: string): string {
  const keys = key.split('.');
  let value: any = hebrewTranslations;
  
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      return key; // Return the key if translation not found
    }
  }
  
  return value;
}

// Helper function to check if user prefers Hebrew
export function shouldUseHebrew(): boolean {
  if (typeof window === 'undefined') return false;
  
  const language = navigator.language.toLowerCase();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  return language.includes('he') || timeZone === 'Asia/Jerusalem';
}

export default hebrewTranslations;