import Link from 'next/link';
import { ArrowLeft, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground">
            Get in touch with our team - we're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="mr-2 h-5 w-5" />
                Email Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-2">
                For general inquiries and customer support
              </p>
              <p className="font-medium">support@vntg.com</p>
              <p className="text-sm text-muted-foreground mt-2">
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
              <p className="text-muted-foreground mb-2">
                Speak directly with our support team
              </p>
              <p className="font-medium">+1 (555) 123-4567</p>
              <p className="text-sm text-muted-foreground mt-2">
                Monday - Friday: 9 AM - 6 PM EST
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
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

        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">How do I track my order?</h4>
              <p className="text-muted-foreground">
                You can track your order by visiting the tracking page or checking your email 
                for tracking information sent after your order ships.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">What is your return policy?</h4>
              <p className="text-muted-foreground">
                We offer a 30-day return policy for most items. Items must be in original 
                condition with all packaging and tags intact.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Do you ship internationally?</h4>
              <p className="text-muted-foreground">
                Currently, we ship within the United States. International shipping 
                options are coming soon.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}