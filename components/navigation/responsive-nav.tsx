'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { ScrollReveal } from '@/components/layout/scroll-reveal';

export interface NavItem {
  title: string;
  href: string;
  description?: string;
  children?: NavItem[];
  external?: boolean;
}

export interface ResponsiveNavProps {
  items: NavItem[];
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showDescriptions?: boolean;
  maxDepth?: number;
}

export function ResponsiveNav({
  items,
  className,
  orientation = 'horizontal',
  showDescriptions = false,
  maxDepth = 2
}: ResponsiveNavProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const pathname = usePathname();

  // Close expanded items when route changes
  useEffect(() => {
    setExpandedItems(new Set());
  }, [pathname]);

  const toggleExpanded = (itemTitle: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemTitle)) {
      newExpanded.delete(itemTitle);
    } else {
      newExpanded.add(itemTitle);
    }
    setExpandedItems(newExpanded);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  // Horizontal navigation for desktop
  if (orientation === 'horizontal') {
    return (
      <NavigationMenu className={className}>
        <NavigationMenuList className="flex-wrap">
          {items.map((item) => (
            <NavigationMenuItem key={item.title}>
              {item.children && item.children.length > 0 ? (
                <>
                  <NavigationMenuTrigger 
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary',
                      isActive(item.href) && 'text-primary'
                    )}
                  >
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 w-[400px] lg:w-[500px] lg:grid-cols-2">
                      {item.children.map((child) => (
                        <NavigationMenuLink key={child.title} asChild>
                          <Link
                            href={child.href}
                            className={cn(
                              'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors',
                              'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                              isActive(child.href) && 'bg-accent text-accent-foreground'
                            )}
                          >
                            <div className="text-sm font-medium leading-none">
                              {child.title}
                            </div>
                            {showDescriptions && child.description && (
                              <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                {child.description}
                              </p>
                            )}
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md',
                      isActive(item.href) && 'text-primary bg-accent'
                    )}
                    target={item.external ? '_blank' : undefined}
                    rel={item.external ? 'noopener noreferrer' : undefined}
                  >
                    {item.title}
                  </Link>
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
    );
  }

  // Vertical navigation for mobile/sidebar
  const renderVerticalItem = (item: NavItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0 && level < maxDepth;
    const isExpanded = expandedItems.has(item.title);
    const itemIsActive = isActive(item.href);

    return (
      <div key={item.title} className="space-y-1">
        <div className="flex items-center">
          {hasChildren ? (
            <Button
              variant="ghost"
              onClick={() => toggleExpanded(item.title)}
              className={cn(
                'flex-1 justify-between h-auto p-3 text-left font-normal',
                level > 0 && `ml-${level * 4}`,
                itemIsActive && 'bg-accent text-accent-foreground'
              )}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm">{item.title}</span>
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <Link
              href={item.href}
              className={cn(
                'flex flex-1 items-center space-x-2 rounded-md p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                level > 0 && `ml-${level * 4}`,
                itemIsActive && 'bg-accent text-accent-foreground font-medium'
              )}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
            >
              <span>{item.title}</span>
            </Link>
          )}
        </div>

        {hasChildren && isExpanded && (
          <ScrollReveal animation="slideLeft" className="space-y-1">
            {item.children!.map((child) => renderVerticalItem(child, level + 1))}
          </ScrollReveal>
        )}
      </div>
    );
  };

  return (
    <nav className={cn('space-y-1', className)}>
      {items.map((item) => renderVerticalItem(item))}
    </nav>
  );
}

// Predefined navigation configurations
export const mainNavItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Products',
    href: '/products',
    children: [
      {
        title: 'All Products',
        href: '/products',
        description: 'Browse our complete collection'
      },
      {
        title: 'New Arrivals',
        href: '/products?filter=new',
        description: 'Latest additions to our catalog'
      },
      {
        title: 'Sale Items',
        href: '/products?filter=sale',
        description: 'Special offers and discounts'
      },
      {
        title: 'Featured',
        href: '/products?filter=featured',
        description: 'Curated selection of premium items'
      }
    ]
  },
  {
    title: 'Categories',
    href: '/categories',
    children: [
      {
        title: 'Clothing',
        href: '/categories/clothing',
        description: 'Vintage and modern apparel'
      },
      {
        title: 'Accessories',
        href: '/categories/accessories',
        description: 'Bags, jewelry, and more'
      },
      {
        title: 'Electronics',
        href: '/categories/electronics',
        description: 'Vintage tech and gadgets'
      },
      {
        title: 'Home & Decor',
        href: '/categories/home-decor',
        description: 'Furniture and decorative items'
      }
    ]
  },
  {
    title: 'About',
    href: '/about',
  },
  {
    title: 'Contact',
    href: '/contact',
  }
];

export const footerNavItems: NavItem[] = [
  {
    title: 'Company',
    href: '#',
    children: [
      { title: 'About Us', href: '/about' },
      { title: 'Careers', href: '/careers' },
      { title: 'Press', href: '/press' },
      { title: 'Blog', href: '/blog' }
    ]
  },
  {
    title: 'Support',
    href: '#',
    children: [
      { title: 'Help Center', href: '/help' },
      { title: 'Contact Us', href: '/contact' },
      { title: 'Shipping Info', href: '/shipping' },
      { title: 'Returns', href: '/returns' }
    ]
  },
  {
    title: 'Legal',
    href: '#',
    children: [
      { title: 'Privacy Policy', href: '/privacy' },
      { title: 'Terms of Service', href: '/terms' },
      { title: 'Cookie Policy', href: '/cookies' }
    ]
  }
];
