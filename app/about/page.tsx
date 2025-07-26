import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AboutPage() {
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
          <h1 className="text-4xl font-bold mb-4">About VNTG</h1>
          <p className="text-xl text-muted-foreground">
            Your premium e-commerce destination for quality products
          </p>
        </div>

        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
            <p className="mb-4">
              VNTG is a modern e-commerce platform built to deliver exceptional shopping experiences. 
              We specialize in curating high-quality products across multiple categories, ensuring 
              our customers find exactly what they're looking for.
            </p>
            <p className="mb-4">
              Our platform combines cutting-edge technology with user-friendly design to create 
              a seamless shopping experience from browse to checkout.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="mb-4">
              To provide customers with access to premium products while maintaining the highest 
              standards of service, security, and satisfaction.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Why Choose VNTG?</h2>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Carefully curated product selection</li>
              <li>Secure payment processing with Stripe</li>
              <li>Fast and reliable shipping</li>
              <li>Excellent customer support</li>
              <li>Easy returns and exchanges</li>
              <li>Mobile-optimized shopping experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
            <p className="mb-4">
              Have questions? We'd love to hear from you.
            </p>
            <Link href="/contact">
              <Button>Contact Us</Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}