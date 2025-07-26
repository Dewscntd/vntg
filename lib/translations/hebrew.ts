// Hebrew translations for Israeli customers

export const hebrewTranslations = {
  // Site navigation
  navigation: {
    home: 'עמוד הבית',
    products: 'מוצרים',
    categories: 'קטגוריות',
    search: 'חיפוש',
    cart: 'עגלת קניות',
    account: 'חשבון',
    login: 'התחברות',
    register: 'הרשמה',
    logout: 'התנתקות',
    admin: 'ניהול',
  },

  // Product pages
  products: {
    title: 'מוצרים',
    searchPlaceholder: 'חפש מוצרים...',
    filterBy: 'סנן לפי',
    sortBy: 'מיין לפי',
    noProducts: 'לא נמצאו מוצרים',
    loading: 'טוען מוצרים...',
    featured: 'מוצרים מומלצים',
    newArrivals: 'הגעות חדשות',
    onSale: 'במבצע',
    outOfStock: 'אזל מהמלאי',
    inStock: 'במלאי',
    available: 'זמין',
    addToCart: 'הוסף לעגלה',
    buyNow: 'קנה עכשיו',
    viewDetails: 'צפה בפרטים',
    specifications: 'מפרט',
    description: 'תיאור',
    category: 'קטגוריה',
    price: 'מחיר',
    originalPrice: 'מחיר מקורי',
    salePrice: 'מחיר מבצע',
    discount: 'הנחה',
  },

  // Product specifications for second-hand clothing
  specifications: {
    title: 'מפרט המוצר',
    size: 'מידה',
    condition: 'מצב',
    brand: 'מותג',
    material: 'חומר',
    color: 'צבע',
    style: 'סגנון',
    era: 'תקופה',
    measurements: 'מידות',
  },

  // Condition values for second-hand items
  condition: {
    excellent: 'מעולה',
    veryGood: 'טוב מאוד',
    good: 'טוב',
    fair: 'סביר',
    vintage: 'וינטג\'',
    description: {
      excellent: 'מצב מעולה, כמעט חדש',
      veryGood: 'מצב טוב מאוד, סימני שימוש קלים',
      good: 'מצב טוב, סימני שימוש נראים',
      fair: 'מצב סביר, סימני שימוש ברורים',
      vintage: 'פריט וינטג\' אותנטי',
    },
  },

  // Common clothing sizes
  sizes: {
    xs: 'XS',
    s: 'S',
    m: 'M',
    l: 'L',
    xl: 'XL',
    xxl: 'XXL',
    oneSize: 'מידה אחת',
  },

  // Shopping cart
  cart: {
    title: 'עגלת קניות',
    empty: 'העגלה ריקה',
    item: 'פריט',
    items: 'פריטים',
    quantity: 'כמות',
    price: 'מחיר',
    total: 'סה"כ',
    subtotal: 'סכום ביניים',
    remove: 'הסר',
    update: 'עדכן',
    checkout: 'המשך לתשלום',
    continueShopping: 'המשך קניות',
    addedToCart: 'נוסף לעגלה!',
  },

  // Categories for second-hand clothing
  categories: {
    title: 'קטגוריות',
    all: 'הכל',
    clothing: 'ביגוד',
    menswear: 'ביגוד גברים',
    womenswear: 'ביגוד נשים',
    unisex: 'יוניסקס',
    tops: 'חולצות',
    bottoms: 'מכנסיים',
    dresses: 'שמלות',
    outerwear: 'ביגוד עליון',
    shoes: 'נעליים',
    accessories: 'אביזרים',
    vintage: 'וינטג\'',
    designer: 'מעצבים',
    streetwear: 'ביגוד רחוב',
    formal: 'חגיגי',
    casual: 'יומיומי',
  },

  // Account pages
  account: {
    title: 'החשבון שלי',
    profile: 'פרופיל',
    orders: 'הזמנות',
    addresses: 'כתובות',
    settings: 'הגדרות',
    personalInfo: 'מידע אישי',
    orderHistory: 'היסטוריית הזמנות',
    noOrders: 'אין הזמנות',
    reorder: 'הזמן שוב',
    trackOrder: 'מעקב הזמנה',
  },

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
    address2: "דירה, קומה וכו' (אופציונלי)",
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

  // Admin panel
  admin: {
    title: 'פאנל ניהול',
    dashboard: 'לוח בקרה',
    products: 'ניהול מוצרים',
    categories: 'ניהול קטגוריות',
    orders: 'ניהול הזמנות',
    users: 'ניהול משתמשים',
    settings: 'הגדרות',
    analytics: 'אנליטיקס',
    addProduct: 'הוסף מוצר',
    editProduct: 'ערוך מוצר',
    deleteProduct: 'מחק מוצר',
    addCategory: 'הוסף קטגוריה',
    editCategory: 'ערוך קטגוריה',
    deleteCategory: 'מחק קטגוריה',
    productName: 'שם המוצר',
    productDescription: 'תיאור המוצר',
    productPrice: 'מחיר המוצר',
    productImage: 'תמונת המוצר',
    uploadImage: 'העלה תמונה',
    changeImage: 'החלף תמונה',
    inventory: 'מלאי',
    featured: 'מומלץ',
    published: 'פורסם',
    draft: 'טיוטה',
    save: 'שמור',
    cancel: 'ביטול',
    delete: 'מחק',
    confirm: 'אשר',
    basicInfo: 'מידע בסיסי',
    specifications: 'מפרטים',
    images: 'תמונות',
    pricing: 'תמחור',
    discountPercent: 'אחוז הנחה',
    inventoryCount: 'כמות במלאי',
    categorySelect: 'בחר קטגוריה',
    selectCategory: 'בחר קטגוריה',
    selectCondition: 'בחר מצב',
    placeholders: {
      productName: 'הכנס שם מוצר',
      description: 'הכנס תיאור מוצר',
      price: '0.00',
      size: 'למשל: S, M, L, XL, 32, 42',
      brand: 'למשל: Nike, Adidas, וינטג\'',
      material: 'למשל: כותנה, ג\'ינס, עור',
    },
  },

  // Messages for second-hand store
  secondHand: {
    unique: 'פריט ייחודי',
    oneOfAKind: 'יחיד מסוגו',
    vintage: 'וינטג\' אותנטי',
    preOwned: 'יד שנייה',
    authenticated: 'מאומת',
    sustainableFashion: 'אופנה בת קיימא',
    ecofriendly: 'ידידותי לסביבה',
    thrift: 'חנות יד שנייה',
    consignment: 'קונסיגנציה',
    retro: 'רטרו',
    collector: 'פריט אספנות',
    rare: 'נדיר',
    limitedEdition: 'מהדורה מוגבלת',
  },

  // Store specific
  store: {
    name: 'Peakees',
    tagline: 'אופנה ייחודית יד שנייה',
    description: 'חנות הביגוד המקוונת המובילה לפריטי אופנה ייחודיים יד שנייה',
    welcomeMessage: 'ברוכים הבאים ל-Peakees',
    featuredItems: 'פריטים מובילים',
    newArrivals: 'הגעות חדשות',
    bestSellers: 'הנמכרים ביותר',
    vintageCollection: 'קולקציית וינטג\'',
    designerPieces: 'פריטי מעצבים',
    sustainableChoice: 'הבחירה הבת קיימא',
    uniqueFinds: 'מציאות ייחודות',
  },

  // Time and dates
  time: {
    justNow: 'עכשיו',
    minutesAgo: 'דקות',
    hoursAgo: 'שעות',
    daysAgo: 'ימים',
    weeksAgo: 'שבועות',
    monthsAgo: 'חודשים',
    yearsAgo: 'שנים',
    ago: 'לפני',
  },

  // Contact and support
  contact: {
    title: 'צור קשר',
    email: 'אימייל',
    phone: 'טלפון',
    address: 'כתובת',
    hours: 'שעות פתיחה',
    support: 'תמיכה',
    faq: 'שאלות נפוצות',
    returnPolicy: 'מדיניות החזרות',
    shippingPolicy: 'מדיניות משלוחים',
    privacyPolicy: 'מדיניות פרטיות',
    termsOfService: 'תנאי שימוש',
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
