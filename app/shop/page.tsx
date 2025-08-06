export const dynamic = 'force-dynamic';

import { ShopPageTemplate } from '@/components/layout/page-template';
import { TransitionLink } from '@/components/providers/route-transition-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, Package, User, Star, Truck, Shield } from 'lucide-react';
import {
  ScrollReveal,
  StaggerReveal,
  TextReveal,
  RevealSection,
} from '@/components/layout/scroll-reveal';
import { DesktopHero, DesktopSection } from '@/components/layout/desktop-layout';
import { ResponsiveDisplay, ResponsiveLead } from '@/components/ui/responsive-typography';

export default function Home() {
  return (
    <ShopPageTemplate showHeader={true} padding={false} className="space-y-16">
      {/* Hero Section */}
      <DesktopHero
        height="lg"
        contentAlignment="center"
        verticalAlignment="center"
        className="bg-gradient-to-br from-primary/5 via-background to-secondary/5"
      >
        <div className="mx-auto max-w-5xl space-y-8 text-center">
          <TextReveal>
            <ResponsiveDisplay
              size="lg"
              gradient
              gradientFrom="from-primary"
              gradientTo="to-primary/60"
            >
              Welcome to VNTG
            </ResponsiveDisplay>
          </TextReveal>
          <ScrollReveal animation="fadeIn" delay={300}>
            <ResponsiveLead size="lg" className="mx-auto max-w-3xl">
              Curated vintage fashion for every style. Discover unique pieces for men, women, teens,
              and kids.
            </ResponsiveLead>
          </ScrollReveal>
          <ScrollReveal animation="fadeIn" delay={600}>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <TransitionLink href="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Shop Now
                </TransitionLink>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <TransitionLink href="/categories">
                  <Package className="mr-2 h-5 w-5" />
                  Browse Categories
                </TransitionLink>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </DesktopHero>

      {/* Featured Categories Section */}
      <DesktopSection spacing="xl" background="default">
        <RevealSection
          title="Shop by Category"
          subtitle="Discover vintage fashion for every member of your family"
          titleAnimation="textReveal"
          contentAnimation="stagger"
        >
          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
            <Card
              className="group cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
              data-reveal
            >
              <TransitionLink href="/categories/cat-1" className="block">
                <CardHeader className="pb-2 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                    <User className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">Men</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    Classic and contemporary styles for the modern man
                  </CardDescription>
                </CardContent>
              </TransitionLink>
            </Card>

            <Card
              className="group cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
              data-reveal
            >
              <TransitionLink href="/categories/cat-2" className="block">
                <CardHeader className="pb-2 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/10 transition-colors group-hover:bg-pink-500/20">
                    <User className="h-8 w-8 text-pink-600" />
                  </div>
                  <CardTitle className="text-lg">Women</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>Elegant and trendy pieces for every occasion</CardDescription>
                </CardContent>
              </TransitionLink>
            </Card>

            <Card
              className="group cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
              data-reveal
            >
              <TransitionLink href="/categories/cat-3" className="block">
                <CardHeader className="pb-2 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 transition-colors group-hover:bg-purple-500/20">
                    <User className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg">Teens</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    Fresh streetwear and trendy styles for young adults
                  </CardDescription>
                </CardContent>
              </TransitionLink>
            </Card>

            <Card
              className="group cursor-pointer transition-all hover:scale-105 hover:shadow-lg"
              data-reveal
            >
              <TransitionLink href="/categories/cat-4" className="block">
                <CardHeader className="pb-2 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 transition-colors group-hover:bg-green-500/20">
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">Kids</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>Comfortable and fun clothing for children</CardDescription>
                </CardContent>
              </TransitionLink>
            </Card>

            <Card
              className="group cursor-pointer transition-all hover:scale-105 hover:shadow-lg md:col-span-1 lg:col-span-2"
              data-reveal
            >
              <TransitionLink href="/categories/cat-5" className="block">
                <CardHeader className="pb-2 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 transition-colors group-hover:bg-orange-500/20">
                    <Package className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg">Books & Media</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    Fashion magazines, style guides, and inspiring reads
                  </CardDescription>
                </CardContent>
              </TransitionLink>
            </Card>

            <Card
              className="group cursor-pointer transition-all hover:scale-105 hover:shadow-lg md:col-span-2 lg:col-span-2"
              data-reveal
            >
              <TransitionLink href="/categories/cat-6" className="block">
                <CardHeader className="pb-2 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 transition-colors group-hover:bg-red-500/20">
                    <Package className="h-8 w-8 text-red-600" />
                  </div>
                  <CardTitle className="text-lg">Toys & Games</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    Fashion-themed games and creative toys for all ages
                  </CardDescription>
                </CardContent>
              </TransitionLink>
            </Card>
          </div>
        </RevealSection>
      </DesktopSection>

      {/* Features Section */}
      <DesktopSection spacing="xl" background="muted">
        <RevealSection
          title="Why Choose VNTG?"
          subtitle="We're committed to providing the best shopping experience with quality products and exceptional service."
          titleAnimation="textReveal"
          contentAnimation="stagger"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center" data-reveal>
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Premium Quality</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Carefully curated products that meet our high standards for quality and
                  authenticity.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center" data-reveal>
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Fast Shipping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Quick and reliable delivery to get your purchases to you as soon as possible.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center" data-reveal>
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Secure Shopping</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your data and payments are protected with industry-leading security measures.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </RevealSection>
      </DesktopSection>

      {/* Quick Links Section */}
      <DesktopSection spacing="xl" background="default">
        <RevealSection
          title="Explore VNTG"
          subtitle="Quick access to the most popular sections of our store."
          titleAnimation="textReveal"
          contentAnimation="stagger"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="group cursor-pointer transition-all hover:shadow-lg" data-reveal>
              <TransitionLink href="/products" className="block">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>All Products</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Browse our complete collection of vintage and modern items.
                  </CardDescription>
                </CardContent>
              </TransitionLink>
            </Card>

            <Card className="group cursor-pointer transition-all hover:shadow-lg" data-reveal>
              <TransitionLink href="/categories" className="block">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Package className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Categories</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Shop by category to find exactly what you're looking for.
                  </CardDescription>
                </CardContent>
              </TransitionLink>
            </Card>

            <Card className="group cursor-pointer transition-all hover:shadow-lg" data-reveal>
              <TransitionLink href="/account" className="block">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>My Account</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Manage your profile, orders, and account preferences.
                  </CardDescription>
                </CardContent>
              </TransitionLink>
            </Card>
          </div>
        </RevealSection>
      </DesktopSection>
    </ShopPageTemplate>
  );
}
