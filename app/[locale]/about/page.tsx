import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Peakees - Premium E-commerce Experience',
  description:
    "Learn about Peakees's mission to provide exceptional shopping experiences with curated products, secure payments, and outstanding customer service.",
  keywords: 'Peakees, about us, e-commerce, premium products, customer service',
  openGraph: {
    title: 'About Peakees - Your Premium Shopping Destination',
    description:
      "Discover Peakees's commitment to quality products and exceptional customer service.",
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="mb-4 text-4xl font-bold">About Peakees</h1>
          <p className="text-xl text-muted-foreground">
            Your premium e-commerce destination for quality products
          </p>
        </div>

        <article className="prose max-w-none">
          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Our Story</h2>
            <p className="mb-4">
              Peakees is a modern e-commerce platform built to deliver exceptional shopping
              experiences. We specialize in curating high-quality products across multiple
              categories, ensuring our customers find exactly what they&apos;re looking for.
            </p>
            <p className="mb-4">
              Our platform combines cutting-edge technology with user-friendly design to create a
              seamless shopping experience from browse to checkout.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Our Mission</h2>
            <p className="mb-4">
              To provide customers with access to premium products while maintaining the highest
              standards of service, security, and satisfaction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 text-2xl font-semibold">Why Choose Peakees?</h2>
            <ul className="mb-4 list-inside list-disc space-y-2" role="list">
              <li>Carefully curated product selection</li>
              <li>Secure payment processing with Stripe</li>
              <li>Fast and reliable shipping</li>
              <li>Excellent customer support</li>
              <li>Easy returns and exchanges</li>
              <li>Mobile-optimized shopping experience</li>
              <li>Sustainable and ethical sourcing</li>
              <li>24/7 customer support availability</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold">Get in Touch</h2>
            <p className="mb-4">Have questions? We&apos;d love to hear from you.</p>
            <Link href="/contact">
              <Button>Contact Us</Button>
            </Link>
          </section>
        </article>
      </div>
    </main>
  );
}
