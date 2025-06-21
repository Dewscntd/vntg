# Checkout Flow Testing Guide

## Prerequisites
1. Ensure the development server is running: `npm run dev`
2. Have test products in the database
3. Have Stripe test keys configured
4. Have Supabase configured with all migrations applied

## Test Scenarios

### 1. Basic Checkout Flow
1. **Add items to cart**
   - Navigate to `/products`
   - Add at least one product to cart
   - Verify cart count updates

2. **Navigate to checkout**
   - Click cart icon or go to `/checkout`
   - Should redirect to login if not authenticated
   - Login with test account

3. **Shipping Information**
   - Fill out shipping form with valid data
   - Select shipping method (Standard, Express, or Overnight)
   - Click "Continue to Payment"

4. **Payment Information**
   - Payment form should load with Stripe elements
   - Use Stripe test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., 12/25)
   - CVC: Any 3 digits (e.g., 123)
   - Click "Pay $X.XX"

5. **Order Review**
   - Review all order details
   - Verify shipping address, payment method, and items
   - Click "Place Order"

6. **Order Confirmation**
   - Should see success message
   - Order number should be displayed
   - Confirmation email should be sent

### 2. Error Scenarios

#### Invalid Payment
- Use declined card: `4000 0000 0000 0002`
- Should show error message
- Should not create order

#### Insufficient Inventory
- Add more items than available in stock
- Should show error during order creation

#### Network Errors
- Test with network disconnected
- Should show appropriate error messages

### 3. Edge Cases

#### Guest Checkout (if implemented)
- Test checkout without login
- Verify email collection

#### Multiple Shipping Methods
- Test different shipping costs
- Verify total calculation

#### Tax Calculation
- Verify 8% tax is applied correctly
- Test with different shipping addresses

## API Endpoints to Test

### Payment Intent Creation
```bash
curl -X POST http://localhost:3000/api/checkout/payment-intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount": 2000, "currency": "usd"}'
```

### Order Creation
```bash
curl -X POST http://localhost:3000/api/checkout/create-order \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "shippingAddress": {
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "555-1234",
      "address": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345",
      "country": "US"
    },
    "paymentMethodId": "pi_test_123",
    "shippingMethod": "standard"
  }'
```

### Order Retrieval
```bash
curl -X GET http://localhost:3000/api/orders/ORDER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Database Verification

After successful checkout, verify in Supabase:

1. **Orders table**
   - New order record created
   - Status is 'pending'
   - Total amount is correct

2. **Order Items table**
   - Items from cart are transferred
   - Quantities and prices are correct

3. **Cart Items table**
   - User's cart should be empty

4. **Products table**
   - Inventory counts should be reduced

5. **Payment Intents table**
   - Payment intent record exists
   - Status is 'succeeded'

## Common Issues

### Stripe Configuration
- Verify `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify `STRIPE_SECRET_KEY` is set
- Check webhook endpoint configuration

### Database Issues
- Run migrations: Check Supabase dashboard
- Verify RLS policies allow operations
- Check function permissions

### Email Issues
- Verify `RESEND_API_KEY` is configured
- Check email template rendering
- Verify sender domain

## Success Criteria

✅ User can complete entire checkout flow
✅ Payment is processed successfully
✅ Order is created in database
✅ Inventory is updated
✅ Confirmation email is sent
✅ User is redirected to confirmation page
✅ Error handling works for failed payments
✅ Cart is cleared after successful order

## Next Steps

After basic checkout is working:
1. Implement order tracking
2. Add order management for users
3. Build admin order management
4. Add more payment methods
5. Implement refunds and returns
