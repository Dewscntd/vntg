'use client';

import React, { useState, useEffect } from 'react';
import {
  getHebrewTranslation,
  shouldUseHebrew,
  hebrewTranslations,
} from '@/lib/translations/hebrew';

export type Language = 'en' | 'he';

/**
 * Hook for managing translations in the app
 * Automatically detects Hebrew preference and provides translation functions
 */
export function useTranslations() {
  const [language, setLanguage] = useState<Language>('en');
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    // Check if user prefers Hebrew
    const preferHebrew = shouldUseHebrew();
    if (preferHebrew) {
      setLanguage('he');
      setIsRTL(true);
    }
  }, []);

  /**
   * Get translation for a key
   * Falls back to the key itself if translation not found
   */
  const t = (key: string, fallback?: string): string => {
    if (language === 'he') {
      const translation = getHebrewTranslation(key);
      return translation || fallback || key;
    }
    return fallback || key;
  };

  /**
   * Get translation for admin interface
   */
  const tAdmin = (key: string, fallback?: string): string => {
    return t(`admin.${key}`, fallback);
  };

  /**
   * Get translation for products
   */
  const tProducts = (key: string, fallback?: string): string => {
    return t(`products.${key}`, fallback);
  };

  /**
   * Get translation for specifications
   */
  const tSpecs = (key: string, fallback?: string): string => {
    return t(`specifications.${key}`, fallback);
  };

  /**
   * Get translation for condition values
   */
  const tCondition = (key: string, fallback?: string): string => {
    return t(`condition.${key}`, fallback);
  };

  /**
   * Get translation for cart
   */
  const tCart = (key: string, fallback?: string): string => {
    return t(`cart.${key}`, fallback);
  };

  /**
   * Switch language
   */
  const switchLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsRTL(newLanguage === 'he');

    // Update document direction
    if (typeof document !== 'undefined') {
      document.documentElement.dir = newLanguage === 'he' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLanguage;
    }
  };

  /**
   * Format price in the appropriate currency
   */
  const formatPrice = (price: number): string => {
    if (language === 'he') {
      return new Intl.NumberFormat('he-IL', {
        style: 'currency',
        currency: 'ILS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  /**
   * Format date in the appropriate locale
   */
  const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (language === 'he') {
      return new Intl.DateTimeFormat('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(dateObj);
    }

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(dateObj);
  };

  return {
    language,
    isRTL,
    isHebrew: language === 'he',
    t,
    tAdmin,
    tProducts,
    tSpecs,
    tCondition,
    tCart,
    switchLanguage,
    formatPrice,
    formatDate,
    translations: language === 'he' ? hebrewTranslations : null,
  };
}

/**
 * Higher-order component to add translation context
 */
export function withTranslations<T extends object>(Component: React.ComponentType<T>) {
  return function TranslatedComponent(props: T) {
    const translations = useTranslations();
    return React.createElement(Component, { ...props, translations } as any);
  };
}

export default useTranslations;
