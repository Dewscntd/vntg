# VNTG Admin Guide

Complete guide for managing your VNTG e-commerce platform through the admin panel.

## 🚀 Getting Started

### Admin Access
- **Admin Panel**: https://vntg-store.vercel.app/admin-direct
- **Login Credentials**: `michaelvx@gmail.com` / `1q1q1q1q`

### First Login
1. Navigate to the [login page](https://vntg-store.vercel.app/auth/login)
2. Enter your admin credentials
3. Access the [admin panel](https://vntg-store.vercel.app/admin-direct)

## 📦 Product Management

### Adding New Products

1. **Navigate to Products**
   - Click "Add Product" from the admin dashboard
   - Or go to "Manage Products" → "Add Product"

2. **Product Information**
   ```
   Required Fields:
   ✅ Product Name
   ✅ Description
   ✅ Price (USD/ILS)
   ✅ Category
   ✅ Inventory Count
   
   Optional Fields:
   📸 Product Images
   🏷️ Tags
   📏 Specifications
   🎯 Featured Product
   ```

3. **Product Images**
   - Upload multiple images (recommended: 1200x1200px)
   - First image becomes the main product image
   - Supports: JPG, PNG, WebP formats
   - Maximum file size: 5MB per image

4. **Pricing**
   - Set price in USD (automatically converts to ILS)
   - Consider Israeli market pricing
   - Set up promotional pricing if needed

5. **Inventory Management**
   - Set initial stock quantity
   - Enable low stock alerts
   - Track inventory automatically

### Managing Existing Products

#### Product List View
- **Search**: Find products by name, SKU, or category
- **Filter**: By category, stock status, or featured status
- **Sort**: By name, price, date added, or stock level
- **Bulk Actions**: Update multiple products at once

#### Editing Products
1. Click "Edit" on any product in the list
2. Update any field as needed
3. Save changes
4. Changes reflect immediately on the storefront

#### Product Status
- **Active**: Visible to customers
- **Draft**: Hidden from customers (for preparation)
- **Out of Stock**: Visible but not purchasable

### Categories

#### Creating Categories
1. Go to "Categories" in the admin menu
2. Click "Add Category"
3. Enter category details:
   - Name (English/Hebrew)
   - Description
   - Parent category (for subcategories)
   - Display order

#### Managing Categories
- **Drag & Drop**: Reorder categories
- **Nested Categories**: Create subcategories
- **Bulk Assignment**: Move multiple products to categories

## 🛒 Order Management

### Order Dashboard
- **New Orders**: Require processing
- **Processing**: Being prepared for shipment
- **Shipped**: In transit to customer
- **Delivered**: Successfully completed
- **Cancelled**: Cancelled orders
- **Refunded**: Refunded orders

### Processing Orders

#### New Order Workflow
1. **Order Notification**
   - New orders appear in the dashboard
   - Email notifications sent automatically
   - Check order details and payment status

2. **Order Validation**
   - Verify customer information
   - Check product availability
   - Validate shipping address

3. **Inventory Update**
   - Stock automatically reduced on order
   - Check for low inventory alerts
   - Update product availability

4. **Order Fulfillment**
   - Mark as "Processing" when preparing
   - Add tracking information
   - Mark as "Shipped" when dispatched

### Order Details

#### Customer Information
- Contact details and shipping address
- Order history and customer notes
- Payment method and transaction ID

#### Order Items
- Product details and quantities
- Individual item prices and totals
- Special instructions or customizations

#### Order Actions
- **Update Status**: Change order status
- **Add Notes**: Internal notes for order processing
- **Send Messages**: Communicate with customer
- **Process Refund**: Handle returns and refunds
- **Print Invoice**: Generate order documentation

### Shipping Management

#### Israeli Shipping
- **Local Delivery**: Jerusalem, Tel Aviv, Haifa zones
- **National Shipping**: Israel Post integration
- **Express Delivery**: Same-day delivery options
- **International**: Limited international shipping

#### Tracking Integration
- Automatic tracking number generation
- Customer email notifications
- Real-time tracking updates
- Delivery confirmation

## 👥 User Management

### Customer Overview
- **Customer List**: All registered customers
- **Guest Orders**: Orders without registration
- **Customer Segments**: VIP, regular, inactive customers
- **Order History**: Complete purchase history

### Customer Support

#### Communication Tools
- **Direct Messaging**: In-app customer communication
- **Email Templates**: Automated and manual emails
- **Order Updates**: Automatic status notifications
- **Support Tickets**: Issue tracking and resolution

#### Account Management
- **View Customer Profile**: Complete customer information
- **Order History**: All past orders and returns
- **Address Book**: Saved shipping addresses
- **Payment Methods**: Saved payment information

### Admin Users

#### Creating Admin Users
1. Go to "Users" → "Admin Users"
2. Click "Add Admin"
3. Set permissions:
   - **Super Admin**: Full access
   - **Product Manager**: Product management only
   - **Order Manager**: Order processing only
   - **Customer Support**: Customer interaction only

#### Managing Permissions
- **Role-Based Access**: Assign specific roles
- **Feature Permissions**: Granular permission control
- **Session Management**: Monitor active admin sessions

## 📊 Analytics & Reporting

### Sales Analytics

#### Dashboard Metrics
- **Daily Sales**: Revenue and order count
- **Weekly Trends**: Sales performance over time
- **Monthly Reports**: Comprehensive monthly analysis
- **Product Performance**: Best and worst performing products

#### Revenue Tracking
- **Total Revenue**: Gross and net revenue
- **Currency Breakdown**: USD vs ILS sales
- **Payment Methods**: Credit card vs other methods
- **Refunds & Returns**: Return rate and reasons

### Customer Analytics

#### User Behavior
- **Page Views**: Most visited pages
- **Conversion Rates**: Visitor to customer conversion
- **Cart Abandonment**: Recovery opportunities
- **Customer Lifetime Value**: Long-term customer value

#### Geographic Data
- **Location Analysis**: Sales by region (Israel focus)
- **Shipping Zones**: Delivery performance by area
- **Device Usage**: Mobile vs desktop shopping patterns

### Inventory Analytics

#### Stock Management
- **Low Stock Alerts**: Products needing restocking
- **Fast Moving Items**: Popular products requiring attention
- **Slow Moving Items**: Products needing promotion
- **Inventory Turnover**: Stock rotation efficiency

#### Forecasting
- **Demand Prediction**: Anticipated product demand
- **Seasonal Trends**: Holiday and seasonal patterns
- **Reorder Points**: Optimal restocking timing

## 🔧 System Configuration

### General Settings

#### Store Information
- **Store Name**: VNTG
- **Description**: Store description and meta tags
- **Contact Information**: Address, phone, email
- **Business Hours**: Operating hours and timezone

#### Localization
- **Languages**: English and Hebrew support
- **Currency**: USD and ILS support
- **Date Format**: Israeli date formatting
- **Number Format**: Israeli number formatting

### Payment Configuration

#### Stripe Settings
- **Payment Methods**: Credit cards, Israeli cards
- **Currency Settings**: Multi-currency support
- **Tax Configuration**: Israeli VAT (17%)
- **Webhook Configuration**: Automated payment processing

#### Israeli Market
- **VAT Handling**: Automatic VAT calculation
- **Israeli Cards**: Support for Israeli credit cards
- **Local Payment Methods**: Bank transfer options
- **Invoicing**: Israeli invoice requirements

### Shipping Configuration

#### Shipping Zones
- **Israel**: Domestic shipping rates
- **Jerusalem Area**: Local delivery options
- **Tel Aviv Area**: Express delivery
- **International**: Limited international shipping

#### Shipping Methods
- **Standard Delivery**: 3-5 business days
- **Express Delivery**: 1-2 business days
- **Same Day**: Available in major cities
- **Pickup Points**: Self-service pickup locations

## 🛡️ Security & Maintenance

### Security Best Practices

#### Access Control
- **Strong Passwords**: Enforce password requirements
- **Two-Factor Authentication**: Additional security layer
- **Session Management**: Automatic session timeout
- **IP Restrictions**: Limit admin access by IP

#### Data Protection
- **Customer Data**: GDPR compliance
- **Payment Security**: PCI DSS compliance
- **Backup Strategy**: Regular automated backups
- **Audit Logs**: Track all admin actions

### System Maintenance

#### Regular Tasks
- **Database Cleanup**: Remove old data and logs
- **Image Optimization**: Compress and optimize images
- **Cache Management**: Clear caches when needed
- **Update Monitoring**: Keep system components updated

#### Performance Monitoring
- **Site Speed**: Monitor page load times
- **Uptime Monitoring**: Track system availability
- **Error Tracking**: Monitor and fix errors
- **Database Performance**: Optimize queries

## 📱 Mobile Administration

### Mobile Access
- **Responsive Design**: Admin panel works on mobile
- **Touch Optimized**: Mobile-friendly interface
- **Quick Actions**: Essential functions on mobile
- **Push Notifications**: Order alerts on mobile

### Mobile Features
- **Order Management**: Process orders on the go
- **Customer Support**: Respond to customer inquiries
- **Inventory Checks**: Quick stock level checks
- **Sales Monitoring**: Real-time sales tracking

## 🆘 Troubleshooting

### Common Issues

#### Login Problems
- **Forgot Password**: Use password reset functionality
- **Account Locked**: Contact system administrator
- **Browser Issues**: Clear cache and cookies
- **Permission Denied**: Check user role and permissions

#### Order Issues
- **Payment Failed**: Check Stripe webhook configuration
- **Inventory Mismatch**: Reconcile inventory counts
- **Shipping Errors**: Verify shipping zone configuration
- **Email Problems**: Check email service configuration

#### Product Issues
- **Images Not Loading**: Check file format and size
- **Search Not Working**: Rebuild search index
- **Categories Missing**: Verify category assignments
- **Price Display**: Check currency conversion settings

### Getting Help

#### Support Resources
- **Documentation**: Complete admin documentation
- **Video Tutorials**: Step-by-step guides
- **FAQ**: Frequently asked questions
- **Support Email**: admin-support@vntg.com

#### Emergency Contacts
- **Technical Issues**: tech-support@vntg.com
- **Payment Problems**: payments@vntg.com
- **Security Concerns**: security@vntg.com
- **General Support**: support@vntg.com

## 📚 Quick Reference

### Essential URLs
```
Admin Panel: https://vntg-store.vercel.app/admin-direct
Store Front: https://vntg-store.vercel.app
Login Page: https://vntg-store.vercel.app/auth/login
```

### Admin Credentials
```
Email: michaelvx@gmail.com
Password: 1q1q1q1q
```

### Key Shortcuts
```
Products: /admin/products
Orders: /admin/orders
Users: /admin/users
Analytics: /admin/analytics
```

### Test Payment Cards
```
US Card: 4242 4242 4242 4242
Israeli Card: 4000 0027 6000 0016
Declined Card: 4000 0000 0000 0002
```

---

**Need additional help?** Contact support at admin-support@vntg.com