# Component Library Documentation

## Overview

Peakees uses a comprehensive component library built on top of shadcn/ui with custom business logic components. This document provides a complete reference for all available components.

## 🏗️ Component Architecture

### Component Hierarchy

```
UI Components (shadcn/ui)
├── Base Components (Button, Input, Card, etc.)
├── Composite Components (Form, Dialog, etc.)
└── Layout Components (Container, Grid, etc.)

Business Components
├── Product Components
├── Cart Components
├── Navigation Components
├── Layout Components
└── Provider Components
```

### Design Principles

- **Composition over Configuration** - Components are composable and flexible
- **Accessibility First** - All components follow WCAG guidelines
- **Type Safety** - Full TypeScript support with proper prop types
- **Performance** - Optimized for rendering and bundle size
- **Consistency** - Unified design system and API patterns

## 🎨 UI Components (shadcn/ui)

### Base Components

#### Button

Versatile button component with multiple variants.

```tsx
import { Button } from '@/components/ui/button';

// Variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Loading</Button>
```

#### Input

Form input component with validation support.

```tsx
import { Input } from '@/components/ui/input';

<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={handleChange}
  error={error}
  disabled={disabled}
/>;
```

#### Card

Container component for content grouping.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here.</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

#### Badge

Small status or label indicator.

```tsx
import { Badge } from '@/components/ui/badge';

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

### Form Components

#### Label

Accessible form labels.

```tsx
import { Label } from '@/components/ui/label';

<Label htmlFor="email">Email Address</Label>
<Input id="email" type="email" />
```

#### Textarea

Multi-line text input.

```tsx
import { Textarea } from '@/components/ui/textarea';

<Textarea placeholder="Enter your message..." value={value} onChange={handleChange} rows={4} />;
```

#### Select

Dropdown selection component.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select an option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>;
```

#### Checkbox

Checkbox input component.

```tsx
import { Checkbox } from '@/components/ui/checkbox';

<Checkbox
  id="terms"
  checked={checked}
  onCheckedChange={setChecked}
/>
<Label htmlFor="terms">Accept terms and conditions</Label>
```

### Layout Components

#### Separator

Visual divider component.

```tsx
import { Separator } from '@/components/ui/separator';

<div>
  <p>Content above</p>
  <Separator />
  <p>Content below</p>
</div>;
```

#### ScrollArea

Scrollable content area.

```tsx
import { ScrollArea } from '@/components/ui/scroll-area';

<ScrollArea className="h-72 w-48 rounded-md border p-4">
  <div className="space-y-2">
    {items.map((item) => (
      <div key={item.id}>{item.name}</div>
    ))}
  </div>
</ScrollArea>;
```

### Overlay Components

#### Dialog

Modal dialog component.

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content goes here.</p>
  </DialogContent>
</Dialog>;
```

#### Sheet

Slide-out panel component.

```tsx
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

<Sheet>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
    </SheetHeader>
    <p>Sheet content goes here.</p>
  </SheetContent>
</Sheet>;
```

#### Toast

Notification component.

```tsx
import { useToast } from '@/lib/hooks/use-toast';

const { toast } = useToast();

// Show toast
toast({
  title: 'Success',
  description: 'Your action was completed successfully.',
  variant: 'default', // "default" | "destructive"
});
```

## 🛍️ Product Components

### ProductCard

Individual product display card.

```tsx
import { ProductCard } from '@/components/products';

<ProductCard
  product={{
    id: '1',
    name: 'Product Name',
    price: 99.99,
    image_url: '/product.jpg',
    discount_percent: 10,
    is_featured: true,
    is_new: false,
    inventory_count: 5,
  }}
  priority={false}
  onQuickView={handleQuickView}
  className="custom-class"
/>;
```

**Props:**

- `product` - Product data object
- `priority` - Priority loading for above-fold images
- `onQuickView` - Quick view callback function
- `className` - Additional CSS classes

### ProductGrid

Grid layout for multiple products.

```tsx
import { ProductGrid } from '@/components/products';

<ProductGrid
  products={products}
  isLoading={false}
  loadingCount={12}
  enableQuickView={true}
  animateEntrance={true}
  className="custom-grid"
/>;
```

**Props:**

- `products` - Array of product objects
- `isLoading` - Loading state
- `loadingCount` - Number of skeleton cards to show
- `enableQuickView` - Enable quick view functionality
- `animateEntrance` - Enable entrance animations

### ProductPrice

Price display with discount handling.

```tsx
import { ProductPrice } from '@/components/products';

<ProductPrice
  price={99.99}
  discount_percent={10}
  currency="USD"
  showOriginal={true}
  className="text-lg font-bold"
/>;
```

**Props:**

- `price` - Original price
- `discount_percent` - Discount percentage (optional)
- `currency` - Currency code
- `showOriginal` - Show original price when discounted
- `className` - Additional CSS classes

### ProductBadges

Product status badges.

```tsx
import { ProductBadges } from '@/components/products';

<ProductBadges
  is_featured={true}
  is_new={false}
  is_sale={true}
  discount_percent={20}
  inventory_count={2}
  className="absolute left-2 top-2"
/>;
```

**Props:**

- `is_featured` - Featured product badge
- `is_new` - New product badge
- `is_sale` - Sale badge
- `discount_percent` - Discount percentage for sale badge
- `inventory_count` - Stock count for low stock badge

## 🛒 Cart Components

### CartButton

Cart trigger button with item count.

```tsx
import { CartButton } from '@/components/cart';

<CartButton variant="ghost" size="md" showText={false} showBadge={true} className="relative" />;
```

### CartDrawer

Sliding cart panel.

```tsx
import { CartDrawer } from '@/components/cart';

<CartDrawer>
  <CartButton />
</CartDrawer>;
```

### CartItem

Individual cart item display.

```tsx
import { CartItem } from '@/components/cart';

<CartItem item={cartItem} compact={false} className="border-b last:border-b-0" />;
```

### CartSummary

Order summary with pricing.

```tsx
import { CartSummary } from '@/components/cart';

<CartSummary showCheckoutButton={true} showContinueShoppingButton={true} compact={false} />;
```

## 🧭 Navigation Components

### Breadcrumb

Hierarchical navigation.

```tsx
import { Breadcrumb } from '@/components/navigation';

<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Current Page' },
  ]}
  showHome={true}
  className="mb-6"
/>;
```

### Pagination

Page navigation component.

```tsx
import { Pagination } from '@/components/navigation';

<Pagination
  currentPage={1}
  totalPages={10}
  totalItems={100}
  itemsPerPage={10}
  onPageChange={handlePageChange}
  showInfo={true}
  className="mt-8"
/>;
```

### CategoryNavigation

Category menu navigation.

```tsx
import { CategoryNavigation } from '@/components/navigation';

<CategoryNavigation
  categories={categories}
  orientation="horizontal"
  maxItems={6}
  showAll={true}
  className="border-b"
/>;
```

## 🎨 Layout Components

### Header

Main site header.

```tsx
import { Header } from '@/components/layout';

<Header className="sticky top-0 z-40" />;
```

### Footer

Site footer component.

```tsx
import { Footer } from '@/components/layout';

<Footer className="mt-auto" />;
```

### Container

Content container with max width.

```tsx
import { Container } from '@/components/layout';

<Container size="lg" className="py-8">
  <h1>Page Content</h1>
</Container>;
```

## 🔧 Provider Components

### CartProvider

Global cart state provider.

```tsx
import { CartProvider } from '@/lib/context/cart-context';

<CartProvider>
  <App />
</CartProvider>;
```

### AuthProvider

Authentication state provider.

```tsx
import { AuthProvider } from '@/lib/auth/auth-context';

<AuthProvider>
  <App />
</AuthProvider>;
```

### ThemeProvider

Theme and styling provider.

```tsx
import { ThemeProvider } from '@/components/providers/theme-provider';

<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  <App />
</ThemeProvider>;
```

## 🎭 Animation Components

### LazyImage

Optimized image with lazy loading.

```tsx
import { LazyImage } from '@/components/ui/lazy-image';

<LazyImage
  src="/image.jpg"
  alt="Description"
  width={400}
  height={300}
  placeholder="skeleton"
  rootMargin="50px"
  threshold={0.1}
  className="rounded-lg"
/>;
```

### AnimatedCounter

Animated number counter.

```tsx
import { AnimatedCounter } from '@/components/ui/animated-counter';

<AnimatedCounter from={0} to={100} duration={2000} format={(value) => `$${value.toFixed(2)}`} />;
```

## 🎨 Styling Guidelines

### CSS Variables

Components use CSS variables for theming.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 222.2 84% 4.9%;
  --muted: 210 40% 96%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96%;
  --accent-foreground: 222.2 84% 4.9%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}
```

### Component Variants

Use the `cva` (Class Variance Authority) pattern for component variants.

```tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        lg: 'h-11 px-8 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  // Additional props
}
```

### Responsive Design

Use Tailwind's responsive prefixes for mobile-first design.

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Responsive grid */}
</div>
```

## 🧪 Testing Components

### Component Testing

Use React Testing Library for component tests.

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

test('button renders with correct text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
});

test('button calls onClick when clicked', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);

  fireEvent.click(screen.getByRole('button'));
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Storybook Integration

Document components with Storybook.

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};
```

## 🔧 Component Development

### Creating New Components

1. **Create component file**

   ```tsx
   // components/ui/new-component.tsx
   import { forwardRef } from 'react';
   import { cn } from '@/lib/utils';

   interface NewComponentProps {
     className?: string;
     children: React.ReactNode;
   }

   const NewComponent = forwardRef<HTMLDivElement, NewComponentProps>(
     ({ className, children, ...props }, ref) => {
       return (
         <div ref={ref} className={cn('base-styles', className)} {...props}>
           {children}
         </div>
       );
     }
   );

   NewComponent.displayName = 'NewComponent';

   export { NewComponent };
   ```

2. **Add to index file**

   ```tsx
   // components/ui/index.ts
   export { NewComponent } from './new-component';
   ```

3. **Create tests**

   ```tsx
   // components/ui/__tests__/new-component.test.tsx
   import { render } from '@testing-library/react';
   import { NewComponent } from '../new-component';

   test('renders correctly', () => {
     render(<NewComponent>Test</NewComponent>);
   });
   ```

4. **Create Storybook story**

   ```tsx
   // components/ui/new-component.stories.tsx
   import type { Meta, StoryObj } from '@storybook/react';
   import { NewComponent } from './new-component';

   const meta: Meta<typeof NewComponent> = {
     title: 'UI/NewComponent',
     component: NewComponent,
   };

   export default meta;
   ```

### Best Practices

1. **Use forwardRef** for components that need ref access
2. **Include displayName** for better debugging
3. **Use TypeScript** for all props and interfaces
4. **Follow naming conventions** (PascalCase for components)
5. **Include proper JSDoc** comments for complex props
6. **Test accessibility** with screen readers
7. **Document with Storybook** for design system

---

This component library provides a solid foundation for building consistent, accessible, and performant user interfaces in the Peakees e-commerce platform.
