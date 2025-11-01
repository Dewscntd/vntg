import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');

  return {
    title: t('aboutTitle'),
    description: t('aboutDescription'),
    keywords: 'Peakees, about us, e-commerce, premium products, customer service',
    openGraph: {
      title: t('aboutTitle'),
      description: t('aboutDescription'),
      type: 'website',
    },
  };
}

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToHome')}
            </Button>
          </Link>
          <h1 className="mb-4 text-4xl font-bold">{t('title')}</h1>
          <p className="text-xl text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        <article className="prose max-w-none">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">{t('ourStory')}</h2>
            <p className="mb-4">
              {t('ourStoryPara1')}
            </p>
            <p className="mb-4">
              {t('ourStoryPara2')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">{t('ourMission')}</h2>
            <p className="mb-4">
              {t('ourMissionPara')}
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">{t('whyChoose')}</h2>
            <ul className="mb-4 list-inside list-disc space-y-2" role="list">
              <li>{t('whyChooseItems.curated')}</li>
              <li>{t('whyChooseItems.secure')}</li>
              <li>{t('whyChooseItems.fastShipping')}</li>
              <li>{t('whyChooseItems.support')}</li>
              <li>{t('whyChooseItems.returns')}</li>
              <li>{t('whyChooseItems.mobile')}</li>
              <li>{t('whyChooseItems.sustainable')}</li>
              <li>{t('whyChooseItems.available')}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">{t('getInTouch')}</h2>
            <p className="mb-4">{t('getInTouchPara')}</p>
            <Link href="/contact">
              <Button>{t('contactUs')}</Button>
            </Link>
          </section>
        </article>
      </div>
    </main>
  );
}
