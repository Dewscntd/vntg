// Test utilities for Israeli market functionality

import { formatCurrency, formatCurrencyIL, ISRAELI_CURRENCY } from './currency';
import { israeliHelpers, ISRAELI_CONFIG } from '../config/israeli-market';

// Test data for Israeli checkout flow
export const israeliTestData = {
  shippingAddress: {
    firstName: 'דוד',
    lastName: 'כהן',
    email: 'david.cohen@example.com',
    phone: '+972-50-123-4567',
    address: 'רחוב הרצל 123',
    address2: 'דירה 4',
    city: 'Tel Aviv',
    state: 'tel-aviv',
    zipCode: '6789012',
    country: 'IL',
  },
  
  testAmounts: {
    small: 50, // Below free shipping threshold
    large: 250, // Above free shipping threshold
    withVAT: 100,
  },
  
  expectedResults: {
    smallOrderShipping: 25, // Should charge shipping
    largeOrderShipping: 0,  // Should be free shipping
    vatOn100: 17, // 17% VAT on 100 ILS
    totalWith100AndVAT: 117, // 100 + 17
  },
};

// Test functions
export const israeliTests = {
  // Test currency formatting
  testCurrencyFormatting() {
    console.log('Testing Israeli currency formatting:');
    console.log('100 ILS:', formatCurrencyIL(100, ISRAELI_CURRENCY));
    console.log('1234.56 ILS:', formatCurrencyIL(1234.56, ISRAELI_CURRENCY));
    
    return {
      basic: formatCurrencyIL(100, ISRAELI_CURRENCY),
      withDecimals: formatCurrencyIL(1234.56, ISRAELI_CURRENCY),
    };
  },
  
  // Test VAT calculations
  testVATCalculations() {
    const amount = israeliTestData.testAmounts.withVAT;
    const vat = israeliHelpers.calculateVAT(amount);
    const total = israeliHelpers.getAmountWithVAT(amount);
    
    console.log('Testing VAT calculations:');
    console.log(`Amount: ${amount} ILS`);
    console.log(`VAT (17%): ${vat} ILS`);
    console.log(`Total: ${total} ILS`);
    
    return { amount, vat, total };
  },
  
  // Test shipping calculations
  testShippingCalculations() {
    const smallOrder = israeliTestData.testAmounts.small;
    const largeOrder = israeliTestData.testAmounts.large;
    
    const smallOrderStandardShipping = israeliHelpers.getShippingCost(smallOrder, 'standard');
    const smallOrderExpressShipping = israeliHelpers.getShippingCost(smallOrder, 'express');
    const largeOrderStandardShipping = israeliHelpers.getShippingCost(largeOrder, 'standard');
    const largeOrderExpressShipping = israeliHelpers.getShippingCost(largeOrder, 'express');
    
    console.log('Testing shipping calculations:');
    console.log(`Small order (${smallOrder} ILS) - Standard: ${smallOrderStandardShipping} ILS`);
    console.log(`Small order (${smallOrder} ILS) - Express: ${smallOrderExpressShipping} ILS`);
    console.log(`Large order (${largeOrder} ILS) - Standard: ${largeOrderStandardShipping} ILS`);
    console.log(`Large order (${largeOrder} ILS) - Express: ${largeOrderExpressShipping} ILS`);
    
    return {
      smallOrderStandard: smallOrderStandardShipping,
      smallOrderExpress: smallOrderExpressShipping,
      largeOrderStandard: largeOrderStandardShipping,
      largeOrderExpress: largeOrderExpressShipping,
    };
  },
  
  // Test phone formatting
  testPhoneFormatting() {
    const testPhones = [
      '050-123-4567',
      '0501234567',
      '972501234567',
      '+972501234567',
    ];
    
    console.log('Testing Israeli phone formatting:');
    const results = testPhones.map(phone => {
      const formatted = israeliHelpers.formatIsraeliPhone(phone);
      const isValid = israeliHelpers.isValidIsraeliPhone(formatted);
      console.log(`${phone} -> ${formatted} (Valid: ${isValid})`);
      return { original: phone, formatted, isValid };
    });
    
    return results;
  },
  
  // Test postal code validation
  testPostalCodeValidation() {
    const testCodes = [
      '1234567', // Valid 7-digit
      '123456',  // Invalid 6-digit
      '12345678', // Invalid 8-digit
      'abcdefg', // Invalid non-numeric
    ];
    
    console.log('Testing Israeli postal code validation:');
    const results = testCodes.map(code => {
      const isValid = israeliHelpers.isValidIsraeliPostalCode(code);
      console.log(`${code}: ${isValid ? 'Valid' : 'Invalid'}`);
      return { code, isValid };
    });
    
    return results;
  },
  
  // Run all tests
  runAllTests() {
    console.log('=== Running Israeli Market Tests ===');
    
    const results = {
      currency: this.testCurrencyFormatting(),
      vat: this.testVATCalculations(),
      shipping: this.testShippingCalculations(),
      phone: this.testPhoneFormatting(),
      postalCode: this.testPostalCodeValidation(),
    };
    
    console.log('=== All Tests Complete ===');
    return results;
  },
};

// Quick validation function for production use
export function validateIsraeliCheckoutData(data: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Validate postal code
  if (data.country === 'IL' && !israeliHelpers.isValidIsraeliPostalCode(data.zipCode)) {
    errors.push('Invalid Israeli postal code format');
  }
  
  // Validate phone number
  if (data.country === 'IL' && !israeliHelpers.isValidIsraeliPhone(data.phone)) {
    errors.push('Invalid Israeli phone number format');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export default israeliTests;