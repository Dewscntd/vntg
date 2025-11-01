export const dynamic = 'force-dynamic';

import { getTranslations } from 'next-intl/server';
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

export default async function Home() {
  const t = await getTranslations('shop');
  const tNav = await getTranslations('navigation');

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
              {t('welcome')}
            </ResponsiveDisplay>
          </TextReveal>
          <ScrollReveal animation="fadeIn" delay={300}>
            <ResponsiveLead size="lg" className="mx-auto max-w-3xl">
              {t('heroSubtitle')}
            </ResponsiveLead>
          </ScrollReveal>
          <ScrollReveal animation="fadeIn" delay={600}>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <TransitionLink href="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {t('shopNow')}
                </TransitionLink>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <TransitionLink href="/categories">
                  <Package className="mr-2 h-5 w-5" />
                  {tNav('categories')}
                </TransitionLink>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </DesktopHero>

      {/* Featured Categories Section */}
      <DesktopSection spacing="xl" background="default">
        <RevealSection
          title={t('shopByCategory')}
          subtitle={t('shopByCategorySubtitle')}
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
                  <CardTitle className="text-lg">{t('men')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    {t('menDescription')}
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
                  <CardTitle className="text-lg">{t('women')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>{t('womenDescription')}</CardDescription>
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
                  <CardTitle className="text-lg">{t('teens')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    {t('teensDescription')}
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
                  <CardTitle className="text-lg">{t('kids')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>{t('kidsDescription')}</CardDescription>
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
                  <CardTitle className="text-lg">{t('booksMedia')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    {t('booksMediaDescription')}
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
                  <CardTitle className="text-lg">{t('toysGames')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>
                    {t('toysGamesDescription')}
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
          title={t('whyChoose')}
          subtitle={t('whyChooseSubtitle')}
          titleAnimation="textReveal"
          contentAnimation="stagger"
        >
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center" data-reveal>
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Star className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('premiumQuality')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('premiumQualityDescription')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center" data-reveal>
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('fastShipping')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('fastShippingDescription')}
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center" data-reveal>
              <CardHeader>
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{t('secureShopping')}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  {t('secureShoppingDescription')}
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </RevealSection>
      </DesktopSection>

      {/* Quick Links Section */}
      <DesktopSection spacing="xl" background="default">
        <RevealSection
          title={t('explorePeakees')}
          subtitle={t('explorePeakeesSubtitle')}
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
                    <CardTitle>{t('allProducts')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('allProductsDescription')}
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
                    <CardTitle>{t('categoriesLink')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('categoriesDescription')}
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
                    <CardTitle>{t('myAccount')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {t('myAccountDescription')}
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
