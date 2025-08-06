'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Quote } from 'lucide-react';
import { ScrollReveal, RevealSection } from '@/components/layout/scroll-reveal';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Fashion Enthusiast',
    avatar: 'https://via.placeholder.com/100x100?text=SJ',
    content:
      "I found the most incredible vintage denim jacket on VNTG. The quality was amazing and it's become my signature piece. Love knowing I'm shopping sustainably!",
    rating: 5,
    initials: 'SJ',
  },
  {
    name: 'Michael Chen',
    role: 'Sustainable Living Advocate',
    avatar: 'https://via.placeholder.com/100x100?text=MC',
    content:
      "As someone who cares about the environment, VNTG is perfect. Every purchase feels good knowing I'm giving pre-loved items a new life while getting unique pieces.",
    rating: 5,
    initials: 'MC',
  },
  {
    name: 'Emma Rodriguez',
    role: 'Vintage Collector',
    avatar: 'https://via.placeholder.com/100x100?text=ER',
    content:
      "The curation at VNTG is exceptional. I've found rare vintage pieces I couldn't find anywhere else. Their attention to quality and authenticity is unmatched.",
    rating: 5,
    initials: 'ER',
  },
  {
    name: 'David Park',
    role: 'Style Blogger',
    avatar: 'https://via.placeholder.com/100x100?text=DP',
    content:
      'VNTG has become my go-to for unique fashion finds. The variety is incredible - from classic pieces to bold statement items. Plus, the shopping experience is seamless.',
    rating: 5,
    initials: 'DP',
  },
  {
    name: 'Lisa Wang',
    role: 'Working Professional',
    avatar: 'https://via.placeholder.com/100x100?text=LW',
    content:
      'I love that I can find professional vintage pieces that stand out in the best way. VNTG helps me express my personality while maintaining a polished look.',
    rating: 5,
    initials: 'LW',
  },
  {
    name: 'Alex Thompson',
    role: 'Parent & Eco-Conscious Shopper',
    avatar: 'https://via.placeholder.com/100x100?text=AT',
    content:
      "Shopping at VNTG for my family feels great. Quality clothes for my kids that have history and character, plus I'm teaching them about sustainable choices.",
    rating: 5,
    initials: 'AT',
  },
];

export function SocialProof() {
  return (
    <section className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <RevealSection
          title="What Our Customers Say"
          subtitle="Join thousands of satisfied customers who've found their perfect vintage pieces"
          titleAnimation="textReveal"
          contentAnimation="stagger"
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card
                key={testimonial.name}
                className="relative h-full overflow-hidden border-0 shadow-lg"
                data-reveal
              >
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <Quote className="mb-4 h-8 w-8 text-primary/20" />

                  {/* Rating */}
                  <div className="mb-4 flex items-center gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Testimonial Content */}
                  <blockquote className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    "{testimonial.content}"
                  </blockquote>

                  {/* Customer Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="text-xs font-medium">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{testimonial.name}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid gap-8 text-center sm:grid-cols-4" data-reveal>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">4.9/5</div>
              <div className="text-sm text-muted-foreground">Customer Rating</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">2-3 Days</div>
              <div className="text-sm text-muted-foreground">Average Delivery</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">30 Days</div>
              <div className="text-sm text-muted-foreground">Return Policy</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Customer Support</div>
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
