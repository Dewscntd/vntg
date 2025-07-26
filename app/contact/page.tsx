import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | VNTG - Get in Touch',
  description:
    'Contact VNTG for customer support, inquiries, or assistance. Email, phone, and business address information available.',
  keywords: 'VNTG, contact, customer support, help, email, phone',
  openGraph: {
    title: "Contact VNTG - We're Here to Help",
    description: 'Get in touch with our customer support team for any questions or assistance.',
    type: 'website',
  },
};

export default function ContactPage() {
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
          <h1 className="mb-4 text-4xl font-bold">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Get in touch with our team - we're here to help!
          </p>
        </div>

        <section
          className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2"
          aria-label="Contact methods"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-muted-foreground">
                For general inquiries and customer support
              </p>
              <a
                href="mailto:support@vntg.com"
                className="font-medium text-primary hover:underline"
              >
                support@vntg.com
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                We typically respond within 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                Phone Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2 text-muted-foreground">Speak directly with our support team</p>
              <a href="tel:+15551234567" className="font-medium text-primary hover:underline">
                +1 (555) 123-4567
              </a>
              <p className="mt-2 text-sm text-muted-foreground">Monday - Friday: 9 AM - 6 PM EST</p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Business Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">VNTG E-commerce</p>
                <p>123 Commerce Street</p>
                <p>Business District</p>
                <p>City, State 12345</p>
                <p>United States</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4" role="region" aria-label="FAQ section">
              <div>
                <h4 className="mb-2 font-semibold">How do I track my order?</h4>
                <p className="text-muted-foreground">
                  You can track your order by visiting the tracking page or checking your email for
                  tracking information sent after your order ships.
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">What is your return policy?</h4>
                <p className="text-muted-foreground">
                  We offer a 30-day return policy for most items. Items must be in original
                  condition with all packaging and tags intact.
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold">Do you ship internationally?</h4>
                <p className="text-muted-foreground">
                  Currently, we ship within the United States. International shipping options are
                  coming soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
