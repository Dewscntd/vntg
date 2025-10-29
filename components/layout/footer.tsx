'use client';

import Link from 'next/link';
import { TransitionLink } from '@/components/providers/route-transition-provider';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">P</span>
              </div>
              <span className="text-xl font-bold">Peakees</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Curated vintage fashion for every style. Discover unique, sustainable pieces that tell
              your story.
            </p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              Made with <Heart className="mx-1 h-4 w-4 text-red-500" /> for sustainable fashion
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Shop</h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <TransitionLink
                href="/shop"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                All Products
              </TransitionLink>
              <TransitionLink
                href="/categories"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Categories
              </TransitionLink>
              <TransitionLink
                href="/categories/cat-1"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Men's Fashion
              </TransitionLink>
              <TransitionLink
                href="/categories/cat-2"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Women's Fashion
              </TransitionLink>
              <TransitionLink
                href="/categories/cat-3"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Teen Styles
              </TransitionLink>
            </nav>
          </div>

          {/* Company Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Company</h3>
            <nav className="flex flex-col space-y-2 text-sm">
              <TransitionLink
                href="/about"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                About Us
              </TransitionLink>
              <TransitionLink
                href="/contact"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Contact
              </TransitionLink>
              <TransitionLink
                href="/account"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                My Account
              </TransitionLink>
              <TransitionLink
                href="/tracking"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Order Tracking
              </TransitionLink>
            </nav>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold">Stay Updated</h3>
            <p className="text-sm text-muted-foreground">
              Get notified about new arrivals and exclusive vintage finds.
            </p>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input type="email" placeholder="Enter your email" className="text-sm" />
                <Button size="sm">Subscribe</Button>
              </div>
              <p className="text-xs text-muted-foreground">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:gap-6">
              <span>&copy; 2024 Peakees. All rights reserved.</span>
              <div className="flex gap-4">
                <Link href="/privacy" className="transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="transition-colors hover:text-foreground">
                  Terms of Service
                </Link>
                <Link href="/returns" className="transition-colors hover:text-foreground">
                  Returns
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>hello@peakees.com</span>
              </div>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
