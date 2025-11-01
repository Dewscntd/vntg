'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  Home,
  Package,
  ShoppingBag,
  User,
  Search,
  Phone,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TouchButton, TouchIconButton } from '@/components/ui/touch-button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/context/cart-context';
import { CategoryNavigation } from './category-navigation';
import { microInteractions } from '@/lib/animations/micro-interactions';

export interface MobileNavProps {
  className?: string;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
}

export function MobileNav({ className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const { user } = useAuth();
  const { itemCount } = useCart();
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Close mobile nav when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Handle touch interactions
  const handleTriggerClick = () => {
    if (triggerRef.current) {
      microInteractions.buttonPress(triggerRef.current);
    }
    setIsOpen(!isOpen);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const navItems: NavItem[] = [
    {
      title: 'דף הבית',
      href: '/',
      icon: Home,
    },
    {
      title: 'חנות',
      href: '/shop',
      icon: ShoppingBag,
    },
    {
      title: 'מוצרים',
      href: '/products',
      icon: Package,
    },
    {
      title: 'קטגוריות',
      href: '/categories',
      icon: Package,
    },
    {
      title: 'על Peakees',
      href: '/about',
      icon: Info,
    },
    {
      title: 'צור קשר',
      href: '/contact',
      icon: Phone,
    },
  ];

  const accountItems: NavItem[] = user
    ? [
        {
          title: 'החשבון שלי',
          href: '/account',
          icon: User,
        },
        {
          title: 'הזמנות',
          href: '/account/orders',
          icon: Package,
        },
        {
          title: 'עגלה',
          href: '/cart',
          icon: ShoppingBag,
          badge: itemCount > 0 ? itemCount : undefined,
        },
      ]
    : [
        {
          title: 'התחברות',
          href: '/auth/login',
          icon: User,
        },
        {
          title: 'יצירת חשבון',
          href: '/auth/register',
          icon: User,
        },
        {
          title: 'עגלה',
          href: '/cart',
          icon: ShoppingBag,
          badge: itemCount > 0 ? itemCount : undefined,
        },
      ];

  const NavItemComponent = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const isActive = pathname === item.href;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections.has(item.title);

    return (
      <div className="space-y-1">
        <div className="flex items-center">
          {hasChildren ? (
            <TouchButton
              variant="ghost"
              size="touch"
              onClick={() => toggleSection(item.title)}
              className={cn(
                'flex-1 justify-between text-right font-normal',
                level > 0 && 'mr-4',
                isActive && 'bg-accent text-accent-foreground'
              )}
              haptic
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </TouchButton>
          ) : (
            <Link
              href={item.href}
              className={cn(
                'flex flex-1 items-center gap-3 rounded-md p-3 text-sm transition-colors hover:bg-accent hover:text-accent-foreground',
                level > 0 && 'mr-4',
                isActive && 'bg-accent font-medium text-accent-foreground'
              )}
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1 pr-4">
            {item.children!.map((child) => (
              <NavItemComponent key={child.title} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <TouchIconButton
          ref={triggerRef}
          variant="ghost"
          size="md"
          icon={<Menu />}
          label="פתיחת תפריט ניווט"
          className={cn('md:hidden', className)}
          onClick={handleTriggerClick}
          haptic
        />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-80 flex-col p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <SheetHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">P</span>
              </div>
              <span className="text-xl font-bold">Peakees</span>
            </SheetTitle>
            <TouchIconButton
              variant="ghost"
              size="md"
              icon={<X />}
              label="סגירת תפריט ניווט"
              onClick={() => setIsOpen(false)}
              haptic
            />
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                ניווט
              </h3>
              {navItems.map((item) => (
                <NavItemComponent key={item.title} item={item} />
              ))}
            </div>

            <Separator />

            {/* Categories */}
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                קטגוריות
              </h3>
              <div className="pr-3">
                <CategoryNavigation
                  orientation="vertical"
                  showAllLink={false}
                  className="space-y-1"
                />
              </div>
            </div>

            <Separator />

            {/* Account Section */}
            <div className="space-y-1">
              <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                חשבון
              </h3>
              {accountItems.map((item) => (
                <NavItemComponent key={item.title} item={item} />
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t p-6 pt-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">© 2024 Peakees. כל הזכויות שמורות.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
