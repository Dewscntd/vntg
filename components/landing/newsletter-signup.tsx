'use client';

import { useState } from 'react';
import { Send, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollReveal } from '@/components/layout/scroll-reveal';
import { ResponsiveH2 } from '@/components/ui/responsive-typography';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export function NewsletterSignup() {
  const t = useTranslations('landing.newsletter');
  const [email, setEmail] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      setErrorMessage(t('error.invalidEmail'));
      setSubmitState('error');
      return;
    }

    setSubmitState('loading');
    setErrorMessage('');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In real implementation, you would call your newsletter API here
    // const response = await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });

    setSubmitState('success');
    setEmail('');

    // Reset after 5 seconds
    setTimeout(() => {
      setSubmitState('idle');
    }, 5000);
  };

  return (
    <section className="relative overflow-hidden bg-foreground py-20 text-background md:py-28">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:32px_32px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <ScrollReveal animation="fadeIn">
            <ResponsiveH2 size="md" className="mb-4 text-background">
              {t('title')}
            </ResponsiveH2>
          </ScrollReveal>

          <ScrollReveal animation="fadeIn" delay={200}>
            <p className="mb-8 text-lg text-background/70">
              {t('subtitle')}
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fadeIn" delay={400}>
            <form onSubmit={handleSubmit} className="mx-auto max-w-md">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Input
                    type="email"
                    placeholder={t('placeholder')}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (submitState === 'error') {
                        setSubmitState('idle');
                        setErrorMessage('');
                      }
                    }}
                    disabled={submitState === 'loading' || submitState === 'success'}
                    className={cn(
                      'h-12 border-background/20 bg-background/10 text-background placeholder:text-background/50 focus:border-background/40 focus:ring-background/20',
                      submitState === 'error' && 'border-red-400'
                    )}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitState === 'loading' || submitState === 'success'}
                  className={cn(
                    'h-12 min-w-[140px] bg-background text-foreground hover:bg-background/90',
                    submitState === 'success' && 'bg-green-500 hover:bg-green-500'
                  )}
                >
                  {submitState === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('subscribing')}
                    </>
                  ) : submitState === 'success' ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t('subscribed')}
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      {t('subscribe')}
                    </>
                  )}
                </Button>
              </div>

              {/* Error Message */}
              {submitState === 'error' && errorMessage && (
                <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
              )}

              {/* Success Message */}
              {submitState === 'success' && (
                <p className="mt-4 text-sm text-green-400">
                  {t('successMessage')}
                </p>
              )}
            </form>
          </ScrollReveal>

          <ScrollReveal animation="fadeIn" delay={600}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-background/50">
              <span>{t('benefits.weekly')}</span>
              <span className="hidden sm:inline">•</span>
              <span>{t('benefits.exclusive')}</span>
              <span className="hidden sm:inline">•</span>
              <span>{t('benefits.unsubscribe')}</span>
            </div>
          </ScrollReveal>

          {/* Social Proof */}
          <ScrollReveal animation="fadeIn" delay={800}>
            <div className="mt-12 flex items-center justify-center gap-4">
              {/* Avatar Stack */}
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 overflow-hidden rounded-full border-2 border-foreground bg-background/20"
                  >
                    <img
                      src={`https://i.pravatar.cc/80?img=${i + 10}`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-background/70">
                {t('joinedCount')}
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
